import config from '@/config'
import axiosInstance from './axios'
import { mockUsers } from '@/mock/users'
import { mockAnnouncements } from '@/mock/announcements'
import { mockFeedback } from '@/mock/feedback'

/* ============================================================
 *  Внутренние хелперы
 * ============================================================ */

/**
 * Имитация задержки сети в mock-режиме.
 */
const mockDelay = (ms = 250) => new Promise(r => setTimeout(r, ms))

/**
 * Глубокая копия — чтобы mock-данные не мутировались между вызовами.
 * structuredClone (native) + fallback на JSON.
 */
function cloneDeep(value) {
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value) } catch { /* fallthrough */ }
  }
  return JSON.parse(JSON.stringify(value))
}

/**
 * Нормализация ответа списка: всегда возвращаем { items, total }.
 * На моке — оборачиваем массив, на API — берём как есть.
 */
function normalizeList(data) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length }
  }
  if (data && typeof data === 'object') {
    return {
      items: data.items || data.data || [],
      total: data.total ?? (data.items?.length ?? 0)
    }
  }
  return { items: [], total: 0 }
}

/**
 * Обёртка для запросов — единый формат ошибок.
 */
async function request(promiseFactory, { signal } = {}) {
  try {
    return await promiseFactory({ signal })
  } catch (err) {
    // Отменённые запросы — не логируем как ошибки
    if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
      throw err
    }
    // Прокидываем дальше в исходном виде — стор сам решит, что делать
    throw err
  }
}

/* ============================================================
 *  Mock-хелпер: общий каркас
 * ============================================================ */

async function mockOrRequest(mockFn, apiFn, opts = {}) {
  if (config.api.useMock) {
    await mockDelay(opts.delay ?? 250)
    return mockFn()
  }
  return request(apiFn, opts)
}

/* ============================================================
 *  API
 * ============================================================ */

export const adminApi = {
  /* ---------- Дашборд ---------- */

  async getDashboardStats(opts = {}) {
    return mockOrRequest(
      () => ({
        totalUsers: mockUsers.length,
        totalAnnouncements: mockAnnouncements.length,
        activeAnnouncements: mockAnnouncements.filter(a => a.status === 'active').length,
        pendingAnnouncements: mockAnnouncements.filter(a => a.status === 'pending').length,
        totalFeedback: mockFeedback.length,
        newFeedback: mockFeedback.filter(f => f.status === 'new' || f.status === 'open').length
      }),
      ({ signal }) => axiosInstance
        .get('/admin/stats', { signal })
        .then(r => r.data),
      opts
    )
  },

  /* ---------- Пользователи ---------- */

  async getUsers(params = {}, opts = {}) {
    return mockOrRequest(
      () => normalizeList(cloneDeep(mockUsers)),
      ({ signal }) => axiosInstance
        .get('/admin/users', { params, signal })
        .then(r => normalizeList(r.data)),
      opts
    )
  },

  async getUserById(id, opts = {}) {
    return mockOrRequest(
      () => {
        const user = mockUsers.find(u => u.id === Number(id))
        return user ? cloneDeep(user) : null
      },
      ({ signal }) => axiosInstance
        .get(`/admin/users/${id}`, { signal })
        .then(r => r.data),
      opts
    )
  },

  async blockUser(id, opts = {}) {
    return mockOrRequest(
      () => {
        // В mock-режиме модифицируем КОПИЮ, но сохраняем в mockUsers,
        // чтобы изменение было видно при следующем запросе
        const user = mockUsers.find(u => u.id === Number(id))
        if (user) {
          user.status = 'blocked'
          user.blockReason = 'Заблокирован администратором'
        }
        return user ? cloneDeep(user) : null
      },
      ({ signal }) => axiosInstance
        .put(`/admin/users/${id}/block`, null, { signal })
        .then(r => r.data),
      opts
    )
  },

  async unblockUser(id, opts = {}) {
    return mockOrRequest(
      () => {
        const user = mockUsers.find(u => u.id === Number(id))
        if (user) {
          user.status = 'active'
          user.blockReason = null
        }
        return user ? cloneDeep(user) : null
      },
      ({ signal }) => axiosInstance
        .put(`/admin/users/${id}/unblock`, null, { signal })
        .then(r => r.data),
      opts
    )
  },

  /* ---------- Объявления ---------- */

  async getAnnouncements(params = {}, opts = {}) {
    return mockOrRequest(
      () => normalizeList(cloneDeep(mockAnnouncements)),
      ({ signal }) => axiosInstance
        .get('/admin/announcements', { params, signal })
        .then(r => normalizeList(r.data)),
      opts
    )
  },

  async getAnnouncementById(id, opts = {}) {
    return mockOrRequest(
      () => {
        const a = mockAnnouncements.find(x => x.id === Number(id))
        return a ? cloneDeep(a) : null
      },
      ({ signal }) => axiosInstance
        .get(`/admin/announcements/${id}`, { signal })
        .then(r => r.data),
      opts
    )
  },

  async moderateAnnouncement(id, action, opts = {}) {
    return mockOrRequest(
      () => {
        const announcement = mockAnnouncements.find(a => a.id === Number(id))
        if (announcement) {
          const statusMap = {
            approve: 'active',
            reject: 'rejected',
            block: 'blocked'
          }
          announcement.status = statusMap[action] || announcement.status
        }
        return announcement ? cloneDeep(announcement) : null
      },
      ({ signal }) => axiosInstance
        .put(`/admin/announcements/${id}/moderate`, { action }, { signal })
        .then(r => r.data),
      { delay: 300, ...opts }
    )
  },

  /* ---------- Обращения ---------- */

  async getFeedback(params = {}, opts = {}) {
    return mockOrRequest(
      () => normalizeList(cloneDeep(mockFeedback)),
      ({ signal }) => axiosInstance
        .get('/admin/feedback', { params, signal })
        .then(r => normalizeList(r.data)),
      opts
    )
  },

  async getFeedbackById(id, opts = {}) {
    return mockOrRequest(
      () => {
        const fb = mockFeedback.find(f => f.id === Number(id))
        return fb ? cloneDeep(fb) : null
      },
      ({ signal }) => axiosInstance
        .get(`/admin/feedback/${id}`, { signal })
        .then(r => r.data),
      opts
    )
  },

  async updateFeedbackStatus(id, status, opts = {}) {
    return mockOrRequest(
      () => {
        const fb = mockFeedback.find(f => f.id === Number(id))
        if (fb) fb.status = status
        return fb ? cloneDeep(fb) : null
      },
      ({ signal }) => axiosInstance
        .patch(`/admin/feedback/${id}`, { status }, { signal })
        .then(r => r.data),
      opts
    )
  },

  async replyToFeedback(id, content, opts = {}) {
    return mockOrRequest(
      () => {
        const fb = mockFeedback.find(f => f.id === Number(id))
        if (fb) {
          fb.messages = fb.messages || []
          fb.messages.push({
            id: Date.now(),
            feedbackId: fb.id,
            authorId: 100,
            authorName: 'Служба поддержки',
            authorType: 'admin',
            content,
            createdAt: new Date().toISOString(),
            read: false
          })
          fb.status = 'waiting_user'
          fb.updatedAt = new Date().toISOString()
        }
        return fb ? cloneDeep(fb) : null
      },
      ({ signal }) => axiosInstance
        .post(`/admin/feedback/${id}/messages`, { content }, { signal })
        .then(r => r.data),
      opts
    )
  },

  /* ---------- Аудит ---------- */

  async getAuditLogs(params = {}, opts = {}) {
    // Стабильный mock: даты фиксированы относительно старта модуля,
    // чтобы не «прыгали» при перезапросах.
    const baseTime = Date.now()
    const mockLogs = [
      {
        id: 1,
        userId: 4,
        actorName: 'Администратор',
        action: 'login',
        details: 'Вход в систему',
        ip: '192.168.1.1',
        createdAt: new Date(baseTime - 3600000).toISOString()
      },
      {
        id: 2,
        userId: 1,
        actorName: 'Алексей Петров',
        action: 'create_announcement',
        details: 'Создание объявления #3',
        ip: '192.168.1.2',
        createdAt: new Date(baseTime - 7200000).toISOString()
      },
      {
        id: 3,
        userId: 4,
        actorName: 'Администратор',
        action: 'moderate_announcement',
        details: 'Одобрение объявления #5',
        ip: '192.168.1.1',
        createdAt: new Date(baseTime - 10800000).toISOString()
      },
      {
        id: 4,
        userId: 2,
        actorName: 'Мария Иванова',
        action: 'login',
        details: 'Вход в систему',
        ip: '192.168.1.3',
        createdAt: new Date(baseTime - 14400000).toISOString()
      }
    ]

    return mockOrRequest(
      () => normalizeList(mockLogs),
      ({ signal }) => axiosInstance
        .get('/admin/audit-logs', { params, signal })
        .then(r => normalizeList(r.data)),
      opts
    )
  }
}