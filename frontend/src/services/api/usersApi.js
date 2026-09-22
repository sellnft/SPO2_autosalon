import config from '@/config'
import axiosInstance from './axios'
import { mockUsers } from '@/mock/users'

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

/** Текущий юзер (в мок-режиме — id = 1) */
const CURRENT_USER_ID = 1

/* ============================================================
 *  Mock: сессии (стабильный набор — не генерируются заново)
 * ============================================================ */

const mockSessions = [
  {
    id: 1,
    device: 'Chrome на MacBook Pro',
    userAgent: 'Mozilla/5.0 ... Chrome/120',
    ip: '192.168.1.1',
    location: 'Москва, Россия',
    lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    current: true
  },
  {
    id: 2,
    device: 'Safari на iPhone 15',
    userAgent: 'Mozilla/5.0 ... Safari/17',
    ip: '192.168.1.2',
    location: 'Москва, Россия',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    current: false
  },
  {
    id: 3,
    device: 'Firefox на Windows',
    userAgent: 'Mozilla/5.0 ... Firefox/121',
    ip: '85.142.10.5',
    location: 'Санкт-Петербург, Россия',
    lastActive: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    current: false
  }
]

/* ============================================================
 *  API
 * ============================================================ */

export const usersApi = {
  /**
   * Получить пользователя по ID.
   */
  async getUser(id, opts = {}) {
    const uid = normalizeId(id)
    if (!uid) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const found = mockUsers.find(u => u.id === uid)
      return found ? cloneDeep(found) : null
    }

    const { data } = await axiosInstance.get(`/users/${uid}`, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Обновить текущего пользователя (или конкретного, если админ).
   * @param {Object} userData — { id?, ...поля }
   * @param {Object} [opts]
   * @param {boolean} [opts.isAdminEdit] — обновлять конкретного юзера (не /me)
   */
  async updateUser(userData, opts = {}) {
    if (!userData || typeof userData !== 'object') return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 400)

      const targetId = opts.isAdminEdit
        ? Number(userData.id)
        : CURRENT_USER_ID

      const index = mockUsers.findIndex(u => u.id === targetId)
      if (index === -1) return null

      // Не даём перезаписать id
      const { id, ...safeData } = userData
      mockUsers[index] = {
        ...mockUsers[index],
        ...cloneDeep(safeData),
        updatedAt: new Date().toISOString()
      }
      return cloneDeep(mockUsers[index])
    }

    // Эндпоинт зависит от режима
    const url = opts.isAdminEdit && userData.id
      ? `/users/${userData.id}`
      : '/users/me'

    const method = opts.isAdminEdit ? 'patch' : 'put'
    const { data } = await axiosInstance[method](url, userData, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Загрузить аватар (multipart/form-data).
   * axios сам поставит правильный Content-Type с boundary.
   */
  async uploadAvatar(file, opts = {}) {
    if (!file) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 600)

      // Имитируем URL — обычно возвращается сервером
      const fakeUrl = `https://i.pravatar.cc/200?u=${Date.now()}`
      const user = mockUsers.find(u => u.id === CURRENT_USER_ID)
      if (user) user.avatar = fakeUrl

      return { avatarUrl: fakeUrl }
    }

    const formData = new FormData()
    formData.append('avatar', file)

    const { data } = await axiosInstance.post('/users/me/avatar', formData, {
      signal: opts.signal,
      onUploadProgress: opts.onUploadProgress
    })
    return data
  },

  /**
   * Удалить аватар.
   */
  async deleteAvatar(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const user = mockUsers.find(u => u.id === CURRENT_USER_ID)
      if (user) user.avatar = null
      return { ok: true }
    }

    const { data } = await axiosInstance.delete('/users/me/avatar', {
      signal: opts.signal
    })
    return data ?? { ok: true }
  },

  /* ---------- Сессии ---------- */

  /**
   * Список активных сессий.
   */
  async getSessions(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      // Сортировка: текущая сессия сверху, остальные по lastActive desc
      const sorted = [...mockSessions].sort((a, b) => {
        if (a.current && !b.current) return -1
        if (!a.current && b.current) return 1
        return new Date(b.lastActive || 0) - new Date(a.lastActive || 0)
      })
      return cloneDeep(sorted)
    }

    const { data } = await axiosInstance.get('/users/sessions', {
      signal: opts.signal
    })
    return data
  },

  /**
   * Завершить конкретную сессию.
   */
  async revokeSession(sessionId, opts = {}) {
    const sid = normalizeId(sessionId)
    if (!sid) return { ok: false, reason: 'invalid_id' }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const idx = mockSessions.findIndex(s => s.id === sid)
      if (idx !== -1) mockSessions.splice(idx, 1)
      return { ok: true, id: sid }
    }

    const { data } = await axiosInstance.delete(`/users/sessions/${sid}`, {
      signal: opts.signal
    })
    return data ?? { ok: true, id: sid }
  },

  /**
   * Завершить все сессии, кроме текущей.
   */
  async revokeAllSessions(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)

      const removed = mockSessions.length
      // Оставляем только текущую
      const current = mockSessions.find(s => s.current)
      mockSessions.splice(0, mockSessions.length)
      if (current) mockSessions.push(current)

      return { ok: true, removed: removed - (current ? 1 : 0) }
    }

    const { data } = await axiosInstance.delete('/users/sessions', {
      signal: opts.signal
    })
    return data ?? { ok: true }
  },

  /* ---------- Пароль и безопасность ---------- */

  /**
   * Смена пароля.
   * payload: { currentPassword, newPassword }
   */
  async changePassword(payload, opts = {}) {
    if (!payload?.currentPassword || !payload?.newPassword) {
      return { ok: false, reason: 'missing_fields' }
    }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 600)
      return { ok: true }
    }

    const { data } = await axiosInstance.put('/users/password', payload, {
      signal: opts.signal
    })
    return data ?? { ok: true }
  },

  /**
   * Установить пароль (если у юзера нет — например, после OAuth).
   */
  async setPassword(password, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 400)
      return { ok: true }
    }

    const { data } = await axiosInstance.post('/users/password', { password }, {
      signal: opts.signal
    })
    return data ?? { ok: true }
  },

  /**
   * Верификация телефона.
   */
  async verifyPhone(code, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)
      return { ok: code === '1234' } // простой мок
    }

    const { data } = await axiosInstance.post('/users/verify-phone', { code }, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Запросить SMS с кодом верификации.
   */
  async requestPhoneVerification(phone, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)
      return { ok: true, phone }
    }

    const { data } = await axiosInstance.post(
      '/users/phone/request-verification',
      { phone },
      { signal: opts.signal }
    )
    return data
  },

  /* ---------- Аккаунт ---------- */

  /**
   * Удалить аккаунт (soft-delete обычно).
   * Требует пароль для подтверждения.
   */
  async deleteAccount(password, opts = {}) {
    if (!password) return { ok: false, reason: 'missing_password' }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 800)
      return { ok: true }
    }

    const { data } = await axiosInstance.delete('/users/me', {
      data: { password },
      signal: opts.signal
    })
    return data ?? { ok: true }
  },

  /**
   * Объявления конкретного пользователя (для профиля).
   * По сути проксирует announcementsApi, но с фильтром по seller.
   */
  async getUserAnnouncements(userId, params = {}, opts = {}) {
    const uid = normalizeId(userId)
    if (!uid) return { items: [], total: 0 }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 250)

      // Динамический импорт, чтобы не тянуть весь мок сразу
      const { mockAnnouncements } = await import('@/mock/announcements')

      const own = mockAnnouncements.filter(a => a.sellerId === uid)
      const page = Math.max(1, Number(params.page) || 1)
      const perPage = Math.min(100, Math.max(1, Number(params.perPage) || 20))
      const start = (page - 1) * perPage

      return {
        items: cloneDeep(own.slice(start, start + perPage)),
        total: own.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get(`/users/${uid}/announcements`, {
      params,
      signal: opts.signal
    })
    if (Array.isArray(data)) {
      return { items: data, total: data.length, page: 1, perPage: data.length }
    }
    return {
      items: data.items || [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      perPage: data.perPage ?? 20
    }
  }
}