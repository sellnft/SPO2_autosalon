// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockAuth } from '@/mock/auth'

export const authApi = {
  async login(credentials) {
    if (config.api.useMock) {
      return mockAuth.login(credentials)
    }
    // Реальный запрос:
    // const { data } = await axiosInstance.post('/auth/login', credentials)
    // return data
  },
  
  async register(userData) {
    if (config.api.useMock) {
      return mockAuth.register(userData)
    }
    // const { data } = await axiosInstance.post('/auth/register', userData)
    // return data
  },
  
  async logout() {
    if (config.api.useMock) {
      return mockAuth.logout()
    }
    // const { data } = await axiosInstance.post('/auth/logout')
    // return data
  },
  
  async getCurrentUser() {
    if (config.api.useMock) {
      return mockAuth.getCurrentUser()
    }
    // const { data } = await axiosInstance.get('/auth/me')
    // return data
  },
  
  async refreshToken() {
    if (config.api.useMock) {
      return mockAuth.refreshToken()
    }
    // const { data } = await axiosInstance.post('/auth/refresh')
    // return data
  }
}