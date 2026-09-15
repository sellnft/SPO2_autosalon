import config from '@/config'
import axiosInstance from './axios'
import { mockUsers } from '@/mock/users'

export const usersApi = {
  async getUser(id) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return mockUsers.find(u => u.id === Number(id)) || null
    }
    const { data } = await axiosInstance.get(`/users/${id}`)
    return data
  },

  async updateUser(userData) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 400))
      const index = mockUsers.findIndex(u => u.id === Number(userData.id))
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...userData }
        return mockUsers[index]
      }
      return null
    }
    const { data } = await axiosInstance.put('/users/me', userData)
    return data
  },

  async getSessions() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [
        {
          id: 1,
          device: 'Chrome на MacBook Pro',
          ip: '192.168.1.1',
          location: 'Москва, Россия',
          lastActive: new Date().toISOString(),
          current: true
        },
        {
          id: 2,
          device: 'Safari на iPhone 15',
          ip: '192.168.1.2',
          location: 'Москва, Россия',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          current: false
        }
      ]
    }
    const { data } = await axiosInstance.get('/users/sessions')
    return data
  },

  async revokeSession(sessionId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return true
    }
    await axiosInstance.delete(`/users/sessions/${sessionId}`)
    return true
  },

  async changePassword(payload) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 600))
      return { success: true }
    }
    const { data } = await axiosInstance.put('/users/password', payload)
    return data
  }
}