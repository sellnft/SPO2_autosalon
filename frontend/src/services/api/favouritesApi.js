import config from '@/config'
import axiosInstance from './axios'
import { mockFavourites } from '@/mock/favourites'

export const favouritesApi = {
  async getFavourites() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockFavourites]
    }
    const { data } = await axiosInstance.get('/favourites')
    return data
  },

  async addToFavourites(announcementId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const existing = mockFavourites.find(f => f.announcementId === Number(announcementId))
      if (existing) return existing

      const favourite = {
        id: mockFavourites.length + 1,
        announcementId: Number(announcementId),
        createdAt: new Date().toISOString()
      }
      mockFavourites.push(favourite)
      return favourite
    }
    const { data } = await axiosInstance.post('/favourites', { announcementId })
    return data
  },

  async removeFromFavourites(announcementId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const index = mockFavourites.findIndex(f => f.announcementId === Number(announcementId))
      if (index !== -1) mockFavourites.splice(index, 1)
      return true
    }
    await axiosInstance.delete(`/favourites/${announcementId}`)
    return true
  }
}