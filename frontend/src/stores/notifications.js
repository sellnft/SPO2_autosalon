import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationsApi } from '@/services/api/notificationsApi'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)
  
  const hasUnread = computed(() => unreadCount.value > 0)
  
  async function fetchNotifications() {
    loading.value = true
    try {
      notifications.value = await notificationsApi.getNotifications()
      unreadCount.value = notifications.value.filter(n => !n.read).length
      return notifications.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function markAsRead(notificationId) {
    try {
      await notificationsApi.markAsRead(notificationId)
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.read) {
        notification.read = true
        unreadCount.value--
      }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  async function markAllAsRead() {
    try {
      await notificationsApi.markAllAsRead()
      notifications.value.forEach(n => n.read = true)
      unreadCount.value = 0
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  async function updateNotificationSettings(settings) {
    try {
      return await notificationsApi.updateSettings(settings)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updateNotificationSettings
  }
})