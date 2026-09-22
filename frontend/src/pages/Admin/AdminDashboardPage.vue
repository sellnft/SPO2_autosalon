<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import AdminStatCard from '@/components/admin/AdminStatCard.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

const adminStore = useAdminStore()

onMounted(async () => {
  await adminStore.fetchDashboardStats()
})

const stats = computed(() => adminStore.dashboardStats)

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      key: 'users',
      label: 'Пользователи',
      value: stats.value.totalUsers,
      hint: 'всего зарегистрировано',
      icon: 'users',
      accent: 'accent',
      to: '/admin/users'
    },
    {
      key: 'announcements',
      label: 'Объявления',
      value: stats.value.totalAnnouncements,
      hint: 'всего опубликовано',
      icon: 'car',
      accent: 'info',
      to: '/admin/announcements'
    },
    {
      key: 'active',
      label: 'Активных',
      value: stats.value.activeAnnouncements,
      hint: 'сейчас в продаже',
      icon: 'check',
      accent: 'success',
      to: '/admin/announcements?status=active'
    },
    {
      key: 'pending',
      label: 'На модерации',
      value: stats.value.pendingAnnouncements,
      hint: 'ожидают проверки',
      icon: 'clock',
      accent: 'warning',
      to: '/admin/announcements?status=pending'
    },
    {
      key: 'feedback',
      label: 'Обращения',
      value: stats.value.totalFeedback,
      hint: 'всего получено',
      icon: 'chat',
      accent: 'info',
      to: '/admin/feedback'
    },
    {
      key: 'new-feedback',
      label: 'Новые обращения',
      value: stats.value.newFeedback,
      hint: 'требуют ответа',
      icon: 'bell',
      accent: 'danger',
      to: '/admin/feedback?status=open'
    }
  ]
})

const quickActions = computed(() => {
  if (!stats.value) return []
  return [
    {
      to: '/admin/announcements?status=pending',
      icon: 'clock',
      accent: 'warning',
      title: 'Модерация',
      description: `${stats.value.pendingAnnouncements} объявлений ждут проверки`,
      badge: stats.value.pendingAnnouncements > 0 ? stats.value.pendingAnnouncements : null
    },
    {
      to: '/admin/feedback?status=open',
      icon: 'chat',
      accent: 'danger',
      title: 'Обращения',
      description: `${stats.value.newFeedback} новых обращений`,
      badge: stats.value.newFeedback > 0 ? stats.value.newFeedback : null
    },
    {
      to: '/admin/users',
      icon: 'users',
      accent: 'accent',
      title: 'Пользователи',
      description: `Всего ${stats.value.totalUsers.toLocaleString('ru-RU')} пользователей`,
      badge: null
    }
  ]
})

// Моковая активность за неделю (без бэка)
const weeklyActivity = [
  { day: 'Пн', value: 42 },
  { day: 'Вт', value: 58 },
  { day: 'Ср', value: 51 },
  { day: 'Чт', value: 74 },
  { day: 'Пт', value: 89 },
  { day: 'Сб', value: 96 },
  { day: 'Вс', value: 68 }
]

const weeklyMax = computed(() =>
  Math.max(...weeklyActivity.map(d => d.value))
)
</script>

<template>
  <div class="cv-ad">
    <header class="cv-ad__header">
      <div class="cv-ad__header-left">
        <span class="cv-ad__eyebrow">
          <span class="cv-ad__eyebrow-dot" aria-hidden="true"></span>
          Админ · Обзор
        </span>
        <h1 class="cv-ad__title">Обзор платформы</h1>
        <p class="cv-ad__subtitle">
          Ключевые показатели CarVibe в реальном времени
        </p>
      </div>
    </header>

    <BaseLoader v-if="!stats" text="Загрузка статистики..." />

    <template v-else>
      <!-- === СТАТИСТИКА === -->
      <section class="cv-ad__grid">
        <RouterLink
          v-for="card in statCards"
          :key="card.key"
          :to="card.to"
          class="cv-ad__stat"
          :data-accent="card.accent"
        >
          <span class="cv-ad__stat-icon" aria-hidden="true">
            <svg v-if="card.icon === 'users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <svg v-else-if="card.icon === 'car'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h12l2 5v3a2 2 0 0 1-2 2M5 17a2 2 0 0 0-2 2M19 17a2 2 0 0 1 2 2"/>
              <circle cx="7.5" cy="14.5" r="1.5"/>
              <circle cx="16.5" cy="14.5" r="1.5"/>
            </svg>
            <svg v-else-if="card.icon === 'check'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12.5l5 5L20 6"/>
            </svg>
            <svg v-else-if="card.icon === 'clock'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            <svg v-else-if="card.icon === 'chat'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </span>

          <div class="cv-ad__stat-body">
            <span class="cv-ad__stat-label">{{ card.label }}</span>
            <span class="cv-ad__stat-value">
              {{ card.value.toLocaleString('ru-RU') }}
            </span>
            <span class="cv-ad__stat-hint">{{ card.hint }}</span>
          </div>

          <span class="cv-ad__stat-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17L17 7M17 7H8M17 7v9"/>
            </svg>
          </span>
        </RouterLink>
      </section>

      <!-- === БЫСТРЫЕ ДЕЙСТВИЯ === -->
      <section class="cv-ad__section">
        <header class="cv-ad__section-head">
          <div>
            <span class="cv-ad__section-eyebrow">Требует внимания</span>
            <h2 class="cv-ad__section-title">Быстрые действия</h2>
          </div>
        </header>

        <div class="cv-ad__actions">
          <RouterLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="cv-ad__action"
            :data-accent="action.accent"
          >
            <span class="cv-ad__action-icon" aria-hidden="true">
              <svg v-if="action.icon === 'clock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
              <svg v-else-if="action.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>

              <span v-if="action.badge" class="cv-ad__action-badge">
                {{ action.badge }}
              </span>
            </span>

            <div class="cv-ad__action-body">
              <p class="cv-ad__action-title">{{ action.title }}</p>
              <p class="cv-ad__action-desc">{{ action.description }}</p>
            </div>

            <span class="cv-ad__action-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </RouterLink>
        </div>
      </section>

      <!-- === АКТИВНОСТЬ ЗА 7 ДНЕЙ === -->
      <section class="cv-ad__section">
        <header class="cv-ad__section-head">
          <div>
            <span class="cv-ad__section-eyebrow">Динамика</span>
            <h2 class="cv-ad__section-title">Активность за 7 дней</h2>
          </div>
          <div class="cv-ad__section-legend">
            <span class="cv-ad__legend-dot" aria-hidden="true"></span>
            <span>публикаций в день</span>
          </div>
        </header>

        <div class="cv-ad__chart">
          <div
            v-for="(item, idx) in weeklyActivity"
            :key="item.day"
            class="cv-ad__chart-bar"
            :style="{ '--delay': `${idx * 60}ms` }"
          >
            <div class="cv-ad__chart-bar-track">
              <div
                class="cv-ad__chart-bar-fill"
                :style="{ height: `${(item.value / weeklyMax) * 100}%` }"
              >
                <span class="cv-ad__chart-bar-value">{{ item.value }}</span>
              </div>
            </div>
            <span class="cv-ad__chart-bar-day">{{ item.day }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.cv-ad {
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* === HEADER === */
.cv-ad__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-ad__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-ad__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-ad__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAdDot 2.2s ease-in-out infinite;
}

@keyframes cvAdDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-ad__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-ad__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

/* === STATS GRID === */
.cv-ad__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-ad__stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ad__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cv-ad__stat::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(201, 169, 97, 0.1),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.cv-ad__stat:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-3px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(201, 169, 97, 0.14);
}

.cv-ad__stat:hover::before,
.cv-ad__stat:hover::after {
  opacity: 1;
}

.cv-ad__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 13px;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ad__stat:hover .cv-ad__stat-icon {
  transform: scale(1.06);
}

/* Accent variations */
.cv-ad__stat[data-accent="accent"] .cv-ad__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.15);
}

.cv-ad__stat[data-accent="info"] .cv-ad__stat-icon {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.14);
  border-color: rgba(106, 154, 194, 0.35);
  box-shadow: 0 0 24px rgba(106, 154, 194, 0.15);
}

.cv-ad__stat[data-accent="success"] .cv-ad__stat-icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.35);
  box-shadow: 0 0 24px rgba(122, 154, 106, 0.15);
}

.cv-ad__stat[data-accent="warning"] .cv-ad__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
  box-shadow: 0 0 24px rgba(217, 119, 6, 0.15);
}

.cv-ad__stat[data-accent="danger"] .cv-ad__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
  box-shadow: 0 0 24px rgba(184, 119, 85, 0.15);
}

.cv-ad__stat-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.cv-ad__stat-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

.cv-ad__stat-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-ad__stat-hint {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.45);
}

.cv-ad__stat-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  color: rgba(201, 169, 97, 0.5);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ad__stat:hover .cv-ad__stat-arrow {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  border-color: rgba(232, 213, 160, 0.5);
  transform: translate(2px, -2px);
}

/* === SECTIONS === */
.cv-ad__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cv-ad__section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-ad__section-eyebrow {
  display: block;
  margin-bottom: 4px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-ad__section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.2px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-ad__section-legend {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-ad__legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.7);
}

/* === QUICK ACTIONS === */
.cv-ad__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-ad__action {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ad__action::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-ad__action:hover {
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-3px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(201, 169, 97, 0.14);
}

.cv-ad__action-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ad__action:hover .cv-ad__action-icon {
  transform: scale(1.06);
}

.cv-ad__action[data-accent="accent"] .cv-ad__action-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-ad__action[data-accent="warning"] .cv-ad__action-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-ad__action[data-accent="danger"] .cv-ad__action-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-ad__action-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.1px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  box-shadow:
    0 0 0 2px #0E0E12,
    0 4px 12px rgba(201, 169, 97, 0.5);
  font-variant-numeric: tabular-nums;
}

.cv-ad__action-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.cv-ad__action-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-ad__action-desc {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-ad__action-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  color: rgba(201, 169, 97, 0.5);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ad__action:hover .cv-ad__action-arrow {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateX(3px);
}

/* === CHART === */
.cv-ad__chart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  padding: 24px 22px 18px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  min-height: 200px;
}

.cv-ad__chart::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-ad__chart-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  align-items: center;
}

.cv-ad__chart-bar-track {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 140px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.03);
  overflow: hidden;
}

.cv-ad__chart-bar-fill {
  position: relative;
  width: 100%;
  border-radius: 8px;
  background: linear-gradient(180deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 24px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  animation: cvAdBarRise 0.9s cubic-bezier(0.34, 1.2, 0.64, 1) backwards;
  animation-delay: var(--delay, 0ms);
  transition: filter 0.25s ease;
}

.cv-ad__chart-bar:hover .cv-ad__chart-bar-fill {
  filter: brightness(1.15);
}

@keyframes cvAdBarRise {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
    opacity: 1;
  }
}

.cv-ad__chart-bar-value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 20px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.1px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 2px 10px rgba(201, 169, 97, 0.4);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.cv-ad__chart-bar-day {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

/* === RESPONSIVE === */
@media (max-width: 1280px) {
  .cv-ad__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .cv-ad__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cv-ad__actions {
    grid-template-columns: 1fr;
  }
  .cv-ad__title {
    font-size: 26px;
    letter-spacing: -0.4px;
  }
}

@media (max-width: 768px) {
  .cv-ad {
    gap: 22px;
  }

  .cv-ad__title {
    font-size: 22px;
  }

  .cv-ad__subtitle {
    font-size: 12.5px;
  }

  .cv-ad__grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .cv-ad__stat {
    padding: 16px;
    gap: 12px;
  }

  .cv-ad__stat-icon {
    width: 42px;
    height: 42px;
    border-radius: 11px;
  }

  .cv-ad__stat-value {
    font-size: 22px;
  }

  .cv-ad__section-title {
    font-size: 16px;
  }

  .cv-ad__chart {
    padding: 18px 14px 14px;
    gap: 8px;
    min-height: 170px;
  }

  .cv-ad__chart-bar-track {
    height: 110px;
  }

  .cv-ad__chart-bar-value {
    min-width: 22px;
    height: 18px;
    font-size: 10px;
    top: -22px;
  }

  .cv-ad__chart-bar-day {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .cv-ad__title {
    font-size: 20px;
  }

  .cv-ad__chart {
    gap: 6px;
  }

  .cv-ad__chart-bar-track {
    height: 90px;
  }
}
</style>