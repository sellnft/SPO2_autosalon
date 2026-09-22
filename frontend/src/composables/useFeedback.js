import { computed, ref } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

/**
 * Composable-обёртка над feedback-store.
 * Единая обработка ошибок, тосты, редиректы, silent-режим.
 */
export function useFeedback() {
  const store = useFeedbackStore()
  const toastStore = useToastStore()
  const router = useRouter()

  // === Реактивные данные ===
  const feedback = computed(() => store.feedback)
  const currentFeedback = computed(() => store.currentFeedback)
  const unreadCount = computed(() => store.unreadCount)
  const openCount = computed(() => store.openCount)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  // === Локальный стейт отправки (не надо хранить в сторе) ===
  const sending = ref(false)
  const creating = ref(false)

  /**
   * Универсальный обработчик — фильтрует AbortError,
   * показывает тост только если не silent.
   */
  async function withToast(fn, { errorMessage, silent = false } = {}) {
    try {
      return await fn()
    } catch (err) {
      const isAbort =
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED' ||
        err?.message === 'canceled'

      if (!isAbort && !silent && errorMessage) {
        toastStore.error(errorMessage)
      }
      throw err
    }
  }

  /**
   * Загрузить список обращений
   * @param {Object} [opts]
   * @param {boolean} [opts.silent] — для фонового polling'а
   */
  async function fetchFeedback(opts = {}) {
    return withToast(
      () => store.fetchFeedback(),
      { errorMessage: 'Не удалось загрузить обращения', ...opts }
    )
  }

  /**
   * Загрузить одно обращение по ID
   */
  async function fetchFeedbackById(id, opts = {}) {
    return withToast(
      () => store.fetchFeedbackById(id),
      { errorMessage: 'Не удалось загрузить обращение', ...opts }
    )
  }

  /**
   * Создать обращение
   * @param {Object} data
   * @param {Object} [opts]
   * @param {boolean} [opts.redirect=true] — перейти на страницу обращения
   * @param {string}  [opts.successMessage='Обращение создано']
   */
  async function createFeedback(data, opts = {}) {
    const {
      redirect = true,
      successMessage = 'Обращение создано'
    } = opts

    if (creating.value) return null
    creating.value = true

    try {
      const fb = await withToast(
        () => store.createFeedback(data),
        { errorMessage: 'Не удалось создать обращение' }
      )

      if (fb) {
        toastStore.success(successMessage)
        if (redirect && fb.id) {
          router.push(`/feedback/${fb.id}`)
        }
      }

      return fb
    } finally {
      creating.value = false
    }
  }

  /**
   * Отправить сообщение в обращение
   * @param {number|string} feedbackId
   * @param {string} content
   * @param {Object} [opts]
   * @param {boolean} [opts.silent]
   */
  async function sendMessage(feedbackId, content, opts = {}) {
    const text = typeof content === 'string' ? content.trim() : ''
    if (!text) return null

    if (sending.value) return null
    sending.value = true

    try {
      return await withToast(
        () => store.sendMessage(feedbackId, text),
        { errorMessage: 'Не удалось отправить сообщение', ...opts }
      )
    } finally {
      sending.value = false
    }
  }

  /**
   * Обновить статус обращения (для админки / автора)
   * @param {number|string} id
   * @param {string} status
   */
  async function updateStatus(id, status, opts = {}) {
    return withToast(
      async () => {
        const result = await store.updateStatus?.(id, status)
        toastStore.success(opts.successMessage || 'Статус обновлён')
        return result
      },
      { errorMessage: 'Не удалось обновить статус' }
    )
  }

  /**
   * Пометить обращение прочитанным (тихо, без тоста об ошибке)
   */
  async function markAsRead(id) {
    try {
      await store.markAsRead?.(id)
    } catch (err) {
      console.warn('[useFeedback] markAsRead failed:', err?.message || err)
    }
  }

  /**
   * Закрыть обращение
   */
  async function closeFeedback(id, opts = {}) {
    return withToast(
      async () => {
        const result = await store.closeFeedback?.(id)
        toastStore.success(opts.successMessage || 'Обращение закрыто')
        return result
      },
      { errorMessage: 'Не удалось закрыть обращение' }
    )
  }

  return {
    // Данные
    feedback,
    currentFeedback,
    unreadCount,
    openCount,
    loading,
    error,

    // Локальный стейт операций
    sending,
    creating,

    // CRUD
    fetchFeedback,
    fetchFeedbackById,
    createFeedback,
    sendMessage,

    // Действия
    updateStatus,
    markAsRead,
    closeFeedback
  }
}