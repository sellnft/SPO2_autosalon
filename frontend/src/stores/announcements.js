import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { announcementsApi } from '@/services/api/announcementsApi'

export const useAnnouncementsStore = defineStore('announcements', () => {
  const announcements = ref([])
  const currentAnnouncement = ref(null)
  const totalItems = ref(0)
  const loading = ref(false)
  const error = ref(null)
  
  const filters = ref({
    search: '',
    brand: '',
    model: '',
    yearFrom: null,
    yearTo: null,
    priceFrom: null,
    priceTo: null,
    bodyType: '',
    transmission: '',
    drive: '',
    city: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    perPage: 20
  })
  
  const hasAnnouncements = computed(() => announcements.value.length > 0)
  
  async function fetchAnnouncements(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await announcementsApi.getAnnouncements({
        ...filters.value,
        ...params
      })
      announcements.value = response.items
      totalItems.value = response.total
      return response
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchAnnouncement(id) {
    loading.value = true
    error.value = null
    try {
      currentAnnouncement.value = await announcementsApi.getAnnouncement(id)
      return currentAnnouncement.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function createAnnouncement(data) {
    loading.value = true
    try {
      const announcement = await announcementsApi.createAnnouncement(data)
      announcements.value.unshift(announcement)
      return announcement
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function updateAnnouncement(id, data) {
    loading.value = true
    try {
      const announcement = await announcementsApi.updateAnnouncement(id, data)
      const index = announcements.value.findIndex(a => a.id === id)
      if (index !== -1) {
        announcements.value[index] = announcement
      }
      return announcement
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function deleteAnnouncement(id) {
    try {
      await announcementsApi.deleteAnnouncement(id)
      announcements.value = announcements.value.filter(a => a.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  function updateFilters(newFilters) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }
  
  function resetFilters() {
    filters.value = {
      search: '',
      brand: '',
      model: '',
      yearFrom: null,
      yearTo: null,
      priceFrom: null,
      priceTo: null,
      bodyType: '',
      transmission: '',
      drive: '',
      city: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      perPage: 20
    }
  }
  
  return {
    announcements,
    currentAnnouncement,
    totalItems,
    loading,
    error,
    filters,
    hasAnnouncements,
    fetchAnnouncements,
    fetchAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateFilters,
    resetFilters
  }
})