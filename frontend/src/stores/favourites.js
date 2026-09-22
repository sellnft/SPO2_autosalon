import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favouritesApi } from '@/services/api/favouritesApi'

export const useFavouritesStore = defineStore('favourites', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const favourites = ref([])
  const total = ref(0)

  /**
   * Set для O(1) проверки isFavourite.
   * Синхронизируется с favourites при каждом изменении.
   */
  const favouriteIdsSet = ref(new Set())

  /** Отдельный счётчик для бейджа (без загрузки всего списка) */
  const countFromServer = ref(null)

  const loading = ref(false)
  const mutating = ref(false)
  const error = ref(null)

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  /** Всего в избранном (приоритет — серверное значение) */
  const favouritesCount = computed(
    () => countFromServer.value ?? total.value
  )

  /** Массив ID (для совместимости) */
  const favouriteIds = computed(() =>
    Array.from(favouriteIdsSet.value)
  )

  const hasFavourites = computed(() => favourites.value.length > 0)
  const isEmpty = computed(() => !loading.value && favourites.value.length === 0)

  /* ============================================================
   *  ХЕЛПЕРЫ
   * ============================================================ */

  function normalizeError(err) {
    return err?.message || String(err) || 'Неизвестная ошибка'
  }

  function normalizeId(id) {
    const num = Number(id)
    return Number.isFinite(num) && num > 0 ? num : null
  }

  /** Пересобрать Set из массива (вызывается после bulk-изменений) */
  function rebuildSet() {
    favouriteIdsSet.value = new Set(
      favourites.value.map(f => f.announcementId)
    )
  }

  /** Добавить ID в Set без пересборки */
  function addIdToSet(id) {
    const next = new Set(favouriteIdsSet.value)
    next.add(id)
    favouriteIdsSet.value = next
  }

  /** Удалить ID из Set */
  function removeIdFromSet(id) {
    const next = new Set(favouriteIdsSet.value)
    next.delete(id)
    favouriteIdsSet.value = next
  }

  /* ============================================================
   *  FETCH
   * ============================================================ */

  /**
   * Загрузить список избранного.
   * @param {Object} [params] — { page, perPage }
   */
  async function fetchFavourites(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await favouritesApi.getFavourites(params)

      // Поддержка обоих форматов
      const items = Array.isArray(response) ? response : response.items || []
      const totalCount = Array.isArray(response)
        ? response.length
        : response.total ?? items.length

      favourites.value = items
      total.value = totalCount
      countFromServer.value = totalCount
      rebuildSet()

      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Загрузить только количество (для бейджа).
   */
  async function fetchCount() {
    try {
      const result = await favouritesApi.getFavouritesCount?.()
      if (result) {
        countFromServer.value = result.count ?? result
      }
      return countFromServer.value
    } catch {
      // Тихо — не критично
    }
  }

  /**
   * Загрузить только ID (для быстрой проверки isFavourite на клиенте).
   */
  async function fetchIds() {
    try {
      const ids = await favouritesApi.getFavouriteIds?.()
      if (Array.isArray(ids)) {
        favouriteIdsSet.value = new Set(ids)
        countFromServer.value = ids.length
      }
      return favouriteIds.value
    } catch {
      return []
    }
  }

  /* ============================================================
   *  ADD / REMOVE
   * ============================================================ */

  async function addToFavourites(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return null

    // Защита от дублей
    if (favouriteIdsSet.value.has(id)) {
      return favourites.value.find(f => f.announcementId === id) || null
    }

    error.value = null

    // Optimistic
    addIdToSet(id)
    countFromServer.value = (countFromServer.value ?? total.value) + 1

    try {
      const favourite = await favouritesApi.addToFavourites(id)

      // Добавляем в начало списка (свежие сверху)
      if (favourite && !favourites.value.find(f => f.announcementId === id)) {
        favourites.value = [favourite, ...favourites.value]
        total.value += 1
      }

      return favourite
    } catch (err) {
      // Откат
      removeIdFromSet(id)
      countFromServer.value = Math.max(0, (countFromServer.value ?? 1) - 1)
      error.value = normalizeError(err)
      throw err
    }
  }

  async function removeFromFavourites(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return

    if (!favouriteIdsSet.value.has(id)) return

    error.value = null

    // Запоминаем для отката
    const prev = favourites.value.find(f => f.announcementId === id)
    const prevIndex = favourites.value.indexOf(prev)

    // Optimistic
    removeIdFromSet(id)
    favourites.value = favourites.value.filter(f => f.announcementId !== id)
    total.value = Math.max(0, total.value - 1)
    countFromServer.value = Math.max(0, (countFromServer.value ?? 1) - 1)

    try {
      await favouritesApi.removeFromFavourites(id)
    } catch (err) {
      // Откат
      addIdToSet(id)
      if (prev) {
        const next = [...favourites.value]
        next.splice(Math.max(0, prevIndex), 0, prev)
        favourites.value = next
      }
      total.value += 1
      countFromServer.value = (countFromServer.value ?? 0) + 1
      error.value = normalizeError(err)
      throw err
    }
  }

  /**
   * Переключить избранное (главный метод для UI-сердечка).
   * @returns {Promise<boolean>} — новое состояние
   */
  async function toggleFavourite(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return false

    const current = favouriteIdsSet.value.has(id)

    if (current) {
      await removeFromFavourites(id)
      return false
    } else {
      await addToFavourites(id)
      return true
    }
  }

  /* ============================================================
   *  BULK
   * ============================================================ */

  async function clearAll() {
    mutating.value = true
    error.value = null

    const prev = [...favourites.value]
    const prevCount = countFromServer.value

    // Optimistic
    favourites.value = []
    total.value = 0
    favouriteIdsSet.value = new Set()
    countFromServer.value = 0

    try {
      await favouritesApi.clearAll?.()
    } catch (err) {
      // Откат
      favourites.value = prev
      total.value = prev.length
      countFromServer.value = prevCount
      rebuildSet()
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  CHECK
   * ============================================================ */

  /**
   * Проверить isFavourite локально (O(1)).
   */
  function isFavourite(announcementId) {
    const id = normalizeId(announcementId)
    return id ? favouriteIdsSet.value.has(id) : false
  }

  /**
   * Проверить isFavourite на сервере (если локально пусто).
   * Полезно для карточек вне списка избранного.
   */
  async function checkIsFavouriteOnServer(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return false

    // Если уже знаем — отдаём локально
    if (favouriteIdsSet.value.has(id)) return true

    try {
      const result = await favouritesApi.checkIsFavourite?.(id)
      if (result) addIdToSet(id)
      return Boolean(result)
    } catch {
      return false
    }
  }

  /* ============================================================
   *  RESET
   * ============================================================ */

  function reset() {
    favourites.value = []
    total.value = 0
    favouriteIdsSet.value = new Set()
    countFromServer.value = null
    loading.value = false
    mutating.value = false
    error.value = null
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    favourites,
    total,
    loading,
    mutating,
    error,

    // Getters
    favouritesCount,
    favouriteIds,
    hasFavourites,
    isEmpty,

    // Actions
    fetchFavourites,
    fetchCount,
    fetchIds,

    addToFavourites,
    removeFromFavourites,
    toggleFavourite,
    clearAll,

    isFavourite,
    checkIsFavouriteOnServer,

    reset
  }
})