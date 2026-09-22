import config from '@/config'
import axiosInstance from './axios'
import { mockChats } from '@/mock/chats'
import { mockMessages } from '@/mock/messages'

/* ============================================================
 *  Хелперы
 * ============================================================ */

const mockDelay = (ms = 200) => new Promise(r => setTimeout(r, ms))

function cloneDeep(value) {
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value) } catch { /* fallthrough */ }
  }
  return JSON.parse(JSON.stringify(value))
}

/** Универсальный id-генератор, устойчивый к удалениям */
function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

/** Генератор id для сообщений — timestamp + random, чтобы избежать коллизий */
function generateMessageId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000)
}

/** Сортировка сообщений по дате (asc по умолчанию) */
function sortMessages(items, order = 'asc') {
  const dir = order === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    const av = new Date(a.createdAt || 0).getTime()
    const bv = new Date(b.createdAt || 0).getTime()
    return (av - bv) * dir
  })
}

/* ============================================================
 *  API
 * ============================================================ */

export const chatApi = {
  /**
   * Список чатов пользователя.
   * @returns {Promise<{ items: Array, total: number }>}
   */
  async getChats(params = {}, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      // Возвращаем чаты текущего юзера (id = 1)
      const items = mockChats
        .filter(c => c.buyerId === 1 || c.sellerId === 1)
        .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))

      return {
        items: cloneDeep(items),
        total: items.length
      }
    }

    const { data } = await axiosInstance.get('/chats', {
      params,
      signal: opts.signal
    })
    return Array.isArray(data)
      ? { items: data, total: data.length }
      : { items: data.items || [], total: data.total ?? 0 }
  },

  /**
   * Один чат по ID.
   */
  async getChat(chatId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)
      const found = mockChats.find(c => c.id === Number(chatId))
      return found ? cloneDeep(found) : null
    }

    const { data } = await axiosInstance.get(`/chats/${chatId}`, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Сообщения чата с пагинацией.
   * @param {number|string} chatId
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.perPage=50]
   * @param {'asc'|'desc'} [params.order='asc']
   */
  async getMessages(chatId, params = {}, opts = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const perPage = Math.min(200, Math.max(1, Number(params.perPage) || 50))
    const order = params.order || 'asc'

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      let items = mockMessages.filter(m => m.chatId === Number(chatId))
      items = sortMessages(items, order)

      const start = (page - 1) * perPage
      const end = start + perPage

      return {
        items: cloneDeep(items.slice(start, end)),
        total: items.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get(`/chats/${chatId}/messages`, {
      params: { ...params, page, perPage, order },
      signal: opts.signal
    })
    return Array.isArray(data)
      ? { items: data, total: data.length, page, perPage }
      : {
          items: data.items || [],
          total: data.total ?? 0,
          page: data.page ?? page,
          perPage: data.perPage ?? perPage
        }
  },

  /**
   * Отправить сообщение.
   * @param {number|string} chatId
   * @param {string} content
   * @param {Object} [opts]
   * @param {number} [opts.senderId=1]
   */
  async sendMessage(chatId, content, opts = {}) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const senderId = opts.senderId ?? 1
      const message = {
        id: generateMessageId(),
        chatId: Number(chatId),
        senderId,
        content: text,
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sent'
      }
      mockMessages.push(message)

      // Обновляем метаданные чата
      const chat = mockChats.find(c => c.id === Number(chatId))
      if (chat) {
        chat.lastMessage = text
        chat.lastMessageAt = message.createdAt
      }

      return cloneDeep(message)
    }

    const { data } = await axiosInstance.post(
      `/chats/${chatId}/messages`,
      { content: text },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Создать или найти существующий чат.
   * Ищем по (announcementId + buyerId), чтобы не было дублей.
   */
  async createChat(announcementId, sellerId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)

      const annId = Number(announcementId)
      const currentUserId = 1 // мок: текущий юзер

      // Ищем чат этого пользователя по этому объявлению
      const existing = mockChats.find(
        c => c.announcementId === annId && c.buyerId === currentUserId
      )
      if (existing) return cloneDeep(existing)

      const chat = {
        id: nextId(mockChats),
        announcementId: annId,
        sellerId: Number(sellerId),
        buyerId: currentUserId,
        sellerName: 'Продавец',
        buyerName: 'Вы',
        announcementTitle: 'Объявление',
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString()
      }
      mockChats.push(chat)
      return cloneDeep(chat)
    }

    const { data } = await axiosInstance.post(
      '/chats',
      { announcementId, sellerId },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Пометить сообщения чата прочитанными.
   * @param {number|string} chatId
   * @param {Object} [opts]
   * @param {number|string} [opts.lastMessageId] — если передано, помечаем только до него
   */
  async markAsRead(chatId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)

      const cid = Number(chatId)
      let updated = 0

      mockMessages.forEach(m => {
        if (m.chatId === cid && !m.read && m.senderId !== 1) {
          m.read = true
          updated++
        }
      })

      const chat = mockChats.find(c => c.id === cid)
      if (chat) chat.unreadCount = 0

      return { ok: true, updated }
    }

    const { data } = await axiosInstance.post(
      `/chats/${chatId}/read`,
      { lastMessageId: opts.lastMessageId },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Удалить сообщение.
   */
  async deleteMessage(chatId, messageId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)

      const idx = mockMessages.findIndex(
        m => m.id === Number(messageId) && m.chatId === Number(chatId)
      )
      if (idx !== -1) mockMessages.splice(idx, 1)

      return { ok: true }
    }

    const { data } = await axiosInstance.delete(
      `/chats/${chatId}/messages/${messageId}`,
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Редактировать сообщение.
   */
  async editMessage(chatId, messageId, content, opts = {}) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)

      const found = mockMessages.find(
        m => m.id === Number(messageId) && m.chatId === Number(chatId)
      )
      if (!found) return null

      found.content = text
      found.editedAt = new Date().toISOString()
      return cloneDeep(found)
    }

    const { data } = await axiosInstance.patch(
      `/chats/${chatId}/messages/${messageId}`,
      { content: text },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Общее количество непрочитанных сообщений (для бейджа в хедере).
   */
  async getUnreadCount(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      const total = mockMessages.filter(m => !m.read && m.senderId !== 1).length
      return { count: total }
    }

    const { data } = await axiosInstance.get('/chats/unread-count', {
      signal: opts.signal
    })
    return data
  },

  /**
   * Удалить чат целиком.
   */
  async deleteChat(chatId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const cid = Number(chatId)
      const chatIdx = mockChats.findIndex(c => c.id === cid)
      if (chatIdx !== -1) mockChats.splice(chatIdx, 1)

      // Удаляем все сообщения этого чата
      for (let i = mockMessages.length - 1; i >= 0; i--) {
        if (mockMessages[i].chatId === cid) mockMessages.splice(i, 1)
      }

      return { ok: true }
    }

    const { data } = await axiosInstance.delete(`/chats/${chatId}`, {
      signal: opts.signal
    })
    return data
  }
}