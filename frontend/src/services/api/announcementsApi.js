// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockAnnouncements } from '@/mock/announcements'

export const announcementsApi = {
  async getAnnouncements(params = {}) {
    if (config.api.useMock) {
      // Имитация фильтрации и пагинации
      let filtered = [...mockAnnouncements]
      
      // Фильтрация
      if (params.search) {
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(params.search.toLowerCase()) ||
          a.brand.toLowerCase().includes(params.search.toLowerCase())
        )
      }
      if (params.brand) {
        filtered = filtered.filter(a => a.brand === params.brand)
      }
      if (params.bodyType) {
        filtered = filtered.filter(a => a.bodyType === params.bodyType)
      }
      if (params.city) {
        filtered = filtered.filter(a => a.city === params.city)
      }
      if (params.yearFrom) {
        filtered = filtered.filter(a => a.year >= params.yearFrom)
      }
      if (params.yearTo) {
        filtered = filtered.filter(a => a.year <= params.yearTo)
      }
      if (params.priceFrom) {
        filtered = filtered.filter(a => a.price >= params.priceFrom)
      }
      if (params.priceTo) {
        filtered = filtered.filter(a => a.price <= params.priceTo)
      }
      
      // Сортировка
      const sortBy = params.sortBy || 'createdAt'
      const sortOrder = params.sortOrder || 'desc'
      filtered.sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      })
      
      // Пагинация
      const page = params.page || 1
      const perPage = params.perPage || 20
      const start = (page - 1) * perPage
      const end = start + perPage
      
      return {
        items: filtered.slice(start, end),
        total: filtered.length,
        page,
        perPage
      }
    }
    // Реальный запрос:
    // const { data } = await axiosInstance.get('/announcements', { params })
    // return data
  },
  
  async getAnnouncement(id) {
    if (config.api.useMock) {
      return mockAnnouncements.find(a => a.id === Number(id)) || null
    }
    // const { data } = await axiosInstance.get(`/announcements/${id}`)
    // return data
  },
  
  async createAnnouncement(data) {
    if (config.api.useMock) {
      const newAnnouncement = {
        id: mockAnnouncements.length + 1,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        views: 0,
        favourites: 0
      }
      mockAnnouncements.unshift(newAnnouncement)
      return newAnnouncement
    }
    // const { data } = await axiosInstance.post('/announcements', data)
    // return data
  },
  
  async updateAnnouncement(id, data) {
    if (config.api.useMock) {
      const index = mockAnnouncements.findIndex(a => a.id === Number(id))
      if (index !== -1) {
        mockAnnouncements[index] = { ...mockAnnouncements[index], ...data }
        return mockAnnouncements[index]
      }
      return null
    }
    // const { data } = await axiosInstance.put(`/announcements/${id}`, data)
    // return data
  },
  
  async deleteAnnouncement(id) {
    if (config.api.useMock) {
      const index = mockAnnouncements.findIndex(a => a.id === Number(id))
      if (index !== -1) {
        mockAnnouncements.splice(index, 1)
      }
      return true
    }
    // await axiosInstance.delete(`/announcements/${id}`)
  }
}