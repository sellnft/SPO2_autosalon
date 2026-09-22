import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscriptionsApi } from '@/services/api/subscriptionsApi'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const subscriptions = ref([])
  const subscriptionsTotal = ref(0)

  const savedSearches = ref([])
  const savedSearchesTotal = ref(0)

  /**
   * Set для O(1) проверки isSubscribed.
   * Синхронизируется при каждом изменении списка.
   */
  const subscribedIdsSet = ref(new Set())

  /** Отдельные счётчики с сервера (для бейджей без загрузки списков) */
  const subscriptionsCountFromServer = ref(null)

  // Загрузка (отдельно по секциям)
  const loading = ref({
    subscriptions: false,
    savedSearches: false
  })

  const mutating = ref(false)
  const error = ref(null)

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const subscriptionsCount = computed(
    () => subscriptionsCountFromServer.value ?? subscriptionsTotal.value
  )

  const savedSearchesCount = computed(() => savedSearchesTotal.value)

  /** Массив ID (для совместимости со старым API) */
  const subscribedIds = computed(() =>
    Array.from(subscribedIdsSet.value)
  )

  const hasSubscriptions = computed(() => subscriptions.value.length > 0)
  const hasSavedSearches = computed(() => savedSearches.value.length > 0)

  const isEmptySubscriptions = computed(
    () => !loading.value.subscriptions && subscriptions.value.length === 0
  )
  const isEmptySavedSearches = computed(
    () => !loading.value.savedSearches && savedSearches.value.length === 0
  )

  /** Общий флаг загрузки (для совместимости со старым API) */
  const isLoading = computed(() =>
    loading.value.subscriptions || loading.value.savedSearches
  )

  /** Быстрый поиск */
  const savedSearchById = computed(() => {
    const map = new Map()
    savedSearches.value.forEach(s => map.set(s.id, s))
    return (id) => map.get(Number(id)) || null
  })

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

  function setSectionLoading(section, value) {
    loading.value = { ...loading.value, [section]: value }
  }

  function rebuildSet() {
    subscribedIdsSet.value = new Set(
      subscriptions.value.map(s => s.announcementId)
    )
  }

  function addIdToSet(id) {
    const next = new Set(subscribedIdsSet.value)
    next.add(id)
    subscribedIdsSet.value = next
  }

  function removeIdFromSet(id) {
    const next = new Set(subscribedIdsSet.value)
    next.delete(id)
    subscribedIdsSet.value = next
  }

  /* ============================================================
   *  SUBSCRIPTIONS — FETCH
   * ============================================================ */

  /**
   * Загрузить список подписок.
   * @param {Object} [params] — { page, perPage }
   */
  async function fetchSubscriptions(params = {}) {
    setSectionLoading('subscriptions', true)
    error.value = null

    try {
      const response = await subscriptionsApi.getSubscriptions(params)

      const items = Array.isArray(response) ? response : response.items || []
      const totalCount = Array.isArray(response)
        ? response.length
        : response.total ?? items.length

      subscriptions.value = items
      subscriptionsTotal.value = totalCount
      subscriptionsCountFromServer.value = totalCount
      rebuildSet()

      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      setSectionLoading('subscriptions', false)
    }
  }

  /**
   * Лёгкий запрос — количество подписок (для бейджа).
   */
  async function fetchSubscriptionsCount() {
    try {
      const result = await subscriptionsApi.getSubscriptionsCount?.()
      if (result) {
        subscriptionsCountFromServer.value = result.count ?? result
      }
      return subscriptionsCountFromServer.value
    } catch {
      // Тихо — не критично
    }
  }

  /**
   * Проверить, подписан ли на объявление (на сервере).
   * Полезно для карточек вне списка подписок.
   */
  async function checkSubscriptionOnServer(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return false

    // Если уже знаем — отдаём локально
    if (subscribedIdsSet.value.has(id)) return true

    try {
      const result = await subscriptionsApi.checkSubscription?.(id)
      if (result) addIdToSet(id)
      return Boolean(result)
    } catch {
      return false
    }
  }

  /* ============================================================
   *  SUBSCRIBE / UNSUBSCRIBE
   * ============================================================ */

  async function subscribe(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return null

    // Защита от дублей
    if (subscribedIdsSet.value.has(id)) {
      return subscriptions.value.find(s => s.announcementId === id) || null
    }

    error.value = null

    // Optimistic
    addIdToSet(id)
    subscriptionsCountFromServer.value =
      (subscriptionsCountFromServer.value ?? subscriptionsTotal.value) + 1

    try {
      const subscription = await subscriptionsApi.subscribe(id)

      if (subscription && !subscriptions.value.find(s => s.announcementId === id)) {
        subscriptions.value = [subscription, ...subscriptions.value]
        subscriptionsTotal.value += 1
      }

      return subscription
    } catch (err) {
      // Откат
      removeIdFromSet(id)
      subscriptionsCountFromServer.value = Math.max(
        0,
        (subscriptionsCountFromServer.value ?? 1) - 1
      )
      error.value = normalizeError(err)
      throw err
    }
  }

  async function unsubscribe(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return

    if (!subscribedIdsSet.value.has(id)) return

    error.value = null

    const prev = subscriptions.value.find(s => s.announcementId === id)
    const prevIndex = subscriptions.value.indexOf(prev)

    // Optimistic
    removeIdFromSet(id)
    subscriptions.value = subscriptions.value.filter(s => s.announcementId !== id)
    subscriptionsTotal.value = Math.max(0, subscriptionsTotal.value - 1)
    subscriptionsCountFromServer.value = Math.max(
      0,
      (subscriptionsCountFromServer.value ?? 1) - 1
    )

    try {
      await subscriptionsApi.unsubscribe(id)
    } catch (err) {
      // Откат
      addIdToSet(id)
      if (prev) {
        const next = [...subscriptions.value]
        next.splice(Math.max(0, prevIndex), 0, prev)
        subscriptions.value = next
      }
      subscriptionsTotal.value += 1
      subscriptionsCountFromServer.value =
        (subscriptionsCountFromServer.value ?? 0) + 1
      error.value = normalizeError(err)
      throw err
    }
  }

  /**
   * Переключить подписку (главный метод для UI-кнопки).
   * @returns {Promise<boolean>} — новое состояние
   */
  async function toggleSubscription(announcementId) {
    const id = normalizeId(announcementId)
    if (!id) return false

    const current = subscribedIdsSet.value.has(id)

    if (current) {
      await unsubscribe(id)
      return false
    } else {
      await subscribe(id)
      return true
    }
  }

  /* ============================================================
   *  SAVED SEARCHES — FETCH
   * ============================================================ */

  async function fetchSavedSearches(params = {}) {
    setSectionLoading('savedSearches', true)
    error.value = null

    try {
      const response = await subscriptionsApi.getSavedSearches(params)

      const items = Array.isArray(response) ? response : response.items || []
      const totalCount = Array.isArray(response)
        ? response.length
        : response.total ?? items.length

      savedSearches.value = items
      savedSearchesTotal.value = totalCount

      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      setSectionLoading('savedSearches', false)
    }
  }

  /* ============================================================
   *  SAVED SEARCHES — CRUD
   * ============================================================ */

  async function saveSearch(searchData) {
    error.value = null
    mutating.value = true

    try {
      const search = await subscriptionsApi.saveSearch(searchData)
      if (!search) return null

      // Если такой уже есть — обновляем
      const existingIdx = savedSearches.value.findIndex(s => s.id === search.id)
      if (existingIdx !== -1) {
        savedSearches.value = [
          ...savedSearches.value.slice(0, existingIdx),
          search,
          ...savedSearches.value.slice(existingIdx + 1)
        ]
      } else {
        savedSearches.value = [search, ...savedSearches.value]
        savedSearchesTotal.value += 1
      }

      return search
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function updateSavedSearch(searchId, updates) {
    const id = normalizeId(searchId)
    if (!id) return null

    const prev = savedSearchById.value(id)
    if (!prev) return null

    error.value = null
    mutating.value = true

    // Optimistic
    const idx = savedSearches.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      const next = [...savedSearches.value]
      next[idx] = { ...next[idx], ...updates }
      savedSearches.value = next
    }

    try {
      const result = await subscriptionsApi.updateSavedSearch?.(id, updates)
      if (result && idx !== -1) {
        const next = [...savedSearches.value]
        next[idx] = result
        savedSearches.value = next
      }
      return result || savedSearches.value[idx]
    } catch (err) {
      // Откат
      if (prev && idx !== -1) {
        const next = [...savedSearches.value]
        next[idx] = prev
        savedSearches.value = next
      }
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /**
   * Включить/выключить уведомления по сохранённому поиску.
   */
  async function toggleSearchNotifications(searchId, enabled) {
    return updateSavedSearch(searchId, { notificationsEnabled: enabled })
  }

  async function deleteSavedSearch(searchId) {
    const id = normalizeId(searchId)
    if (!id) return

    const prev = savedSearchById.value(id)
    const prevIndex = savedSearches.value.findIndex(s => s.id === id)

    if (!prev) return

    error.value = null
    mutating.value = true

    // Optimistic
    savedSearches.value = savedSearches.value.filter(s => s.id !== id)
    savedSearchesTotal.value = Math.max(0, savedSearchesTotal.value - 1)

    try {
      await subscriptionsApi.deleteSavedSearch(id)
    } catch (err) {
      // Откат
      const next = [...savedSearches.value]
      next.splice(Math.max(0, prevIndex), 0, prev)
      savedSearches.value = next
      savedSearchesTotal.value += 1
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function clearSavedSearches() {
    if (!savedSearches.value.length) return

    const prev = [...savedSearches.value]
    const prevTotal = savedSearchesTotal.value

    error.value = null
    mutating.value = true

    // Optimistic
    savedSearches.value = []
    savedSearchesTotal.value = 0

    try {
      await subscriptionsApi.clearSavedSearches?.()
    } catch (err) {
      // Откат
      savedSearches.value = prev
      savedSearchesTotal.value = prevTotal
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  CHECK
   * ============================================================ */

  /** Локальная проверка isSubscribed (O(1)) */
  function isSubscribed(announcementId) {
    const id = normalizeId(announcementId)
    return id ? subscribedIdsSet.value.has(id) : false
  }

  /* ============================================================
   *  RESET
   * ============================================================ */

  function reset() {
    subscriptions.value = []
    subscriptionsTotal.value = 0
    subscriptionsCountFromServer.value = null

    savedSearches.value = []
    savedSearchesTotal.value = 0

    subscribedIdsSet.value = new Set()

    loading.value = { subscriptions: false, savedSearches: false }
    mutating.value = false
    error.value = null
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    subscriptions,
    subscriptionsTotal,
    savedSearches,
    savedSearchesTotal,
    loading,
    isLoading,
    mutating,
    error,

    // Getters
    subscriptionsCount,
    savedSearchesCount,
    subscribedIds,
    hasSubscriptions,
    hasSavedSearches,
    isEmptySubscriptions,
    isEmptySavedSearches,
    savedSearchById,

    // Subscriptions — fetch
    fetchSubscriptions,
    fetchSubscriptionsCount,
    checkSubscriptionOnServer,

    // Subscriptions — actions
    subscribe,
    unsubscribe,
    toggleSubscription,
    isSubscribed,

    // Saved Searches — fetch
    fetchSavedSearches,

    // Saved Searches — actions
    saveSearch,
    updateSavedSearch,
    toggleSearchNotifications,
    deleteSavedSearch,
    clearSavedSearches,

    // Reset
    reset
  }
})