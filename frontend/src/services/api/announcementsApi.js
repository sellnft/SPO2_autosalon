import config from '@/config'
import axiosInstance from './axios'
import { mockAnnouncements } from '@/mock/announcements'

export const announcementsApi = {
  async getAnnouncements(params = {}) {
    if (config.api.useMock) {
      let filtered = [...mockAnnouncements]

      if (params.search) {
        const q = params.search.toLowerCase()
        filtered = filtered.filter(a =>
          a.title?.toLowerCase().includes(q) ||
          a.brand?.toLowerCase().includes(q) ||
          a.model?.toLowerCase().includes(q)
        )
      }
      if (params.brand) filtered = filtered.filter(a => a.brand === params.brand)
      if (params.model) {
        const q = params.model.toLowerCase()
        filtered = filtered.filter(a => a.model?.toLowerCase().includes(q))
      }
      if (params.bodyType) filtered = filtered.filter(a => a.bodyType === params.bodyType)
      if (params.transmission) filtered = filtered.filter(a => a.transmission === params.transmission)
      if (params.drive) filtered = filtered.filter(a => a.drive === params.drive)
      if (params.city) filtered = filtered.filter(a => a.city === params.city)
      if (params.color) filtered = filtered.filter(a => a.color === params.color)
      if (params.yearFrom) filtered = filtered.filter(a => a.year >= Number(params.yearFrom))
      if (params.yearTo) filtered = filtered.filter(a => a.year <= Number(params.yearTo))
      if (params.priceFrom) filtered = filtered.filter(a => a.price >= Number(params.priceFrom))
      if (params.priceTo) filtered = filtered.filter(a => a.price <= Number(params.priceTo))
      if (params.mileageFrom) filtered = filtered.filter(a => a.mileage >= Number(params.mileageFrom))
      if (params.mileageTo) filtered = filtered.filter(a => a.mileage <= Number(params.mileageTo))

      // Сортировка
      const sortBy = params.sortBy || 'createdAt'
      const sortOrder = params.sortOrder || 'desc'

      filtered.sort((a, b) => {
        let aVal = a[sortBy]
        let bVal = b[sortBy]

        // Для дат — сравниваем timestamp
        if (sortBy === 'createdAt') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }

        // Для чисел
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        // Для строк
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        return 0
      })

      const page = Number(params.page) || 1
      const perPage = Number(params.perPage) || 20
      const start = (page - 1) * perPage
      const end = start + perPage

      return {
        items: filtered.slice(start, end),
        total: filtered.length,
        page,
        perPage
      }
    }

    const { data } = await axiosInstance.get('/announcements', { params })
    return data
  },

  async getAnnouncement(id) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return mockAnnouncements.find(a => a.id === Number(id)) || null
    }
    const { data } = await axiosInstance.get(`/announcements/${id}`)
    return data
  },

  async createAnnouncement(data) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 400))
      const newAnnouncement = {
        id: Math.max(0, ...mockAnnouncements.map(a => a.id)) + 1,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        views: 0,
        favourites: 0
      }
      mockAnnouncements.unshift(newAnnouncement)
      return newAnnouncement
    }
    const { data: result } = await axiosInstance.post('/announcements', data)
    return result
  },

  async updateAnnouncement(id, data) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 400))
      const index = mockAnnouncements.findIndex(a => a.id === Number(id))
      if (index !== -1) {
        mockAnnouncements[index] = { ...mockAnnouncements[index], ...data }
        return mockAnnouncements[index]
      }
      return null
    }
    const { data: result } = await axiosInstance.put(`/announcements/${id}`, data)
    return result
  },

  async deleteAnnouncement(id) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const index = mockAnnouncements.findIndex(a => a.id === Number(id))
      if (index !== -1) mockAnnouncements.splice(index, 1)
      return true
    }
    await axiosInstance.delete(`/announcements/${id}`)
    return true
  }
}