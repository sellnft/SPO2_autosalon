import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApi } from '@/services/api/adminApi'

export const useAdminStore = defineStore('admin', () => {
  const users = ref([])
  const announcements = ref([])
  const feedback = ref([])
  const auditLogs = ref([])
  const dashboardStats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const totalUsers = computed(() => users.value.length)
  const totalAnnouncements = computed(() => announcements.value.length)
  const pendingAnnouncements = computed(() =>
    announcements.value.filter(a => a.status === 'pending')
  )
  const openFeedback = computed(() =>
    feedback.value.filter(f =>
      ['open', 'in_progress', 'waiting_user'].includes(f.status)
    )
  )

  async function fetchDashboardStats() {
    loading.value = true
    try {
      dashboardStats.value = await adminApi.getDashboardStats()
      return dashboardStats.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUsers() {
    loading.value = true
    try {
      users.value = await adminApi.getUsers()
      return users.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAnnouncements() {
    loading.value = true
    try {
      announcements.value = await adminApi.getAnnouncements()
      return announcements.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function moderateAnnouncement(id, action) {
    try {
      const result = await adminApi.moderateAnnouncement(id, action)
      const index = announcements.value.findIndex(a => a.id === Number(id))
      if (index !== -1 && result) {
        announcements.value[index] = { ...announcements.value[index], ...result }
      }
      return result
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function blockUser(id) {
    try {
      const updated = await adminApi.blockUser(id)
      const index = users.value.findIndex(u => u.id === Number(id))
      if (index !== -1 && updated) {
        users.value[index] = { ...users.value[index], ...updated }
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function unblockUser(id) {
    try {
      const updated = await adminApi.unblockUser(id)
      const index = users.value.findIndex(u => u.id === Number(id))
      if (index !== -1 && updated) {
        users.value[index] = { ...users.value[index], ...updated }
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function fetchFeedback() {
    loading.value = true
    try {
      feedback.value = await adminApi.getFeedback()
      return feedback.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAuditLogs() {
    loading.value = true
    try {
      auditLogs.value = await adminApi.getAuditLogs()
      return auditLogs.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset() {
    users.value = []
    announcements.value = []
    feedback.value = []
    auditLogs.value = []
    dashboardStats.value = null
    error.value = null
  }

  return {
    users,
    announcements,
    feedback,
    auditLogs,
    dashboardStats,
    loading,
    error,
    totalUsers,
    totalAnnouncements,
    pendingAnnouncements,
    openFeedback,
    fetchDashboardStats,
    fetchUsers,
    fetchAnnouncements,
    moderateAnnouncement,
    blockUser,
    unblockUser,
    fetchFeedback,
    fetchAuditLogs,
    reset
  }
})