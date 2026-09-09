import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi } from '@/services/api/usersApi'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const sessions = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const isProfileLoaded = computed(() => !!profile.value)
  
  async function fetchProfile(userId) {
    loading.value = true
    error.value = null
    try {
      profile.value = await usersApi.getUser(userId)
      return profile.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateProfile(userData) {
    loading.value = true
    error.value = null
    try {
      profile.value = await usersApi.updateUser(userData)
      return profile.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchSessions() {
    loading.value = true
    try {
      sessions.value = await usersApi.getSessions()
      return sessions.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function revokeSession(sessionId) {
    try {
      await usersApi.revokeSession(sessionId)
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  return {
    profile,
    sessions,
    loading,
    error,
    isProfileLoaded,
    fetchProfile,
    updateProfile,
    fetchSessions,
    revokeSession
  }
})