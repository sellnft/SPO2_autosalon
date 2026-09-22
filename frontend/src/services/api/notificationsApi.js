import config from '@/config'
import axiosInstance from './axios'
import { mockNotifications } from '@/mock/notifications'

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

function normalizeId(id) {
  const num = Number(id)
  return Number.isFinite(num) && num > 0 ? num : null
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
 *  Mock-настройки уведомлений (по умолчанию)
 * ============================================================ */

const defaultNotificationSettings = {
  email: {
    newMessage: true,
    newAnnouncement: false,
    priceChange: true,
    system: true
  },
  push: {
    newMessage: true,
    newAnnouncement: false,
    priceChange: false,
    system: true
  },
  frequency: 'instant' // 'instant' | 'daily' | 'weekly'
}

let mockNotificationSettings = cloneDeep(defaultNotificationSettings)

/* ============================================================
 *  API
 * ============================================================ */

export const notificationsApi = {
  /**
   * Список уведомлений.
   * @param {Object} [params] — { page, perPage, onlyUnread, type }
   */
  async getNotifications(params = {}, opts = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const perPage = Math.min(100, Math.max(1, Number(params.perPage) || 20))

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      let items = [...mockNotifications]

      if (params.onlyUnread) {
        items = items.filter(n => !n.read)
      }
      if (params.type) {
        items = items.filter(n => n.type === params.type)
      }

      // Свежие сверху
      items.sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )

      const start = (page - 1) * perPage
      return {
        items: cloneDeep(items.slice(start, start + perPage)),
        total: items.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/notifications', {
      params: { ...params, page, perPage },
      signal: opts.signal
    })
    return normalizeList(data, { page, perPage })
  },

  /**
   * Одно уведомление по ID.
   */
  async getNotification(id, opts = {}) {
    const nid = normalizeId(id)
    if (!nid) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)
      const found = mockNotifications.find(n => n.id === nid)
      return found ? cloneDeep(found) : null
    }

    const { data } = await axiosInstance.get(`/notifications/${nid}`, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Пометить одно уведомление прочитанным.
   */
  async markAsRead(id, opts = {}) {
    const nid = normalizeId(id)
    if (!nid) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      const n = mockNotifications.find(x => x.id === nid)
      if (!n) return null
      n.read = true
      n.readAt = new Date().toISOString()
      return cloneDeep(n)
    }

    const { data } = await axiosInstance.put(
      `/notifications/${nid}/read`,
      null,
      { signal: opts.signal }
    )
    return data ?? { ok: true, id: nid }
  },

  /**
   * Пометить несколько прочитанными.
   */
  async markManyAsRead(ids, opts = {}) {
    if (!Array.isArray(ids) || !ids.length) return { ok: true, updated: 0 }

    const normalized = ids.map(normalizeId).filter(Boolean)
    if (!normalized.length) return { ok: true, updated: 0 }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)
      let updated = 0
      mockNotifications.forEach(n => {
        if (normalized.includes(n.id) && !n.read) {
          n.read = true
          n.readAt = new Date().toISOString()
          updated++
        }
      })
      return { ok: true, updated }
    }

    const { data } = await axiosInstance.post(
      '/notifications/read',
      { ids: normalized },
      { signal: opts.signal }
    )
    return data ?? { ok: true, updated: normalized.length }
  },

  /**
   * Пометить все прочитанными.
   */
  async markAllAsRead(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      let updated = 0
      mockNotifications.forEach(n => {
        if (!n.read) {
          n.read = true
          n.readAt = new Date().toISOString()
          updated++
        }
      })
      return { ok: true, updated }
    }

    const { data } = await axiosInstance.put(
      '/notifications/read-all',
      null,
      { signal: opts.signal }
    )
    return data ?? { ok: true }
  },

  /**
   * Удалить одно уведомление.
   */
  async deleteNotification(id, opts = {}) {
    const nid = normalizeId(id)
    if (!nid) return { ok: false }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)
      const idx = mockNotifications.findIndex(n => n.id === nid)
      if (idx !== -1) mockNotifications.splice(idx, 1)
      return { ok: true, id: nid }
    }

    const { data } = await axiosInstance.delete(`/notifications/${nid}`, {
      signal: opts.signal
    })
    return data ?? { ok: true, id: nid }
  },

  /**
   * Очистить все уведомления.
   */
  async clearAll(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)
      const removed = mockNotifications.length
      mockNotifications.splice(0, mockNotifications.length)
      return { ok: true, removed }
    }

    const { data } = await axiosInstance.delete('/notifications', {
      signal: opts.signal
    })
    return data ?? { ok: true }
  },

  /**
   * Лёгкий запрос — количество непрочитанных (для бейджа в хедере).
   */
  async getUnreadCount(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      return { count: mockNotifications.filter(n => !n.read).length }
    }

    const { data } = await axiosInstance.get('/notifications/unread-count', {
      signal: opts.signal
    })
    return data
  },

  /* ---------- Настройки ---------- */

  /**
   * Получить настройки уведомлений.
   */
  async getSettings(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)
      return cloneDeep(mockNotificationSettings)
    }

    const { data } = await axiosInstance.get('/notifications/settings', {
      signal: opts.signal
    })
    return data
  },

  /**
   * Обновить настройки уведомлений.
   * Делаем merge с текущими — чтобы можно было обновить часть.
   */
  async updateSettings(settings, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)
      mockNotificationSettings = {
        ...mockNotificationSettings,
        ...cloneDeep(settings),
        email: {
          ...mockNotificationSettings.email,
          ...(settings.email || {})
        },
        push: {
          ...mockNotificationSettings.push,
          ...(settings.push || {})
        }
      }
      return cloneDeep(mockNotificationSettings)
    }

    const { data } = await axiosInstance.put(
      '/notifications/settings',
      settings,
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Сбросить настройки к дефолтным.
   */
  async resetSettings(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      mockNotificationSettings = cloneDeep(defaultNotificationSettings)
      return cloneDeep(mockNotificationSettings)
    }

    const { data } = await axiosInstance.post(
      '/notifications/settings/reset',
      null,
      { signal: opts.signal }
    )
    return data
  }
}