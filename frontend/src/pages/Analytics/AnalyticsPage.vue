<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDate } from '@/utils/formatDate'

defineOptions({ name: 'AnalyticsPage' })

const router = useRouter()
const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const period = ref('30d')
const myAnnouncements = ref([])

const periods = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
  { value: 'all', label: 'Всё время' }
]

/* Демо-данные для графика. В реальном проекте — из API */
const chartPoints = computed(() => {
  const seed = period.value === '7d' ? 7 : period.value === '30d' ? 30 : 90
  const points = []
  for (let i = 0; i < seed; i++) {
    const base = 60 + Math.sin(i * 0.5) * 30 + (i * 1.2)
    points.push(Math.max(20, Math.round(base + (i % 5) * 8)))
  }
  return points
})

const chartPath = computed(() => {
  const points = chartPoints.value
  if (!points.length) return ''
  const max = Math.max(...points) || 1
  const step = 100 / (points.length - 1 || 1)
  return points
    .map((v, i) => {
      const x = i * step
      const y = 40 - (v / max) * 35
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})

const chartAreaPath = computed(() => {
  const path = chartPath.value
  if (!path) return ''
  return `${path} L100,40 L0,40 Z`
})

const summary = computed(() => {
  const items = myAnnouncements.value
  const totalViews = items.reduce((s, a) => s + (a.views || 0), 0)
  const totalFavorites = items.reduce((s, a) => s + (a.favoritesCount || 0), 0)
  const totalMessages = items.reduce((s, a) => s + (a.messagesCount || 0), 0)
  const active = items.filter(a => a.status === 'active').length
  const sold = items.filter(a => a.status === 'sold').length
  const conversion = totalViews ? ((totalMessages / totalViews) * 100).toFixed(1) : '0.0'

  return {
    total: items.length,
    active,
    sold,
    totalViews,
    totalFavorites,
    totalMessages,
    conversion
  }
})

const statCards = computed(() => [
  { key: 'views', label: 'Просмотры', value: summary.value.totalViews, icon: 'eye', accent: 'accent' },
  { key: 'favorites', label: 'В избранном', value: summary.value.totalFavorites, icon: 'heart', accent: 'danger' },
  { key: 'messages', label: 'Сообщений', value: summary.value.totalMessages, icon: 'chat', accent: 'info' },
  { key: 'conversion', label: 'Конверсия', value: `${summary.value.conversion}%`, icon: 'chart', accent: 'success' }
])

const topAnnouncements = computed(() =>
  [...myAnnouncements.value]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
)

async function loadData() {
  loading.value = true
  try {
    if (!authStore.user?.id) return
    await announcementsStore.fetchAnnouncements({ sellerId: authStore.user.id, perPage: 200 })
    myAnnouncements.value = announcementsStore.announcements.filter(
      a => a.sellerId === authStore.user.id
    )
  } catch (err) {
    console.error('Failed to load analytics:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="cv-an">
    <header class="cv-an__header">
      <div class="cv-an__header-left">
        <span class="cv-an__eyebrow">
          <span class="cv-an__eyebrow-dot" aria-hidden="true"></span>
          Личный кабинет · Аналитика
        </span>
        <h1 class="cv-an__title">Аналитика</h1>
        <p class="cv-an__subtitle">
          Статистика ваших объявлений и эффективность продаж
        </p>
      </div>

      <div class="cv-an__periods">
        <button
          v-for="p in periods"
          :key="p.value"
          type="button"
          class="cv-an__period"
          :class="{ 'cv-an__period--active': period === p.value }"
          @click="period = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </header>

    <!-- === STATS === -->
    <section class="cv-an__stats">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="cv-an__stat"
        :data-accent="card.accent"
      >
        <span class="cv-an__stat-icon" aria-hidden="true">
          <svg v-if="card.icon === 'eye'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg v-else-if="card.icon === 'heart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
          </svg>
          <svg v-else-if="card.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M7 15l4-4 3 3 6-6"/>
          </svg>
        </span>

        <div class="cv-an__stat-body">
          <span class="cv-an__stat-value">{{ card.value.toLocaleString('ru-RU') }}</span>
          <span class="cv-an__stat-label">{{ card.label }}</span>
        </div>
      </article>
    </section>

    <!-- === CHART === -->
    <section class="cv-an__card">
      <header class="cv-an__card-head">
        <h2 class="cv-an__card-title">Просмотры за период</h2>
        <span class="cv-an__card-hint">
          Всего: <strong>{{ summary.totalViews.toLocaleString('ru-RU') }}</strong>
        </span>
      </header>

      <div class="cv-an__chart">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="anChartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#C9A961" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#C9A961" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path :d="chartAreaPath" fill="url(#anChartFill)"/>
          <path :d="chartPath" stroke="#E8D5A0" stroke-width="0.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>

    <!-- === TOP ANNOUNCEMENTS === -->
    <section class="cv-an__card">
      <header class="cv-an__card-head">
        <h2 class="cv-an__card-title">Топ объявлений</h2>
        <BaseButton variant="ghost" @click="router.push('/profile/announcements')">
          Все объявления
        </BaseButton>
      </header>

      <div v-if="loading" class="cv-an__loading">
        <div v-for="i in 3" :key="i" class="cv-an__skeleton"></div>
      </div>

      <div v-else-if="!topAnnouncements.length" class="cv-an__empty">
        <p class="cv-an__empty-title">Пока нет данных</p>
        <p class="cv-an__empty-hint">Опубликуйте объявление, чтобы увидеть статистику</p>
        <BaseButton @click="router.push('/announcements/create')">
          Создать объявление
        </BaseButton>
      </div>

      <ul v-else class="cv-an__top">
        <li
          v-for="(item, index) in topAnnouncements"
          :key="item.id"
          class="cv-an__top-item"
          @click="router.push(`/announcements/${item.id}`)"
        >
          <span class="cv-an__top-rank">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="cv-an__top-body">
            <p class="cv-an__top-title">{{ item.title }}</p>
            <p class="cv-an__top-meta">
              {{ item.brand }} {{ item.model }} · {{ formatDate(item.createdAt, 'short') }}
            </p>
          </div>
          <div class="cv-an__top-stats">
            <span class="cv-an__top-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {{ (item.views || 0).toLocaleString('ru-RU') }}
            </span>
            <span class="cv-an__top-stat">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
              </svg>
              {{ item.favoritesCount || 0 }}
            </span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.cv-an {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-an__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-an__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-an__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-an__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAnDot 2.2s ease-in-out infinite;
}

@keyframes cvAnDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-an__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: rgba(245, 240, 230, 0.98);
}

.cv-an__subtitle {
  margin: 0;
  font-size: 13.5px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-an__periods {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-an__period {
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-an__period:hover:not(.cv-an__period--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-an__period--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 16px rgba(201, 169, 97, 0.35);
}

.cv-an__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-an__stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-an__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-an__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 11px;
  border: 1px solid;
}

.cv-an__stat[data-accent="accent"] .cv-an__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-an__stat[data-accent="danger"] .cv-an__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-an__stat[data-accent="info"] .cv-an__stat-icon {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.14);
  border-color: rgba(106, 154, 194, 0.35);
}

.cv-an__stat[data-accent="success"] .cv-an__stat-icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-an__stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-an__stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-an__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(200, 190, 175, 0.6);
}

.cv-an__card {
  padding: 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-an__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-an__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cv-an__card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-an__card-hint {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.6);
}

.cv-an__card-hint strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-an__chart {
  height: 220px;
  position: relative;
}

.cv-an__chart svg {
  width: 100%;
  height: 100%;
  display: block;
}

.cv-an__loading {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-an__skeleton {
  height: 64px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}

.cv-an__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.08) 50%, transparent);
  animation: cvAnShimmer 1.8s ease-in-out infinite;
}

@keyframes cvAnShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-an__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
}

.cv-an__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
}

.cv-an__empty-hint {
  margin: 0;
  font-size: 12.5px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-an__top {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-an__top-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.22s ease;
  border: 1px solid transparent;
}

.cv-an__top-item:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.2);
  transform: translateX(2px);
}

.cv-an__top-rank {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
  width: 26px;
}

.cv-an__top-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-an__top-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-an__top-meta {
  margin: 0;
  font-size: 11.5px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-an__top-stats {
  display: inline-flex;
  gap: 12px;
  flex-shrink: 0;
}

.cv-an__top-stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.75);
  font-variant-numeric: tabular-nums;
}

.cv-an__top-stat svg {
  color: rgba(201, 169, 97, 0.65);
}

@media (max-width: 1024px) {
  .cv-an__stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .cv-an { padding: 24px 20px 60px; }
  .cv-an__title { font-size: 24px; }
  .cv-an__periods { width: 100%; }
  .cv-an__period { flex: 1; text-align: center; }
  .cv-an__stats { grid-template-columns: 1fr; }
  .cv-an__top-stats { display: none; }
}
</style>