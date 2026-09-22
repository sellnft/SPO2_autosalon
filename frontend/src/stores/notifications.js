import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationsApi } from '@/services/api/notificationsApi'

export const useNotificationsStore = defineStore('notifications', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const notifications = ref([])
  const total = ref(0)
  const unreadCount = ref(0)
  const settings = ref(null)

  const loading = ref(false)
  const loadingMore = ref(false)
  const mutating = ref(false)
  const error = ref(null)

  // Параметры последнего запроса — для refetch
  const lastParams = ref({})

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const hasUnread = computed(() => unreadCount.value > 0)
  const hasNotifications = computed(() => notifications.value.length > 0)
  const isEmpty = computed(() => !loading.value && notifications.value.length === 0)

  const recentNotifications = computed(() =>
    notifications.value.slice(0, 5)
  )

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read)
  )

  /** Быстрый поиск по ID */
  const notificationById = computed(() => {
    const map = new Map()
    notifications.value.forEach(n => map.set(n.id, n))
    return (id) => map.get(Number(id)) || null
  })

  /* ============================================================
   *  ХЕЛПЕРЫ
   * ============================================================ */

  function normalizeError(err) {
    return err?.message || String(err) || 'Неизвестная ошибка'
  }

  function patchInList(id, patch) {
    const index = notifications.value.findIndex(n => n.id === Number(id))
    if (index === -1) return false

    notifications.value = [
      ...notifications.value.slice(0, index),
      { ...notifications.value[index], ...patch },
      ...notifications.value.slice(index + 1)
    ]
    return true
  }

  /* ============================================================
   *  FETCH
   * ============================================================ */

  /**
   * Загрузить список уведомлений.
   * @param {Object} [params] — { page, perPage, onlyUnread, type }
   * @param {Object} [opts]
   * @param {boolean} [opts.append=false] — дописать в конец (пагинация)
   */
  async function fetchNotifications(params = {}, opts = {}) {
    if (opts.append) {
      loadingMore.value = true
    } else {
      loading.value = true
    }
    error.value = null

    if (!opts.append) lastParams.value = { ...params }

    try {
      const response = await notificationsApi.getNotifications(params)

      const items = Array.isArray(response) ? response : response.items || []
      const totalCount = Array.isArray(response)
        ? response.length
        : response.total ?? items.length

      if (opts.append) {
        // Избегаем дублей
        const existingIds = new Set(notifications.value.map(n => n.id))
        const newItems = items.filter(n => !existingIds.has(n.id))
        notifications.value = [...notifications.value, ...newItems]
      } else {
        notifications.value = items
      }

      total.value = totalCount

      // unreadCount: приоритет — считать локально только для полного списка
      if (!opts.append && !params.onlyUnread) {
        unreadCount.value = notifications.value.filter(n => !n.read).length
      }

      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  /** Повторный запрос с текущими параметрами */
  async function refetch() {
    return fetchNotifications(lastParams.value)
  }

  /**
   * Лёгкий запрос — только количество непрочитанных.
   * Для бейджа в хедере и polling.
   */
  async function fetchUnreadCount() {
    try {
      const result = await notificationsApi.getUnreadCount?.()
      if (result) {
        unreadCount.value = result.count ?? result
      }
      return unreadCount.value
    } catch {
      // Тихо — не критично
    }
  }

  /**
   * Получить одно уведомление.
   */
  async function fetchNotificationById(id) {
    const key = Number(id)
    if (!Number.isFinite(key)) return null

    // Кэш
    const cached = notificationById.value(key)
    if (cached) return cached

    try {
      const item = await notificationsApi.getNotification?.(key)
      if (item) {
        notifications.value = [item, ...notifications.value]
        total.value += 1
      }
      return item
    } catch (err) {
      error.value = normalizeError(err)
      return null
    }
  }

  /* ============================================================
   *  MARK AS READ
   * ============================================================ */

  async function markAsRead(notificationId) {
    const id = Number(notificationId)
    if (!Number.isFinite(id)) return

    const target = notificationById.value(id)
    if (!target) return
    if (target.read) return // Уже прочитано

    error.value = null

    // Optimistic
    patchInList(id, { read: true, readAt: new Date().toISOString() })
    unreadCount.value = Math.max(0, unreadCount.value - 1)

    try {
      await notificationsApi.markAsRead(id)
    } catch (err) {
      // Откат
      patchInList(id, { read: false, readAt: null })
      unreadCount.value += 1
      error.value = normalizeError(err)
      throw err
    }
  }

  /**
   * Пометить несколько прочитанными.
   */
  async function markManyAsRead(ids) {
    const list = Array.isArray(ids)
      ? ids.map(Number).filter(Number.isFinite)
      : []
    if (!list.length) return

    error.value = null
    mutating.value = true

    // Отбираем только непрочитанные
    const toMark = list.filter(id => {
      const n = notificationById.value(id)
      return n && !n.read
    })
    if (!toMark.length) {
      mutating.value = false
      return
    }

    const prevStates = toMark.map(id => ({
      id,
      read: notificationById.value(id)?.read,
      readAt: notificationById.value(id)?.readAt
    }))

    // Optimistic
    toMark.forEach(id => {
      patchInList(id, { read: true, readAt: new Date().toISOString() })
    })
    unreadCount.value = Math.max(0, unreadCount.value - toMark.length)

    try {
      await notificationsApi.markManyAsRead?.(toMark)
    } catch (err) {
      // Откат
      prevStates.forEach(({ id, read, readAt }) => {
        patchInList(id, { read, readAt })
      })
      unreadCount.value += toMark.length
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function markAllAsRead() {
    const prev = notifications.value.map(n => ({
      id: n.id,
      read: n.read,
      readAt: n.readAt
    }))
    const prevUnread = unreadCount.value

    if (prevUnread === 0) return

    error.value = null
    mutating.value = true

    // Optimistic — иммутабельно
    const now = new Date().toISOString()
    notifications.value = notifications.value.map(n => ({
      ...n,
      read: true,
      readAt: n.readAt || now
    }))
    unreadCount.value = 0

    try {
      await notificationsApi.markAllAsRead()
    } catch (err) {
      // Откат
      notifications.value = notifications.value.map(n => {
        const p = prev.find(x => x.id === n.id)
        return p ? { ...n, read: p.read, readAt: p.readAt } : n
      })
      unreadCount.value = prevUnread
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  DELETE / CLEAR
   * ============================================================ */

  async function deleteNotification(notificationId) {
    const id = Number(notificationId)
    if (!Number.isFinite(id)) return

    const target = notificationById.value(id)
    if (!target) return

    error.value = null

    // Optimistic
    notifications.value = notifications.value.filter(n => n.id !== id)
    total.value = Math.max(0, total.value - 1)
    if (!target.read) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }

    try {
      await notificationsApi.deleteNotification?.(id)
    } catch (err) {
      // Откат
      notifications.value = [target, ...notifications.value]
      total.value += 1
      if (!target.read) unreadCount.value += 1
      error.value = normalizeError(err)
      throw err
    }
  }

  async function clearAll() {
    if (!notifications.value.length) return

    const prev = [...notifications.value]
    const prevTotal = total.value
    const prevUnread = unreadCount.value

    error.value = null
    mutating.value = true

    // Optimistic
    notifications.value = []
    total.value = 0
    unreadCount.value = 0

    try {
      await notificationsApi.clearAll?.()
    } catch (err) {
      // Откат
      notifications.value = prev
      total.value = prevTotal
      unreadCount.value = prevUnread
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  SETTINGS
   * ============================================================ */

  async function fetchSettings() {
    try {
      const result = await notificationsApi.getSettings?.()
      if (result) settings.value = result
      return settings.value
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    }
  }

  async function updateNotificationSettings(newSettings) {
    const prev = settings.value

    error.value = null
    mutating.value = true

    // Optimistic (merge)
    settings.value = {
      ...(settings.value || {}),
      ...newSettings
    }

    try {
      const result = await notificationsApi.updateSettings(newSettings)
      if (result) settings.value = result
      return result
    } catch (err) {
      // Откат
      settings.value = prev
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function resetSettings() {
    try {
      const result = await notificationsApi.resetSettings?.()
      if (result) settings.value = result
      return result
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    }
  }

  /* ============================================================
   *  RESET
   * ============================================================ */

  function reset() {
    notifications.value = []
    total.value = 0
    unreadCount.value = 0
    settings.value = null
    lastParams.value = {}
    loading.value = false
    loadingMore.value = false
    mutating.value = false
    error.value = null
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    notifications,
    total,
    unreadCount,
    settings,
    loading,
    loadingMore,
    mutating,
    error,

    // Getters
    hasUnread,
    hasNotifications,
    isEmpty,
    recentNotifications,
    unreadNotifications,
    notificationById,

    // Fetch
    fetchNotifications,
    refetch,
    fetchUnreadCount,
    fetchNotificationById,

    // Mark as read
    markAsRead,
    markManyAsRead,
    markAllAsRead,

    // Delete / clear
    deleteNotification,
    clearAll,

    // Settings
    fetchSettings,
    updateNotificationSettings,
    resetSettings,

    // Reset
    reset
  }
})