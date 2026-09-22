<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const search = ref('')
const filters = ref({ action: '', actor: '' })
const activePeriod = ref('today')
const onlyCritical = ref(false)
const refreshing = ref(false)

const periods = [
  { key: 'today', label: 'Сегодня', days: 1 },
  { key: 'week', label: '7 дней', days: 7 },
  { key: 'month', label: '30 дней', days: 30 },
  { key: 'all', label: 'Всё время', days: null }
]

const criticalActions = [
  'block_user',
  'delete_announcement',
  'moderate_announcement',
  'unblock_user'
]

const actionConfig = {
  login: { label: 'Вход в систему', icon: 'login', color: 'accent' },
  logout: { label: 'Выход', icon: 'logout', color: 'neutral' },
  create_announcement: { label: 'Создание объявления', icon: 'plus', color: 'success' },
  update_announcement: { label: 'Обновление объявления', icon: 'edit', color: 'warning' },
  delete_announcement: { label: 'Удаление объявления', icon: 'trash', color: 'danger' },
  moderate_announcement: { label: 'Модерация объявления', icon: 'shield', color: 'warning' },
  block_user: { label: 'Блокировка пользователя', icon: 'lock', color: 'danger' },
  unblock_user: { label: 'Разблокировка пользователя', icon: 'unlock', color: 'success' },
  reply_feedback: { label: 'Ответ на обращение', icon: 'chat', color: 'accent' }
}

const columns = [
  { key: 'action', label: '', width: '48px', align: 'center' },
  { key: 'actor', label: 'Актор', width: '20%' },
  { key: 'event', label: 'Событие', width: '35%' },
  { key: 'ip', label: 'IP', width: '15%' },
  { key: 'createdAt', label: 'Дата', width: '20%' }
]

const filterConfig = computed(() => [
  {
    key: 'action',
    label: 'Действие',
    placeholder: 'Все действия',
    options: Object.entries(actionConfig).map(([value, cfg]) => ({
      value,
      label: cfg.label
    }))
  },
  {
    key: 'actor',
    label: 'Актор',
    placeholder: 'Все акторы',
    options: getActors()
  }
])

const stats = computed(() => {
  const items = filterByPeriod(adminStore.auditLogs)
  return {
    logins: items.filter(l => l.action === 'login').length,
    moderations: items.filter(l => l.action === 'moderate_announcement').length,
    blocks: items.filter(l => l.action === 'block_user').length,
    critical: items.filter(l => criticalActions.includes(l.action)).length
  }
})

const statCards = computed(() => [
  { key: 'logins', label: 'Входов', value: stats.value.logins, icon: 'login', accent: 'accent' },
  { key: 'moderations', label: 'Модераций', value: stats.value.moderations, icon: 'shield', accent: 'warning' },
  { key: 'blocks', label: 'Блокировок', value: stats.value.blocks, icon: 'lock', accent: 'danger' },
  { key: 'critical', label: 'Критичных', value: stats.value.critical, icon: 'alert', accent: 'danger' }
])

function getActors() {
  const actors = new Set()
  adminStore.auditLogs.forEach(log => {
    if (log.actorName) actors.add(log.actorName)
  })
  return Array.from(actors).map(name => ({ value: name, label: name }))
}

function filterByPeriod(logs) {
  const period = periods.find(p => p.key === activePeriod.value)
  if (!period?.days) return logs

  const cutoff = Date.now() - period.days * 24 * 60 * 60 * 1000
  return logs.filter(log => {
    if (!log.createdAt) return false
    return new Date(log.createdAt).getTime() >= cutoff
  })
}

const filteredLogs = computed(() => {
  let items = filterByPeriod(adminStore.auditLogs)

  if (onlyCritical.value) {
    items = items.filter(l => criticalActions.includes(l.action))
  }

  if (filters.value.action) {
    items = items.filter(l => l.action === filters.value.action)
  }

  if (filters.value.actor) {
    items = items.filter(l => l.actorName === filters.value.actor)
  }

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    items = items.filter(l =>
      l.actorName?.toLowerCase().includes(q) ||
      l.action?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q) ||
      l.ip?.toLowerCase().includes(q)
    )
  }

  return items
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { action: '', actor: '' }
  onlyCritical.value = false
}

function getActionConfig(action) {
  return actionConfig[action] || { label: action, icon: 'info', color: 'neutral' }
}

function isCritical(action) {
  return criticalActions.includes(action)
}

async function refresh() {
  refreshing.value = true
  try {
    await adminStore.fetchAuditLogs()
    toastStore.success('Журнал обновлён')
  } finally {
    refreshing.value = false
  }
}

function exportCSV() {
  const data = filteredLogs.value.map(log => ({
    ID: log.id,
    Актор: log.actorName || 'Система',
    Действие: getActionConfig(log.action).label,
    Объект: log.details || '',
    IP: log.ip || '',
    Дата: log.createdAt
  }))

  if (!data.length) {
    toastStore.error('Нет данных для экспорта')
    return
  }

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row =>
      Object.values(row)
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
  ].join('\n')

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audit-logs-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)

  toastStore.success('Экспорт готов')
}

function goToEntity(log) {
  if (!log.entityType || !log.entityId) return

  if (log.entityType === 'announcement') {
    router.push(`/admin/announcements/${log.entityId}`)
  } else if (log.entityType === 'user') {
    router.push(`/admin/users/${log.entityId}`)
  } else if (log.entityType === 'feedback') {
    router.push(`/admin/feedback/${log.entityId}`)
  }
}

onMounted(() => {
  adminStore.fetchAuditLogs()
})
</script>

<template>
  <div class="cv-aal">
    <header class="cv-aal__header">
      <div class="cv-aal__header-left">
        <span class="cv-aal__eyebrow">
          <span class="cv-aal__eyebrow-dot" aria-hidden="true"></span>
          Админ · Журнал действий
        </span>
        <h1 class="cv-aal__title">Журнал действий</h1>
        <p class="cv-aal__subtitle">
          <strong>{{ filteredLogs.length.toLocaleString('ru-RU') }}</strong> записей
          <template v-if="activePeriod !== 'all'">
            · за {{ periods.find(p => p.key === activePeriod)?.label.toLowerCase() }}
          </template>
        </p>
      </div>

      <div class="cv-aal__header-actions">
        <BaseButton variant="outline" :loading="refreshing" @click="refresh">
          <svg v-if="!refreshing" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
            <path d="M21 3v5h-5"/>
          </svg>
          Обновить
        </BaseButton>

        <BaseButton variant="outline" @click="exportCSV">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <path d="M7 10l5 5 5-5"/>
            <path d="M12 15V3"/>
          </svg>
          Экспорт CSV
        </BaseButton>
      </div>
    </header>

    <section class="cv-aal__stats">
      <div
        v-for="stat in statCards"
        :key="stat.key"
        class="cv-aal__stat"
        :data-accent="stat.accent"
      >
        <span class="cv-aal__stat-icon" aria-hidden="true">
          <svg v-if="stat.icon === 'login'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
          </svg>
          <svg v-else-if="stat.icon === 'shield'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <svg v-else-if="stat.icon === 'lock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2"/>
            <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </span>

        <div class="cv-aal__stat-content">
          <span class="cv-aal__stat-value">{{ stat.value.toLocaleString('ru-RU') }}</span>
          <span class="cv-aal__stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="cv-aal__periods">
      <button
        v-for="period in periods"
        :key="period.key"
        type="button"
        class="cv-aal__period"
        :class="{ 'cv-aal__period--active': activePeriod === period.key }"
        @click="activePeriod = period.key"
      >
        {{ period.label }}
      </button>
    </section>

    <div class="cv-aal__toolbar">
      <AdminFilters
        v-model:search="search"
        :filters="filterConfig"
        :active-filters="filters"
        @update:filter="handleFilter"
        @reset="resetFilters"
      />

      <button
        type="button"
        class="cv-aal__critical-toggle"
        :class="{ 'cv-aal__critical-toggle--active': onlyCritical }"
        @click="onlyCritical = !onlyCritical"
      >
        <span class="cv-aal__critical-toggle-box">
          <svg v-if="onlyCritical" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
        </span>
        Только критичные
      </button>
    </div>

    <div class="cv-aal__table-wrap">
      <AdminTable
        :columns="columns"
        :items="filteredLogs"
        :loading="adminStore.loading"
        empty-text="Записи не найдены"
        :empty-icon="'search'"
        empty-hint="Попробуйте изменить фильтры или выбрать другой период"
      >
        <template #action="{ item }">
          <span
            class="cv-aal__action-dot"
            :data-color="getActionConfig(item.action).color"
            :title="getActionConfig(item.action).label"
          >
            <span class="cv-aal__action-dot-icon" aria-hidden="true">
              <svg v-if="getActionConfig(item.action).icon === 'login'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <path d="M10 17l5-5-5-5"/>
                <path d="M15 12H3"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'logout'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <path d="M16 17l5-5-5-5"/>
                <path d="M21 12H9"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'plus'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'edit'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3l5 5-11 11H5v-5z"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'trash'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'shield'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'lock'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'unlock'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 7.5-2"/>
              </svg>
              <svg v-else-if="getActionConfig(item.action).icon === 'chat'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              </svg>
              <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </span>
          </span>
        </template>

        <template #actor="{ item }">
          <div class="cv-aal__actor">
            <span class="cv-aal__actor-avatar">
              {{ (item.actorName || 'С').charAt(0).toUpperCase() }}
            </span>
            <span class="cv-aal__actor-name">
              {{ item.actorName || 'Система' }}
            </span>
          </div>
        </template>

        <template #event="{ item }">
          <div class="cv-aal__event">
            <span
              class="cv-aal__event-label"
              :data-color="getActionConfig(item.action).color"
            >
              {{ getActionConfig(item.action).label }}
            </span>

            <span
              v-if="item.details"
              class="cv-aal__event-details"
              :class="{ 'cv-aal__event-details--link': item.entityType && item.entityId }"
              @click.stop="goToEntity(item)"
            >
              {{ item.details }}
              <svg v-if="item.entityType && item.entityId" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </div>
        </template>

        <template #ip="{ item }">
          <span class="cv-aal__ip">{{ item.ip || '—' }}</span>
        </template>

        <template #createdAt="{ item }">
          <span class="cv-aal__date">
            {{ formatDate(item.createdAt, 'datetime') }}
          </span>
        </template>
      </AdminTable>
    </div>
  </div>
</template>

<style scoped>
.cv-aal {
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-aal__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-aal__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-aal__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-aal__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAalDot 2.2s ease-in-out infinite;
}

@keyframes cvAalDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-aal__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-aal__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.6);
}

.cv-aal__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-aal__header-actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
}

.cv-aal__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-aal__stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-aal__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-aal__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 11px;
  border: 1px solid;
}

.cv-aal__stat[data-accent="accent"] .cv-aal__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-aal__stat[data-accent="warning"] .cv-aal__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-aal__stat[data-accent="danger"] .cv-aal__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-aal__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-aal__stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-aal__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-aal__periods {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  align-self: flex-start;
  flex-wrap: wrap;
}

.cv-aal__period {
  padding: 8px 16px;
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
}

.cv-aal__period:hover:not(.cv-aal__period--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-aal__period--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-aal__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-aal__critical-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-aal__critical-toggle:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-aal__critical-toggle--active {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.4);
}

.cv-aal__critical-toggle-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 6px;
  color: #1A1208;
  background: rgba(255, 255, 255, 0.04);
  border: 1.5px solid rgba(201, 169, 97, 0.32);
  transition: all 0.2s ease;
}

.cv-aal__critical-toggle--active .cv-aal__critical-toggle-box {
  background: linear-gradient(135deg, #E8A88A, #B87755);
  border-color: rgba(232, 168, 138, 0.55);
  box-shadow: 0 2px 8px rgba(184, 119, 85, 0.4);
}

.cv-aal__table-wrap {
  position: relative;
}

.cv-aal__action-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  border: 1px solid;
}

.cv-aal__action-dot[data-color="accent"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-aal__action-dot[data-color="success"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-aal__action-dot[data-color="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-aal__action-dot[data-color="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-aal__action-dot[data-color="neutral"] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-aal__action-dot-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.cv-aal__actor {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-aal__actor-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95);
}

.cv-aal__actor-name {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aal__event {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cv-aal__event-label {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
}

.cv-aal__event-label[data-color="accent"] { color: #E8D5A0; }
.cv-aal__event-label[data-color="success"] { color: #B8CEA8; }
.cv-aal__event-label[data-color="warning"] { color: #F0C080; }
.cv-aal__event-label[data-color="danger"] { color: #E8A88A; }
.cv-aal__event-label[data-color="neutral"] { color: rgba(220, 210, 195, 0.8); }

.cv-aal__event-details {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aal__event-details--link {
  color: #E8D5A0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.cv-aal__event-details--link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-aal__ip {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: rgba(220, 210, 195, 0.65);
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.cv-aal__date {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .cv-aal__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-aal__title { font-size: 26px; letter-spacing: -0.4px; }
}

@media (max-width: 768px) {
  .cv-aal { gap: 16px; }
  .cv-aal__title { font-size: 22px; }
  .cv-aal__subtitle { font-size: 12.5px; }

  .cv-aal__header-actions { width: 100%; flex-direction: column; }
  .cv-aal__header-actions > * { width: 100%; }

  .cv-aal__stats { gap: 10px; }
  .cv-aal__stat { padding: 12px 14px; gap: 10px; }
  .cv-aal__stat-icon { width: 36px; height: 36px; }
  .cv-aal__stat-value { font-size: 18px; }
  .cv-aal__stat-label { font-size: 10.5px; }

  .cv-aal__periods { width: 100%; }
  .cv-aal__period { flex: 1; text-align: center; padding: 8px 12px; }

  .cv-aal__toolbar { flex-direction: column; align-items: stretch; }
  .cv-aal__critical-toggle { width: 100%; justify-content: center; }
}

@media (max-width: 480px) {
  .cv-aal__title { font-size: 20px; }
  .cv-aal__stats { grid-template-columns: 1fr; }
  .cv-aal__periods { padding: 5px; gap: 4px; }
  .cv-aal__period { padding: 7px 10px; font-size: 11.5px; }
}
</style>