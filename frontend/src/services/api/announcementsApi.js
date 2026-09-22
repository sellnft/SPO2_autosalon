import config from '@/config'
import axiosInstance from './axios'
import { mockAnnouncements } from '@/mock/announcements'

/* ============================================================
 *  Хелперы
 * ============================================================ */

const mockDelay = (ms = 250) => new Promise(r => setTimeout(r, ms))

function cloneDeep(value) {
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value) } catch { /* fallthrough */ }
  }
  return JSON.parse(JSON.stringify(value))
}

/**
 * Универсальное сравнение значения с фильтром.
 * Поддерживает: одиночное значение, массив значений (OR),
 * диапазоны (передаются отдельно через *From / *To).
 */
function matches(value, filter) {
  if (filter == null || filter === '') return true
  if (Array.isArray(filter)) {
    if (!filter.length) return true
    return filter.includes(value)
  }
  return value === filter
}

/**
 * Сравнение «содержит» для строковых полей.
 */
function matchesLike(value, query) {
  if (!query) return true
  return String(value ?? '').toLowerCase().includes(String(query).toLowerCase())
}

/**
 * Сортировка с учётом типов.
 * Безопасна к null/undefined/NaN.
 */
function sortItems(items, sortBy, sortOrder) {
  const dir = sortOrder === 'asc' ? 1 : -1

  return [...items].sort((a, b) => {
    let av = a[sortBy]
    let bv = b[sortBy]

    // Даты
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      av = av ? new Date(av).getTime() : 0
      bv = bv ? new Date(bv).getTime() : 0
      if (Number.isNaN(av)) av = 0
      if (Number.isNaN(bv)) bv = 0
    }

    // null/undefined — в конец (независимо от порядка)
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1

    // Числа
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * dir
    }

    // Строки
    if (typeof av === 'string' && typeof bv === 'string') {
      return av.localeCompare(bv) * dir
    }

    // Булевы/смешанные
    return (av > bv ? 1 : av < bv ? -1 : 0) * dir
  })
}

/**
 * Нормализация параметров пагинации.
 */
function normalizePagination(params) {
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = Math.min(
    100,
    Math.max(1, Number(params.perPage) || 20)
  )
  return { page, perPage }
}

/**
 * Нормализация ответа списка — единый формат.
 */
function normalizeListResponse(data, { page, perPage } = {}) {
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: page || 1, perPage: perPage || data.length }
  }
  if (data && typeof data === 'object') {
    return {
      items: data.items || data.data || [],
      total: data.total ?? (data.items?.length ?? 0),
      page: data.page ?? page ?? 1,
      perPage: data.perPage ?? perPage ?? 20
    }
  }
  return { items: [], total: 0, page: page || 1, perPage: perPage || 20 }
}

/* ============================================================
 *  Mock-фильтрация + сортировка
 * ============================================================ */

function applyMockFilters(source, params) {
  let filtered = [...source]

  // Текстовый поиск (title, brand, model, description)
  if (params.search) {
    const q = params.search
    filtered = filtered.filter(a =>
      matchesLike(a.title, q) ||
      matchesLike(a.brand, q) ||
      matchesLike(a.model, q) ||
      matchesLike(a.description, q)
    )
  }

  // Прямые фильтры (в т.ч. массивы)
  if (params.brand) filtered = filtered.filter(a => matches(a.brand, params.brand))
  if (params.bodyType) filtered = filtered.filter(a => matches(a.bodyType, params.bodyType))
  if (params.transmission) filtered = filtered.filter(a => matches(a.transmission, params.transmission))
  if (params.drive) filtered = filtered.filter(a => matches(a.drive, params.drive))
  if (params.city) filtered = filtered.filter(a => matches(a.city, params.city))
  if (params.color) filtered = filtered.filter(a => matches(a.color, params.color))
  if (params.fuel) filtered = filtered.filter(a => matches(a.fuel, params.fuel))
  if (params.sellerType) filtered = filtered.filter(a => matches(a.sellerType, params.sellerType))

  // Модель — по вхождению
  if (params.model) {
    filtered = filtered.filter(a => matchesLike(a.model, params.model))
  }

  // Диапазоны (числовые)
  const rangeFilters = [
    ['yearFrom', 'year', '>='],
    ['yearTo', 'year', '<='],
    ['priceFrom', 'price', '>='],
    ['priceTo', 'price', '<='],
    ['mileageFrom', 'mileage', '>='],
    ['mileageTo', 'mileage', '<='],
    ['powerFrom', 'power', '>='],
    ['powerTo', 'power', '<=']
  ]

  for (const [paramKey, field, op] of rangeFilters) {
    const raw = params[paramKey]
    if (raw === undefined || raw === null || raw === '') continue

    const num = Number(raw)
    if (!Number.isFinite(num)) continue

    filtered = filtered.filter(a => {
      const value = Number(a[field])
      if (!Number.isFinite(value)) return false
      return op === '>=' ? value >= num : value <= num
    })
  }

  // Boolean
  if (params.onlyWithPhoto) {
    filtered = filtered.filter(a => Array.isArray(a.photos) && a.photos.length > 0)
  }
  if (params.exchange) {
    filtered = filtered.filter(a => a.exchange === true)
  }

  return filtered
}

/* ============================================================
 *  API
 * ============================================================ */

export const announcementsApi = {
  /**
   * Список объявлений с фильтрами, сортировкой и пагинацией.
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.perPage=20]
   * @param {string} [params.sortBy='createdAt']
   * @param {'asc'|'desc'} [params.sortOrder='desc']
   * @param {Object} [opts]
   * @param {AbortSignal} [opts.signal]
   */
  async getAnnouncements(params = {}, opts = {}) {
    const { page, perPage } = normalizePagination(params)

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 250)

      let filtered = applyMockFilters(mockAnnouncements, params)
      filtered = sortItems(filtered, params.sortBy || 'createdAt', params.sortOrder || 'desc')

      const start = (page - 1) * perPage
      const end = start + perPage

      return {
        items: cloneDeep(filtered.slice(start, end)),
        total: filtered.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/announcements', {
      params,
      signal: opts.signal
    })
    return normalizeListResponse(data, { page, perPage })
  },

  /**
   * Одно объявление по ID.
   */
  async getAnnouncement(id, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const found = mockAnnouncements.find(a => a.id === Number(id))
      return found ? cloneDeep(found) : null
    }

    const { data } = await axiosInstance.get(`/announcements/${id}`, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Популярные объявления (для главной).
   */
  async getPopular(limit = 6, opts = {}) {
    return this.getAnnouncements(
      { perPage: limit, sortBy: 'views', sortOrder: 'desc' },
      opts
    )
  },

  /**
   * Свежие объявления (для главной).
   */
  async getFresh(limit = 6, opts = {}) {
    return this.getAnnouncements(
      { perPage: limit, sortBy: 'createdAt', sortOrder: 'desc' },
      opts
    )
  },

  /**
   * Мои объявления (для профиля).
   */
  async getMyAnnouncements(params = {}, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 250)
      // В моке считаем, что sellerId = 1 (текущий юзер)
      const currentSellerId = 1
      const own = mockAnnouncements.filter(a => a.sellerId === currentSellerId)
      const filtered = applyMockFilters(own, params)
      const sorted = sortItems(filtered, params.sortBy || 'createdAt', params.sortOrder || 'desc')

      const { page, perPage } = normalizePagination(params)
      const start = (page - 1) * perPage
      return {
        items: cloneDeep(sorted.slice(start, start + perPage)),
        total: sorted.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/announcements/my', {
      params,
      signal: opts.signal
    })
    return normalizeListResponse(data, normalizePagination(params))
  },

  /**
   * Создать объявление.
   */
  async createAnnouncement(payload, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 400)
      const newAnnouncement = {
        id: Math.max(0, ...mockAnnouncements.map(a => a.id)) + 1,
        ...cloneDeep(payload),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        favourites: 0
      }
      mockAnnouncements.unshift(newAnnouncement)
      return cloneDeep(newAnnouncement)
    }

    const { data } = await axiosInstance.post('/announcements', payload, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Обновить объявление.
   * @param {Object} [opts]
   * @param {boolean} [opts.partial=true] — merge или полная замена
   */
  async updateAnnouncement(id, payload, opts = {}) {
    const { partial = true } = opts

    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 400)
      const index = mockAnnouncements.findIndex(a => a.id === Number(id))
      if (index === -1) return null

      const current = mockAnnouncements[index]
      const next = partial
        ? { ...current, ...cloneDeep(payload), updatedAt: new Date().toISOString() }
        : { ...cloneDeep(payload), id: current.id, updatedAt: new Date().toISOString() }

      mockAnnouncements[index] = next
      return cloneDeep(next)
    }

    const { data } = await axiosInstance.put(`/announcements/${id}`, payload, {
      signal: opts.signal
    })
    return data
  },

  /**
   * Удалить объявление.
   */
  async deleteAnnouncement(id, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 200)
      const index = mockAnnouncements.findIndex(a => a.id === Number(id))
      if (index !== -1) mockAnnouncements.splice(index, 1)
      return true
    }

    await axiosInstance.delete(`/announcements/${id}`, {
      signal: opts.signal
    })
    return true
  },

  /**
   * Увеличить просмотры (оптимистично, тихо).
   */
  async incrementViews(id, opts = {}) {
    if (config.api.useMock) {
      const found = mockAnnouncements.find(a => a.id === Number(id))
      if (found) found.views = (found.views || 0) + 1
      return true
    }

    try {
      await axiosInstance.post(`/announcements/${id}/views`, null, {
        signal: opts.signal
      })
      return true
    } catch {
      // Тихая ошибка — просмотры не критичны
      return false
    }
  },

  /**
   * Добавить/убрать из избранного (toggle).
   */
  async toggleFavourite(id, opts = {}) {
    if (config.api.useMock) {
      await mockDelay(opts.delay ?? 150)
      const found = mockAnnouncements.find(a => a.id === Number(id))
      if (!found) return null
      found.isFavourite = !found.isFavourite
      found.favourites = (found.favourites || 0) + (found.isFavourite ? 1 : -1)
      return cloneDeep(found)
    }

    const { data } = await axiosInstance.post(`/announcements/${id}/favourite`, null, {
      signal: opts.signal
    })
    return data
  }
}