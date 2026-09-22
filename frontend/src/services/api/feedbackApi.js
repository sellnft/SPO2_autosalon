import config from '@/config'
import axiosInstance from './axios'
import { mockFeedback } from '@/mock/feedback'

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

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

/** Уникальный ID сообщения — timestamp + random */
function generateMessageId() {
  return Date.now() * 1000 + Math.floor(Math.random() * 1000)
}

function normalizeList(data, { page = 1, perPage = 20 } = {}) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page, perPage }
  }
  if (data && typeof data === 'object') {
    return {
      items: data.items || data.data || [],
      total: data.total ?? (data.items?.length ?? 0),
      page: data.page ?? page,
      perPage: data.perPage ?? perPage
    }
  }
  return { items: [], total: 0, page, perPage }
}

/* ============================================================
 *  Mock: реестр таймеров автоответов
 *  Нужен, чтобы чистить pending-таймеры при HMR / удалении
 * ============================================================ */

const pendingAutoReplies = new Set()

function scheduleMockAutoReply(feedback) {
  const timer = setTimeout(() => {
    try {
      const reply = {
        id: generateMessageId(),
        feedbackId: feedback.id,
        authorId: 100,
        authorName: 'Служба поддержки',
        authorType: 'admin',
        content: 'Спасибо за сообщение! Мы рассмотрим его в ближайшее время.',
        createdAt: new Date().toISOString(),
        read: false
      }
      feedback.messages.push(reply)
      feedback.updatedAt = new Date().toISOString()
      feedback.status = 'in_progress'
    } finally {
      pendingAutoReplies.delete(timer)
    }
  }, 3000)

  pendingAutoReplies.add(timer)
}

/** Вызывается при HMR / unmount модуля — опционально */
export function clearPendingAutoReplies() {
  pendingAutoReplies.forEach(t => clearTimeout(t))
  pendingAutoReplies.clear()
}

/* ============================================================
 *  API
 * ============================================================ */

export const feedbackApi = {
  /**
   * Список обращений пользователя.
   * @param {Object} [params] — { page, perPage, status, priority, search }
   */
  async getFeedback(params = {}, opts = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const perPage = Math.min(100, Math.max(1, Number(params.perPage) || 20))

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      let items = [...mockFeedback]

      // Фильтр по статусу
      if (params.status) {
        items = items.filter(f => f.status === params.status)
      }

      // Поиск
      if (params.search) {
        const q = String(params.search).toLowerCase()
        items = items.filter(f =>
          String(f.subject || '').toLowerCase().includes(q) ||
          String(f.id).includes(q)
        )
      }

      // Сортировка по updatedAt desc
      items.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      )

      const start = (page - 1) * perPage
      return {
        items: cloneDeep(items.slice(start, start + perPage)),
        total: items.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/feedback', {
      params: { ...params, page, perPage },
      signal: opts.signal
    })
    return normalizeList(data, { page, perPage })
  },

  /**
   * Одно обращение по ID.
   */
  async getFeedbackById(id, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const found = mockFeedback.find(f => f.id === Number(id))
      return found ? cloneDeep(found) : null
    }

    const { data } = await axiosInstance.get(`/feedback/${id}`, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Создать обращение.
   * data: { subject, category, priority?, message }
   */
  async createFeedback(data, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 400)

      const now = new Date().toISOString()
      const newId = nextId(mockFeedback)

      const feedback = {
        id: newId,
        userId: 1,
        userName: 'Вы',
        subject: data.subject,
        category: data.category,
        priority: data.priority || 'normal',
        status: 'open',
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: generateMessageId(),
            feedbackId: newId,
            authorId: 1,
            authorName: 'Вы',
            authorType: 'user',
            content: data.message,
            createdAt: now,
            read: true
          }
        ]
      }

      mockFeedback.push(feedback)
      return cloneDeep(feedback)
    }

    const { data: result } = await axiosInstance.post('/feedback', data, {
      signal: opts.signal
    })
    return result
  },

  /**
   * Отправить сообщение в обращение.
   * @param {number|string} feedbackId
   * @param {string} content
   * @param {Object} [opts]
   * @param {string} [opts.authorType='user'] — 'user' | 'admin'
   * @param {boolean} [opts.autoReply=true] — в mock-режиме генерировать авто-ответ
   */
  async sendMessage(feedbackId, content, opts = {}) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    const authorType = opts.authorType || 'user'

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const feedback = mockFeedback.find(f => f.id === Number(feedbackId))
      if (!feedback) {
        const err = new Error('Обращение не найдено')
        err.status = 404
        throw err
      }

      const message = {
        id: generateMessageId(),
        feedbackId: Number(feedbackId),
        authorId: authorType === 'admin' ? 100 : 1,
        authorName: authorType === 'admin' ? 'Служба поддержки' : 'Вы',
        authorType,
        content: text,
        createdAt: new Date().toISOString(),
        read: false
      }

      feedback.messages = feedback.messages || []
      feedback.messages.push(message)
      feedback.updatedAt = message.createdAt

      // Статус: юзер написал → open, админ → waiting_user
      if (authorType === 'admin') {
        feedback.status = 'waiting_user'
      } else {
        feedback.status = 'open'
      }

      // Авто-ответ только если юзер пишет и это включено (в админке — отключаем)
      const shouldAutoReply = opts.autoReply !== false && authorType === 'user'
      if (shouldAutoReply) {
        scheduleMockAutoReply(feedback)
      }

      return cloneDeep(message)
    }

    const { data: result } = await axiosInstance.post(
      `/feedback/${feedbackId}/messages`,
      { content: text },
      { signal: opts.signal }
    )
    return result
  },

  /**
   * Обновить статус обращения.
   */
  async updateStatus(feedbackId, status, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const feedback = mockFeedback.find(f => f.id === Number(feedbackId))
      if (!feedback) return null

      feedback.status = status
      feedback.updatedAt = new Date().toISOString()
      return cloneDeep(feedback)
    }

    const { data } = await axiosInstance.patch(
      `/feedback/${feedbackId}`,
      { status },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Пометить обращение прочитанным.
   * Тихий метод — не критично, если упадёт.
   */
  async markAsRead(feedbackId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      const feedback = mockFeedback.find(f => f.id === Number(feedbackId))
      if (feedback) {
        feedback.messages?.forEach(m => { m.read = true })
        feedback.unreadCount = 0
      }
      return { ok: true }
    }

    const { data } = await axiosInstance.post(
      `/feedback/${feedbackId}/read`,
      null,
      { signal: opts.signal }
    )
    return data ?? { ok: true }
  },

  /**
   * Закрыть обращение.
   */
  async closeFeedback(feedbackId, opts = {}) {
    return this.updateStatus(feedbackId, 'closed', opts)
  },

  /**
   * Удалить обращение (только для админа / автора до ответа).
   */
  async deleteFeedback(feedbackId, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const idx = mockFeedback.findIndex(f => f.id === Number(feedbackId))
      if (idx !== -1) mockFeedback.splice(idx, 1)
      return { ok: true }
    }

    const { data } = await axiosInstance.delete(`/feedback/${feedbackId}`, {
      signal: opts.signal
    })
    return data ?? { ok: true }
  }
}