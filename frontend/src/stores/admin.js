import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApi } from '@/services/api/adminApi'

export const useAdminStore = defineStore('admin', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  // Списки
  const users = ref([])
  const announcements = ref([])
  const feedback = ref([])
  const auditLogs = ref([])

  // Тоталы для пагинации
  const usersTotal = ref(0)
  const announcementsTotal = ref(0)
  const feedbackTotal = ref(0)
  const auditLogsTotal = ref(0)

  // Дашборд
  const dashboardStats = ref(null)

  // Параметры (чтобы refetch после действий)
  const usersParams = ref({})
  const announcementsParams = ref({})
  const feedbackParams = ref({})
  const auditLogsParams = ref({})

  // Загрузка (отдельно по секциям)
  const loading = ref({
    dashboard: false,
    users: false,
    announcements: false,
    feedback: false,
    auditLogs: false
  })

  // Ошибки (отдельно по секциям)
  const errors = ref({
    dashboard: null,
    users: null,
    announcements: null,
    feedback: null,
    auditLogs: null
  })

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  // Счётчики
  const totalUsers = computed(() => usersTotal.value || users.value.length)
  const totalAnnouncements = computed(
    () => announcementsTotal.value || announcements.value.length
  )
  const totalFeedback = computed(
    () => feedbackTotal.value || feedback.value.length
  )

  // Отфильтрованные подборки
  const pendingAnnouncements = computed(() =>
    announcements.value.filter(a => a.status === 'pending')
  )
  const openFeedback = computed(() =>
    feedback.value.filter(f =>
      ['open', 'in_progress', 'waiting_user'].includes(f.status)
    )
  )
  const blockedUsers = computed(() =>
    users.value.filter(u => u.status === 'blocked')
  )
  const admins = computed(() =>
    users.value.filter(u => u.role === 'admin')
  )

  // Быстрый поиск по ID (для детальных страниц)
  const userById = computed(() => {
    const map = new Map()
    users.value.forEach(u => map.set(u.id, u))
    return (id) => map.get(Number(id)) || null
  })
  const announcementById = computed(() => {
    const map = new Map()
    announcements.value.forEach(a => map.set(a.id, a))
    return (id) => map.get(Number(id)) || null
  })
  const feedbackById = computed(() => {
    const map = new Map()
    feedback.value.forEach(f => map.set(f.id, f))
    return (id) => map.get(Number(id)) || null
  })

  // Общий флаг «что-то грузится»
  const isLoading = computed(() =>
    Object.values(loading.value).some(Boolean)
  )

  // Общая ошибка
  const firstError = computed(() => {
    for (const key of Object.keys(errors.value)) {
      if (errors.value[key]) return errors.value[key]
    }
    return null
  })

  /* ============================================================
   *  ВНУТРЕННИЕ ХЕЛПЕРЫ
   * ============================================================ */

  function setLoading(section, value) {
    loading.value = { ...loading.value, [section]: value }
  }

  function setError(section, err) {
    errors.value = {
      ...errors.value,
      [section]: err?.message || String(err) || 'Неизвестная ошибка'
    }
  }

  function clearError(section) {
    errors.value = { ...errors.value, [section]: null }
  }

  /**
   * Универсальная обёртка: loading + error + finally.
   * Работает с новым форматом API ({ items, total }) и старым (array).
   */
  async function withLoading(section, fn) {
    setLoading(section, true)
    clearError(section)
    try {
      return await fn()
    } catch (err) {
      setError(section, err)
      throw err
    } finally {
      setLoading(section, false)
    }
  }

  /**
   * Разворачивает ответ в { items, total }.
   * Совместимо и с массивом, и с объектом.
   */
  function unwrap(response) {
    if (Array.isArray(response)) {
      return { items: response, total: response.length }
    }
    if (response && typeof response === 'object') {
      return {
        items: response.items || response.data || [],
        total: response.total ?? (response.items?.length ?? 0)
      }
    }
    return { items: [], total: 0 }
  }

  /**
   * Оптимистично обновить элемент в массиве.
   */
  function patchInList(listRef, id, patch) {
    const index = listRef.value.findIndex(item => item.id === Number(id))
    if (index === -1) return false
    listRef.value = [
      ...listRef.value.slice(0, index),
      { ...listRef.value[index], ...patch },
      ...listRef.value.slice(index + 1)
    ]
    return true
  }

  /**
   * Удалить элемент из массива.
   */
  function removeFromList(listRef, id) {
    listRef.value = listRef.value.filter(item => item.id !== Number(id))
  }

  /* ============================================================
   *  DASHBOARD
   * ============================================================ */

  async function fetchDashboardStats() {
    return withLoading('dashboard', async () => {
      dashboardStats.value = await adminApi.getDashboardStats()
      return dashboardStats.value
    })
  }

  /* ============================================================
   *  USERS
   * ============================================================ */

  async function fetchUsers(params = {}) {
    usersParams.value = { ...params }
    return withLoading('users', async () => {
      const { items, total } = unwrap(await adminApi.getUsers(params))
      users.value = items
      usersTotal.value = total
      return items
    })
  }

  /** Повторный запрос с последними params */
  async function refetchUsers() {
    return fetchUsers(usersParams.value)
  }

  async function fetchUserById(id) {
    return withLoading('users', async () => {
      // Если уже в списке — возвращаем без запроса
      const cached = userById.value(id)
      if (cached) return cached

      const user = await adminApi.getUserById(id)
      if (user) users.value = [...users.value, user]
      return user
    })
  }

  async function blockUser(id, reason = null) {
    clearError('users')

    const prev = userById.value(id)

    // Optimistic
    patchInList(users, id, { status: 'blocked', blockReason: reason })

    try {
      const updated = await adminApi.blockUser(id)
      if (updated) patchInList(users, id, updated)
      return updated
    } catch (err) {
      // Откат
      if (prev) patchInList(users, id, prev)
      setError('users', err)
      throw err
    }
  }

  async function unblockUser(id) {
    clearError('users')

    const prev = userById.value(id)

    patchInList(users, id, { status: 'active', blockReason: null })

    try {
      const updated = await adminApi.unblockUser(id)
      if (updated) patchInList(users, id, updated)
      return updated
    } catch (err) {
      if (prev) patchInList(users, id, prev)
      setError('users', err)
      throw err
    }
  }

  /* ============================================================
   *  ANNOUNCEMENTS
   * ============================================================ */

  async function fetchAnnouncements(params = {}) {
    announcementsParams.value = { ...params }
    return withLoading('announcements', async () => {
      const { items, total } = unwrap(await adminApi.getAnnouncements(params))
      announcements.value = items
      announcementsTotal.value = total
      return items
    })
  }

  async function refetchAnnouncements() {
    return fetchAnnouncements(announcementsParams.value)
  }

  async function fetchAnnouncementById(id) {
    return withLoading('announcements', async () => {
      const cached = announcementById.value(id)
      if (cached) return cached

      const item = await adminApi.getAnnouncementById(id)
      if (item) announcements.value = [...announcements.value, item]
      return item
    })
  }

  /**
   * Модерация одного объявления.
   * action: 'approve' | 'reject' | 'block'
   */
  async function moderateAnnouncement(id, action) {
    clearError('announcements')

    const prev = announcementById.value(id)

    // Маппинг action → новый статус (для optimistic)
    const optimisticStatus = {
      approve: 'active',
      reject: 'rejected',
      block: 'blocked'
    }[action]

    if (optimisticStatus) {
      patchInList(announcements, id, { status: optimisticStatus })
    }

    try {
      const result = await adminApi.moderateAnnouncement(id, action)
      if (result) patchInList(announcements, id, result)

      // Обновляем счётчики дашборда (тихо, без блокировки UI)
      fetchDashboardStats().catch(() => {})

      return result
    } catch (err) {
      if (prev) patchInList(announcements, id, prev)
      setError('announcements', err)
      throw err
    }
  }

  /**
   * Массовая модерация (bulk).
   * @param {Array<number>} ids
   * @param {string} action
   * @returns {{ succeeded: Array, failed: Array }}
   */
  async function moderateMany(ids, action) {
    const results = { succeeded: [], failed: [] }
    const list = Array.isArray(ids) ? ids : []

    await Promise.all(
      list.map(async (id) => {
        try {
          await moderateAnnouncement(id, action)
          results.succeeded.push(id)
        } catch {
          results.failed.push(id)
        }
      })
    )

    return results
  }

  /* ============================================================
   *  FEEDBACK
   * ============================================================ */

  async function fetchFeedback(params = {}) {
    feedbackParams.value = { ...params }
    return withLoading('feedback', async () => {
      const { items, total } = unwrap(await adminApi.getFeedback(params))
      feedback.value = items
      feedbackTotal.value = total
      return items
    })
  }

  async function refetchFeedback() {
    return fetchFeedback(feedbackParams.value)
  }

  async function fetchFeedbackById(id) {
    return withLoading('feedback', async () => {
      const cached = feedbackById.value(id)
      if (cached) return cached

      const item = await adminApi.getFeedbackById(id)
      if (item) feedback.value = [...feedback.value, item]
      return item
    })
  }

  /**
   * Обновить статус обращения.
   */
  async function updateFeedbackStatus(id, status) {
    clearError('feedback')

    const prev = feedbackById.value(id)
    patchInList(feedback, id, { status })

    try {
      const result = await adminApi.updateFeedbackStatus(id, status)
      if (result) patchInList(feedback, id, result)
      return result
    } catch (err) {
      if (prev) patchInList(feedback, id, prev)
      setError('feedback', err)
      throw err
    }
  }

  /**
   * Ответить на обращение.
   */
  async function replyToFeedback(id, content) {
    const prev = feedbackById.value(id)

    // Optimistic: добавляем сообщение локально
    if (prev) {
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        feedbackId: Number(id),
        authorId: 100,
        authorName: 'Служба поддержки',
        authorType: 'admin',
        content,
        createdAt: new Date().toISOString(),
        pending: true
      }
      patchInList(feedback, id, {
        messages: [...(prev.messages || []), optimisticMsg],
        status: 'waiting_user'
      })
    }

    try {
      const result = await adminApi.replyToFeedback(id, content)
      // Заменяем optimistic на реальный ответ
      if (result) {
        patchInList(feedback, id, result)
      }
      return result
    } catch (err) {
      if (prev) patchInList(feedback, id, prev)
      setError('feedback', err)
      throw err
    }
  }

  /* ============================================================
   *  AUDIT LOGS
   * ============================================================ */

  async function fetchAuditLogs(params = {}) {
    auditLogsParams.value = { ...params }
    return withLoading('auditLogs', async () => {
      const { items, total } = unwrap(await adminApi.getAuditLogs(params))
      auditLogs.value = items
      auditLogsTotal.value = total
      return items
    })
  }

  async function refetchAuditLogs() {
    return fetchAuditLogs(auditLogsParams.value)
  }

  /* ============================================================
   *  СБРОС
   * ============================================================ */

  function reset() {
    users.value = []
    announcements.value = []
    feedback.value = []
    auditLogs.value = []

    usersTotal.value = 0
    announcementsTotal.value = 0
    feedbackTotal.value = 0
    auditLogsTotal.value = 0

    dashboardStats.value = null

    usersParams.value = {}
    announcementsParams.value = {}
    feedbackParams.value = {}
    auditLogsParams.value = {}

    loading.value = {
      dashboard: false,
      users: false,
      announcements: false,
      feedback: false,
      auditLogs: false
    }

    errors.value = {
      dashboard: null,
      users: null,
      announcements: null,
      feedback: null,
      auditLogs: null
    }
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // Стейт
    users,
    announcements,
    feedback,
    auditLogs,
    dashboardStats,

    usersTotal,
    announcementsTotal,
    feedbackTotal,
    auditLogsTotal,

    // Загрузка / ошибки
    loading,
    errors,
    isLoading,
    firstError,

    // Геттеры
    totalUsers,
    totalAnnouncements,
    totalFeedback,
    pendingAnnouncements,
    openFeedback,
    blockedUsers,
    admins,
    userById,
    announcementById,
    feedbackById,

    // Dashboard
    fetchDashboardStats,

    // Users
    fetchUsers,
    refetchUsers,
    fetchUserById,
    blockUser,
    unblockUser,

    // Announcements
    fetchAnnouncements,
    refetchAnnouncements,
    fetchAnnouncementById,
    moderateAnnouncement,
    moderateMany,

    // Feedback
    fetchFeedback,
    refetchFeedback,
    fetchFeedbackById,
    updateFeedbackStatus,
    replyToFeedback,

    // Audit
    fetchAuditLogs,
    refetchAuditLogs,

    // Reset
    reset
  }
})