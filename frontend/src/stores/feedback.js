import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { feedbackApi } from '@/services/api/feedbackApi'

/* ============================================================
 *  Утилиты
 * ============================================================ */

const OPEN_STATUSES = ['open', 'in_progress', 'waiting_user']

function optimisticId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useFeedbackStore = defineStore('feedback', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const feedback = ref([])
  const total = ref(0)
  const currentFeedback = ref(null)

  const loading = ref(false)
  const loadingCurrent = ref(false)
  const mutating = ref(false)
  const sending = ref(false)
  const error = ref(null)

  // Race guard для детальной
  let fetchSeq = 0

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const hasFeedback = computed(() => feedback.value.length > 0)
  const isEmpty = computed(() => !loading.value && feedback.value.length === 0)

  /**
   * Непрочитанные сообщения.
   * Приоритет — серверный unreadCount у каждого feedback.
   */
  const unreadCount = computed(() =>
    feedback.value.reduce((sum, f) => {
      // Если сервер дал unreadCount — используем
      if (typeof f.unreadCount === 'number') {
        return sum + f.unreadCount
      }
      // Иначе считаем сами
      const unread = (f.messages || []).filter(
        m => m.authorType === 'admin' && !m.read
      ).length
      return sum + unread
    }, 0)
  )

  const openCount = computed(() =>
    feedback.value.filter(f => OPEN_STATUSES.includes(f.status)).length
  )

  /** Быстрый поиск по ID */
  const feedbackById = computed(() => {
    const map = new Map()
    feedback.value.forEach(f => map.set(f.id, f))
    return (id) => map.get(Number(id)) || null
  })

  /* ============================================================
   *  ХЕЛПЕРЫ
   * ============================================================ */

  function normalizeError(err) {
    return err?.message || String(err) || 'Неизвестная ошибка'
  }

  function patchInList(id, patch) {
    const index = feedback.value.findIndex(f => f.id === Number(id))
    if (index === -1) return false

    feedback.value = [
      ...feedback.value.slice(0, index),
      { ...feedback.value[index], ...patch },
      ...feedback.value.slice(index + 1)
    ]
    return true
  }

  /** Синхронизировать currentFeedback с записью в списке */
  function syncCurrentFromList(id) {
    const item = feedbackById.value(id)
    if (item && currentFeedback.value?.id === Number(id)) {
      currentFeedback.value = { ...item }
    }
  }

  /* ============================================================
   *  FETCH
   * ============================================================ */

  /**
   * Загрузить список обращений.
   * @param {Object} [params] — { page, perPage, status, search }
   */
  async function fetchFeedback(params = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await feedbackApi.getFeedback(params)

      const items = Array.isArray(response) ? response : response.items || []
      const totalCount = Array.isArray(response)
        ? response.length
        : response.total ?? items.length

      feedback.value = items
      total.value = totalCount
      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Загрузить одно обращение по ID.
   * Помечает как прочитанное локально + на сервере.
   */
  async function fetchFeedbackById(id, opts = {}) {
    const key = Number(id)
    const seq = ++fetchSeq

    loadingCurrent.value = true
    error.value = null

    try {
      const item = await feedbackApi.getFeedbackById(key)

      // Race guard
      if (seq !== fetchSeq) return currentFeedback.value

      currentFeedback.value = item

      if (item) {
        // Помечаем admin-сообщения прочитанными локально
        const marked = {
          ...item,
          messages: (item.messages || []).map(m =>
            m.authorType === 'admin' ? { ...m, read: true } : m
          ),
          unreadCount: 0
        }

        currentFeedback.value = marked

        // Обновляем в списке
        const listItem = feedbackById.value(key)
        if (listItem) {
          patchInList(key, {
            messages: marked.messages,
            unreadCount: 0,
            status: item.status
          })
        } else if (!opts.onlyCurrent) {
          // Добавляем в список, если там ещё нет
          feedback.value = [...feedback.value, marked]
          total.value += 1
        }

        // Тихо помечаем на сервере
        feedbackApi.markAsRead?.(key).catch(() => {})
      }

      return currentFeedback.value
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      if (seq === fetchSeq) loadingCurrent.value = false
    }
  }

  /* ============================================================
   *  CREATE
   * ============================================================ */

  async function createFeedback(data) {
    mutating.value = true
    error.value = null

    try {
      const newFeedback = await feedbackApi.createFeedback(data)
      if (newFeedback) {
        feedback.value = [newFeedback, ...feedback.value]
        total.value += 1
      }
      return newFeedback
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  SEND MESSAGE
   * ============================================================ */

  /**
   * Отправить сообщение в обращение.
   * @param {number|string} feedbackId
   * @param {string} content
   */
  async function sendMessage(feedbackId, content) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    const key = Number(feedbackId)
    if (!Number.isFinite(key)) return null

    error.value = null
    sending.value = true

    // Optimistic
    const optimistic = {
      id: optimisticId(),
      feedbackId: key,
      authorId: 1,
      authorName: 'Вы',
      authorType: 'user',
      content: text,
      createdAt: new Date().toISOString(),
      read: false,
      status: 'sending'
    }

    const item = feedbackById.value(key)
    const prevItem = item ? { ...item } : null

    if (item) {
      patchInList(key, {
        messages: [...(item.messages || []), optimistic],
        updatedAt: optimistic.createdAt
      })
    }

    if (currentFeedback.value?.id === key) {
      currentFeedback.value = {
        ...currentFeedback.value,
        messages: [...(currentFeedback.value.messages || []), optimistic]
      }
    }

    try {
      const message = await feedbackApi.sendMessage(key, text)

      // Заменяем optimistic на реальное
      if (item) {
        const currentItem = feedbackById.value(key)
        const msgs = (currentItem?.messages || []).map(m =>
          m.id === optimistic.id ? { ...message, status: 'sent' } : m
        )
        patchInList(key, { messages: msgs, updatedAt: message.createdAt })
      }

      if (currentFeedback.value?.id === key) {
        const msgs = (currentFeedback.value.messages || []).map(m =>
          m.id === optimistic.id ? { ...message, status: 'sent' } : m
        )
        currentFeedback.value = { ...currentFeedback.value, messages: msgs }
      }

      return message
    } catch (err) {
      // Помечаем failed
      const mark = (messages = []) =>
        messages.map(m =>
          m.id === optimistic.id ? { ...m, status: 'failed' } : m
        )

      if (item) patchInList(key, { messages: mark(feedbackById.value(key)?.messages) })
      if (currentFeedback.value?.id === key) {
        currentFeedback.value = {
          ...currentFeedback.value,
          messages: mark(currentFeedback.value.messages)
        }
      }

      error.value = normalizeError(err)
      throw err
    } finally {
      sending.value = false
    }
  }

  /* ============================================================
   *  STATUS / CLOSE / DELETE
   * ============================================================ */

  async function updateStatus(id, status) {
    const key = Number(id)
    const prev = feedbackById.value(key)

    mutating.value = true
    error.value = null

    // Optimistic
    if (prev) patchInList(key, { status })
    if (currentFeedback.value?.id === key) {
      currentFeedback.value = { ...currentFeedback.value, status }
    }

    try {
      const result = await feedbackApi.updateStatus?.(key, status)
      if (result) {
        patchInList(key, result)
        syncCurrentFromList(key)
      }
      return result
    } catch (err) {
      if (prev) patchInList(key, prev)
      if (currentFeedback.value?.id === key && prev) {
        currentFeedback.value = { ...currentFeedback.value, status: prev.status }
      }
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function closeFeedback(id) {
    return updateStatus(id, 'closed')
  }

  async function deleteFeedback(id) {
    const key = Number(id)
    const prev = feedbackById.value(key)
    const prevIndex = feedback.value.findIndex(f => f.id === key)

    mutating.value = true
    error.value = null

    // Optimistic
    feedback.value = feedback.value.filter(f => f.id !== key)
    total.value = Math.max(0, total.value - 1)

    if (currentFeedback.value?.id === key) {
      currentFeedback.value = null
    }

    try {
      await feedbackApi.deleteFeedback?.(key)
    } catch (err) {
      // Откат
      if (prev) {
        const next = [...feedback.value]
        next.splice(Math.max(0, prevIndex), 0, prev)
        feedback.value = next
        total.value += 1
      }
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  RESET
   * ============================================================ */

  function clearCurrent() {
    currentFeedback.value = null
  }

  function reset() {
    feedback.value = []
    total.value = 0
    currentFeedback.value = null
    loading.value = false
    loadingCurrent.value = false
    mutating.value = false
    sending.value = false
    error.value = null
    fetchSeq = 0
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    feedback,
    total,
    currentFeedback,
    loading,
    loadingCurrent,
    mutating,
    sending,
    error,

    // Getters
    hasFeedback,
    isEmpty,
    unreadCount,
    openCount,
    feedbackById,

    // Actions
    fetchFeedback,
    fetchFeedbackById,
    createFeedback,
    sendMessage,

    updateStatus,
    closeFeedback,
    deleteFeedback,

    clearCurrent,
    reset
  }
})