import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api/authApi'
import { tokenStorage } from '@/services/storage/tokenStorage'
import config from '@/config'
import { setMockCurrentUser } from '@/mock/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const pendingUser = ref(null)
  const pendingToken = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function initAuth() {
    const token = tokenStorage.getAccessToken()

    if (token && config.api.useMock) {
      const match = token.match(/mock_access_(\d+)_/)
      if (match) {
        const userId = Number(match[1])
        setMockCurrentUser(userId)
        accessToken.value = token
        try {
          user.value = await authApi.getCurrentUser()
        } catch (err) {
          console.error('Failed to restore user:', err)
          logout()
        }
      }
    } else if (token) {
      accessToken.value = token
      try {
        user.value = await authApi.getCurrentUser()
      } catch (err) {
        console.error('Failed to restore user:', err)
        logout()
      }
    }

    initialized.value = true
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(credentials)

      if (response.requires2FA) {
        pendingUser.value = response.user
        pendingToken.value = response.accessToken
        return { requires2FA: true }
      }

      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      user.value = response.user
      tokenStorage.setTokens(response.accessToken, response.refreshToken)
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verify2FA(code) {
    loading.value = true
    try {
      await authApi.verify2FA(code)
      accessToken.value = pendingToken.value
      user.value = pendingUser.value
      tokenStorage.setTokens(pendingToken.value, '')
      pendingUser.value = null
      pendingToken.value = null
      return { success: true }
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
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      pendingUser.value = null
      pendingToken.value = null
      tokenStorage.clearTokens()
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    initialized,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    initAuth,
    login,
    verify2FA,
    register,
    logout
  }
})