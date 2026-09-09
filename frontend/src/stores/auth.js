import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api/authApi'
import { tokenStorage } from '@/services/storage/tokenStorage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const accessToken = ref(null)
  const refreshToken = ref(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref(null)
  
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  
  async function initAuth() {
    const token = tokenStorage.getAccessToken()
    if (token) {
      accessToken.value = token
      try {
        user.value = await authApi.getCurrentUser()
      } catch (err) {
        console.error('Failed to get user:', err)
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
    register,
    logout
  }
})