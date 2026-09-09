// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockSubscriptions, mockSavedSearches } from '@/mock/subscriptions'

export const subscriptionsApi = {
  async getSubscriptions() {
    if (config.api.useMock) {
      return mockSubscriptions
    }
    // const { data } = await axiosInstance.get('/subscriptions')
    // return data
  },
  
  async getSavedSearches() {
    if (config.api.useMock) {
      return mockSavedSearches
    }
    // const { data } = await axiosInstance.get('/subscriptions/saved-searches')
    // return data
  },
  
  async subscribe(announcementId) {
    if (config.api.useMock) {
      const subscription = {
        id: mockSubscriptions.length + 1,
        announcementId: Number(announcementId),
        createdAt: new Date().toISOString()
      }
      mockSubscriptions.push(subscription)
      return subscription
    }
    // const { data } = await axiosInstance.post('/subscriptions', { announcementId })
    // return data
  },
  
  async unsubscribe(announcementId) {
    if (config.api.useMock) {
      const index = mockSubscriptions.findIndex(s => s.announcementId === Number(announcementId))
      if (index !== -1) {
        mockSubscriptions.splice(index, 1)
      }
      return true
    }
    // await axiosInstance.delete(`/subscriptions/${announcementId}`)
  },
  
  async saveSearch(searchData) {
    if (config.api.useMock) {
      const search = {
        id: mockSavedSearches.length + 1,
        ...searchData,
        createdAt: new Date().toISOString()
      }
      mockSavedSearches.push(search)
      return search
    }
    // const { data } = await axiosInstance.post('/subscriptions/saved-searches', searchData)
    // return data
  },
  
  async deleteSavedSearch(searchId) {
    if (config.api.useMock) {
      const index = mockSavedSearches.findIndex(s => s.id === Number(searchId))
      if (index !== -1) {
        mockSavedSearches.splice(index, 1)
      }
      return true
    }
    // await axiosInstance.delete(`/subscriptions/saved-searches/${searchId}`)
  }
}