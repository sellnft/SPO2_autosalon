import { ref, computed } from 'vue'

export function usePagination(options = {}) {
  const { initialPage = 1, perPage = 20, total = 0 } = options

  const currentPage = ref(initialPage)
  const totalItems = ref(total)
  const itemsPerPage = ref(perPage)

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  const hasNext = computed(() => currentPage.value < totalPages.value)
  const hasPrev = computed(() => currentPage.value > 1)

  const rangeStart = computed(() =>
    totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
  )

  const rangeEnd = computed(() =>
    Math.min(currentPage.value * itemsPerPage.value, totalItems.value)
  )

  function goTo(page) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
  }

  function next() {
    if (hasNext.value) currentPage.value++
  }

  function prev() {
    if (hasPrev.value) currentPage.value--
  }

  function reset() {
    currentPage.value = 1
  }

  return {
    currentPage,
    totalItems,
    itemsPerPage,
    totalPages,
    hasNext,
    hasPrev,
    rangeStart,
    rangeEnd,
    goTo,
    next,
    prev,
    reset
  }
}