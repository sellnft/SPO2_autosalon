import config from '@/config'
import axiosInstance from './axios'
import { mockSubscriptions, mockSavedSearches } from '@/mock/subscriptions'

export const subscriptionsApi = {
  async getSubscriptions() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockSubscriptions]
    }
    const { data } = await axiosInstance.get('/subscriptions')
    return data
  },

  async getSavedSearches() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockSavedSearches]
    }
    const { data } = await axiosInstance.get('/subscriptions/saved-searches')
    return data
  },

  async subscribe(announcementId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const existing = mockSubscriptions.find(s => s.announcementId === Number(announcementId))
      if (existing) return existing

      const subscription = {
        id: mockSubscriptions.length + 1,
        announcementId: Number(announcementId),
        createdAt: new Date().toISOString()
      }
      mockSubscriptions.push(subscription)
      return subscription
    }
    const { data } = await axiosInstance.post('/subscriptions', { announcementId })
    return data
  },

  async unsubscribe(announcementId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const index = mockSubscriptions.findIndex(s => s.announcementId === Number(announcementId))
      if (index !== -1) mockSubscriptions.splice(index, 1)
      return true
    }
    await axiosInstance.delete(`/subscriptions/${announcementId}`)
    return true
  },

  async saveSearch(searchData) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const search = {
        id: mockSavedSearches.length + 1,
        ...searchData,
        createdAt: new Date().toISOString()
      }
      mockSavedSearches.push(search)
      return search
    }
    const { data } = await axiosInstance.post('/subscriptions/saved-searches', searchData)
    return data
  },

  async deleteSavedSearch(searchId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const index = mockSavedSearches.findIndex(s => s.id === Number(searchId))
      if (index !== -1) mockSavedSearches.splice(index, 1)
      return true
    }
    await axiosInstance.delete(`/subscriptions/saved-searches/${searchId}`)
    return true
  }
}