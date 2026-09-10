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
      
      // Обновляем локально
      const index = announcements.value.findIndex(a => a.id === Number(id))
      if (index !== -1) {
        const newStatus = action === 'approve' ? 'active' 
          : action === 'reject' ? 'rejected' 
          : action === 'block' ? 'blocked' 
          : announcements.value[index].status
        announcements.value[index] = { 
          ...announcements.value[index], 
          status: newStatus 
        }
      }
      
      return result
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
    fetchFeedback,
    fetchAuditLogs
  }
})