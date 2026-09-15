import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useFilters(initialFilters = {}, options = {}) {
  const { syncWithUrl = false, routePath = '/announcements' } = options
  const router = useRouter()
  const route = useRoute()

  const filters = ref({ ...initialFilters })
  const activeCount = computed(() =>
    Object.values(filters.value).filter(v =>
      v !== '' && v !== null && v !== undefined
    ).length
  )

  // Загрузка из URL
  if (syncWithUrl) {
    Object.keys(initialFilters).forEach(key => {
      if (route.query[key] !== undefined) {
        filters.value[key] = route.query[key]
      }
    })
  }

  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    if (syncWithUrl) syncToUrl()
  }

  function resetFilters() {
    filters.value = { ...initialFilters }
    if (syncWithUrl) syncToUrl()
  }

  function removeFilter(key) {
    filters.value[key] = initialFilters[key] ?? ''
    if (syncWithUrl) syncToUrl()
  }

  function syncToUrl() {
    const query = {}
    Object.keys(filters.value).forEach(key => {
      const value = filters.value[key]
      if (value !== '' && value !== null && value !== undefined) {
        query[key] = value
      }
    })
    router.replace({ path: routePath, query })
  }

  return {
    filters,
    activeCount,
    updateFilters,
    resetFilters,
    removeFilter
  }
}