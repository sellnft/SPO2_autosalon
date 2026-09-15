import config from '@/config'
import { tokenStorage } from '@/services/storage/tokenStorage'

class ChatSocket {
  constructor() {
    this.socket = null
    this.messageHandlers = []
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.shouldReconnect = true
  }

  connect() {
    if (this.connected) return

    if (config.api.useMock) {
      console.log('[Mock WS] Connected')
      this.connected = true
      return
    }

    try {
      const token = tokenStorage.getAccessToken()
      if (!token) {
        console.warn('[WS] No token, skipping connection')
        return
      }

      this.socket = new WebSocket(`${config.api.wsURL}/chat?token=${token}`)

      this.socket.onopen = () => {
        console.log('[WS] Connected')
        this.connected = true
        this.reconnectAttempts = 0
      }

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.emitMessage(message)
        } catch (err) {
          console.error('[WS] Failed to parse message:', err)
        }
      }

      this.socket.onerror = (error) => {
        console.error('[WS] Error:', error)
      }

      this.socket.onclose = (event) => {
        console.log('[WS] Closed:', event.code, event.reason)
        this.connected = false
        this.socket = null

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          setTimeout(() => this.connect(), this.reconnectDelay)
        }
      }
    } catch (err) {
      console.error('[WS] Connection failed:', err)
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.connected = false
    this.reconnectAttempts = 0
  }

  onMessage(handler) {
    if (!this.messageHandlers.includes(handler)) {
      this.messageHandlers.push(handler)
    }
  }

  offMessage(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
  }

  emitMessage(message) {
    this.messageHandlers.forEach(h => {
      try {
        h(message)
      } catch (err) {
        console.error('[WS] Handler error:', err)
      }
    })
  }

  sendMessage(chatId, content) {
    if (config.api.useMock) {
      const message = {
        id: Date.now(),
        chatId: Number(chatId),
        senderId: 1,
        content,
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sent'
      }

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          chatId: Number(chatId),
          senderId: chatId === 1 ? 3 : 2,
          content: this.getAutoResponse(),
          createdAt: new Date().toISOString(),
          read: false,
          status: 'received'
        }
        this.emitMessage(response)
      }, 2000 + Math.random() * 2000)

      return message
    }

    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify({ chatId, content }))
    } else {
      console.warn('[WS] Not connected, message dropped')
    }
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
}

export const chatSocket = new ChatSocket()