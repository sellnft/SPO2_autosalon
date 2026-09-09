import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favouritesApi } from '@/services/api/favouritesApi'

export const useFavouritesStore = defineStore('favourites', () => {
  const favourites = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const favouritesCount = computed(() => favourites.value.length)
  
  async function fetchFavourites() {
    loading.value = true
    error.value = null
    try {
      favourites.value = await favouritesApi.getFavourites()
      return favourites.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function addToFavourites(announcementId) {
    try {
      const favourite = await favouritesApi.addToFavourites(announcementId)
      favourites.value.push(favourite)
      return favourite
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  async function removeFromFavourites(announcementId) {
    try {
      await favouritesApi.removeFromFavourites(announcementId)
      favourites.value = favourites.value.filter(f => f.announcementId !== announcementId)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  function isFavourite(announcementId) {
    return favourites.value.some(f => f.announcementId === announcementId)
  }
  
  return {
    favourites,
    loading,
    error,
    favouritesCount,
    fetchFavourites,
    addToFavourites,
    removeFromFavourites,
    isFavourite
  }
})