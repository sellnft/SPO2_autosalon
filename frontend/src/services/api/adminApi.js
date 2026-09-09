// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockUsers } from '@/mock/users'
import { mockAnnouncements } from '@/mock/announcements'
import { mockFeedback } from '@/mock/feedback'

export const adminApi = {
  async getDashboardStats() {
    if (config.api.useMock) {
      return {
        totalUsers: mockUsers.length,
        totalAnnouncements: mockAnnouncements.length,
        activeAnnouncements: mockAnnouncements.filter(a => a.status === 'active').length,
        pendingAnnouncements: mockAnnouncements.filter(a => a.status === 'pending').length,
        totalFeedback: mockFeedback.length,
        newFeedback: mockFeedback.filter(f => f.status === 'new').length
      }
    }
    // const { data } = await axiosInstance.get('/admin/stats')
    // return data
  },
  
  async getUsers() {
    if (config.api.useMock) {
      return mockUsers
    }
    // const { data } = await axiosInstance.get('/admin/users')
    // return data
  },
  
  async getAnnouncements() {
    if (config.api.useMock) {
      return mockAnnouncements
    }
    // const { data } = await axiosInstance.get('/admin/announcements')
    // return data
  },
  
  async moderateAnnouncement(id, action) {
    if (config.api.useMock) {
      const announcement = mockAnnouncements.find(a => a.id === Number(id))
      if (announcement) {
        announcement.status = action === 'approve' ? 'active' : 'rejected'
      }
      return announcement
    }
    // const { data } = await axiosInstance.put(`/admin/announcements/${id}/moderate`, { action })
    // return data
  },
  
  async getFeedback() {
    if (config.api.useMock) {
      return mockFeedback
    }
    // const { data } = await axiosInstance.get('/admin/feedback')
    // return data
  },
  
  async getAuditLogs() {
    if (config.api.useMock) {
      return [
        {
          id: 1,
          userId: 1,
          action: 'login',
          details: 'Вход в систему',
          ip: '192.168.1.1',
          createdAt: '2024-01-15T10:30:00'
        },
        {
          id: 2,
          userId: 2,
          action: 'create_announcement',
          details: 'Создание объявления #3',
          ip: '192.168.1.2',
          createdAt: '2024-01-15T11:00:00'
        }
      ]
    }
    // const { data } = await axiosInstance.get('/admin/audit-logs')
    // return data
  }
}