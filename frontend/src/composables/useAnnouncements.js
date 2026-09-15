import { computed } from 'vue'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

export function useAnnouncements() {
  const store = useAnnouncementsStore()
  const toastStore = useToastStore()
  const router = useRouter()

  const announcements = computed(() => store.announcements)
  const currentAnnouncement = computed(() => store.currentAnnouncement)
  const totalItems = computed(() => store.totalItems)
  const loading = computed(() => store.loading)
  const error = computed(() => store.error)
  const filters = computed(() => store.filters)

  async function fetchAnnouncements(params) {
    try {
      return await store.fetchAnnouncements(params)
    } catch (err) {
      toastStore.error('Не удалось загрузить объявления')
      throw err
    }
  }

  async function fetchAnnouncement(id) {
    try {
      return await store.fetchAnnouncement(id)
    } catch (err) {
      toastStore.error('Не удалось загрузить объявление')
      throw err
    }
  }

  async function createAnnouncement(data) {
    try {
      const announcement = await store.createAnnouncement(data)
      toastStore.success('Объявление создано')
      router.push(`/announcements/${announcement.id}`)
      return announcement
    } catch (err) {
      toastStore.error('Не удалось создать объявление')
      throw err
    }
  }

  async function updateAnnouncement(id, data) {
    try {
      const announcement = await store.updateAnnouncement(id, data)
      toastStore.success('Объявление обновлено')
      return announcement
    } catch (err) {
      toastStore.error('Не удалось обновить объявление')
      throw err
    }
  }

  async function deleteAnnouncement(id) {
    try {
      await store.deleteAnnouncement(id)
      toastStore.success('Объявление удалено')
    } catch (err) {
      toastStore.error('Не удалось удалить объявление')
      throw err
    }
  }

  return {
    announcements,
    currentAnnouncement,
    totalItems,
    loading,
    error,
    filters,
    fetchAnnouncements,
    fetchAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    updateFilters: store.updateFilters,
    resetFilters: store.resetFilters
  }
}