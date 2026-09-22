<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDate } from '@/utils/formatDate'

const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const search = ref('')
const filters = ref({ role: '', status: '' })
const activeTab = ref('all')
const sortBy = ref('createdAt-desc')

const columns = [
  { key: 'user', label: 'Пользователь', width: '30%' },
  { key: 'city', label: 'Город', width: '15%' },
  { key: 'role', label: 'Роль', width: '13%' },
  { key: 'status', label: 'Статус', width: '13%' },
  { key: 'announcementsCount', label: 'Объявлений', width: '11%', align: 'center' },
  { key: 'createdAt', label: 'Регистрация', width: '18%' }
]

const filterConfig = [
  {
    key: 'role',
    placeholder: 'Все роли',
    options: [
      { value: 'user', label: 'Пользователь' },
      { value: 'admin', label: 'Администратор' }
    ]
  }
]

const stats = computed(() => {
  const items = adminStore.users
  return {
    total: items.length,
    active: items.filter(u => u.status === 'active').length,
    blocked: items.filter(u => u.status === 'blocked').length,
    admins: items.filter(u => u.role === 'admin').length
  }
})

const statCards = computed(() => [
  {
    key: 'all',
    label: 'Всего',
    value: stats.value.total,
    icon: 'users',
    accent: 'accent'
  },
  {
    key: 'active',
    label: 'Активные',
    value: stats.value.active,
    icon: 'check',
    accent: 'success'
  },
  {
    key: 'blocked',
    label: 'Заблокированные',
    value: stats.value.blocked,
    icon: 'lock',
    accent: 'danger'
  },
  {
    key: 'admins',
    label: 'Администраторы',
    value: stats.value.admins,
    icon: 'shield',
    accent: 'info'
  }
])

const tabs = computed(() => [
  { key: 'all', label: 'Все', count: stats.value.total, color: 'neutral' },
  { key: 'active', label: 'Активные', count: stats.value.active, color: 'success' },
  { key: 'blocked', label: 'Заблокированные', count: stats.value.blocked, color: 'danger' },
  { key: 'admins', label: 'Администраторы', count: stats.value.admins, color: 'info' }
])

const sortOptions = [
  { key: 'createdAt-desc', label: 'Новые сначала' },
  { key: 'createdAt-asc', label: 'Старые сначала' },
  { key: 'name-asc', label: 'По имени (А-Я)' },
  { key: 'announcementsCount-desc', label: 'Больше объявлений' }
]

const filteredUsers = computed(() => {
  let items = adminStore.users

  if (activeTab.value === 'active') {
    items = items.filter(u => u.status === 'active')
  } else if (activeTab.value === 'blocked') {
    items = items.filter(u => u.status === 'blocked')
  } else if (activeTab.value === 'admins') {
    items = items.filter(u => u.role === 'admin')
  }

  if (filters.value.role && activeTab.value !== 'admins') {
    items = items.filter(u => u.role === filters.value.role)
  }

  if (filters.value.status && activeTab.value === 'all') {
    items = items.filter(u => u.status === filters.value.status)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    items = items.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    )
  }

  const [field, order] = sortBy.value.split('-')
  items = [...items].sort((a, b) => {
    if (field === 'createdAt') {
      const av = new Date(a.createdAt || 0).getTime()
      const bv = new Date(b.createdAt || 0).getTime()
      return order === 'desc' ? bv - av : av - bv
    }
    if (field === 'name') {
      const av = (a.name || '').toLowerCase()
      const bv = (b.name || '').toLowerCase()
      return order === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
    }
    const av = a[field] ?? 0
    const bv = b[field] ?? 0
    return order === 'desc' ? bv - av : av - bv
  })

  return items
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { role: '', status: '' }
  activeTab.value = 'all'
}

function handleTabChange(tabKey) {
  activeTab.value = tabKey
  filters.value.role = ''
  filters.value.status = ''
}

function goToUser(user) {
  router.push(`/admin/users/${user.id}`)
}

function exportCSV() {
  const data = filteredUsers.value.map(u => ({
    ID: u.id,
    Имя: u.name,
    Email: u.email,
    Телефон: u.phone,
    Город: u.city,
    Роль: u.role,
    Статус: u.status,
    Объявлений: u.announcementsCount,
    Регистрация: u.createdAt
  }))

  const csv = [
    Object.keys(data[0] || {}).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `users-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)

  toastStore.success('Экспорт готов')
}

onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<template>
  <div class="cv-au">
    <!-- === HEADER === -->
    <header class="cv-au__header">
      <div class="cv-au__header-left">
        <span class="cv-au__eyebrow">
          <span class="cv-au__eyebrow-dot" aria-hidden="true"></span>
          Админ · Пользователи
        </span>
        <h1 class="cv-au__title">Пользователи</h1>
        <p class="cv-au__subtitle">
          Всего <strong>{{ stats.total.toLocaleString('ru-RU') }}</strong>
          <template v-if="stats.blocked">
            · <strong class="cv-au__subtitle-danger">{{ stats.blocked }} заблокировано</strong>
          </template>
          <template v-if="stats.admins">
            · <strong class="cv-au__subtitle-info">{{ stats.admins }} админов</strong>
          </template>
        </p>
      </div>

      <div class="cv-au__header-actions">
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

    <!-- === STAT CARDS === -->
    <section class="cv-au__stats">
      <button
        v-for="stat in statCards"
        :key="stat.key"
        type="button"
        class="cv-au__stat"
        :data-accent="stat.accent"
        @click="handleTabChange(stat.key)"
      >
        <span class="cv-au__stat-icon" aria-hidden="true">
          <svg v-if="stat.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <svg v-else-if="stat.icon === 'check'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          <svg v-else-if="stat.icon === 'lock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2"/>
            <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </span>

        <div class="cv-au__stat-content">
          <span class="cv-au__stat-value">{{ stat.value.toLocaleString('ru-RU') }}</span>
          <span class="cv-au__stat-label">{{ stat.label }}</span>
        </div>
      </button>
    </section>

    <!-- === TABS === -->
    <section class="cv-au__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="cv-au__tab"
        :class="{ 'cv-au__tab--active': activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        <span class="cv-au__tab-label">{{ tab.label }}</span>
        <span class="cv-au__tab-count">{{ tab.count }}</span>
      </button>
    </section>

    <!-- === TOOLBAR === -->
    <div class="cv-au__toolbar">
      <AdminFilters
        v-model:search="search"
        :filters="filterConfig"
        :active-filters="filters"
        @update:filter="handleFilter"
        @reset="resetFilters"
      />

      <div class="cv-au__toolbar-right">
        <div class="cv-au__sort">
          <select v-model="sortBy" class="cv-au__sort-select">
            <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
              {{ opt.label }}
            </option>
          </select>
          <span class="cv-au__sort-arrow" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- === TABLE === -->
    <div class="cv-au__table-wrap">
      <AdminTable
        :columns="columns"
        :items="filteredUsers"
        :loading="adminStore.loading"
        empty-text="Пользователи не найдены"
        empty-icon="users"
        empty-hint="Попробуйте изменить фильтры или сбросить поиск"
        @row-click="goToUser"
      >
        <template #user="{ item }">
          <div class="cv-au__user">
            <span class="cv-au__avatar" :data-role="item.role">
              {{ item.name?.charAt(0) || '?' }}
            </span>
            <div class="cv-au__user-info">
              <p class="cv-au__name">{{ item.name }}</p>
              <p class="cv-au__email">{{ item.email }}</p>
            </div>
          </div>
        </template>

        <template #city="{ item }">
          <span class="cv-au__city">{{ item.city || '—' }}</span>
        </template>

        <template #role="{ item }">
          <span
            class="cv-au__role"
            :data-role="item.role"
          >
            <span class="cv-au__role-icon" aria-hidden="true">
              <svg v-if="item.role === 'admin'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
              </svg>
              <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            {{ item.role === 'admin' ? 'Админ' : 'Пользователь' }}
          </span>
        </template>

        <template #status="{ item }">
          <AdminStatusBadge :status="item.status" type="user" />
        </template>

        <template #announcementsCount="{ item }">
          <span
            class="cv-au__count"
            :class="{ 'cv-au__count--empty': !item.announcementsCount }"
          >
            {{ item.announcementsCount || 0 }}
          </span>
        </template>

        <template #createdAt="{ item }">
          <span class="cv-au__date">{{ formatDate(item.createdAt, 'short') }}</span>
        </template>
      </AdminTable>
    </div>
  </div>
</template>

<style scoped>
.cv-au {
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* === HEADER === */
.cv-au__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-au__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-au__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-au__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAuDot 2.2s ease-in-out infinite;
}

@keyframes cvAuDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-au__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-au__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.6);
}

.cv-au__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-au__subtitle-danger {
  color: #E8A88A !important;
}

.cv-au__subtitle-info {
  color: #B8D4E8 !important;
}

.cv-au__header-actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
}

/* === STATS === */
.cv-au__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-au__stat {
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

.cv-au__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-au__stat:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
}

.cv-au__stat:active {
  transform: translateY(-1px) scale(0.98);
}

.cv-au__stat-icon {
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

.cv-au__stat:hover .cv-au__stat-icon {
  transform: scale(1.06);
}

.cv-au__stat[data-accent="accent"] .cv-au__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.15);
}

.cv-au__stat[data-accent="success"] .cv-au__stat-icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.35);
  box-shadow: 0 0 24px rgba(122, 154, 106, 0.15);
}

.cv-au__stat[data-accent="danger"] .cv-au__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
  box-shadow: 0 0 24px rgba(184, 119, 85, 0.15);
}

.cv-au__stat[data-accent="info"] .cv-au__stat-icon {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.14);
  border-color: rgba(106, 154, 194, 0.35);
  box-shadow: 0 0 24px rgba(106, 154, 194, 0.15);
}

.cv-au__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-au__stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-au__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

/* === TABS === */
.cv-au__tabs {
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

.cv-au__tabs::-webkit-scrollbar { display: none; }

.cv-au__tab {
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

.cv-au__tab:hover:not(.cv-au__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-au__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-au__tab-label { white-space: nowrap; }

.cv-au__tab-count {
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

.cv-au__tab--active .cv-au__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

/* === TOOLBAR === */
.cv-au__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-au__toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-au__sort {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cv-au__sort-select {
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
  min-width: 180px;
}

.cv-au__sort-select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-au__sort-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
}

.cv-au__sort-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
}

.cv-au__sort-arrow {
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
.cv-au__user {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.cv-au__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95);
}

.cv-au__avatar[data-role="admin"] {
  box-shadow:
    0 0 0 1.5px rgba(184, 212, 232, 0.6),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 0 16px rgba(106, 154, 194, 0.5);
}

.cv-au__user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-au__name {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-au__email {
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-au__city {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
}

.cv-au__role {
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

.cv-au__role-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.cv-au__role[data-role="user"] {
  color: rgba(200, 190, 175, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.cv-au__role[data-role="admin"] {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 2px 10px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-au__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 9px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  border-radius: 999px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
  font-variant-numeric: tabular-nums;
}

.cv-au__count--empty {
  color: rgba(200, 190, 175, 0.4);
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
}

.cv-au__date {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
  white-space: nowrap;
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .cv-au__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-au__title { font-size: 26px; letter-spacing: -0.4px; }
}

@media (max-width: 768px) {
  .cv-au { gap: 16px; }
  .cv-au__title { font-size: 22px; }
  .cv-au__subtitle { font-size: 12.5px; }
  .cv-au__header-actions { width: 100%; }
  .cv-au__header-actions > * { width: 100%; }

  .cv-au__stats { gap: 10px; }
  .cv-au__stat { padding: 12px 14px; gap: 10px; }
  .cv-au__stat-icon { width: 36px; height: 36px; }
  .cv-au__stat-value { font-size: 18px; }
  .cv-au__stat-label { font-size: 10.5px; }

  .cv-au__tabs { padding: 5px; gap: 4px; }
  .cv-au__tab { padding: 8px 12px; font-size: 12px; gap: 6px; }
  .cv-au__tab-count { min-width: 20px; height: 18px; font-size: 10px; padding: 0 6px; }

  .cv-au__toolbar { flex-direction: column; align-items: stretch; }
  .cv-au__toolbar-right { width: 100%; }
  .cv-au__sort { width: 100%; }
  .cv-au__sort-select { width: 100%; min-width: 0; }
}

@media (max-width: 480px) {
  .cv-au__title { font-size: 20px; }
  .cv-au__stats { grid-template-columns: 1fr; }
}
</style>