// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockUsers } from '@/mock/users'

export const usersApi = {
  async getUser(id) {
    if (config.api.useMock) {
      return mockUsers.find(u => u.id === Number(id)) || null
    }
    // const { data } = await axiosInstance.get(`/users/${id}`)
    // return data
  },
  
  async updateUser(userData) {
    if (config.api.useMock) {
      const index = mockUsers.findIndex(u => u.id === userData.id)
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...userData }
        return mockUsers[index]
      }
      return null
    }
    // const { data } = await axiosInstance.put('/users/me', userData)
    // return data
  },
  
  async getSessions() {
    if (config.api.useMock) {
      return [
        {
          id: 1,
          device: 'Chrome на MacBook Pro',
          ip: '192.168.1.1',
          location: 'Москва, Россия',
          lastActive: '2024-01-15T10:30:00',
          current: true
        },
        {
          id: 2,
          device: 'Safari на iPhone 15',
          ip: '192.168.1.2',
          location: 'Москва, Россия',
          lastActive: '2024-01-14T18:45:00',
          current: false
        }
      ]
    }
    // const { data } = await axiosInstance.get('/users/sessions')
    // return data
  },
  
  async revokeSession(sessionId) {
    if (config.api.useMock) {
      return true
    }
    // await axiosInstance.delete(`/users/sessions/${sessionId}`)
  }
}