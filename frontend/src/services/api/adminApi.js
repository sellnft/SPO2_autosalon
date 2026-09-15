import config from '@/config'
import axiosInstance from './axios'
import { mockUsers } from '@/mock/users'
import { mockAnnouncements } from '@/mock/announcements'
import { mockFeedback } from '@/mock/feedback'

export const adminApi = {
  async getDashboardStats() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return {
        totalUsers: mockUsers.length,
        totalAnnouncements: mockAnnouncements.length,
        activeAnnouncements: mockAnnouncements.filter(a => a.status === 'active').length,
        pendingAnnouncements: mockAnnouncements.filter(a => a.status === 'pending').length,
        totalFeedback: mockFeedback.length,
        newFeedback: mockFeedback.filter(f => f.status === 'new' || f.status === 'open').length
      }
    }
    const { data } = await axiosInstance.get('/admin/stats')
    return data
  },

  async getUsers() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockUsers]
    }
    const { data } = await axiosInstance.get('/admin/users')
    return data
  },

  async getAnnouncements() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockAnnouncements]
    }
    const { data } = await axiosInstance.get('/admin/announcements')
    return data
  },

  async moderateAnnouncement(id, action) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 300))
      const announcement = mockAnnouncements.find(a => a.id === Number(id))
      if (announcement) {
        const statusMap = {
          approve: 'active',
          reject: 'rejected',
          block: 'blocked'
        }
        announcement.status = statusMap[action] || announcement.status
      }
      return announcement
    }
    const { data } = await axiosInstance.put(`/admin/announcements/${id}/moderate`, { action })
    return data
  },

  async getFeedback() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockFeedback]
    }
    const { data } = await axiosInstance.get('/admin/feedback')
    return data
  },

  async blockUser(id) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const user = mockUsers.find(u => u.id === Number(id))
      if (user) {
        user.status = 'blocked'
        user.blockReason = 'Заблокирован администратором'
      }
      return user
    }
    const { data } = await axiosInstance.put(`/admin/users/${id}/block`)
    return data
  },

  async unblockUser(id) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const user = mockUsers.find(u => u.id === Number(id))
      if (user) {
        user.status = 'active'
        user.blockReason = null
      }
      return user
    }
    const { data } = await axiosInstance.put(`/admin/users/${id}/unblock`)
    return data
  },

  async getAuditLogs() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [
        {
          id: 1,
          userId: 4,
          actorName: 'Администратор',
          action: 'login',
          details: 'Вход в систему',
          ip: '192.168.1.1',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          userId: 1,
          actorName: 'Алексей Петров',
          action: 'create_announcement',
          details: 'Создание объявления #3',
          ip: '192.168.1.2',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 3,
          userId: 4,
          actorName: 'Администратор',
          action: 'moderate_announcement',
          details: 'Одобрение объявления #5',
          ip: '192.168.1.1',
          createdAt: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: 4,
          userId: 2,
          actorName: 'Мария Иванова',
          action: 'login',
          details: 'Вход в систему',
          ip: '192.168.1.3',
          createdAt: new Date(Date.now() - 14400000).toISOString()
        }
      ]
    }
    const { data } = await axiosInstance.get('/admin/audit-logs')
    return data
  }
}