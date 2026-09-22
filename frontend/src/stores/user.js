import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/services/api/usersApi'

export const useUserStore = defineStore('user', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const profile = ref(null)

  /** Кэш чужих профилей: { [id]: user } */
  const profilesCache = ref({})

  const sessions = ref([])
  const announcements = ref([])

  // Загрузка по секциям
  const loading = ref({
    profile: false,
    sessions: false,
    announcements: false
  })

  const mutating = ref(false)
  const error = ref(null)

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const isProfileLoaded = computed(() => Boolean(profile.value))

  const hasSessions = computed(() => sessions.value.length > 0)

  const isEmptySessions = computed(
    () => !loading.value.sessions && sessions.value.length === 0
  )

  const currentSession = computed(
    () => sessions.value.find(s => s.current) || null
  )

  const otherSessions = computed(
    () => sessions.value.filter(s => !s.current)
  )

  const hasAnnouncements = computed(() => announcements.value.length > 0)

  const isEmptyAnnouncements = computed(
    () => !loading.value.announcements && announcements.value.length === 0
  )

  /** Общий флаг — что-то грузится */
  const isLoading = computed(() =>
    Object.values(loading.value).some(Boolean)
  )

  /** Быстрый поиск сессии по ID */
  const sessionById = computed(() => {
    const map = new Map()
    sessions.value.forEach(s => map.set(s.id, s))
    return (id) => map.get(Number(id)) || null
  })

  /** Профиль другого юзера из кэша */
  const cachedProfile = computed(() => (id) => {
    return profilesCache.value[Number(id)] || null
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

  /* ============================================================
   *  PROFILE
   * ============================================================ */

  /**
   * Загрузить профиль пользователя.
   * @param {number} userId
   * @param {Object} [opts]
   * @param {boolean} [opts.useCache=true]
   * @param {boolean} [opts.force=false]
   */
  async function fetchProfile(userId, opts = {}) {
    const id = normalizeId(userId)
    if (!id) return null

    // Кэш
    if (!opts.force && opts.useCache !== false) {
      const cached = profilesCache.value[id]
      if (cached) {
        profile.value = cached
        return cached
      }
    }

    setSectionLoading('profile', true)
    error.value = null

    try {
      const user = await usersApi.getUser(id)
      profile.value = user
      if (user) {
        profilesCache.value = { ...profilesCache.value, [id]: user }
      }
      return user
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      setSectionLoading('profile', false)
    }
  }

  /** Загрузить свой профиль */
  async function fetchMyProfile(opts = {}) {
    return fetchProfile(opts.userId ?? 1, opts)
  }

  /**
   * Обновить профиль.
   * @param {Object} userData
   * @param {Object} [opts]
   * @param {boolean} [opts.partial=true] — merge или замена
   */
  async function updateProfile(userData, opts = {}) {
    if (!userData || typeof userData !== 'object') return null

    const prev = profile.value
    const { partial = true } = opts

    error.value = null
    mutating.value = true

    // Optimistic
    if (prev) {
      profile.value = partial
        ? { ...prev, ...userData }
        : { ...userData, id: prev.id }
    }

    try {
      const updated = await usersApi.updateUser(userData)

      // Merge: сохраняем поля, которых нет в ответе
      const finalProfile = updated && prev
        ? (partial ? { ...prev, ...updated } : updated)
        : (updated || prev)

      profile.value = finalProfile

      // Обновляем кэш
      if (finalProfile?.id) {
        profilesCache.value = {
          ...profilesCache.value,
          [finalProfile.id]: finalProfile
        }
      }

      return finalProfile
    } catch (err) {
      // Откат
      profile.value = prev
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  AVATAR
   * ============================================================ */

  async function uploadAvatar(file, opts = {}) {
    if (!file) return null

    error.value = null
    mutating.value = true

    try {
      const result = await usersApi.uploadAvatar?.(file, opts)

      if (result?.avatarUrl && profile.value) {
        profile.value = { ...profile.value, avatar: result.avatarUrl }
      }

      return result
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function deleteAvatar() {
    const prev = profile.value?.avatar

    error.value = null
    mutating.value = true

    // Optimistic
    if (profile.value) {
      profile.value = { ...profile.value, avatar: null }
    }

    try {
      await usersApi.deleteAvatar?.()
    } catch (err) {
      // Откат
      if (profile.value && prev) {
        profile.value = { ...profile.value, avatar: prev }
      }
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  SESSIONS
   * ============================================================ */

  async function fetchSessions() {
    setSectionLoading('sessions', true)
    error.value = null

    try {
      const response = await usersApi.getSessions()
      // Поддержка и массива, и { items, total }
      const items = Array.isArray(response) ? response : response.items || []
      sessions.value = items
      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      setSectionLoading('sessions', false)
    }
  }

  async function revokeSession(sessionId) {
    const id = normalizeId(sessionId)
    if (!id) return

    const prev = sessionById.value(id)
    const prevIndex = sessions.value.findIndex(s => s.id === id)

    if (!prev) return

    error.value = null
    mutating.value = true

    // Optimistic
    sessions.value = sessions.value.filter(s => s.id !== id)

    try {
      await usersApi.revokeSession(id)
    } catch (err) {
      // Откат
      const next = [...sessions.value]
      next.splice(Math.max(0, prevIndex), 0, prev)
      sessions.value = next
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /**
   * Завершить все сессии кроме текущей.
   */
  async function revokeAllSessions() {
    const others = otherSessions.value
    if (!others.length) return { ok: true, removed: 0 }

    const prev = [...sessions.value]

    error.value = null
    mutating.value = true

    // Optimistic: оставляем только текущую
    sessions.value = sessions.value.filter(s => s.current)

    try {
      const result = await usersApi.revokeAllSessions?.()
      return result ?? { ok: true, removed: others.length }
    } catch (err) {
      // Откат
      sessions.value = prev
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  PASSWORD / SECURITY
   * ============================================================ */

  async function changePassword(payload) {
    error.value = null
    mutating.value = true

    try {
      return await usersApi.changePassword?.(payload)
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function verifyPhone(code) {
    error.value = null
    mutating.value = true

    try {
      const result = await usersApi.verifyPhone?.(code)
      if (result?.ok && profile.value) {
        profile.value = { ...profile.value, phoneVerified: true }
      }
      return result
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  async function requestPhoneVerification(phone) {
    error.value = null

    try {
      return await usersApi.requestPhoneVerification?.(phone)
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    }
  }

  /* ============================================================
   *  ANNOUNCEMENTS
   * ============================================================ */

  /**
   * Загрузить объявления пользователя.
   * @param {number} userId
   * @param {Object} [params] — { page, perPage }
   */
  async function fetchUserAnnouncements(userId, params = {}) {
    const id = normalizeId(userId)
    if (!id) return []

    setSectionLoading('announcements', true)
    error.value = null

    try {
      const response = await usersApi.getUserAnnouncements?.(id, params)
      const items = Array.isArray(response) ? response : response?.items || []
      announcements.value = items
      return items
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      setSectionLoading('announcements', false)
    }
  }

  /* ============================================================
   *  ACCOUNT
   * ============================================================ */

  async function deleteAccount(password) {
    error.value = null
    mutating.value = true

    try {
      const result = await usersApi.deleteAccount?.(password)
      // Очищаем локально — authStore сам сбросит юзера
      profile.value = null
      sessions.value = []
      announcements.value = []
      return result
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      mutating.value = false
    }
  }

  /* ============================================================
   *  CACHE
   * ============================================================ */

  function clearProfileCache() {
    profilesCache.value = {}
  }

  /* ============================================================
   *  RESET
   * ============================================================ */

  function reset() {
    profile.value = null
    profilesCache.value = {}
    sessions.value = []
    announcements.value = []

    loading.value = {
      profile: false,
      sessions: false,
      announcements: false
    }

    mutating.value = false
    error.value = null
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    profile,
    sessions,
    announcements,
    loading,
    isLoading,
    mutating,
    error,

    // Getters
    isProfileLoaded,
    hasSessions,
    isEmptySessions,
    currentSession,
    otherSessions,
    hasAnnouncements,
    isEmptyAnnouncements,
    sessionById,
    cachedProfile,

    // Profile
    fetchProfile,
    fetchMyProfile,
    updateProfile,

    // Avatar
    uploadAvatar,
    deleteAvatar,

    // Sessions
    fetchSessions,
    revokeSession,
    revokeAllSessions,

    // Security
    changePassword,
    verifyPhone,
    requestPhoneVerification,

    // Announcements
    fetchUserAnnouncements,

    // Account
    deleteAccount,

    // Cache
    clearProfileCache,

    // Reset
    reset
  }
})