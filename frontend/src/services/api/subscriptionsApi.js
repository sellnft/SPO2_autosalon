import config from '@/config'
import axiosInstance from './axios'
import { mockSubscriptions, mockSavedSearches } from '@/mock/subscriptions'

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

/**
 * Хэш поиска — стабильный ключ для проверки дублей.
 * Поля сортируются, чтобы {a:1, b:2} и {b:2, a:1} давали одинаковый хэш.
 */
function searchHash(data) {
  if (!data || typeof data !== 'object') return ''
  const keys = Object.keys(data).sort()
  return keys.map(k => `${k}:${JSON.stringify(data[k])}`).join('|')
}

/* ============================================================
 *  API
 * ============================================================ */

export const subscriptionsApi = {
  /* ---------- Подписки на объявления ---------- */

  /**
   * Список активных подписок на объявления.
   * @param {Object} [params] — { page, perPage }
   */
  async getSubscriptions(params = {}, opts = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const perPage = Math.min(100, Math.max(1, Number(params.perPage) || 20))

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const sorted = [...mockSubscriptions].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )

      const start = (page - 1) * perPage
      return {
        items: cloneDeep(sorted.slice(start, start + perPage)),
        total: sorted.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/subscriptions', {
      params: { ...params, page, perPage },
      signal: opts.signal
    })
    return normalizeList(data, { page, perPage })
  },

  /**
   * Проверить, подписан ли пользователь на объявление.
   */
  async checkSubscription(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return false

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      return mockSubscriptions.some(s => s.announcementId === annId)
    }

    const { data } = await axiosInstance.get(
      `/subscriptions/${annId}/exists`,
      { signal: opts.signal }
    )
    return Boolean(data?.subscribed ?? data?.exists ?? false)
  },

  /**
   * Подписаться на объявление. Идемпотентно.
   */
  async subscribe(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const existing = mockSubscriptions.find(s => s.announcementId === annId)
      if (existing) return cloneDeep(existing)

      const subscription = {
        id: nextId(mockSubscriptions),
        announcementId: annId,
        createdAt: new Date().toISOString()
      }
      mockSubscriptions.push(subscription)
      return cloneDeep(subscription)
    }

    const { data } = await axiosInstance.post(
      '/subscriptions',
      { announcementId: annId },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Отписаться от объявления.
   */
  async unsubscribe(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return { ok: false, reason: 'invalid_id' }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const index = mockSubscriptions.findIndex(s => s.announcementId === annId)
      if (index !== -1) mockSubscriptions.splice(index, 1)
      return { ok: true, announcementId: annId }
    }

    const { data } = await axiosInstance.delete(`/subscriptions/${annId}`, {
      signal: opts.signal
    })
    return data ?? { ok: true, announcementId: annId }
  },

  /**
   * Переключить подписку (умная кнопка).
   * @param {Object} [opts]
   * @param {boolean} [opts.currentState] — текущее состояние (чтобы не делать лишний check)
   */
  async toggleSubscription(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return { subscribed: false }

    const isSubscribed =
      typeof opts.currentState === 'boolean'
        ? opts.currentState
        : await this.checkSubscription(annId, opts)

    if (isSubscribed) {
      await this.unsubscribe(annId, opts)
      return { subscribed: false, announcementId: annId }
    } else {
      await this.subscribe(annId, opts)
      return { subscribed: true, announcementId: annId }
    }
  },

  /**
   * Количество подписок (для бейджа).
   */
  async getSubscriptionsCount(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      return { count: mockSubscriptions.length }
    }

    const { data } = await axiosInstance.get('/subscriptions/count', {
      signal: opts.signal
    })
    return data
  },

  /* ---------- Сохранённые поиски ---------- */

  /**
   * Список сохранённых поисков.
   */
  async getSavedSearches(params = {}, opts = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const perPage = Math.min(100, Math.max(1, Number(params.perPage) || 20))

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const sorted = [...mockSavedSearches].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )

      const start = (page - 1) * perPage
      return {
        items: cloneDeep(sorted.slice(start, start + perPage)),
        total: sorted.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/subscriptions/saved-searches', {
      params: { ...params, page, perPage },
      signal: opts.signal
    })
    return normalizeList(data, { page, perPage })
  },

  /**
   * Сохранить поиск.
   * Идемпотентно — повторное сохранение того же поиска вернёт существующий.
   */
  async saveSearch(searchData, opts = {}) {
    if (!searchData || typeof searchData !== 'object') return null

    // Хотя бы название ИЛИ фильтры должны быть
    const hasFilters =
      searchData.filters && Object.keys(searchData.filters).length > 0
    const hasName = Boolean(searchData.name?.trim())
    if (!hasFilters && !hasName) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const hash = searchHash(searchData.filters || {})
      const existing = mockSavedSearches.find(
        s => searchHash(s.filters || {}) === hash && hash !== ''
      )

      // Если такой же поиск уже есть — возвращаем его
      if (existing && !opts.allowDuplicates) {
        return cloneDeep(existing)
      }

      const search = {
        id: nextId(mockSavedSearches),
        name: searchData.name?.trim() || 'Мой поиск',
        filters: cloneDeep(searchData.filters || {}),
        notificationsEnabled: searchData.notificationsEnabled ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockSavedSearches.push(search)
      return cloneDeep(search)
    }

    const { data } = await axiosInstance.post(
      '/subscriptions/saved-searches',
      searchData,
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Обновить сохранённый поиск.
   */
  async updateSavedSearch(searchId, updates, opts = {}) {
    const sid = normalizeId(searchId)
    if (!sid) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 250)
      const found = mockSavedSearches.find(s => s.id === sid)
      if (!found) return null

      Object.assign(found, {
        ...cloneDeep(updates),
        updatedAt: new Date().toISOString()
      })
      return cloneDeep(found)
    }

    const { data } = await axiosInstance.patch(
      `/subscriptions/saved-searches/${sid}`,
      updates,
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Включить/выключить уведомления по сохранённому поиску.
   */
  async toggleSearchNotifications(searchId, enabled, opts = {}) {
    return this.updateSavedSearch(
      searchId,
      { notificationsEnabled: enabled },
      opts
    )
  },

  /**
   * Удалить сохранённый поиск.
   */
  async deleteSavedSearch(searchId, opts = {}) {
    const sid = normalizeId(searchId)
    if (!sid) return { ok: false, reason: 'invalid_id' }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const index = mockSavedSearches.findIndex(s => s.id === sid)
      if (index !== -1) mockSavedSearches.splice(index, 1)
      return { ok: true, id: sid }
    }

    const { data } = await axiosInstance.delete(
      `/subscriptions/saved-searches/${sid}`,
      { signal: opts.signal }
    )
    return data ?? { ok: true, id: sid }
  },

  /**
   * Очистить все сохранённые поиски.
   */
  async clearSavedSearches(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)
      const removed = mockSavedSearches.length
      mockSavedSearches.splice(0, mockSavedSearches.length)
      return { ok: true, removed }
    }

    const { data } = await axiosInstance.delete(
      '/subscriptions/saved-searches',
      { signal: opts.signal }
    )
    return data ?? { ok: true }
  }
}