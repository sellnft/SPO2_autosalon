<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFavouritesStore } from '@/stores/favourites'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useToastStore } from '@/stores/toast'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const favouritesStore = useFavouritesStore()
const announcementsStore = useAnnouncementsStore()
const toastStore = useToastStore()

const loading = ref(true)
const activeTab = ref('all')
const searchQuery = ref('')
const sortBy = ref('recent')
const viewMode = ref('grid')

const sortOptions = [
  { key: 'recent', label: 'Недавние' },
  { key: 'price-asc', label: 'Дешевле' },
  { key: 'price-desc', label: 'Дороже' },
  { key: 'year-desc', label: 'Новее' },
  { key: 'mileage-asc', label: 'Меньше пробег' }
]

const favouriteAnnouncements = computed(() => {
  const ids = favouritesStore.favouriteIds || []
  return announcementsStore.announcements.filter(a => ids.includes(a.id))
})

const stats = computed(() => {
  const items = favouriteAnnouncements.value
  return {
    total: items.length,
    priceDrop: items.filter(a => a.priceDrop).length,
    priceUp: items.filter(a => a.priceUp).length,
    withNotes: items.filter(a => favouritesStore.getNote?.(a.id)).length
  }
})

const tabs = computed(() => [
  { key: 'all', label: 'Все', count: stats.value.total },
  {
    key: 'changed',
    label: 'С изменениями',
    count: favouriteAnnouncements.value.filter(a => a.priceDrop || a.priceUp).length
  },
  { key: 'notes', label: 'С заметками', count: stats.value.withNotes }
])

const favouriteCountText = computed(() => {
  const n = stats.value.total
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'объявление'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'объявления'
  return 'объявлений'
})

const filteredAndSorted = computed(() => {
  let items = favouriteAnnouncements.value

  if (activeTab.value === 'changed') {
    items = items.filter(a => a.priceDrop || a.priceUp)
  } else if (activeTab.value === 'notes') {
    items = items.filter(a => favouritesStore.getNote?.(a.id))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    items = items.filter(a =>
      `${a.brand} ${a.model}`.toLowerCase().includes(q) ||
      String(a.year).includes(q) ||
      (a.city || '').toLowerCase().includes(q)
    )
  }

  items = [...items].sort((a, b) => {
    switch (sortBy.value) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0)
      case 'price-desc':
        return (b.price || 0) - (a.price || 0)
      case 'year-desc':
        return (b.year || 0) - (a.year || 0)
      case 'mileage-asc':
        return (a.mileage || 0) - (b.mileage || 0)
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })

  return items
})

function goToCatalog() {
  router.push('/announcements')
}

function goToNotificationSettings() {
  router.push('/profile/notifications')
}

function exportFavourites() {
  toastStore.success('Экспорт в PDF подготовлен')
}

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      favouritesStore.fetchFavourites(),
      announcementsStore.fetchAnnouncements({ perPage: 100 })
    ])
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="cv-fav">
    <div class="cv-fav__container">
      <Breadcrumbs />

      <header class="cv-fav__header">
        <div class="cv-fav__header-left">
          <span class="cv-fav__eyebrow">
            <span class="cv-fav__eyebrow-dot" aria-hidden="true"></span>
            Мои подборки
          </span>
          <h1 class="cv-fav__title">Избранное</h1>
          <p class="cv-fav__subtitle">
            Сохранённые автомобили, которые вам понравились.
            <template v-if="stats.total">
              Всего <strong>{{ stats.total }} {{ favouriteCountText }}</strong>.
            </template>
          </p>
        </div>

        <div v-if="favouriteAnnouncements.length" class="cv-fav__header-actions">
          <BaseButton variant="outline" size="lg" @click="goToNotificationSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
            Уведомления
          </BaseButton>

          <BaseButton variant="outline" size="lg" @click="exportFavourites">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <path d="M7 10l5 5 5-5"/>
              <path d="M12 15V3"/>
            </svg>
            Экспорт
          </BaseButton>

          <BaseButton size="lg" @click="goToCatalog">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
            В каталог
          </BaseButton>
        </div>
      </header>

      <section v-if="favouriteAnnouncements.length" class="cv-fav__info">
        <span class="cv-fav__info-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </span>
        <div class="cv-fav__info-content">
          <p class="cv-fav__info-title">Чем избранное отличается от подписок?</p>
          <p class="cv-fav__info-text">
            <strong>Избранное</strong> — просто сохраняет объявление, чтобы не потерять.
            <strong>Подписка</strong> — присылает уведомления об изменениях цены и статуса.
          </p>
        </div>
        <button
          type="button"
          class="cv-fav__info-link"
          @click="router.push('/profile/subscriptions')"
        >
          Перейти в подписки
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </button>
      </section>

      <section v-if="favouriteAnnouncements.length" class="cv-fav__stats">
        <div class="cv-fav__stat">
          <span class="cv-fav__stat-icon" data-accent="danger" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
            </svg>
          </span>
          <div class="cv-fav__stat-content">
            <span class="cv-fav__stat-value">{{ stats.total }}</span>
            <span class="cv-fav__stat-label">В избранном</span>
          </div>
        </div>

        <div class="cv-fav__stat">
          <span class="cv-fav__stat-icon" data-accent="success" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </span>
          <div class="cv-fav__stat-content">
            <span class="cv-fav__stat-value">{{ stats.priceDrop }}</span>
            <span class="cv-fav__stat-label">Цена снижена</span>
          </div>
        </div>

        <div class="cv-fav__stat">
          <span class="cv-fav__stat-icon" data-accent="warning" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </span>
          <div class="cv-fav__stat-content">
            <span class="cv-fav__stat-value">{{ stats.priceUp }}</span>
            <span class="cv-fav__stat-label">Подорожали</span>
          </div>
        </div>
      </section>

      <section v-if="favouriteAnnouncements.length" class="cv-fav__toolbar">
        <div class="cv-fav__tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="cv-fav__tab"
            :class="{ 'cv-fav__tab--active': activeTab === tab.key }"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span class="cv-fav__tab-label">{{ tab.label }}</span>
            <span class="cv-fav__tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="cv-fav__controls">
          <div class="cv-fav__search">
            <BaseInput
              v-model="searchQuery"
              placeholder="Поиск по марке или городу..."
              clearable
            />
          </div>

          <div class="cv-fav__sort">
            <select v-model="sortBy" class="cv-fav__sort-select">
              <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
                {{ opt.label }}
              </option>
            </select>
            <span class="cv-fav__sort-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
          </div>

          <div class="cv-fav__view">
            <button
              type="button"
              class="cv-fav__view-btn"
              :class="{ 'cv-fav__view-btn--active': viewMode === 'grid' }"
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
              class="cv-fav__view-btn"
              :class="{ 'cv-fav__view-btn--active': viewMode === 'list' }"
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

      <section class="cv-fav__content">
        <div v-if="loading" class="cv-fav__grid">
          <AnnouncementSkeleton v-for="i in 6" :key="i" />
        </div>

        <div v-else-if="!favouriteAnnouncements.length" class="cv-fav__empty">
          <div class="cv-fav__empty-orb" aria-hidden="true"></div>

          <div class="cv-fav__empty-content">
            <span class="cv-fav__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
              </svg>
            </span>

            <h3 class="cv-fav__empty-title">В избранном пусто</h3>
            <p class="cv-fav__empty-text">
              Добавляйте понравившиеся автомобили, чтобы не потерять их.
              Ищите по марке, году и цене — сохраняйте лучшие варианты.
            </p>

            <div class="cv-fav__empty-actions">
              <BaseButton size="lg" @click="goToCatalog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
                Перейти в каталог
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-else-if="!filteredAndSorted.length" class="cv-fav__empty">
          <div class="cv-fav__empty-content">
            <span class="cv-fav__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
            </span>

            <h3 class="cv-fav__empty-title">Ничего не найдено</h3>
            <p class="cv-fav__empty-text">
              По текущим фильтрам нет избранных объявлений.
            </p>

            <BaseButton variant="outline" @click="activeTab = 'all'; searchQuery = ''">
              Сбросить фильтры
            </BaseButton>
          </div>
        </div>

        <div
          v-else
          :class="['cv-fav__grid', viewMode === 'list' && 'cv-fav__grid--list']"
        >
          <AnnouncementCard
            v-for="announcement in filteredAndSorted"
            :key="announcement.id"
            :announcement="announcement"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cv-fav {
  position: relative;
  padding: 20px 0 60px;
}

.cv-fav__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-fav__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cv-fav__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cv-fav__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-fav__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvFavDot 2.2s ease-in-out infinite;
}

@keyframes cvFavDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-fav__title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
}

.cv-fav__subtitle {
  margin: 0;
  max-width: 640px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-fav__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-fav__header-actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.cv-fav__info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-left: 3px solid rgba(201, 169, 97, 0.7);
}

.cv-fav__info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A0;
  flex-shrink: 0;
  margin-top: 1px;
}

.cv-fav__info-content {
  flex: 1;
  min-width: 0;
}

.cv-fav__info-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #E8D5A0;
}

.cv-fav__info-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(245, 240, 230, 0.75);
}

.cv-fav__info-text strong {
  color: #E8D5A0;
  font-weight: 700;
}

.cv-fav__info-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

.cv-fav__info-link:hover {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-fav__info-link:active {
  transform: translateY(0) scale(0.97);
}

.cv-fav__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-fav__stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-fav__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-fav__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-fav__stat-icon[data-accent="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-fav__stat-icon[data-accent="success"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-fav__stat-icon[data-accent="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-fav__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-fav__stat-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-fav__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-fav__toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-fav__tabs {
  display: flex;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cv-fav__tabs::-webkit-scrollbar { display: none; }

.cv-fav__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-fav__tab:hover:not(.cv-fav__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-fav__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-fav__tab-label {
  white-space: nowrap;
}

.cv-fav__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(220, 210, 195, 0.7);
  transition: all 0.25s ease;
}

.cv-fav__tab--active .cv-fav__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-fav__controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-fav__search {
  flex: 1;
  min-width: 240px;
}

.cv-fav__sort {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.cv-fav__sort-select {
  padding: 11px 34px 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.85);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.22s ease;
  min-width: 180px;
}

.cv-fav__sort-select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-fav__sort-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-fav__sort-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
}

.cv-fav__sort-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  pointer-events: none;
}

.cv-fav__view {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  flex-shrink: 0;
}

.cv-fav__view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: rgba(220, 210, 195, 0.6);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-fav__view-btn:hover {
  color: #E8D5A0;
}

.cv-fav__view-btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-fav__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.cv-fav__grid--list {
  grid-template-columns: 1fr;
  gap: 14px;
}

.cv-fav__empty {
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

.cv-fav__empty-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.15), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  animation: cvFavEmptyOrb 4s ease-in-out infinite;
}

@keyframes cvFavEmptyOrb {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-fav__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.cv-fav__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 12px;
  border-radius: 24px;
  color: #E8A88A;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(184, 119, 85, 0.32);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.06) inset,
    0 1px 0 rgba(232, 168, 138, 0.12) inset,
    0 0 60px rgba(184, 119, 85, 0.15);
  animation: cvFavEmptyFloat 4s ease-in-out infinite;
}

@keyframes cvFavEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-fav__empty-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-fav__empty-text {
  margin: 0 0 20px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.6);
}

.cv-fav__empty-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

@media (max-width: 1280px) {
  .cv-fav__container { padding: 0 32px; }
}

@media (max-width: 1024px) {
  .cv-fav__title { font-size: 32px; letter-spacing: -0.7px; }
  .cv-fav__stats { grid-template-columns: repeat(3, 1fr); }
  .cv-fav__grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}

@media (max-width: 768px) {
  .cv-fav { padding: 12px 0 40px; }
  .cv-fav__container { padding: 0 20px; gap: 18px; }
  .cv-fav__title { font-size: 26px; letter-spacing: -0.5px; }
  .cv-fav__subtitle { font-size: 13.5px; }

  .cv-fav__header-actions { width: 100%; flex-direction: column; }
  .cv-fav__header-actions > * { width: 100%; }

  .cv-fav__info { flex-direction: column; padding: 12px 14px; gap: 10px; }
  .cv-fav__info-link { align-self: flex-start; }

  .cv-fav__stats { grid-template-columns: 1fr; gap: 10px; }
  .cv-fav__stat { padding: 16px 18px; }
  .cv-fav__stat-icon { width: 40px; height: 40px; }
  .cv-fav__stat-value { font-size: 20px; }

  .cv-fav__controls { flex-direction: column; gap: 8px; }
  .cv-fav__search { min-width: 0; }
  .cv-fav__sort-select { width: 100%; min-width: 0; }

  .cv-fav__grid { grid-template-columns: 1fr; gap: 14px; }

  .cv-fav__empty { padding: 52px 20px 44px; border-radius: 1rem; }
  .cv-fav__empty-icon { width: 72px; height: 72px; border-radius: 20px; }
  .cv-fav__empty-title { font-size: 17px; }
  .cv-fav__empty-text { font-size: 13px; }
  .cv-fav__empty-actions { flex-direction: column; width: 100%; gap: 12px; }
  .cv-fav__empty-actions > * { width: 100%; }
}
</style>