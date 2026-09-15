import config from '@/config'
import axiosInstance from './axios'
import { mockNotifications } from '@/mock/notifications'

export const notificationsApi = {
  async getNotifications() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockNotifications]
    }
    const { data } = await axiosInstance.get('/notifications')
    return data
  },

  async markAsRead(id) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 100))
      const n = mockNotifications.find(n => n.id === Number(id))
      if (n) n.read = true
      return true
    }
    await axiosInstance.put(`/notifications/${id}/read`)
    return true
  },

  async markAllAsRead() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      mockNotifications.forEach(n => (n.read = true))
      return true
    }
    await axiosInstance.put('/notifications/read-all')
    return true
  },

  async updateSettings(settings) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 300))
      return settings
    }
    const { data } = await axiosInstance.put('/notifications/settings', settings)
    return data
  }
}