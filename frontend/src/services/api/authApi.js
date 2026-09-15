import config from '@/config'
import axiosInstance from './axios'
import { mockAuth } from '@/mock/auth'

export const authApi = {
  async login(credentials) {
    if (config.api.useMock) {
      return mockAuth.login(credentials)
    }
    const { data } = await axiosInstance.post('/auth/login', credentials)
    return data
  },

  async register(userData) {
    if (config.api.useMock) {
      return mockAuth.register(userData)
    }
    const { data } = await axiosInstance.post('/auth/register', userData)
    return data
  },

  async logout() {
    if (config.api.useMock) {
      return mockAuth.logout()
    }
    const { data } = await axiosInstance.post('/auth/logout')
    return data
  },

  async getCurrentUser() {
    if (config.api.useMock) {
      return mockAuth.getCurrentUser()
    }
    const { data } = await axiosInstance.get('/auth/me')
    return data
  },

  async refreshToken() {
    if (config.api.useMock) {
      return mockAuth.refreshToken()
    }
    const { data } = await axiosInstance.post('/auth/refresh')
    return data
  },

  async verifyEmail(token) {
    if (config.api.useMock) {
      return mockAuth.verifyEmail(token)
    }
    const { data } = await axiosInstance.post('/auth/verify-email', { token })
    return data
  },

  async forgotPassword(email) {
    if (config.api.useMock) {
      return mockAuth.forgotPassword(email)
    }
    const { data } = await axiosInstance.post('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(payload) {
    if (config.api.useMock) {
      return mockAuth.resetPassword(payload)
    }
    const { data } = await axiosInstance.post('/auth/reset-password', payload)
    return data
  },

  async verify2FA(code) {
    if (config.api.useMock) {
      return mockAuth.verify2FA(code)
    }
    const { data } = await axiosInstance.post('/auth/2fa/verify', { code })
    return data
  },

  async setup2FA() {
    if (config.api.useMock) {
      return mockAuth.setup2FA()
    }
    const { data } = await axiosInstance.post('/auth/2fa/setup')
    return data
  },

  async enable2FA(code) {
    if (config.api.useMock) {
      return mockAuth.enable2FA(code)
    }
    const { data } = await axiosInstance.post('/auth/2fa/enable', { code })
    return data
  },

  async disable2FA(password) {
    if (config.api.useMock) {
      return mockAuth.disable2FA(password)
    }
    const { data } = await axiosInstance.post('/auth/2fa/disable', { password })
    return data
  }
}