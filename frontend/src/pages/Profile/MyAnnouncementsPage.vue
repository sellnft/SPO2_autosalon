<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementList from '@/components/announcements/AnnouncementList.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import { formatPrice } from '@/utils/formatPrice'

const router = useRouter()
const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const activeTab = ref('all')
const searchQuery = ref('')
const sortBy = ref('createdAt-desc')
const viewMode = ref('list')

const tabs = [
  { key: 'all', label: 'Все', icon: 'grid' },
  { key: 'active', label: 'Активные', icon: 'check', statuses: ['active'] },
  { key: 'pending', label: 'На модерации', icon: 'clock', statuses: ['pending'] },
  { key: 'rejected', label: 'Отклонённые', icon: 'x', statuses: ['rejected', 'blocked'] },
  { key: 'sold', label: 'Проданные', icon: 'tag', statuses: ['sold'] },
  { key: 'draft', label: 'Черновики', icon: 'edit', statuses: ['draft'] }
]

const sortOptions = [
  { key: 'createdAt-desc', label: 'Сначала новые' },
  { key: 'createdAt-asc', label: 'Сначала старые' },
  { key: 'views-desc', label: 'Больше просмотров' },
  { key: 'price-desc', label: 'Дороже' },
  { key: 'price-asc', label: 'Дешевле' }
]

const myAnnouncements = computed(() =>
  announcementsStore.announcements.filter(
    a => a.sellerId === authStore.user?.id
  )
)

const stats = computed(() => {
  const items = myAnnouncements.value
  const total = items.length
  const active = items.filter(a => a.status === 'active').length
  const views = items.reduce((sum, a) => sum + (a.views || 0), 0)
  const favourites = items.reduce((sum, a) => sum + (a.favourites || 0), 0)
  return { total, active, views, favourites }
})

const tabCounts = computed(() => {
  const counts = { all: myAnnouncements.value.length }
  tabs.forEach(tab => {
    if (tab.key === 'all') return
    counts[tab.key] = myAnnouncements.value.filter(a =>
      tab.statuses.includes(a.status)
    ).length
  })
  return counts
})

const filteredAnnouncements = computed(() => {
  let items = myAnnouncements.value

  if (activeTab.value !== 'all') {
    const tab = tabs.find(t => t.key === activeTab.value)
    if (tab?.statuses) {
      items = items.filter(a => tab.statuses.includes(a.status))
    }
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    items = items.filter(a =>
      `${a.brand} ${a.model}`.toLowerCase().includes(q) ||
      String(a.year).includes(q)
    )
  }

  const [field, order] = sortBy.value.split('-')
  items = [...items].sort((a, b) => {
    const av = a[field] ?? 0
    const bv = b[field] ?? 0
    if (field === 'createdAt') {
      return order === 'desc'
        ? new Date(bv) - new Date(av)
        : new Date(av) - new Date(bv)
    }
    return order === 'desc' ? bv - av : av - bv
  })

  return items
})

async function loadData() {
  loading.value = true
  try {
    await announcementsStore.fetchAnnouncements({ perPage: 100 })
  } finally {
    loading.value = false
  }
}

function goToCreate() {
  router.push('/announcements/create')
}

function handleView(item) {
  router.push(`/announcements/${item.id}`)
}

function handleEdit(item) {
  router.push(`/announcements/${item.id}/edit`)
}

onMounted(loadData)
</script>

<template>
  <div class="cv-my">
    <div class="cv-my__container">
      <Breadcrumbs />

      <header class="cv-my__header">
        <div class="cv-my__header-left">
          <span class="cv-my__eyebrow">
            <span class="cv-my__eyebrow-dot" aria-hidden="true"></span>
            Профиль · Мои объявления
          </span>
          <h1 class="cv-my__title">Мои объявления</h1>
          <p class="cv-my__subtitle">
            Управляйте публикациями, следите за статистикой и продвигайте свои предложения
          </p>
        </div>

        <BaseButton size="lg" class="cv-my__cta" @click="goToCreate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Создать объявление
        </BaseButton>
      </header>

      <section class="cv-my__stats">
        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5"/>
              <rect x="14" y="3" width="7" height="5" rx="1.5"/>
              <rect x="14" y="12" width="7" height="9" rx="1.5"/>
              <rect x="3" y="16" width="7" height="5" rx="1.5"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">Всего</span>
            <span class="cv-stat-card__value">{{ stats.total }}</span>
          </div>
        </div>

        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">Активных</span>
            <span class="cv-stat-card__value">{{ stats.active }}</span>
          </div>
        </div>

        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">Просмотров</span>
            <span class="cv-stat-card__value">{{ stats.views.toLocaleString('ru-RU') }}</span>
          </div>
        </div>

        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">В избранном</span>
            <span class="cv-stat-card__value">{{ stats.favourites }}</span>
          </div>
        </div>
      </section>

      <section class="cv-my__toolbar">
        <div class="cv-my__tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="cv-my__tab"
            :class="{ 'cv-my__tab--active': activeTab === tab.key }"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span class="cv-my__tab-icon" aria-hidden="true">
              <svg v-if="tab.icon === 'grid'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <svg v-else-if="tab.icon === 'check'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
              <svg v-else-if="tab.icon === 'clock'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
              <svg v-else-if="tab.icon === 'x'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
              <svg v-else-if="tab.icon === 'tag'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6l4-4h4l8 8-8 8-8-8z"/>
                <circle cx="8" cy="6" r="1"/>
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3l5 5-11 11H5v-5z"/>
              </svg>
            </span>
            <span class="cv-my__tab-label">{{ tab.label }}</span>
            <span class="cv-my__tab-count">{{ tabCounts[tab.key] || 0 }}</span>
          </button>
        </div>

        <div class="cv-my__controls">
          <div class="cv-my__search">
            <BaseInput
              v-model="searchQuery"
              placeholder="Поиск по марке или модели..."
              clearable
            />
          </div>

          <div class="cv-my__sort">
            <select v-model="sortBy" class="cv-my__sort-select">
              <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
                {{ opt.label }}
              </option>
            </select>
            <span class="cv-my__sort-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </span>
          </div>
        </div>
      </section>

      <section class="cv-my__content">
        <div v-if="loading" class="cv-my__grid">
          <AnnouncementSkeleton v-for="i in 4" :key="i" />
        </div>

        <div v-else-if="!myAnnouncements.length" class="cv-my__empty">
          <div class="cv-my__empty-orb" aria-hidden="true"></div>

          <div class="cv-my__empty-content">
            <span class="cv-my__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
                <circle cx="7.5" cy="15.5" r="0.9" fill="currentColor"/>
                <circle cx="16.5" cy="15.5" r="0.9" fill="currentColor"/>
              </svg>
            </span>

            <h3 class="cv-my__empty-title">У вас пока нет объявлений</h3>
            <p class="cv-my__empty-text">
              Разместите первое объявление — это займёт 2 минуты.
              Первые просмотры появятся уже через час после публикации.
            </p>

            <div class="cv-my__empty-actions">
              <BaseButton size="lg" @click="goToCreate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Создать объявление
              </BaseButton>

              <button
                type="button"
                class="cv-my__empty-link"
                @click="router.push('/analytics')"
              >
                Узнать цену авто
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="!filteredAnnouncements.length" class="cv-my__empty">
          <div class="cv-my__empty-content">
            <span class="cv-my__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
            </span>

            <h3 class="cv-my__empty-title">Ничего не найдено</h3>
            <p class="cv-my__empty-text">
              По текущим фильтрам нет объявлений. Попробуйте изменить запрос или выбрать другой раздел.
            </p>

            <BaseButton variant="outline" @click="activeTab = 'all'; searchQuery = ''">
              Сбросить фильтры
            </BaseButton>
          </div>
        </div>

        <AnnouncementList
          v-else
          :announcements="filteredAnnouncements"
          @quick-view="handleView"
          @compare="handleEdit"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.cv-my {
  position: relative;
  padding: 20px 0 60px;
}

.cv-my__container {
  position: relative;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-my__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.cv-my__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cv-my__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-my__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvMyDot 2.2s ease-in-out infinite;
}

@keyframes cvMyDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-my__title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
}

.cv-my__subtitle {
  margin: 0;
  max-width: 640px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-my__cta {
  flex-shrink: 0;
}

.cv-my__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-stat-card {
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
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-stat-card__icon[data-accent="accent"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-stat-card__icon[data-accent="success"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-stat-card__icon[data-accent="info"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-stat-card__icon[data-accent="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-stat-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-stat-card__label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

.cv-stat-card__value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-my__toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-my__tabs {
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

.cv-my__tabs::-webkit-scrollbar { display: none; }

.cv-my__tab {
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

.cv-my__tab:hover:not(.cv-my__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-my__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-my__tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-my__tab-label {
  white-space: nowrap;
}

.cv-my__tab-count {
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

.cv-my__tab--active .cv-my__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-my__controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-my__search {
  flex: 1;
  min-width: 240px;
}

.cv-my__sort {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.cv-my__sort-select {
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
  min-width: 190px;
}

.cv-my__sort-select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-my__sort-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-my__sort-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
  padding: 8px;
}

.cv-my__sort-arrow {
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

.cv-my__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.cv-my__empty {
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

.cv-my__empty-orb {
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
  animation: cvMyEmptyOrb 4s ease-in-out infinite;
}

@keyframes cvMyEmptyOrb {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-my__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.cv-my__empty-icon {
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
  animation: cvMyEmptyFloat 4s ease-in-out infinite;
}

@keyframes cvMyEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-my__empty-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-my__empty-text {
  margin: 0 0 20px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.6);
}

.cv-my__empty-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-my__empty-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-my__empty-link svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-my__empty-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.cv-my__empty-link:hover svg { transform: translateX(3px); }

.cv-my__content {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1280px) {
  .cv-my__container { padding: 0 32px; }
}

@media (max-width: 1024px) {
  .cv-my__title { font-size: 32px; letter-spacing: -0.7px; }
  .cv-my__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-my__grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cv-my { padding: 12px 0 40px; }
  .cv-my__container { padding: 0 20px; gap: 18px; }
  .cv-my__header { gap: 16px; align-items: flex-start; }
  .cv-my__header-left { width: 100%; }
  .cv-my__title { font-size: 26px; letter-spacing: -0.5px; }
  .cv-my__subtitle { font-size: 13.5px; }
  .cv-my__cta { width: 100%; }

  .cv-my__stats { gap: 10px; }
  .cv-stat-card { padding: 16px 16px; gap: 12px; }
  .cv-stat-card__icon { width: 36px; height: 36px; border-radius: 10px; }
  .cv-stat-card__value { font-size: 20px; }
  .cv-stat-card__label { font-size: 9.5px; }

  .cv-my__tabs { padding: 5px; gap: 4px; }
  .cv-my__tab { padding: 8px 12px; font-size: 12px; gap: 6px; }
  .cv-my__tab-count { min-width: 20px; height: 18px; font-size: 10px; padding: 0 6px; }

  .cv-my__controls { flex-direction: column; gap: 8px; }
  .cv-my__search { min-width: 0; }
  .cv-my__sort-select { width: 100%; min-width: 0; }

  .cv-my__empty { padding: 52px 20px 44px; border-radius: 1rem; }
  .cv-my__empty-icon { width: 72px; height: 72px; border-radius: 20px; }
  .cv-my__empty-title { font-size: 17px; }
  .cv-my__empty-text { font-size: 13px; }
  .cv-my__empty-actions { flex-direction: column; width: 100%; gap: 12px; }
  .cv-my__empty-actions > * { width: 100%; }
  .cv-my__empty-link { justify-content: center; }
}
</style>