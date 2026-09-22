import { computed } from 'vue'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

/**
 * Composable-обёртка над announcements-store с тостами и редиректами.
 *
 * Преимущества перед прямым использованием стора:
 * - Единообразная обработка ошибок
 * - Автоматические success/error тосты
 * - Умные редиректы (только там, где нужно)
 *
 * @returns {Object} реактивные данные + методы
 */
export function useAnnouncements() {
  const store = useAnnouncementsStore()
  const toastStore = useToastStore()
  const router = useRouter()

  // === Реактивные данные (readonly, computed для удобства) ===
  const announcements = computed(() => store.announcements)
  const currentAnnouncement = computed(() => store.currentAnnouncement)
  const totalItems = computed(() => store.totalItems)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  const filters = computed(() => store.filters)

  /**
   * Универсальный обработчик для async-операций:
   * - ловит ошибку
   * - показывает тост (если не отключён)
   * - игнорирует отменённые запросы (AbortError)
   * - пробрасывает дальше для кастомной обработки
   */
  async function withToast(fn, { errorMessage, silent = false, rethrow = true } = {}) {
    try {
      return await fn()
    } catch (err) {
      // Отменённые запросы — не наша ошибка
      const isAbort =
        err?.name === 'AbortError' ||
        err?.code === 'ERR_CANCELED' ||
        err?.message === 'canceled'

      if (!isAbort && !silent && errorMessage) {
        toastStore.error(errorMessage)
      }

      if (rethrow) throw err
      return null
    }
  }

  /**
   * Загрузить список объявлений
   * @param {Object} [params] - параметры фильтрации/пагинации
   * @param {Object} [opts]
   * @param {boolean} [opts.silent] - не показывать тост при ошибке
   */
  async function fetchAnnouncements(params, opts = {}) {
    return withToast(
      () => store.fetchAnnouncements(params),
      { errorMessage: 'Не удалось загрузить объявления', ...opts }
    )
  }

  /**
   * Загрузить одно объявление по ID
   */
  async function fetchAnnouncement(id, opts = {}) {
    return withToast(
      () => store.fetchAnnouncement(id),
      { errorMessage: 'Не удалось загрузить объявление', ...opts }
    )
  }

  /**
   * Создать объявление
   * @param {Object} data
   * @param {Object} [opts]
   * @param {boolean} [opts.redirect=true] - перейти на страницу созданного
   * @param {string}  [opts.successMessage] - кастомный текст тоста
   */
  async function createAnnouncement(data, opts = {}) {
    const { redirect = true, successMessage = 'Объявление создано' } = opts

    const announcement = await withToast(
      () => store.createAnnouncement(data),
      { errorMessage: 'Не удалось создать объявление' }
    )

    if (announcement) {
      toastStore.success(successMessage)
      if (redirect && announcement.id) {
        router.push(`/announcements/${announcement.id}`)
      }
    }

    return announcement
  }

  /**
   * Обновить объявление
   */
  async function updateAnnouncement(id, data, opts = {}) {
    const { successMessage = 'Объявление обновлено' } = opts

    const announcement = await withToast(
      () => store.updateAnnouncement(id, data),
      { errorMessage: 'Не удалось обновить объявление' }
    )

    if (announcement) {
      toastStore.success(successMessage)
    }

    return announcement
  }

  /**
   * Удалить объявление
   * @returns {Promise<{ id } | null>} - id удалённого или null при ошибке
   */
  async function deleteAnnouncement(id, opts = {}) {
    const { successMessage = 'Объявление удалено' } = opts

    await withToast(
      () => store.deleteAnnouncement(id),
      { errorMessage: 'Не удалось удалить объявление' }
    )

    toastStore.success(successMessage)
    return { id }
  }

  /**
   * Обновить статус объявления (модерация, продажа и т.д.)
   */
  async function updateStatus(id, status, opts = {}) {
    const { successMessage = 'Статус обновлён' } = opts

    return withToast(
      async () => {
        const result = await store.updateAnnouncement(id, { status })
        toastStore.success(successMessage)
        return result
      },
      { errorMessage: 'Не удалось обновить статус' }
    )
  }

  /**
   * Увеличить счётчик просмотров (оптимистично)
   */
  async function incrementViews(id) {
    // Тихий режим — не спамим юзера тостами об ошибке просмотра
    return withToast(
      () => store.incrementViews?.(id),
      { silent: true, rethrow: false }
    )
  }

  return {
    // Данные
    announcements,
    currentAnnouncement,
    totalItems,
    loading,
    error,
    filters,

    // CRUD
    fetchAnnouncements,
    fetchAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateStatus,
    incrementViews,

    // Фильтры (прокидываем напрямую из стора)
    updateFilters: store.updateFilters,
    resetFilters: store.resetFilters
  }
}