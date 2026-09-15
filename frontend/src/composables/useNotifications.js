import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useToastStore } from '@/stores/toast'

export function useNotifications() {
  const store = useNotificationsStore()
  const toastStore = useToastStore()

  const notifications = computed(() => store.notifications)
  const unreadCount = computed(() => store.unreadCount)
  const hasUnread = computed(() => store.hasUnread)
  const loading = computed(() => store.loading)

  async function fetchNotifications() {
    try {
      return await store.fetchNotifications()
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  async function markAsRead(id) {
    try {
      await store.markAsRead(id)
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  async function markAllAsRead() {
    try {
      await store.markAllAsRead()
      toastStore.success('Все уведомления прочитаны')
    } catch (err) {
      toastStore.error('Ошибка')
    }
  }

  return {
    notifications,
    unreadCount,
    hasUnread,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}