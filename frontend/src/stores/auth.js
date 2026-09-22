import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api/authApi'
import { tokenStorage } from '@/services/storage/tokenStorage'
import config from '@/config'
import { setMockCurrentUser } from '@/mock/auth'

const PENDING_2FA_KEY = 'cv_pending_2fa'

export const useAuthStore = defineStore('auth', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const user = ref(null)
  const accessToken = ref(tokenStorage.getAccessToken?.() ?? null)
  const refreshToken = ref(tokenStorage.getRefreshToken?.() ?? null)

  // Временное состояние для двухфакторки
  const pendingUser = ref(null)
  const pendingToken = ref(null)

  // Флаги
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // Singleton-промис для initAuth
  let initPromise = null

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  /**
   * Авторизован ли пользователь.
   * ВАЖНО: проверяем ТОЛЬКО наличие токена — user может быть ещё не загружен.
   * Если нужен «залогинен и данные есть» — используй isReady.
   */
  const isAuthenticated = computed(() => Boolean(accessToken.value))

  /** Полностью готов: токен есть + user загружен */
  const isReady = computed(
    () => Boolean(accessToken.value) && Boolean(user.value)
  )

  const isAdmin = computed(() => user.value?.role === 'admin')

  const isEmailVerified = computed(
    () => Boolean(user.value?.emailVerified)
  )

  const userName = computed(() => user.value?.name || '')
  const userInitial = computed(() => (user.value?.name?.charAt(0) || '?').toUpperCase())

  /** Есть незавершённый процесс 2FA */
  const hasPending2FA = computed(
    () => Boolean(pendingUser.value && pendingToken.value)
  )

  /* ============================================================
   *  ХЕЛПЕРЫ
   * ============================================================ */

  function normalizeError(err) {
    return err?.message || String(err) || 'Неизвестная ошибка'
  }

  /** Восстановить pending 2FA из sessionStorage (после F5) */
  function restorePending2FA() {
    if (typeof sessionStorage === 'undefined') return
    try {
      const raw = sessionStorage.getItem(PENDING_2FA_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.user && data?.token) {
        pendingUser.value = data.user
        pendingToken.value = data.token
      }
    } catch {
      sessionStorage.removeItem(PENDING_2FA_KEY)
    }
  }

  function savePending2FA() {
    if (typeof sessionStorage === 'undefined') return
    try {
      sessionStorage.setItem(
        PENDING_2FA_KEY,
        JSON.stringify({
          user: pendingUser.value,
          token: pendingToken.value
        })
      )
    } catch {
      /* no-op */
    }
  }

  function clearPending2FA() {
    pendingUser.value = null
    pendingToken.value = null
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(PENDING_2FA_KEY)
    }
  }

  /** Применить логин-ответ (общий для login/verify2FA) */
  function applyAuthResponse(response) {
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken ?? refreshToken.value
    user.value = response.user

    tokenStorage.setTokens(response.accessToken, response.refreshToken)
  }

  /** Полная очистка состояния */
  function resetState() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    clearPending2FA()
    error.value = null
    initPromise = null
  }

  /* ============================================================
   *  INIT
   * ============================================================ */

  /**
   * Инициализация auth при старте приложения.
   * Идемпотентна — повторные вызовы возвращают тот же промис.
   */
  async function initAuth() {
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      // Восстанавливаем 2FA-сессию, если была
      restorePending2FA()

      const token = tokenStorage.getAccessToken?.()

      if (!token) {
        initialized.value = true
        return
      }

      accessToken.value = token
      refreshToken.value = tokenStorage.getRefreshToken?.() ?? null

      // Mock-режим: устанавливаем текущего юзера по токену
      if (config.api.useMock) {
        const match = token.match(/mock_access_(\d+)_/)
        if (match) {
          setMockCurrentUser(Number(match[1]))
        }
      }

      try {
        const current = await authApi.getCurrentUser()

        // authApi теперь возвращает null при 401, а не бросает
        if (!current) {
          resetState()
        } else {
          user.value = current
        }
      } catch (err) {
        // Сетевая ошибка — не разлогиниваем, оставляем токен.
        // Юзер увидит ошибку при следующем запросе и повторит попытку.
        console.warn('[auth] initAuth: failed to load user:', err?.message || err)
        // НО если 401 — API вернул null, отработали выше
      }

      initialized.value = true
    })()

    try {
      return await initPromise
    } finally {
      // После завершения не сбрасываем — пусть initialized защищает
    }
  }

  /* ============================================================
   *  LOGIN
   * ============================================================ */

  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)

      // Требуется 2FA
      if (response?.requires2FA) {
        pendingUser.value = response.user
        pendingToken.value = response.accessToken
        savePending2FA()
        return { requires2FA: true, user: response.user }
      }

      applyAuthResponse(response)
      return response
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verify2FA(code) {
    if (!pendingUser.value || !pendingToken.value) {
      const err = new Error('Нет активной сессии 2FA')
      error.value = err.message
      throw err
    }

    loading.value = true
    error.value = null

    try {
      // API может вернуть новые токены — используем их, если есть
      const response = await authApi.verify2FA(code)

      const finalAccess = response?.accessToken || pendingToken.value
      const finalRefresh = response?.refreshToken ?? null
      const finalUser = response?.user || pendingUser.value

      applyAuthResponse({
        accessToken: finalAccess,
        refreshToken: finalRefresh,
        user: finalUser
      })

      clearPending2FA()
      return { success: true, user: finalUser }
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.register(userData)
      return response
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /* ============================================================
   *  LOGOUT
   * ============================================================ */

  async function logout(opts = {}) {
    // Всегда чистим локальное состояние, даже если API упал
    try {
      if (!opts.skipApi) {
        await authApi.logout()
      }
    } catch (err) {
      // Не валим UI из-за ошибки на бэке
      console.warn('[auth] logout API failed:', err?.message || err)
    } finally {
      resetState()
      tokenStorage.clear?.()
    }
  }

  /* ============================================================
   *  PROFILE / PASSWORD
   * ============================================================ */

  async function updateProfile(data) {
    loading.value = true
    error.value = null

    try {
      const updated = await authApi.updateProfile?.(data)
      if (updated) {
        // Merge — сохраняем поля, которых нет в ответе
        user.value = { ...user.value, ...updated }
      }
      return user.value
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function changePassword(payload) {
    loading.value = true
    error.value = null

    try {
      await authApi.changePassword?.(payload)
      return { ok: true }
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    loading.value = true
    error.value = null

    try {
      await authApi.forgotPassword?.(email)
      return { ok: true }
    } catch (err) {
      error.value = normalizeError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /* ============================================================
   *  ROLE HELPERS
   * ============================================================ */

  function hasRole(role) {
    if (!user.value) return false
    return Array.isArray(role)
      ? role.includes(user.value.role)
      : user.value.role === role
  }

  /* ============================================================
   *  RESET (используется при cv:auth-expired)
   * ============================================================ */

  function reset() {
    resetState()
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    user,
    accessToken,
    refreshToken,
    pendingUser,
    pendingToken,
    initialized,
    loading,
    error,

    // Getters
    isAuthenticated,
    isReady,
    isAdmin,
    isEmailVerified,
    userName,
    userInitial,
    hasPending2FA,

    // Actions
    initAuth,
    login,
    verify2FA,
    register,
    logout,

    // Profile
    updateProfile,
    changePassword,
    forgotPassword,

    // Utils
    hasRole,
    reset
  }
})