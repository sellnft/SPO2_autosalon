import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const toastStore = useToastStore()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const loading = computed(() => authStore.loading)

  async function login(credentials, redirect = null) {
    try {
      const response = await authStore.login(credentials)
      toastStore.success('Вы успешно вошли')

      if (response?.requires2FA) {
        router.push({ name: '2fa', query: { redirect: redirect || route.query.redirect } })
      } else {
        router.push(redirect || route.query.redirect || '/')
      }
      return response
    } catch (err) {
      toastStore.error(err.message || 'Ошибка входа')
      throw err
    }
  }

  async function register(userData) {
    try {
      const response = await authStore.register(userData)
      toastStore.success('Регистрация успешна')
      router.push({ name: 'verify-email', query: { email: userData.email } })
      return response
    } catch (err) {
      toastStore.error(err.message || 'Ошибка регистрации')
      throw err
    }
  }

  async function logout() {
    await authStore.logout()
    toastStore.success('Вы вышли из аккаунта')
    router.push('/')
  }

  async function requireAuth(redirect = null) {
    if (!isAuthenticated.value) {
      toastStore.info('Войдите, чтобы продолжить')
      router.push({
        name: 'login',
        query: { redirect: redirect || route.fullPath }
      })
      return false
    }
    return true
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
    requireAuth
  }
}