import { computed, ref, onUnmounted, getCurrentInstance } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useToastStore } from '@/stores/toast'

/**
 * Composable-обёртка над notifications-store.
 * - Единая обработка ошибок
 * - Optimistic UI для markAsRead
 * - Авто-очистка polling при unmount
 */
export function useNotifications() {
  const store = useNotificationsStore()
  const toastStore = useToastStore()

  // === Реактивные данные ===
  const notifications = computed(() => store.notifications)
  const unreadCount = computed(() => store.unreadCount)
  const hasUnread = computed(() => store.hasUnread)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // === Локальные флаги операций ===
  const marking = ref(false)
  const clearing = ref(false)

  /**
   * Единый обработчик. Фильтрует AbortError, не спамит при silent.
   */
  async function withToast(fn, { errorMessage, silent = false, rethrow = false } = {}) {
    try {
      return await fn()
    } catch (err) {
      const isAbort =
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED' ||
        err?.message === 'canceled'

      if (!isAbort && !silent) {
        if (errorMessage) {
          toastStore.error(errorMessage)
        } else {
          console.warn('[useNotifications]', err?.message || err)
        }
      }

      if (rethrow) throw err
      return null
    }
  }

  /**
   * Загрузить список уведомлений
   * @param {Object} [opts]
   * @param {boolean} [opts.silent] — не показывать тост (для polling)
   */
  async function fetchNotifications(opts = {}) {
    return withToast(
      () => store.fetchNotifications(),
      { silent: opts.silent, errorMessage: 'Не удалось загрузить уведомления' }
    )
  }

  /**
   * Лёгкий запрос — только количество непрочитанных.
   * Полезно для polling бейджа в хедере.
   */
  async function fetchUnreadCount() {
    // Если стора нет — тихо вернём null
    if (typeof store.fetchUnreadCount !== 'function') return null

    return withToast(
      () => store.fetchUnreadCount(),
      { silent: true } // не спамим при polling
    )
  }

  /**
   * Пометить одно уведомление прочитанным.
   * Optimistic: сначала локально, потом запрос. При ошибке — откат.
   */
  async function markAsRead(id, opts = {}) {
    if (!id) return null

    // Optimistic update
    const item = notifications.value.find(n => n.id === id)
    const wasRead = item?.read

    if (item && !wasRead && typeof store.markAsReadLocally === 'function') {
      store.markAsReadLocally(id)
    }

    try {
      await store.markAsRead(id)
      return true
    } catch (err) {
      // Откат при ошибке
      if (item && !wasRead && typeof store.markAsUnreadLocally === 'function') {
        store.markAsUnreadLocally(id)
      }

      if (!opts.silent) {
        toastStore.error('Не удалось отметить как прочитанное')
      }
      return null
    }
  }

  /**
   * Пометить все прочитанными.
   */
  async function markAllAsRead(opts = {}) {
    if (marking.value) return null
    marking.value = true

    try {
      return await withToast(
        async () => {
          const result = await store.markAllAsRead()
          if (!opts.silent) {
            toastStore.success(opts.successMessage || 'Все уведомления прочитаны')
          }
          return result
        },
        { errorMessage: 'Не удалось отметить все как прочитанные' }
      )
    } finally {
      marking.value = false
    }
  }

  /**
   * Пометить прочитанными группу уведомлений.
   */
  async function markManyAsRead(ids, opts = {}) {
    if (!Array.isArray(ids) || !ids.length) return null

    // Если в сторе есть пакетный метод — используем его
    if (typeof store.markManyAsRead === 'function') {
      return withToast(
        () => store.markManyAsRead(ids),
        { errorMessage: 'Не удалось отметить уведомления прочитанными' }
      )
    }

    // Иначе — параллельно по одному
    return Promise.all(ids.map(id => markAsRead(id, { silent: true })))
  }

  /**
   * Удалить одно уведомление.
   */
  async function removeNotification(id, opts = {}) {
    if (!id) return null
    if (typeof store.removeNotification !== 'function') return null

    return withToast(
      async () => {
        const result = await store.removeNotification(id)
        if (!opts.silent) {
          toastStore.success('Уведомление удалено')
        }
        return result
      },
      { errorMessage: 'Не удалось удалить уведомление' }
    )
  }

  /**
   * Очистить все уведомления.
   */
  async function clearAll(opts = {}) {
    if (clearing.value) return null
    clearing.value = true

    try {
      return await withToast(
        async () => {
          if (typeof store.clearAll !== 'function') return null
          const result = await store.clearAll()
          if (!opts.silent) {
            toastStore.success('Уведомления очищены')
          }
          return result
        },
        { errorMessage: 'Не удалось очистить уведомления' }
      )
    } finally {
      clearing.value = false
    }
  }

  // === Polling (опционально) ===
  let pollTimer = null

  /**
   * Запустить автообновление счётчика непрочитанных.
   * @param {number} [interval=30000] — мс
   */
  function startPolling(interval = 30000) {
    stopPolling()
    pollTimer = setInterval(() => {
      fetchUnreadCount()
    }, interval)
  }

  /** Остановить автообновление */
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // Авто-очистка при unmount
  if (getCurrentInstance()) {
    onUnmounted(stopPolling)
  }

  return {
    // Данные
    notifications,
    unreadCount,
    hasUnread,
    loading,
    error,

    // Флаги операций
    marking,
    clearing,

    // Загрузка
    fetchNotifications,
    fetchUnreadCount,

    // Действия
    markAsRead,
    markManyAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,

    // Polling
    startPolling,
    stopPolling
  }
}