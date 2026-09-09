// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockNotifications } from '@/mock/notifications'

export const notificationsApi = {
  async getNotifications() {
    if (config.api.useMock) {
      return mockNotifications
    }
    // const { data } = await axiosInstance.get('/notifications')
    // return data
  },
  
  async markAsRead(notificationId) {
    if (config.api.useMock) {
      const notification = mockNotifications.find(n => n.id === Number(notificationId))
      if (notification) {
        notification.read = true
      }
      return true
    }
    // await axiosInstance.put(`/notifications/${notificationId}/read`)
  },
  
  async markAllAsRead() {
    if (config.api.useMock) {
      mockNotifications.forEach(n => n.read = true)
      return true
    }
    // await axiosInstance.put('/notifications/read-all')
  },
  
  async updateSettings(settings) {
    if (config.api.useMock) {
      return settings
    }
    // const { data } = await axiosInstance.put('/notifications/settings', settings)
    // return data
  }
}