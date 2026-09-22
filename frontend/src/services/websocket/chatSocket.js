import config from '@/config'
import { tokenStorage } from '@/services/storage/tokenStorage'

/* ============================================================
 *  Константы
 * ============================================================ */

/** Тип сообщения (совпадает с бэком) */
const MessageType = Object.freeze({
  MESSAGE: 'message',
  TYPING: 'typing',
  READ: 'read',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
  ACK: 'ack'
})

/** Статус соединения */
const ConnectionStatus = Object.freeze({
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed'
})

/** Генератор стабильного ID для исходящих сообщений (для ACK) */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Экспоненциальный backoff с jitter.
 * @param {number} attempt — номер попытки (0-based)
 * @param {number} base — базовая задержка (мс)
 * @param {number} max — максимум (мс)
 */
function backoffDelay(attempt, base = 1000, max = 30000) {
  const exp = Math.min(base * 2 ** attempt, max)
  // jitter ±30% — защита от thundering herd
  const jitter = exp * (0.7 + Math.random() * 0.6)
  return Math.round(jitter)
}

/* ============================================================
 *  Класс
 * ============================================================ */

class ChatSocket {
  constructor() {
    this.socket = null

    /** Подписчики на сообщения: [{ handler, type }] */
    this.messageHandlers = []

    /** Подписчики на изменение статуса */
    this.statusHandlers = []

    this.status = ConnectionStatus.DISCONNECTED
    this.connected = false

    // Реконнект
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 8
    this.reconnectTimer = null
    this.shouldReconnect = true

    // Heartbeat
    this.pingInterval = null
    this.pongTimeout = null
    this.lastPongAt = null
    this.PING_INTERVAL = 25000 // 25 сек
    this.PONG_TIMEOUT = 10000  // 10 сек на ответ

    // Очередь сообщений, пока сокет отключён
    this.outbox = []

    // Pending ACK: id → { message, resolve, reject, timeout }
    this.pendingAcks = new Map()

    // Автоответы в mock-режиме (для очистки)
    this.pendingMockReplies = new Set()

    // Статистика
    this.stats = { sent: 0, received: 0, dropped: 0, reconnects: 0 }

    // Активные чаты для re-subscribe после реконнекта
    this.joinedChats = new Set()

    // Привязка (bind для addEventListener/removeEventListener)
    this._handleOnline = () => this.connect()
    this._handleOffline = () => this.disconnect({ manual: false, reason: 'offline' })

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this._handleOnline)
      window.addEventListener('offline', this._handleOffline)
    }
  }

  /* ---------- Логирование ---------- */

  log(...args) {
    if (config.debug.enableLogs) {
      console.log('%c[WS]', 'color:#C9A961;font-weight:bold', ...args)
    }
  }

  warn(...args) {
    if (config.debug.enableLogs) {
      console.warn('%c[WS]', 'color:#F0C080;font-weight:bold', ...args)
    }
  }

  /* ---------- Управление статусом ---------- */

  setStatus(newStatus) {
    if (this.status === newStatus) return
    this.status = newStatus
    this.connected = newStatus === ConnectionStatus.CONNECTED
    this.emitStatus(newStatus)
  }

  onStatusChange(handler) {
    this.statusHandlers.push(handler)
    // Сразу отдаём текущий статус
    try { handler(this.status) } catch (err) { console.error(err) }
    return () => this.offStatusChange(handler)
  }

  offStatusChange(handler) {
    this.statusHandlers = this.statusHandlers.filter(h => h !== handler)
  }

  emitStatus(status) {
    this.statusHandlers.forEach(h => {
      try { h(status) } catch (err) { console.error('[WS] status handler error:', err) }
    })
  }

  /* ---------- Подключение ---------- */

  connect() {
    if (this.socket || this.status === ConnectionStatus.CONNECTING) return

    if (config.api.useMock) {
      this.log('Mock connected')
      this.setStatus(ConnectionStatus.CONNECTED)
      this.flushOutbox()
      return
    }

    const token = tokenStorage.getAccessToken()
    if (!token) {
      this.warn('No token — skipping connection')
      this.setStatus(ConnectionStatus.DISCONNECTED)
      return
    }

    this.setStatus(
      this.reconnectAttempts > 0
        ? ConnectionStatus.RECONNECTING
        : ConnectionStatus.CONNECTING
    )

    try {
      // ВАЖНО: токен в query — компромисс для совместимости.
      // TODO(backend): перейти на Sec-WebSocket-Protocol или auth-сообщение.
      const url = `${config.api.wsURL}/chat?token=${encodeURIComponent(token)}`
      this.socket = new WebSocket(url)
      this.bindHandlers()
    } catch (err) {
      console.error('[WS] Connection failed:', err)
      this.scheduleReconnect()
    }
  }

  bindHandlers() {
    this.socket.onopen = () => {
      this.log('Connected')
      this.reconnectAttempts = 0
      this.setStatus(ConnectionStatus.CONNECTED)
      this.startHeartbeat()
      this.resubscribeChats()
      this.flushOutbox()
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleIncoming(message)
      } catch (err) {
        console.error('[WS] Failed to parse message:', err)
      }
    }

    this.socket.onerror = (error) => {
      // Не логируем как error — onclose придёт следом
      this.warn('Error event:', error?.message || error)
    }

    this.socket.onclose = (event) => {
      this.log('Closed:', event.code, event.reason)
      this.socket = null
      this.stopHeartbeat()

      // 1000 — нормальное закрытие, не реконнектим
      if (event.code === 1000 || !this.shouldReconnect) {
        this.setStatus(ConnectionStatus.DISCONNECTED)
        return
      }

      this.scheduleReconnect()
    }
  }

  scheduleReconnect() {
    if (!this.shouldReconnect) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.warn('Max reconnect attempts reached')
      this.setStatus(ConnectionStatus.FAILED)
      return
    }

    const delay = backoffDelay(this.reconnectAttempts)
    this.reconnectAttempts++
    this.stats.reconnects++

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    this.setStatus(ConnectionStatus.RECONNECTING)

    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  disconnect({ manual = true, reason = '' } = {}) {
    if (manual) this.shouldReconnect = false

    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
    this.stopHeartbeat()
    this.clearPendingMockReplies()

    if (this.socket) {
      try { this.socket.close(1000, reason || 'client disconnect') } catch { /* no-op */ }
      this.socket = null
    }

    this.setStatus(ConnectionStatus.DISCONNECTED)
    if (manual) this.reconnectAttempts = 0
  }

  /* ---------- Heartbeat ---------- */

  startHeartbeat() {
    this.stopHeartbeat()

    this.pingInterval = setInterval(() => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return

      try {
        this.socket.send(JSON.stringify({ type: MessageType.PING, t: Date.now() }))

        // Если за PONG_TIMEOUT не пришёл PONG — считаем мёртвым
        clearTimeout(this.pongTimeout)
        this.pongTimeout = setTimeout(() => {
          this.warn('Pong timeout — closing socket')
          try { this.socket?.close(4000, 'pong timeout') } catch { /* no-op */ }
        }, this.PONG_TIMEOUT)
      } catch (err) {
        this.warn('Ping failed:', err?.message || err)
      }
    }, this.PING_INTERVAL)
  }

  stopHeartbeat() {
    clearInterval(this.pingInterval)
    clearTimeout(this.pongTimeout)
    this.pingInterval = null
    this.pongTimeout = null
  }

  /* ---------- Входящие сообщения ---------- */

  handleIncoming(raw) {
    this.stats.received++

    // PONG
    if (raw?.type === MessageType.PONG) {
      clearTimeout(this.pongTimeout)
      this.lastPongAt = Date.now()
      return
    }

    // ACK на отправленное сообщение
    if (raw?.type === MessageType.ACK && raw.id) {
      const pending = this.pendingAcks.get(raw.id)
      if (pending) {
        clearTimeout(pending.timeout)
        this.pendingAcks.delete(raw.id)
        pending.resolve(raw)
      }
      return
    }

    this.emitMessage(raw)
  }

  /* ---------- Отправка ---------- */

  /**
   * Отправить сообщение в чат.
   * @param {number|string} chatId
   * @param {string} content
   * @param {Object} [opts]
   * @param {boolean} [opts.awaitAck=false] — ждать подтверждения (вернёт Promise)
   * @param {number}  [opts.ackTimeout=5000]
   * @returns {Object|Promise<Object>|null}
   */
  sendMessage(chatId, content, opts = {}) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    const cid = Number(chatId)
    if (!Number.isFinite(cid)) {
      this.warn('Invalid chatId:', chatId)
      return null
    }

    const id = generateId()
    const payload = {
      id,
      type: MessageType.MESSAGE,
      chatId: cid,
      content: text,
      createdAt: new Date().toISOString()
    }

    // === Mock режим ===
    if (config.api.useMock) {
      const optimistic = {
        id,
        chatId: cid,
        senderId: 1,
        content: text,
        createdAt: payload.createdAt,
        read: false,
        status: 'sent'
      }

      // Авто-ответ продавца
      const timer = setTimeout(() => {
        try {
          const response = {
            id: generateId(),
            chatId: cid,
            senderId: 2,
            content: this.getAutoResponse(),
            createdAt: new Date().toISOString(),
            read: false,
            status: 'received'
          }
          this.emitMessage(response)
        } finally {
          this.pendingMockReplies.delete(timer)
        }
      }, 1500 + Math.random() * 2000)

      this.pendingMockReplies.add(timer)

      this.stats.sent++

      if (opts.awaitAck) {
        return Promise.resolve({ ...optimistic, ack: true })
      }
      return optimistic
    }

    // === Реальный режим ===
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      // Сокет не открыт — кладём в очередь
      this.outbox.push(payload)
      this.stats.dropped++
      this.warn('Socket not open — queued:', id)
      this.connect()

      return opts.awaitAck
        ? Promise.reject(new Error('WS not connected, message queued'))
        : payload
    }

    try {
      this.socket.send(JSON.stringify(payload))
      this.stats.sent++
    } catch (err) {
      this.outbox.push(payload)
      this.warn('Send failed — queued:', err?.message || err)
      return opts.awaitAck
        ? Promise.reject(err)
        : payload
    }

    // === ACK ===
    if (opts.awaitAck) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.pendingAcks.delete(id)
          reject(new Error('ACK timeout'))
        }, opts.ackTimeout ?? 5000)

        this.pendingAcks.set(id, { resolve, reject, timeout, message: payload })
      })
    }

    return payload
  }

  flushOutbox() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
    if (!this.outbox.length) return

    this.log(`Flushing outbox (${this.outbox.length} messages)`)
    const pending = this.outbox.splice(0)
    pending.forEach(payload => {
      try {
        this.socket.send(JSON.stringify(payload))
        this.stats.sent++
      } catch (err) {
        this.outbox.push(payload)
      }
    })
  }

  /* ---------- Подписки ---------- */

  /**
   * Подписаться на сообщения.
   * @param {(msg) => void} handler
   * @param {string} [type] — фильтр по типу ('message' | 'typing' | 'read')
   * @returns {() => void} — unsubscribe
   */
  onMessage(handler, type = null) {
    const entry = { handler, type }
    if (!this.messageHandlers.find(h => h.handler === handler)) {
      this.messageHandlers.push(entry)
    }
    return () => this.offMessage(handler)
  }

  offMessage(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h.handler !== handler)
  }

  emitMessage(message) {
    this.messageHandlers.forEach(({ handler, type }) => {
      if (type && message?.type && message.type !== type) return
      try {
        handler(message)
      } catch (err) {
        console.error('[WS] Handler error:', err)
      }
    })
  }

  /* ---------- Чаты ---------- */

  /**
   * Подписаться на чат (получать события по нему).
   */
  joinChat(chatId) {
    const cid = Number(chatId)
    if (!Number.isFinite(cid)) return
    this.joinedChats.add(cid)

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'join', chatId: cid }))
    }
  }

  leaveChat(chatId) {
    const cid = Number(chatId)
    this.joinedChats.delete(cid)

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'leave', chatId: cid }))
    }
  }

  resubscribeChats() {
    this.joinedChats.forEach(cid => {
      try {
        this.socket.send(JSON.stringify({ type: 'join', chatId: cid }))
      } catch { /* no-op */ }
    })
  }

  /* ---------- Служебное ---------- */

  clearPendingMockReplies() {
    this.pendingMockReplies.forEach(t => clearTimeout(t))
    this.pendingMockReplies.clear()
  }

  getAutoResponse() {
    const responses = [
      'Здравствуйте! Да, автомобиль ещё продаётся.',
      'Можете приехать посмотреть в любое время.',
      'Цена обсуждаема при осмотре.',
      'Все документы в порядке, обслуживание у дилера.',
      'Есть небольшие сколы, могу скинуть фото.',
      'Давайте встретимся завтра в 15:00?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  /** Статистика для отладки */
  getStats() {
    return { ...this.stats, status: this.status, outbox: this.outbox.length, pendingAcks: this.pendingAcks.size }
  }

  /** Полная очистка (при logout) */
  reset() {
    this.disconnect({ manual: true, reason: 'reset' })
    this.messageHandlers = []
    this.statusHandlers = []
    this.joinedChats.clear()
    this.outbox = []
    this.pendingAcks.forEach(p => clearTimeout(p.timeout))
    this.pendingAcks.clear()
    this.reconnectAttempts = 0
    this.stats = { sent: 0, received: 0, dropped: 0, reconnects: 0 }
  }
}

export const chatSocket = new ChatSocket()
export { MessageType, ConnectionStatus }