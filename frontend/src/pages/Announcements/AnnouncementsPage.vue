<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useToastStore } from '@/stores/toast'
import AnnouncementGrid from '@/components/announcements/AnnouncementGrid.vue'
import AnnouncementFilters from '@/components/announcements/AnnouncementFilters.vue'
import AnnouncementFilterMobile from '@/components/announcements/AnnouncementFilterMobile.vue'
import AnnouncementSort from '@/components/announcements/AnnouncementSort.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()
const subscriptionsStore = useSubscriptionsStore()
const toastStore = useToastStore()

const isFilterMobileOpen = ref(false)
const loading = ref(true)
const error = ref(null)
const viewMode = ref('grid')
const searchInput = ref(announcementsStore.filters.search || '')
const isInitializing = ref(false)
const perPageOptions = [12, 24, 48, 96]

const quickFilters = [
  { key: 'popular', label: 'Популярные', icon: 'fire', params: { sortBy: 'views', sortOrder: 'desc' } },
  { key: 'new', label: 'Новые', icon: 'sparkles', params: { sortBy: 'createdAt', sortOrder: 'desc' } },
  { key: 'budget', label: 'До 1 млн', icon: 'money', params: { priceTo: 1000000 } },
  { key: 'sport', label: 'Спорт', icon: 'bolt', params: { bodyType: 'Купе' } },
  { key: 'suv', label: 'Кроссоверы', icon: 'suv', params: { bodyType: 'Кроссовер' } },
  { key: 'auto', label: 'Автомат', icon: 'gear', params: { transmission: 'Автомат' } }
]

const activeFilters = computed(() => {
  const filters = []
  const filterMap = {
    brand: { label: 'Марка', display: v => v },
    model: { label: 'Модель', display: v => v },
    bodyType: { label: 'Кузов', display: v => v },
    transmission: { label: 'КПП', display: v => v },
    drive: { label: 'Привод', display: v => v },
    color: { label: 'Цвет', display: v => v },
    city: { label: 'Город', display: v => v }
  }

  Object.keys(filterMap).forEach(key => {
    if (announcementsStore.filters[key]) {
      filters.push({
        key,
        label: filterMap[key].label,
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
  if (announcementsStore.filters.mileageTo) {
    filters.push({ key: 'mileageTo', label: 'Пробег до', value: announcementsStore.filters.mileageTo })
  }

  return filters
})

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

const totalItems = computed(() => announcementsStore.totalItems || 0)

const currentPage = computed(() => announcementsStore.filters.page || 1)
const perPage = computed(() => announcementsStore.filters.perPage || 24)

const startItem = computed(() =>
  totalItems.value === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1
)
const endItem = computed(() =>
  Math.min(currentPage.value * perPage.value, totalItems.value)
)

const resultsText = computed(() => {
  if (!totalItems.value) return 'Нет результатов'
  return `Показано ${startItem.value.toLocaleString('ru-RU')}–${endItem.value.toLocaleString('ru-RU')} из ${totalItems.value.toLocaleString('ru-RU')}`
})

const countWord = computed(() => {
  const n = totalItems.value
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'объявление'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'объявления'
  return 'объявлений'
})

const isQuickActive = (quick) => {
  const f = announcementsStore.filters
  return Object.entries(quick.params).every(([key, value]) => f[key] === value)
}

function updateFilters(newFilters) {
  announcementsStore.updateFilters(newFilters)
  announcementsStore.updateFilters({ page: 1 })
  syncQueryParams()
  loadAnnouncements()
}

function resetFilters() {
  announcementsStore.resetFilters()
  searchInput.value = ''
  syncQueryParams()
  loadAnnouncements()
}

function removeFilter(key) {
  const newFilters = { ...announcementsStore.filters }
  newFilters[key] = ''
  if (key === 'search') {
    searchInput.value = ''
  }
  updateFilters(newFilters)
}

function toggleQuickFilter(quick) {
  const f = announcementsStore.filters
  const isActive = isQuickActive(quick)
  const newFilters = { ...f }

  if (isActive) {
    Object.keys(quick.params).forEach(key => {
      if (key === 'sortBy' || key === 'sortOrder') return
      newFilters[key] = ''
    })
  } else {
    Object.assign(newFilters, quick.params)
  }

  updateFilters(newFilters)
}

function syncQueryParams() {
  const query = {}
  const filters = announcementsStore.filters

  Object.keys(filters).forEach(key => {
    if (
      filters[key] &&
      key !== 'page' &&
      key !== 'perPage' &&
      key !== 'sortBy' &&
      key !== 'sortOrder'
    ) {
      query[key] = filters[key]
    }
  })

  if (filters.sortBy && filters.sortOrder && (filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc')) {
    query.sort = `${filters.sortBy}-${filters.sortOrder}`
  }

  router.replace({ path: '/announcements', query })
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
    nextTick(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
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

function handleSearchSubmit() {
  updateFilters({ search: searchInput.value.trim() })
}

function handlePerPageChange(value) {
  updateFilters({ perPage: Number(value) })
}

async function saveSearch() {
  try {
    await subscriptionsStore.saveSearch({
      name: generateSearchName(),
      filters: { ...announcementsStore.filters }
    })
    toastStore.success('Поиск сохранён')
  } catch (err) {
    toastStore.error('Не удалось сохранить поиск')
  }
}

function generateSearchName() {
  const f = announcementsStore.filters
  const parts = []
  if (f.brand) parts.push(f.brand)
  if (f.model) parts.push(f.model)
  if (f.priceTo) parts.push(`до ${Math.round(f.priceTo / 1000000)} млн`)
  if (f.city) parts.push(f.city)
  return parts.join(' · ') || 'Мой поиск'
}

let searchDebounce = null
watch(searchInput, (value) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    if (value !== announcementsStore.filters.search) {
      updateFilters({ search: value.trim() })
    }
  }, 500)
})

watch(
  () => route.query,
  (newQuery) => {
    if (isInitializing.value) return
    if (Object.keys(newQuery).length || Object.keys(announcementsStore.filters).length) {
      const newFilters = {}
      Object.keys(newQuery).forEach(key => {
        if (key === 'sort') {
          const [sortBy, sortOrder] = newQuery.sort.split('-')
          newFilters.sortBy = sortBy
          newFilters.sortOrder = sortOrder
        } else {
          newFilters[key] = newQuery[key]
        }
      })
      if (Object.keys(newFilters).length) {
        announcementsStore.updateFilters(newFilters)
      }
    }
  }
)

onMounted(async () => {
  isInitializing.value = true

  if (Object.keys(route.query).length) {
    const initFilters = {}
    Object.keys(route.query).forEach(key => {
      if (key === 'sort') {
        const [sortBy, sortOrder] = route.query.sort.split('-')
        initFilters.sortBy = sortBy
        initFilters.sortOrder = sortOrder
      } else {
        initFilters[key] = route.query[key]
      }
    })
    announcementsStore.updateFilters(initFilters)
  }

  await loadAnnouncements()
  isInitializing.value = false
})

onUnmounted(() => {
  if (searchDebounce) clearTimeout(searchDebounce)
})
</script>

<template>
  <div class="cv-cat">
    <div class="cv-cat__bg" aria-hidden="true">
      <div class="cv-cat__bg-orb cv-cat__bg-orb--1"></div>
      <div class="cv-cat__bg-orb cv-cat__bg-orb--2"></div>
    </div>

    <div class="cv-cat__container">
      <Breadcrumbs />

      <header class="cv-cat__header">
        <div class="cv-cat__header-left">
          <span class="cv-cat__eyebrow">
            <span class="cv-cat__eyebrow-dot" aria-hidden="true"></span>
            Каталог автомобилей
          </span>

          <h1 class="cv-cat__title">Каталог автомобилей</h1>

          <p class="cv-cat__subtitle">
            <template v-if="totalItems">
              Найдено <strong>{{ totalItems.toLocaleString('ru-RU') }} {{ countWord }}</strong>
              · {{ resultsText }}
            </template>
            <template v-else>
              Начните поиск автомобиля — используйте фильтры ниже
            </template>
          </p>
        </div>

        <div v-if="hasActiveFilters" class="cv-cat__header-actions">
          <BaseButton variant="outline" size="lg" @click="saveSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            Сохранить поиск
          </BaseButton>
        </div>
      </header>

      <section class="cv-cat__quick">
        <div class="cv-cat__quick-label">
          <span class="cv-cat__quick-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
            </svg>
          </span>
          Быстрые фильтры:
        </div>

        <div class="cv-cat__quick-list">
          <button
            v-for="quick in quickFilters"
            :key="quick.key"
            type="button"
            class="cv-cat__quick-chip"
            :class="{ 'cv-cat__quick-chip--active': isQuickActive(quick) }"
            @click="toggleQuickFilter(quick)"
          >
            <span class="cv-cat__quick-chip-icon" aria-hidden="true">
              <svg v-if="quick.icon === 'fire'" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2c1 3 3 4 5 6a7 7 0 1 1-14 0c0-2 1-4 3-5 0 2 1 3 2 3 1 0 1-1 1-2 0-1 0-2 1-3 0 1 1 1 2 1z"/>
              </svg>
              <svg v-else-if="quick.icon === 'sparkles'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                <path d="M5 3v4M3 5h4"/>
              </svg>
              <svg v-else-if="quick.icon === 'money'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <circle cx="12" cy="12" r="2.5"/>
              </svg>
              <svg v-else-if="quick.icon === 'bolt'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
              </svg>
              <svg v-else-if="quick.icon === 'suv'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
              </svg>
              <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v12M16 6v12M6 10h4M14 10h4M6 14h4M14 14h4"/>
              </svg>
            </span>
            {{ quick.label }}
          </button>
        </div>
      </section>

      <section class="cv-cat__toolbar">
        <div class="cv-cat__toolbar-search">
          <span class="cv-cat__toolbar-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
          </span>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Поиск по марке или модели..."
            class="cv-cat__toolbar-input"
            @keydown.enter="handleSearchSubmit"
          />
        </div>

        <div class="cv-cat__toolbar-controls">
          <AnnouncementSort
            :model-value="`${announcementsStore.filters.sortBy}-${announcementsStore.filters.sortOrder}`"
            @update:model-value="handleSortChange"
          />

          <div class="cv-cat__per-page">
            <select
              :value="perPage"
              class="cv-cat__per-page-select"
              @change="handlePerPageChange($event.target.value)"
            >
              <option v-for="opt in perPageOptions" :key="opt" :value="opt">
                {{ opt }} / стр.
              </option>
            </select>
            <span class="cv-cat__per-page-arrow" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
          </div>

          <div class="cv-cat__view">
            <button
              type="button"
              class="cv-cat__view-btn"
              :class="{ 'cv-cat__view-btn--active': viewMode === 'grid' }"
              aria-label="Сетка"
              @click="viewMode = 'grid'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              type="button"
              class="cv-cat__view-btn"
              :class="{ 'cv-cat__view-btn--active': viewMode === 'list' }"
              aria-label="Список"
              @click="viewMode = 'list'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section v-if="hasActiveFilters" class="cv-cat__active">
        <div class="cv-cat__active-chips">
          <button
            v-for="filter in activeFilters"
            :key="filter.key"
            type="button"
            class="cv-cat__active-chip"
            @click="removeFilter(filter.key)"
          >
            <span class="cv-cat__active-chip-label">{{ filter.label }}:</span>
            <span class="cv-cat__active-chip-value">{{ filter.value }}</span>
            <span class="cv-cat__active-chip-close" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </span>
          </button>
        </div>

        <button
          type="button"
          class="cv-cat__active-reset"
          @click="resetFilters"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
          Сбросить все
        </button>
      </section>

      <button
        type="button"
        class="cv-cat__mobile-toolbar"
        @click="isFilterMobileOpen = true"
      >
        <span class="cv-cat__mobile-toolbar-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M6 12h12M10 18h4"/>
          </svg>
        </span>
        <span class="cv-cat__mobile-toolbar-label">
          Фильтры
          <template v-if="activeFilters.length">
            · {{ activeFilters.length }}
          </template>
        </span>
        <span class="cv-cat__mobile-toolbar-arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </span>
      </button>

      <div class="cv-cat__content">
        <aside class="cv-cat__sidebar">
          <AnnouncementFilters
            :filters="announcementsStore.filters"
            @update:filters="updateFilters"
            @reset="resetFilters"
          />
        </aside>

        <div class="cv-cat__results">
          <div v-if="loading" :class="['cv-cat__grid', `cv-cat__grid--${viewMode}`]">
            <AnnouncementSkeleton v-for="i in 6" :key="i" :view="viewMode" />
          </div>

          <ErrorMessage
            v-else-if="error"
            :message="error"
            retry
            @retry="loadAnnouncements"
          />

          <div v-else-if="!announcementsStore.announcements.length" class="cv-cat__empty">
            <div class="cv-cat__empty-orb" aria-hidden="true"></div>

            <div class="cv-cat__empty-content">
              <span class="cv-cat__empty-icon" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
              </span>

              <h3 class="cv-cat__empty-title">Ничего не найдено</h3>
              <p class="cv-cat__empty-text">
                По вашим фильтрам не найдено ни одного автомобиля.
                Попробуйте изменить параметры или сбросить фильтры.
              </p>

              <div class="cv-cat__empty-actions">
                <BaseButton size="lg" @click="resetFilters">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
                    <path d="M21 3v5h-5"/>
                  </svg>
                  Сбросить фильтры
                </BaseButton>
              </div>
            </div>
          </div>

          <template v-else>
            <AnnouncementGrid
              :announcements="announcementsStore.announcements"
              :view="viewMode"
            />

            <BasePagination
              v-if="announcementsStore.totalPages > 1"
              :current-page="currentPage"
              :total-items="totalItems"
              :per-page="perPage"
              @update:current-page="handlePageChange"
            />
          </template>
        </div>
      </div>
    </div>

    <AnnouncementFilterMobile
      v-model="isFilterMobileOpen"
      :filters="announcementsStore.filters"
      @update:filters="updateFilters"
      @reset="resetFilters"
    />
  </div>
</template>

<style scoped>
.cv-cat {
  position: relative;
  padding: 20px 0 60px;
  isolation: isolate;
}

.cv-cat__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-cat__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}

.cv-cat__bg-orb--1 {
  top: -10%;
  left: -5%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvCatOrb 22s ease-in-out infinite;
}

.cv-cat__bg-orb--2 {
  bottom: -20%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.18), transparent 70%);
  animation: cvCatOrb 26s ease-in-out infinite reverse;
}

@keyframes cvCatOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-cat__container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-cat__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-cat__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cv-cat__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-cat__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvCatDot 2.2s ease-in-out infinite;
}

@keyframes cvCatDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-cat__title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-cat__subtitle {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.6);
}

.cv-cat__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-cat__header-actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
}

.cv-cat__quick {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.cv-cat__quick-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
  flex-shrink: 0;
}

.cv-cat__quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
}

.cv-cat__quick-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-cat__quick-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-cat__quick-chip:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-cat__quick-chip:active {
  transform: translateY(0) scale(0.97);
}

.cv-cat__quick-chip--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-cat__quick-chip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-cat__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  isolation: isolate;
}

.cv-cat__toolbar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
}

.cv-cat__toolbar-search {
  position: relative;
  flex: 1;
  min-width: 240px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1.5px solid rgba(201, 169, 97, 0.18);
  border-radius: 11px;
  transition: all 0.25s ease;
}

.cv-cat__toolbar-search:focus-within {
  border-color: rgba(201, 169, 97, 0.55);
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.cv-cat__toolbar-search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-cat__toolbar-input {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.95);
  background: transparent;
  border: none;
  outline: none;
}

.cv-cat__toolbar-input::placeholder {
  color: rgba(200, 190, 175, 0.4);
}

.cv-cat__toolbar-controls {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-cat__per-page {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cv-cat__per-page-select {
  padding: 10px 32px 10px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.85);
  background: rgba(0, 0, 0, 0.2);
  border: 1.5px solid rgba(201, 169, 97, 0.18);
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.22s ease;
  min-width: 100px;
}

.cv-cat__per-page-select:hover {
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-cat__per-page-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
}

.cv-cat__per-page-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
}

.cv-cat__per-page-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  pointer-events: none;
}

.cv-cat__view {
  display: inline-flex;
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-cat__view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: rgba(220, 210, 195, 0.5);
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-cat__view-btn:hover {
  color: #E8D5A0;
}

.cv-cat__view-btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 4px 12px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-cat__active {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0;
}

.cv-cat__active-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.cv-cat__active-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 11px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-cat__active-chip:hover {
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.22), rgba(201, 169, 97, 0.08));
  border-color: rgba(232, 213, 160, 0.5);
  transform: translateY(-1px);
}

.cv-cat__active-chip:active {
  transform: translateY(0) scale(0.96);
}

.cv-cat__active-chip-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-cat__active-chip-value {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-cat__active-chip-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-left: 2px;
  color: rgba(232, 213, 160, 0.65);
  background: rgba(201, 169, 97, 0.15);
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.22s ease;
}

.cv-cat__active-chip:hover .cv-cat__active-chip-close {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  transform: rotate(90deg);
}

.cv-cat__active-reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.08);
  border: 1px solid rgba(184, 119, 85, 0.28);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-cat__active-reset:hover {
  background: rgba(184, 119, 85, 0.18);
  border-color: rgba(184, 119, 85, 0.5);
  transform: translateY(-1px);
}

.cv-cat__mobile-toolbar {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 13px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.85);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.22);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-cat__mobile-toolbar:active {
  transform: scale(0.98);
}

.cv-cat__mobile-toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A0;
  flex-shrink: 0;
}

.cv-cat__mobile-toolbar-label {
  flex: 1;
  text-align: center;
}

.cv-cat__mobile-toolbar-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-cat__content {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
}

.cv-cat__sidebar {
  position: sticky;
  top: 90px;
  align-self: start;
  max-height: calc(100vh - 110px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
  padding-right: 4px;
}

.cv-cat__sidebar::-webkit-scrollbar {
  width: 6px;
}

.cv-cat__sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 3px;
}

.cv-cat__results {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-cat__grid {
  display: grid;
  gap: 22px;
}

.cv-cat__grid--grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.cv-cat__grid--list {
  grid-template-columns: 1fr;
  gap: 14px;
}

.cv-cat__empty {
  position: relative;
  padding: 72px 32px 64px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  text-align: center;
}

.cv-cat__empty-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.15), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  animation: cvCatEmptyOrb 4s ease-in-out infinite;
}

@keyframes cvCatEmptyOrb {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-cat__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.cv-cat__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 12px;
  border-radius: 24px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.15);
  animation: cvCatEmptyFloat 4s ease-in-out infinite;
}

@keyframes cvCatEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-cat__empty-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-cat__empty-text {
  margin: 0 0 20px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.6);
}

.cv-cat__empty-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 1280px) {
  .cv-cat__container { padding: 0 32px; }
  .cv-cat__content { grid-template-columns: 280px minmax(0, 1fr); gap: 20px; }
  .cv-cat__grid--grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
}

@media (max-width: 1024px) {
  .cv-cat__container { padding: 0 24px; }
  .cv-cat__title { font-size: 28px; letter-spacing: -0.6px; }

  .cv-cat__sidebar { display: none; }
  .cv-cat__content { grid-template-columns: 1fr; }
  .cv-cat__mobile-toolbar { display: flex; }
  .cv-cat__grid--grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
}

@media (max-width: 768px) {
  .cv-cat { padding: 12px 0 40px; }
  .cv-cat__container { padding: 0 20px; gap: 16px; }

  .cv-cat__header { gap: 12px; align-items: flex-start; }
  .cv-cat__header-left { width: 100%; }
  .cv-cat__title { font-size: 24px; letter-spacing: -0.4px; }
  .cv-cat__subtitle { font-size: 13px; }
  .cv-cat__header-actions { width: 100%; }

  .cv-cat__quick { gap: 10px; }
  .cv-cat__quick-label { font-size: 10px; }
  .cv-cat__quick-chip { font-size: 12px; padding: 7px 12px; }

  .cv-cat__toolbar { flex-direction: column; align-items: stretch; padding: 12px; gap: 10px; }
  .cv-cat__toolbar-search { min-width: 0; }
  .cv-cat__toolbar-controls { justify-content: space-between; flex-wrap: wrap; }
  .cv-cat__per-page { flex: 1; }
  .cv-cat__per-page-select { width: 100%; }

  .cv-cat__grid--grid { grid-template-columns: 1fr; gap: 12px; }

  .cv-cat__active { gap: 8px; }
  .cv-cat__active-chip-value { max-width: 100px; }

  .cv-cat__empty { padding: 52px 20px 44px; border-radius: 1rem; }
  .cv-cat__empty-icon { width: 72px; height: 72px; border-radius: 20px; }
  .cv-cat__empty-title { font-size: 17px; }
  .cv-cat__empty-text { font-size: 13px; }
  .cv-cat__empty-actions { flex-direction: column; width: 100%; }
  .cv-cat__empty-actions > * { width: 100%; }
}

@media (max-width: 480px) {
  .cv-cat__title { font-size: 22px; }
  .cv-cat__quick-label { display: none; }
}
</style>