import config from '@/config'
import axiosInstance from './axios'
import { mockFavourites } from '@/mock/favourites'

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

/** Устойчивый id-генератор (защита от collision при удалении) */
function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

/** Валидация id объявления */
function normalizeId(id) {
  const num = Number(id)
  return Number.isFinite(num) && num > 0 ? num : null
}

/** Нормализация ответа-списка */
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
 *  API
 * ============================================================ */

export const favouritesApi = {
  /**
   * Список избранного пользователя.
   * @param {Object} [params] — { page, perPage, sortBy, sortOrder }
   */
  async getFavourites(params = {}, opts = {}) {
    const page = Math.max(1, Number(params.page) || 1)
    const perPage = Math.min(100, Math.max(1, Number(params.perPage) || 20))

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      // Сортируем по дате добавления (свежие — сверху)
      const sorted = [...mockFavourites].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )

      const start = (page - 1) * perPage
      const end = start + perPage

      return {
        items: cloneDeep(sorted.slice(start, end)),
        total: sorted.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/favourites', {
      params: { ...params, page, perPage },
      signal: opts.signal
    })
    return normalizeList(data, { page, perPage })
  },

  /**
   * Добавить объявление в избранное.
   * Идемпотентно — повторный вызов не создаёт дубликат.
   */
  async addToFavourites(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return null

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const existing = mockFavourites.find(f => f.announcementId === annId)
      if (existing) return cloneDeep(existing)

      const favourite = {
        id: nextId(mockFavourites),
        announcementId: annId,
        createdAt: new Date().toISOString()
      }
      mockFavourites.push(favourite)
      return cloneDeep(favourite)
    }

    const { data } = await axiosInstance.post(
      '/favourites',
      { announcementId: annId },
      { signal: opts.signal }
    )
    return data
  },

  /**
   * Удалить из избранного.
   */
  async removeFromFavourites(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return { ok: false, reason: 'invalid_id' }

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)

      const index = mockFavourites.findIndex(f => f.announcementId === annId)
      if (index !== -1) mockFavourites.splice(index, 1)

      return { ok: true, announcementId: annId }
    }

    const { data } = await axiosInstance.delete(`/favourites/${annId}`, {
      signal: opts.signal
    })
    return data ?? { ok: true, announcementId: annId }
  },

  /**
   * Переключить избранное (главный метод для UI-сердечка).
   * Возвращает { isFavourite: boolean } — новое состояние.
   */
  async toggleFavourite(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return { isFavourite: false }

    // Если явно указано текущее состояние — не делаем лишний запрос
    const isCurrentlyFav =
      typeof opts.currentState === 'boolean'
        ? opts.currentState
        : await this.checkIsFavourite(annId, opts)

    if (isCurrentlyFav) {
      await this.removeFromFavourites(annId, opts)
      return { isFavourite: false, announcementId: annId }
    } else {
      await this.addToFavourites(annId, opts)
      return { isFavourite: true, announcementId: annId }
    }
  },

  /**
   * Проверить, находится ли объявление в избранном.
   * @returns {Promise<boolean>}
   */
  async checkIsFavourite(announcementId, opts = {}) {
    const annId = normalizeId(announcementId)
    if (!annId) return false

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      return mockFavourites.some(f => f.announcementId === annId)
    }

    // Используем лёгкий endpoint, чтобы не тянуть весь список
    const { data } = await axiosInstance.get(
      `/favourites/${annId}/exists`,
      { signal: opts.signal }
    )
    return Boolean(data?.isFavourite ?? data?.exists ?? false)
  },

  /**
   * Общее количество избранных объявлений (для бейджа).
   */
  async getFavouritesCount(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      return { count: mockFavourites.length }
    }

    const { data } = await axiosInstance.get('/favourites/count', {
      signal: opts.signal
    })
    return data
  },

  /**
   * Получить массив ID избранных (для быстрой проверки isFavourite на клиенте).
   */
  async getFavouriteIds(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 100)
      return mockFavourites.map(f => f.announcementId)
    }

    const { data } = await axiosInstance.get('/favourites/ids', {
      signal: opts.signal
    })
    return Array.isArray(data) ? data : data?.ids || []
  },

  /**
   * Очистить всё избранное.
   */
  async clearAll(opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 300)

      const count = mockFavourites.length
      mockFavourites.splice(0, mockFavourites.length)
      return { ok: true, removed: count }
    }

    const { data } = await axiosInstance.delete('/favourites', {
      signal: opts.signal
    })
    return data ?? { ok: true }
  }
}