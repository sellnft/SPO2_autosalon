<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementGrid from '@/components/announcements/AnnouncementGrid.vue'
import AnnouncementFilters from '@/components/announcements/AnnouncementFilters.vue'
import AnnouncementFilterMobile from '@/components/announcements/AnnouncementFilterMobile.vue'
import AnnouncementSort from '@/components/announcements/AnnouncementSort.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const isFilterMobileOpen = ref(false)
const loading = ref(true)
const error = ref(null)

const activeFilters = computed(() => {
  const filters = []
  const filterMap = {
    brand: 'Марка',
    model: 'Модель',
    bodyType: 'Кузов',
    transmission: 'КПП',
    drive: 'Привод',
    city: 'Город'
  }
  
  Object.keys(filterMap).forEach(key => {
    if (announcementsStore.filters[key]) {
      filters.push({
        key,
        label: filterMap[key],
        value: announcementsStore.filters[key]
      })
    }
  })
  
  if (announcementsStore.filters.priceFrom) {
    filters.push({ key: 'priceFrom', label: 'Цена от', value: announcementsStore.filters.priceFrom })
  }
  if (announcementsStore.filters.priceTo) {
    filters.push({ key: 'priceTo', label: 'Цена до', value: announcementsStore.filters.priceTo })
  }
  if (announcementsStore.filters.yearFrom) {
    filters.push({ key: 'yearFrom', label: 'Год от', value: announcementsStore.filters.yearFrom })
  }
  if (announcementsStore.filters.yearTo) {
    filters.push({ key: 'yearTo', label: 'Год до', value: announcementsStore.filters.yearTo })
  }
  
  return filters
})

function updateFilters(newFilters) {
  announcementsStore.updateFilters(newFilters)
  updateQueryParams()
  loadAnnouncements()
}

function resetFilters() {
  announcementsStore.resetFilters()
  updateQueryParams()
  loadAnnouncements()
}

function removeFilter(key) {
  const newFilters = { ...announcementsStore.filters }
  newFilters[key] = ''
  updateFilters(newFilters)
}

function updateQueryParams() {
  const query = {}
  const filters = announcementsStore.filters
  
  Object.keys(filters).forEach(key => {
    if (filters[key] && key !== 'page' && key !== 'perPage' && key !== 'sortBy' && key !== 'sortOrder') {
      query[key] = filters[key]
    }
  })
  
  router.replace({ path: '/announcements', query })
}

function loadFromQuery() {
  const query = route.query
  if (Object.keys(query).length) {
    announcementsStore.updateFilters(query)
  }
}

async function loadAnnouncements() {
  loading.value = true
  error.value = null
  try {
    await announcementsStore.fetchAnnouncements()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function handleSortChange(sortValue) {
  const [sortBy, sortOrder] = sortValue.split('-')
  updateFilters({ sortBy, sortOrder })
}

function handlePageChange(page) {
  announcementsStore.updateFilters({ page })
  loadAnnouncements()
}

onMounted(() => {
  loadFromQuery()
  loadAnnouncements()
})

watch(() => route.query, () => {
  loadFromQuery()
  loadAnnouncements()
})
</script>

<template>
  <div class="announcements-page">
    <div class="container">
      <!-- Header -->
      <div class="announcements-page__header">
        <h1 class="announcements-page__title">Каталог автомобилей</h1>
        <p class="announcements-page__count">
          Найдено: {{ announcementsStore.totalItems }}
        </p>
      </div>
      
      <!-- Mobile Filter Button -->
      <div class="announcements-page__mobile-filter">
        <BaseButton variant="outline" block @click="isFilterMobileOpen = true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M5 10h10M8 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Фильтры
          <span v-if="activeFilters.length" class="announcements-page__filter-count">
            {{ activeFilters.length }}
          </span>
        </BaseButton>
      </div>
      
      <!-- Active Filters -->
      <div v-if="activeFilters.length" class="announcements-page__active-filters">
        <button
          v-for="filter in activeFilters"
          :key="filter.key"
          class="active-filter"
          @click="removeFilter(filter.key)"
        >
          {{ filter.label }}: {{ filter.value }}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
        
        <button class="active-filter__reset" @click="resetFilters">
          Сбросить все
        </button>
      </div>
      
      <!-- Sort -->
      <div class="announcements-page__sort">
        <AnnouncementSort
          :model-value="`${announcementsStore.filters.sortBy}-${announcementsStore.filters.sortOrder}`"
          @update:model-value="handleSortChange"
        />
      </div>
      
      <!-- Content -->
      <div class="announcements-page__content">
        <!-- Desktop Filters -->
        <aside class="announcements-page__sidebar">
          <AnnouncementFilters
            :filters="announcementsStore.filters"
            @update:filters="updateFilters"
            @reset="resetFilters"
          />
        </aside>
        
        <!-- Results -->
        <div class="announcements-page__results">
          <!-- Loading -->
          <div v-if="loading" class="announcements-page__grid">
            <AnnouncementSkeleton v-for="i in 6" :key="i" />
          </div>
          
          <!-- Error -->
          <ErrorMessage
            v-else-if="error"
            :message="error"
            retry
            @retry="loadAnnouncements"
          />
          
          <!-- Empty -->
          <EmptyState
            v-else-if="!announcementsStore.announcements.length"
            icon="search"
            title="Ничего не найдено"
            description="Попробуйте изменить параметры поиска"
          />
          
          <!-- Results -->
          <template v-else>
            <AnnouncementGrid :announcements="announcementsStore.announcements" />
            
            <BasePagination
              :current-page="announcementsStore.filters.page"
              :total-items="announcementsStore.totalItems"
              :per-page="announcementsStore.filters.perPage"
              @update:current-page="handlePageChange"
            />
          </template>
        </div>
      </div>
    </div>
    
    <!-- Mobile Filters -->
    <AnnouncementFilterMobile
      v-model="isFilterMobileOpen"
      :filters="announcementsStore.filters"
      @update:filters="updateFilters"
      @reset="resetFilters"
    />
  </div>
</template>

<style scoped>
.announcements-page {
  padding: 40px 0;
  min-height: 100vh;
}

.announcements-page__header {
  margin-bottom: 24px;
}

.announcements-page__title {
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.announcements-page__count {
  font-size: 14px;
  color: #6B7280;
}

.announcements-page__mobile-filter {
  display: none;
  margin-bottom: 16px;
}

.announcements-page__filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background: #0A84FF;
  border-radius: 10px;
}

.announcements-page__active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.active-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #0A84FF;
  background: #F0F7FF;
  border-radius: 8px;
  transition: all 0.2s;
}

.active-filter:hover {
  background: #DBEAFE;
}

.active-filter__reset {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  transition: color 0.2s;
}

.active-filter__reset:hover {
  color: #EF4444;
}

.announcements-page__sort {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.announcements-page__content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.announcements-page__sidebar {
  position: sticky;
  top: 90px;
  align-self: start;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
}

.announcements-page__results {
  min-width: 0;
}

.announcements-page__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .announcements-page__sidebar {
    display: none;
  }
  
  .announcements-page__mobile-filter {
    display: block;
  }
  
  .announcements-page__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .announcements-page__grid {
    grid-template-columns: 1fr;
  }
  
  .announcements-page__sort {
    justify-content: flex-start;
  }
  
  .announcements-page__title {
    font-size: 24px;
  }
}
</style>