import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { announcementsApi } from '@/services/api/announcementsApi'

/* ============================================================
 *  Дефолтные фильтры (один источник правды)
 * ============================================================ */

const DEFAULT_FILTERS = Object.freeze({
  search: '',
  brand: '',
  model: '',
  yearFrom: null,
  yearTo: null,
  priceFrom: null,
  priceTo: null,
  mileageFrom: null,
  mileageTo: null,
  bodyType: '',
  transmission: '',
  drive: '',
  color: '',
  city: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  perPage: 20
})

function makeDefaultFilters() {
  return { ...DEFAULT_FILTERS }
}

export const useAnnouncementsStore = defineStore('announcements', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const announcements = ref([])
  const currentAnnouncement = ref(null)
  const totalItems = ref(0)

  const filters = ref(makeDefaultFilters())

  // Отдельные флаги (не блокируем весь список, когда удаляем 1 элемент)
  const loading = ref(false)
  const mutating = ref(false)
  const error = ref(null)

  // Версия для race-condition guard
  let fetchSeq = 0

  // Простой кэш детальных страниц
  const detailCache = new Map()

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const hasAnnouncements = computed(() => announcements.value.length > 0)

  /** Загрузили и ничего не нашли */
  const isEmpty = computed(() =>
    !loading.value && announcements.value.length === 0
  )

  /** Есть ли активные фильтры (отличные от дефолта) */
  const hasActiveFilters = computed(() => {
    const f = filters.value
    return (
      Boolean(f.search) ||
      Boolean(f.brand) ||
      Boolean(f.model) ||
      Boolean(f.bodyType) ||
      Boolean(f.transmission) ||
      Boolean(f.drive) ||
      Boolean(f.color) ||
      Boolean(f.city) ||
      f.yearFrom != null ||
      f.yearTo != null ||
      f.priceFrom != null ||
      f.priceTo != null ||
      f.mileageFrom != null ||
      f.mileageTo != null
    )
  })

  /** Количество активных фильтров (для бейджа) */
  const activeFiltersCount = computed(() => {
    const f = filters.value
    let count = 0
    if (f.search) count++
    if (f.brand) count++
    if (f.model) count++
    if (f.bodyType) count++
    if (f.transmission) count++
    if (f.drive) count++
    if (f.color) count++
    if (f.city) count++
    if (f.yearFrom != null || f.yearTo != null) count++
    if (f.priceFrom != null || f.priceTo != null) count++
    if (f.mileageFrom != null || f.mileageTo != null) count++
    return count
  })

  /* ============================================================
   *  ХЕЛПЕРЫ
   * ============================================================ */

  function normalizeError(err) {
    return err?.message || String(err) || 'Неизвестная ошибка'
  }

  function patchInList(id, patch) {
    const index = announcements.value.findIndex(a => a.id === Number(id))
    if (index === -1) return false

    announcements.value = [
      ...announcements.value.slice(0, index),
      { ...announcements.value[index], ...patch },
      ...announcements.value.slice(index + 1)
    ]
    return true
  }

  /* ============================================================
   *  LIST
   * ============================================================ */

  /**
   * Загрузить список объявлений.
   * @param {Object} [params] — переопределения текущих фильтров
   */
  async function fetchAnnouncements(params = {}) {
    const seq = ++fetchSeq
    loading.value = true
    error.value = null

    try {
      const query = { ...filters.value, ...params }
      const response = await announcementsApi.getAnnouncements(query)

      // Race-condition guard: применяем результат только если это последний запрос
      if (seq !== fetchSeq) return response

      announcements.value = response.items || []
      totalItems.value = response.total ?? response.items?.length ?? 0
      return response
    } catch (err) {
      if (seq === fetchSeq) {
        error.value = normalizeError(err)
      }
      throw err
    } finally {
      if (seq === fetchSeq) {
        loading.value = false
      }
    }
  }

  /** Повторный запрос с текущими фильтрами */
  async function refetch() {
    return fetchAnnouncements(filters.value)
  }

  /* ============================================================
   *  DETAIL
   * ============================================================ */

  /**
   * Загрузить одно объявление.
   * @param {number|string} id
   * @param {Object} [opts]
   * @param {boolean} [opts.useCache=true]
   * @param {boolean} [opts.force=false] — обойти кэш и загрузить заново
   */
  async function fetchAnnouncement(id, opts = {}) {
    const key = Number(id)

    // Кэш
    if (!opts.force && opts.useCache !== false && detailCache.has(key)) {
      currentAnnouncement.value = detailCache.get(key)
      return currentAnnouncement.value
    }

    loading.value = true
    error.value = null
    try {
      const item = await announcementsApi.getAnnouncement(id)
      currentAnnouncement.value = item
      if (item) detailCache.set(key, item)
      return item
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Сбросить текущее объявление (при уходе со страницы) */
  function clearCurrent() {
    currentAnnouncement.value = null
  }

  /** Сбросить кэш (после logout, принудительного обновления) */
  function clearDetailCache() {
    detailCache.clear()
  }

  /* ============================================================
   *  CRUD
   * ============================================================ */

  async function createAnnouncement(data) {
    mutating.value = true
    error.value = null

    try {
      const announcement = await announcementsApi.createAnnouncement(data)

      // Оптимистично — в начало списка
      if (announcement) {
        announcements.value = [announcement, ...announcements.value]
        totalItems.value += 1
        detailCache.set(announcement.id, announcement)
      }

      return announcement
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /**
   * Обновить объявление.
   * @param {number|string} id
   * @param {Object} data
   * @param {Object} [opts]
   * @param {boolean} [opts.partial=true] — merge с существующим или полная замена
   */
  async function updateAnnouncement(id, data, opts = {}) {
    const key = Number(id)
    const prev = announcements.value.find(a => a.id === key)

    mutating.value = true
    error.value = null

    // Optimistic: сразу применяем изменения
    if (prev) patchInList(id, data)

    try {
      const announcement = await announcementsApi.updateAnnouncement(id, data)

      if (announcement) {
        // Merge, а не замена — сохраняем поля, которых нет в ответе
        const merged = opts.partial === false
          ? announcement
          : { ...prev, ...announcement }
        patchInList(id, merged)

        if (currentAnnouncement.value?.id === key) {
          currentAnnouncement.value = {
            ...currentAnnouncement.value,
            ...merged
          }
        }

        detailCache.set(key, merged)
      }

      return announcement
    } catch (err) {
      // Откат
      if (prev) patchInList(id, prev)
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function deleteAnnouncement(id) {
    const key = Number(id)
    const prev = announcements.value.find(a => a.id === key)

    mutating.value = true
    error.value = null

    // Optimistic
    announcements.value = announcements.value.filter(a => a.id !== key)
    totalItems.value = Math.max(0, totalItems.value - 1)

    try {
      await announcementsApi.deleteAnnouncement(id)
      detailCache.delete(key)
      return { id: key }
    } catch (err) {
      // Откат
      if (prev) {
        announcements.value = [prev, ...announcements.value]
        totalItems.value += 1
      }
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  ДЕЙСТВИЯ НАД ОБЪЯВЛЕНИЕМ
   * ============================================================ */

  /** Увеличить счётчик просмотров (тихо) */
  async function incrementViews(id) {
    const key = Number(id)

    // Optimistic
    const item = announcements.value.find(a => a.id === key)
    if (item) patchInList(id, { views: (item.views || 0) + 1 })

    const current = currentAnnouncement.value
    if (current?.id === key) {
      currentAnnouncement.value = { ...current, views: (current.views || 0) + 1 }
    }

    try {
      await announcementsApi.incrementViews?.(id)
    } catch {
      // Тихо — не критично
    }
  }

  /** Переключить избранное (optimistic) */
  async function toggleFavourite(id) {
    const key = Number(id)
    const item = announcements.value.find(a => a.id === key)
    const prev = item?.isFavourite

    if (item) patchInList(id, { isFavourite: !prev })

    if (currentAnnouncement.value?.id === key) {
      currentAnnouncement.value = {
        ...currentAnnouncement.value,
        isFavourite: !prev
      }
    }

    try {
      const result = await announcementsApi.toggleFavourite?.(id, {
        currentState: prev
      })
      const next = result?.isFavourite ?? !prev
      patchInList(id, { isFavourite: next })

      if (currentAnnouncement.value?.id === key) {
        currentAnnouncement.value = {
          ...currentAnnouncement.value,
          isFavourite: next
        }
      }
      return { isFavourite: next }
    } catch (err) {
      // Откат
      if (item) patchInList(id, { isFavourite: prev })
      throw err
    }
  }

  /* ============================================================
   *  ФИЛЬТРЫ
   * ============================================================ */

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setFilter(key, value) {
    filters.value = { ...filters.value, [key]: value }
  }

  /** Смена сортировки. Сбрасывает page на 1, если не указано иное. */
  function setSort(sortBy, sortOrder = null) {
    filters.value = {
      ...filters.value,
      sortBy,
      sortOrder: sortOrder ?? (filters.value.sortBy === sortBy
        ? (filters.value.sortOrder === 'asc' ? 'desc' : 'asc')
        : 'desc'),
      page: 1
    }
  }

  /** Перейти на страницу. Принимает номер или 'next' / 'prev'. */
  function changePage(page) {
    if (page === 'next') {
      filters.value = { ...filters.value, page: filters.value.page + 1 }
    } else if (page === 'prev') {
      filters.value = {
        ...filters.value,
        page: Math.max(1, filters.value.page - 1)
      }
    } else {
      filters.value = {
        ...filters.value,
        page: Math.max(1, Number(page) || 1)
      }
    }
  }

  function setPerPage(perPage) {
    filters.value = {
      ...filters.value,
      perPage: Math.max(1, Number(perPage) || 20),
      page: 1
    }
  }

  function resetFilters() {
    filters.value = makeDefaultFilters()
  }

  /* ============================================================
   *  СБРОС
   * ============================================================ */

  function reset() {
    announcements.value = []
    currentAnnouncement.value = null
    totalItems.value = 0
    filters.value = makeDefaultFilters()
    loading.value = false
    mutating.value = false
    error.value = null
    fetchSeq = 0
    detailCache.clear()
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    announcements,
    currentAnnouncement,
    totalItems,
    loading,
    mutating,
    error,
    filters,

    // Getters
    hasAnnouncements,
    isEmpty,
    hasActiveFilters,
    activeFiltersCount,

    // Actions — list/detail
    fetchAnnouncements,
    refetch,
    fetchAnnouncement,
    clearCurrent,
    clearDetailCache,

    // Actions — CRUD
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,

    // Actions — на объявлении
    incrementViews,
    toggleFavourite,

    // Actions — фильтры
    updateFilters,
    setFilter,
    setSort,
    changePage,
    setPerPage,
    resetFilters,

    // Reset
    reset
  }
})