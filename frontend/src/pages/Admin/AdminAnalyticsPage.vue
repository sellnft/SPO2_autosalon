<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { formatDate } from '@/utils/formatDate'

defineOptions({ name: 'AdminAnalyticsPage' })

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(true)
const period = ref('30d')

const periods = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' }
]

/* Сид для демо-графиков. Замени на реальные данные из API. */
const seed = computed(() => (period.value === '7d' ? 7 : period.value === '30d' ? 30 : 90))

const userGrowth = computed(() => {
  const arr = []
  for (let i = 0; i < seed.value; i++) {
    arr.push(20 + Math.round(Math.sin(i * 0.4) * 8 + i * 0.8))
  }
  return arr
})

const announcementGrowth = computed(() => {
  const arr = []
  for (let i = 0; i < seed.value; i++) {
    arr.push(40 + Math.round(Math.cos(i * 0.3) * 12 + i * 1.1))
  }
  return arr
})

function toPath(points) {
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
}

function toArea(points) {
  const p = toPath(points)
  return p ? `${p} L100,40 L0,40 Z` : ''
}

const summary = computed(() => {
  const users = adminStore.users
  const feedback = adminStore.feedback

  return {
    usersTotal: users.length,
    usersActive: users.filter(u => u.status === 'active').length,
    usersBlocked: users.filter(u => u.status === 'blocked').length,
    admins: users.filter(u => u.role === 'admin').length,
    feedbackTotal: feedback.length,
    feedbackOpen: feedback.filter(f => f.status === 'open').length,
    feedbackCritical: feedback.filter(f => f.priority === 'critical').length,
    feedbackResolved: feedback.filter(f => f.status === 'resolved').length
  }
})

const statCards = computed(() => [
  {
    key: 'users',
    label: 'Пользователей',
    value: summary.value.usersTotal,
    hint: `${summary.value.usersActive} активных`,
    icon: 'users',
    accent: 'accent',
    link: '/admin/users'
  },
  {
    key: 'announcements',
    label: 'Объявлений',
    value: '—',
    hint: 'из каталога',
    icon: 'car',
    accent: 'info',
    link: '/admin/announcements'
  },
  {
    key: 'feedback',
    label: 'Обращений',
    value: summary.value.feedbackTotal,
    hint: `${summary.value.feedbackOpen} открытых`,
    icon: 'chat',
    accent: 'warning',
    link: '/admin/feedback'
  },
  {
    key: 'critical',
    label: 'Критичных',
    value: summary.value.feedbackCritical,
    hint: 'требуют внимания',
    icon: 'alert',
    accent: 'danger',
    link: '/admin/feedback'
  }
])

async function loadData() {
  loading.value = true
  try {
    const tasks = []
    if (!adminStore.users.length) tasks.push(adminStore.fetchUsers())
    if (!adminStore.feedback.length) tasks.push(adminStore.fetchFeedback())
    await Promise.all(tasks)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="cv-aa">
    <!-- HEADER -->
    <header class="cv-aa__header">
      <div class="cv-aa__header-left">
        <span class="cv-aa__eyebrow">
          <span class="cv-aa__eyebrow-dot" aria-hidden="true"></span>
          Админ · Аналитика
        </span>
        <h1 class="cv-aa__title">Аналитика платформы</h1>
        <p class="cv-aa__subtitle">
          Ключевые метрики, динамика роста и активность пользователей
        </p>
      </div>

      <div class="cv-aa__periods">
        <button
          v-for="p in periods"
          :key="p.value"
          type="button"
          class="cv-aa__period"
          :class="{ 'cv-aa__period--active': period === p.value }"
          @click="period = p.value"
        >
          {{ p.label }}
        </button>
      </div>
    </header>

    <!-- STATS -->
    <section class="cv-aa__stats">
      <button
        v-for="card in statCards"
        :key="card.key"
        type="button"
        class="cv-aa__stat"
        :data-accent="card.accent"
        @click="router.push(card.link)"
      >
        <span class="cv-aa__stat-icon" aria-hidden="true">
          <svg v-if="card.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <svg v-else-if="card.icon === 'car'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
            <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
            <circle cx="7.5" cy="15.5" r="0.9" fill="currentColor"/>
            <circle cx="16.5" cy="15.5" r="0.9" fill="currentColor"/>
          </svg>
          <svg v-else-if="card.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4M12 17h.01"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </span>

        <div class="cv-aa__stat-body">
          <span class="cv-aa__stat-value">
            {{ typeof card.value === 'number' ? card.value.toLocaleString('ru-RU') : card.value }}
          </span>
          <span class="cv-aa__stat-label">{{ card.label }}</span>
          <span class="cv-aa__stat-hint">{{ card.hint }}</span>
        </div>

        <span class="cv-aa__stat-arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </span>
      </button>
    </section>

    <!-- CHARTS -->
    <section class="cv-aa__charts">
      <article class="cv-aa__card">
        <header class="cv-aa__card-head">
          <div>
            <h2 class="cv-aa__card-title">Новые пользователи</h2>
            <p class="cv-aa__card-hint">Динамика регистраций</p>
          </div>
          <span class="cv-aa__card-total">
            {{ userGrowth.reduce((s, v) => s + v, 0).toLocaleString('ru-RU') }}
          </span>
        </header>

        <div class="cv-aa__chart">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="aaUsersFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#C9A961" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#C9A961" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="toArea(userGrowth)" fill="url(#aaUsersFill)"/>
            <path :d="toPath(userGrowth)" stroke="#E8D5A0" stroke-width="0.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </article>

      <article class="cv-aa__card">
        <header class="cv-aa__card-head">
          <div>
            <h2 class="cv-aa__card-title">Новые объявления</h2>
            <p class="cv-aa__card-hint">Динамика публикаций</p>
          </div>
          <span class="cv-aa__card-total">
            {{ announcementGrowth.reduce((s, v) => s + v, 0).toLocaleString('ru-RU') }}
          </span>
        </header>

        <div class="cv-aa__chart">
          <svg viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id="aaAnnFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#B8D4E8" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="#B8D4E8" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="toArea(announcementGrowth)" fill="url(#aaAnnFill)"/>
            <path :d="toPath(announcementGrowth)" stroke="#B8D4E8" stroke-width="0.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </article>
    </section>

    <!-- QUICK LINKS -->
    <section class="cv-aa__links">
      <h2 class="cv-aa__links-title">Быстрые переходы</h2>

      <div class="cv-aa__links-grid">
        <button class="cv-aa__link" type="button" @click="router.push('/admin/users')">
          <span class="cv-aa__link-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </span>
          <span class="cv-aa__link-body">
            <span class="cv-aa__link-label">Пользователи</span>
            <span class="cv-aa__link-hint">Управление и блокировки</span>
          </span>
        </button>

        <button class="cv-aa__link" type="button" @click="router.push('/admin/announcements')">
          <span class="cv-aa__link-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
              <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
            </svg>
          </span>
          <span class="cv-aa__link-body">
            <span class="cv-aa__link-label">Объявления</span>
            <span class="cv-aa__link-hint">Модерация каталога</span>
          </span>
        </button>

        <button class="cv-aa__link" type="button" @click="router.push('/admin/feedback')">
          <span class="cv-aa__link-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
            </svg>
          </span>
          <span class="cv-aa__link-body">
            <span class="cv-aa__link-label">Обращения</span>
            <span class="cv-aa__link-hint">Поддержка пользователей</span>
          </span>
        </button>

        <button class="cv-aa__link" type="button" @click="router.push('/admin/audit-logs')">
          <span class="cv-aa__link-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 13h6M9 17h4"/>
            </svg>
          </span>
          <span class="cv-aa__link-body">
            <span class="cv-aa__link-label">Журнал действий</span>
            <span class="cv-aa__link-hint">Audit log</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cv-aa {
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-aa__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-aa__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-aa__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-aa__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAaDot 2.2s ease-in-out infinite;
}

@keyframes cvAaDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-aa__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: rgba(245, 240, 230, 0.98);
}

.cv-aa__subtitle {
  margin: 0;
  font-size: 13.5px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-aa__periods {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  flex-shrink: 0;
}

.cv-aa__period {
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
  white-space: nowrap;
}

.cv-aa__period:hover:not(.cv-aa__period--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-aa__period--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 16px rgba(201, 169, 97, 0.35);
}

.cv-aa__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-aa__stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-aa__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-aa__stat:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.cv-aa__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 11px;
  border: 1px solid;
}

.cv-aa__stat[data-accent="accent"] .cv-aa__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-aa__stat[data-accent="info"] .cv-aa__stat-icon {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.14);
  border-color: rgba(106, 154, 194, 0.35);
}

.cv-aa__stat[data-accent="warning"] .cv-aa__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-aa__stat[data-accent="danger"] .cv-aa__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-aa__stat-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-aa__stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-aa__stat-label {
  font-size: 12px;
  font-weight: 650;
  color: rgba(245, 240, 230, 0.85);
}

.cv-aa__stat-hint {
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(200, 190, 175, 0.5);
}

.cv-aa__stat-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.4);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-aa__stat:hover .cv-aa__stat-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
}

.cv-aa__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.cv-aa__card {
  padding: 22px 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-aa__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-aa__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.cv-aa__card-title {
  margin: 0 0 3px;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-aa__card-hint {
  margin: 0;
  font-size: 11.5px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-aa__card-total {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #E8D5A0;
  font-variant-numeric: tabular-nums;
}

.cv-aa__chart {
  height: 150px;
}

.cv-aa__chart svg {
  width: 100%;
  height: 100%;
  display: block;
}

.cv-aa__links {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-aa__links-title {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: rgba(245, 240, 230, 0.95);
}

.cv-aa__links-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cv-aa__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aa__link:hover {
  border-color: rgba(201, 169, 97, 0.4);
  background: rgba(201, 169, 97, 0.06);
  transform: translateY(-2px);
}

.cv-aa__link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-aa__link-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-aa__link-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.95);
}

.cv-aa__link-hint {
  font-size: 11px;
  color: rgba(200, 190, 175, 0.55);
}

@media (max-width: 1024px) {
  .cv-aa__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-aa__charts { grid-template-columns: 1fr; }
  .cv-aa__links-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .cv-aa__title { font-size: 24px; }
  .cv-aa__periods { width: 100%; }
  .cv-aa__period { flex: 1; text-align: center; }
  .cv-aa__stats { grid-template-columns: 1fr; }
  .cv-aa__links-grid { grid-template-columns: 1fr; }
}
</style>