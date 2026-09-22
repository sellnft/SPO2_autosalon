import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast'

/** Разрешённые пути для redirect (защита от open redirect) */
const SAFE_REDIRECT_PATTERN = /^\/(?!\/)/

/**
 * Composable-обёртка над auth-store с роутингом и тостами.
 * Безопасный редирект, обработка 2FA, guard'ы.
 */
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const toastStore = useToastStore()

  // === Реактивные данные ===
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const loading = computed(() => authStore.loading)

  /**
   * Безопасно достать redirect из query или аргумента.
   * Защита от open redirect: пропускаем только относительные пути.
   */
  function resolveRedirect(explicit, fallback = '/') {
    const fromQuery = Array.isArray(route.query.redirect)
      ? route.query.redirect[0]
      : route.query.redirect

    const candidate = explicit || fromQuery
    if (typeof candidate !== 'string') return fallback
    if (!SAFE_REDIRECT_PATTERN.test(candidate)) return fallback
    return candidate
  }

  /**
   * Логин. Если требуется 2FA — редирект на её страницу,
   * иначе — на redirect или главную.
   */
  async function login(credentials, redirect = null) {
    try {
      const response = await authStore.login(credentials)

      if (response?.requires2FA) {
        toastStore.info('Требуется двухфакторная аутентификация')
        router.push({
          name: '2fa',
          query: { redirect: resolveRedirect(redirect) }
        })
        return response
      }

      toastStore.success('Вы успешно вошли')
      router.push(resolveRedirect(redirect))
      return response
    } catch (err) {
      toastStore.error(err?.message || 'Ошибка входа')
      throw err
    }
  }

  /**
   * Регистрация.
   * @param {Object} userData
   * @param {Object} [opts]
   * @param {boolean} [opts.requireVerification=true] — редирект на verify-email
   */
  async function register(userData, opts = {}) {
    const { requireVerification = true } = opts

    try {
      const response = await authStore.register(userData)
      toastStore.success('Регистрация успешна')

      if (requireVerification && userData?.email) {
        router.push({ name: 'verify-email', query: { email: userData.email } })
      } else {
        router.push('/')
      }

      return response
    } catch (err) {
      toastStore.error(err?.message || 'Ошибка регистрации')
      throw err
    }
  }

  /**
   * Выход. Если стор упадёт — всё равно чистим локально и редиректим.
   * @param {Object} [opts]
   * @param {string} [opts.redirect='/'] — куда перейти после выхода
   * @param {boolean} [opts.silent=false] — не показывать тост
   */
  async function logout(opts = {}) {
    const { redirect = '/', silent = false } = opts

    try {
      await authStore.logout()
    } catch (err) {
      // Стор упал, но локально всё равно считаем юзера вышедшим
      console.warn('[useAuth] logout failed:', err?.message || err)
    } finally {
      if (!silent) toastStore.success('Вы вышли из аккаунта')
      router.push(redirect)
    }
  }

  /**
   * Проверка авторизации. Если не залогинен — тост + редирект на логин.
   * @returns {Promise<boolean>}
   */
  async function requireAuth(redirect = null) {
    if (isAuthenticated.value) return true

    toastStore.info('Войдите, чтобы продолжить')
    router.push({
      name: 'login',
      query: { redirect: redirect || route.fullPath }
    })
    return false
  }

  /**
   * Проверка роли. Если роль не совпадает — 403-тост.
   * @returns {boolean}
   */
  function requireRole(role) {
    if (!isAuthenticated.value) {
      return requireAuth()
    }

    const has = Array.isArray(role)
      ? role.some(r => user.value?.role === r)
      : user.value?.role === role

    if (!has) {
      toastStore.error('Недостаточно прав')
      return false
    }
    return true
  }

  /** Проверка роли без редиректа (для v-if) */
  function hasRole(role) {
    if (!user.value) return false
    return Array.isArray(role)
      ? role.includes(user.value.role)
      : user.value.role === role
  }

  /** Обновить профиль текущего юзера */
  async function updateProfile(data, opts = {}) {
    try {
      const updated = await authStore.updateProfile(data)
      toastStore.success(opts.successMessage || 'Профиль обновлён')
      return updated
    } catch (err) {
      toastStore.error(err?.message || 'Не удалось обновить профиль')
      throw err
    }
  }

  /** Сменить пароль */
  async function changePassword(payload) {
    try {
      await authStore.changePassword(payload)
      toastStore.success('Пароль изменён')
    } catch (err) {
      toastStore.error(err?.message || 'Не удалось изменить пароль')
      throw err
    }
  }

  /** Запросить сброс пароля (отправка письма) */
  async function forgotPassword(email) {
    try {
      await authStore.forgotPassword(email)
      toastStore.success('Письмо отправлено на ' + email)
    } catch (err) {
      toastStore.error(err?.message || 'Не удалось отправить письмо')
      throw err
    }
  }

  return {
    // Данные
    user,
    isAuthenticated,
    isAdmin,
    loading,

    // Основные
    login,
    register,
    logout,

    // Guard'ы
    requireAuth,
    requireRole,
    hasRole,

    // Профиль
    updateProfile,
    changePassword,
    forgotPassword,

    // Утилиты
    resolveRedirect
  }
}