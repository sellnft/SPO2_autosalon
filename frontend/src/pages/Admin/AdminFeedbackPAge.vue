<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { formatDate } from '@/utils/formatDate'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const adminStore = useAdminStore()

const search = ref('')
const filters = ref({ status: '', priority: '' })
const activeTab = ref('all')
const sortBy = ref('updatedAt-desc')

const columns = [
  { key: 'subject', label: 'Обращение', width: '40%' },
  { key: 'user', label: 'Пользователь', width: '20%' },
  { key: 'priority', label: 'Приоритет', width: '13%' },
  { key: 'status', label: 'Статус', width: '15%' },
  { key: 'updatedAt', label: 'Обновлено', width: '12%' }
]

const filterConfig = [
  {
    key: 'priority',
    placeholder: 'Все приоритеты',
    options: [
      { value: 'low', label: 'Низкий' },
      { value: 'normal', label: 'Обычный' },
      { value: 'high', label: 'Высокий' },
      { value: 'critical', label: 'Критический' }
    ]
  }
]

const stats = computed(() => {
  const items = adminStore.feedback
  return {
    total: items.length,
    open: items.filter(f => f.status === 'open').length,
    inProgress: items.filter(f => f.status === 'in_progress').length,
    waiting: items.filter(f => f.status === 'waiting_user').length,
    resolved: items.filter(f => f.status === 'resolved').length,
    closed: items.filter(f => f.status === 'closed').length,
    critical: items.filter(f => f.priority === 'critical').length
  }
})

const statCards = computed(() => [
  {
    key: 'open',
    label: 'Открытых',
    value: stats.value.open,
    icon: 'inbox',
    accent: 'accent'
  },
  {
    key: 'in_progress',
    label: 'В работе',
    value: stats.value.inProgress,
    icon: 'clock',
    accent: 'warning'
  },
  {
    key: 'waiting_user',
    label: 'Ждут ответа',
    value: stats.value.waiting,
    icon: 'chat',
    accent: 'info'
  },
  {
    key: 'critical',
    label: 'Критических',
    value: stats.value.critical,
    icon: 'alert',
    accent: 'danger'
  }
])

const tabs = computed(() => [
  { key: 'all', label: 'Все', count: stats.value.total, color: 'neutral' },
  { key: 'open', label: 'Открытые', count: stats.value.open, color: 'accent' },
  { key: 'in_progress', label: 'В работе', count: stats.value.inProgress, color: 'warning' },
  { key: 'waiting_user', label: 'Ждут ответа', count: stats.value.waiting, color: 'info' },
  { key: 'resolved', label: 'Решённые', count: stats.value.resolved, color: 'success' },
  { key: 'closed', label: 'Закрытые', count: stats.value.closed, color: 'neutral' }
])

const sortOptions = [
  { key: 'updatedAt-desc', label: 'Недавно обновлённые' },
  { key: 'updatedAt-asc', label: 'Давно обновлённые' },
  { key: 'createdAt-desc', label: 'Новые сначала' },
  { key: 'priority-desc', label: 'По приоритету' }
]

const priorityWeight = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1
}

const priorityConfig = {
  low: { label: 'Низкий', icon: 'arrow-down', accent: 'muted' },
  normal: { label: 'Обычный', icon: 'minus', accent: 'info' },
  high: { label: 'Высокий', icon: 'arrow-up', accent: 'warning' },
  critical: { label: 'Критический', icon: 'alert', accent: 'danger' }
}

const filteredFeedback = computed(() => {
  let items = adminStore.feedback

  if (activeTab.value !== 'all') {
    items = items.filter(f => f.status === activeTab.value)
  }

  if (filters.value.status && activeTab.value === 'all') {
    items = items.filter(f => f.status === filters.value.status)
  }

  if (filters.value.priority) {
    items = items.filter(f => f.priority === filters.value.priority)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    items = items.filter(f =>
      f.subject?.toLowerCase().includes(q) ||
      f.userName?.toLowerCase().includes(q) ||
      String(f.id).includes(q)
    )
  }

  const [field, order] = sortBy.value.split('-')
  items = [...items].sort((a, b) => {
    if (field === 'priority') {
      return order === 'desc'
        ? (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        : (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0)
    }
    const av = new Date(a[field] || 0).getTime()
    const bv = new Date(b[field] || 0).getTime()
    return order === 'desc' ? bv - av : av - bv
  })

  return items
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { status: '', priority: '' }
  activeTab.value = 'all'
}

function handleTabChange(tabKey) {
  activeTab.value = tabKey
  filters.value.status = ''
}

function goToFeedback(feedback) {
  router.push(`/admin/feedback/${feedback.id}`)
}

onMounted(() => {
  adminStore.fetchFeedback()
})
</script>

<template>
  <div class="cv-af">
    <!-- === HEADER === -->
    <header class="cv-af__header">
      <div class="cv-af__header-left">
        <span class="cv-af__eyebrow">
          <span class="cv-af__eyebrow-dot" aria-hidden="true"></span>
          Админ · Обращения
        </span>
        <h1 class="cv-af__title">Обращения</h1>
        <p class="cv-af__subtitle">
          Всего <strong>{{ stats.total.toLocaleString('ru-RU') }}</strong>
          <template v-if="stats.open">
            · <strong class="cv-af__subtitle-accent">{{ stats.open }} открыто</strong>
          </template>
          <template v-if="stats.critical">
            · <strong class="cv-af__subtitle-danger">{{ stats.critical }} критичных</strong>
          </template>
        </p>
      </div>
    </header>

    <!-- === STAT CARDS === -->
    <section class="cv-af__stats">
      <button
        v-for="stat in statCards"
        :key="stat.key"
        type="button"
        class="cv-af__stat"
        :data-accent="stat.accent"
        @click="handleTabChange(stat.key)"
      >
        <span class="cv-af__stat-icon" aria-hidden="true">
          <svg v-if="stat.icon === 'inbox'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
            <path d="M5.5 5.5h13l3.5 6.5v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l3.5-6.5z"/>
          </svg>
          <svg v-else-if="stat.icon === 'clock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
          </svg>
          <svg v-else-if="stat.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4M12 17h.01"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          </svg>
        </span>

        <div class="cv-af__stat-content">
          <span class="cv-af__stat-value">{{ stat.value.toLocaleString('ru-RU') }}</span>
          <span class="cv-af__stat-label">{{ stat.label }}</span>
        </div>
      </button>
    </section>

    <!-- === TABS === -->
    <section class="cv-af__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="cv-af__tab"
        :class="{ 'cv-af__tab--active': activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        <span class="cv-af__tab-label">{{ tab.label }}</span>
        <span class="cv-af__tab-count">{{ tab.count }}</span>
      </button>
    </section>

    <!-- === TOOLBAR === -->
    <div class="cv-af__toolbar">
      <AdminFilters
        v-model:search="search"
        :filters="filterConfig"
        :active-filters="filters"
        @update:filter="handleFilter"
        @reset="resetFilters"
      />

      <div class="cv-af__toolbar-right">
        <div class="cv-af__sort">
          <select v-model="sortBy" class="cv-af__sort-select">
            <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
              {{ opt.label }}
            </option>
          </select>
          <span class="cv-af__sort-arrow" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- === TABLE === -->
    <div class="cv-af__table-wrap">
      <AdminTable
        :columns="columns"
        :items="filteredFeedback"
        :loading="adminStore.loading"
        empty-text="Обращения не найдены"
        empty-icon="chat"
        empty-hint="Попробуйте изменить фильтры или сбросить поиск"
        @row-click="goToFeedback"
      >
        <template #subject="{ item }">
          <div class="cv-af__subject">
            <p class="cv-af__subject-title">{{ item.subject }}</p>
            <span class="cv-af__subject-id">#{{ item.id }}</span>
          </div>
        </template>

        <template #user="{ item }">
          <div class="cv-af__user">
            <span class="cv-af__user-avatar">
              {{ item.userName?.charAt(0) || '?' }}
            </span>
            <span class="cv-af__user-name">{{ item.userName || 'Не указан' }}</span>
          </div>
        </template>

        <template #priority="{ item }">
          <span
            class="cv-af__priority"
            :data-accent="priorityConfig[item.priority]?.accent || 'muted'"
          >
            <span class="cv-af__priority-icon" aria-hidden="true">
              <svg v-if="priorityConfig[item.priority]?.icon === 'arrow-up'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <svg v-else-if="priorityConfig[item.priority]?.icon === 'arrow-down'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              <svg v-else-if="priorityConfig[item.priority]?.icon === 'alert'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 9v4M12 17h.01"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
              <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
              </svg>
            </span>
            {{ priorityConfig[item.priority]?.label || item.priority }}
          </span>
        </template>

        <template #status="{ item }">
          <AdminStatusBadge :status="item.status" type="feedback" />
        </template>

        <template #updatedAt="{ item }">
          <span class="cv-af__date">{{ formatDate(item.updatedAt, 'relative') }}</span>
        </template>
      </AdminTable>
    </div>
  </div>
</template>

<style scoped>
.cv-af {
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* === HEADER === */
.cv-af__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-af__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-af__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-af__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAfDot 2.2s ease-in-out infinite;
}

@keyframes cvAfDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-af__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-af__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.6);
}

.cv-af__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-af__subtitle-accent {
  color: #E8D5A0 !important;
}

.cv-af__subtitle-danger {
  color: #E8A88A !important;
}

/* === STATS === */
.cv-af__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-af__stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
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

.cv-af__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-af__stat:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.cv-af__stat:active {
  transform: translateY(-1px) scale(0.98);
}

.cv-af__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 11px;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-af__stat:hover .cv-af__stat-icon {
  transform: scale(1.06);
}

.cv-af__stat[data-accent="accent"] .cv-af__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.15);
}

.cv-af__stat[data-accent="warning"] .cv-af__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
  box-shadow: 0 0 24px rgba(217, 119, 6, 0.15);
}

.cv-af__stat[data-accent="info"] .cv-af__stat-icon {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.14);
  border-color: rgba(106, 154, 194, 0.35);
  box-shadow: 0 0 24px rgba(106, 154, 194, 0.15);
}

.cv-af__stat[data-accent="danger"] .cv-af__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
  box-shadow: 0 0 24px rgba(184, 119, 85, 0.15);
}

.cv-af__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-af__stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-af__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

/* === TABS === */
.cv-af__tabs {
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

.cv-af__tabs::-webkit-scrollbar { display: none; }

.cv-af__tab {
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

.cv-af__tab:hover:not(.cv-af__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-af__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-af__tab-label {
  white-space: nowrap;
}

.cv-af__tab-count {
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

.cv-af__tab--active .cv-af__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

/* === TOOLBAR === */
.cv-af__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-af__toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-af__sort {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cv-af__sort-select {
  padding: 10px 32px 10px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.85);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.22s ease;
  min-width: 190px;
}

.cv-af__sort-select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-af__sort-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
}

.cv-af__sort-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
}

.cv-af__sort-arrow {
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

/* === TABLE CELLS === */
.cv-af__subject {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cv-af__subject-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-af__subject-id {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 1px 7px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(201, 169, 97, 0.75);
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 5px;
}

.cv-af__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-af__user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
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

.cv-af__user-name {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-af__priority {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.3px;
  border-radius: 999px;
  border: 1px solid;
  white-space: nowrap;
}

.cv-af__priority-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cv-af__priority[data-accent="muted"] {
  color: rgba(200, 190, 175, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.cv-af__priority[data-accent="info"] {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.12);
  border-color: rgba(106, 154, 194, 0.32);
}

.cv-af__priority[data-accent="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-af__priority[data-accent="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-af__priority[data-accent="danger"] .cv-af__priority-icon {
  animation: cvAfAlert 1.8s ease-in-out infinite;
}

@keyframes cvAfAlert {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.cv-af__date {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
  white-space: nowrap;
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .cv-af__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-af__title { font-size: 26px; letter-spacing: -0.4px; }
}

@media (max-width: 768px) {
  .cv-af { gap: 16px; }
  .cv-af__title { font-size: 22px; }
  .cv-af__subtitle { font-size: 12.5px; }

  .cv-af__stats { gap: 10px; }
  .cv-af__stat { padding: 12px 14px; gap: 10px; }
  .cv-af__stat-icon { width: 36px; height: 36px; }
  .cv-af__stat-value { font-size: 18px; }
  .cv-af__stat-label { font-size: 10.5px; }

  .cv-af__tabs { padding: 5px; gap: 4px; }
  .cv-af__tab { padding: 8px 12px; font-size: 12px; gap: 6px; }
  .cv-af__tab-count { min-width: 20px; height: 18px; font-size: 10px; padding: 0 6px; }

  .cv-af__toolbar { flex-direction: column; align-items: stretch; }
  .cv-af__toolbar-right { width: 100%; }
  .cv-af__sort { width: 100%; }
  .cv-af__sort-select { width: 100%; min-width: 0; }
}

@media (max-width: 480px) {
  .cv-af__title { font-size: 20px; }
  .cv-af__stats { grid-template-columns: 1fr; }
}
</style>