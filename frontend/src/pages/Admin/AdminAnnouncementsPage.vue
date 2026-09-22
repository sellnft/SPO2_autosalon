<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate } from '@/utils/formatDate'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const search = ref('')
const filters = ref({ status: '', brand: '' })
const activeTab = ref('all')
const sortBy = ref('createdAt-desc')
const selectedIds = ref([])
const bulkLoading = ref(false)

const columns = [
  { key: 'select', label: '', width: '48px', align: 'center' },
  { key: 'announcement', label: 'Объявление', width: '35%' },
  { key: 'price', label: 'Цена', width: '15%' },
  { key: 'seller', label: 'Продавец', width: '18%' },
  { key: 'status', label: 'Статус', width: '15%' },
  { key: 'createdAt', label: 'Создано', width: '12%' }
]

const filterConfig = [
  {
    key: 'status',
    placeholder: 'Все статусы',
    options: [
      { value: 'active', label: 'Опубликовано' },
      { value: 'pending', label: 'На модерации' },
      { value: 'rejected', label: 'Отклонено' },
      { value: 'blocked', label: 'Заблокировано' },
      { value: 'sold', label: 'Продано' }
    ]
  }
]

const stats = computed(() => {
  const items = adminStore.announcements
  return {
    total: items.length,
    pending: items.filter(a => a.status === 'pending').length,
    active: items.filter(a => a.status === 'active').length,
    rejected: items.filter(a => a.status === 'rejected').length,
    blocked: items.filter(a => a.status === 'blocked').length,
    sold: items.filter(a => a.status === 'sold').length
  }
})

const tabs = computed(() => [
  { key: 'all', label: 'Все', count: stats.value.total, color: 'neutral' },
  { key: 'pending', label: 'На модерации', count: stats.value.pending, color: 'warning' },
  { key: 'active', label: 'Активные', count: stats.value.active, color: 'success' },
  { key: 'rejected', label: 'Отклонённые', count: stats.value.rejected, color: 'danger' },
  { key: 'blocked', label: 'Заблокированные', count: stats.value.blocked, color: 'danger' },
  { key: 'sold', label: 'Проданные', count: stats.value.sold, color: 'neutral' }
])

const statCards = computed(() => [
  {
    key: 'pending',
    label: 'На модерации',
    value: stats.value.pending,
    icon: 'clock',
    accent: 'warning'
  },
  {
    key: 'active',
    label: 'Активных',
    value: stats.value.active,
    icon: 'check',
    accent: 'success'
  },
  {
    key: 'rejected',
    label: 'Отклонено',
    value: stats.value.rejected,
    icon: 'x',
    accent: 'danger'
  },
  {
    key: 'blocked',
    label: 'Заблокировано',
    value: stats.value.blocked,
    icon: 'lock',
    accent: 'danger'
  }
])

const sortOptions = [
  { key: 'createdAt-desc', label: 'Новые сначала' },
  { key: 'createdAt-asc', label: 'Старые сначала' },
  { key: 'price-desc', label: 'Дорогие' },
  { key: 'price-asc', label: 'Дешёвые' },
  { key: 'views-desc', label: 'Популярные' }
]

const filteredAnnouncements = computed(() => {
  let items = adminStore.announcements

  if (activeTab.value !== 'all') {
    items = items.filter(a => a.status === activeTab.value)
  }

  if (filters.value.status && activeTab.value === 'all') {
    items = items.filter(a => a.status === filters.value.status)
  }

  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    items = items.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.brand?.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q) ||
      a.sellerName?.toLowerCase().includes(q) ||
      String(a.id).includes(q)
    )
  }

  const [field, order] = sortBy.value.split('-')
  items = [...items].sort((a, b) => {
    if (field === 'createdAt') {
      return order === 'desc'
        ? new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        : new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    }
    const av = a[field] ?? 0
    const bv = b[field] ?? 0
    return order === 'desc' ? bv - av : av - bv
  })

  return items
})

const allSelected = computed(() =>
  filteredAnnouncements.value.length > 0 &&
  selectedIds.value.length === filteredAnnouncements.value.length
)

const someSelected = computed(() =>
  selectedIds.value.length > 0 && !allSelected.value
)

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { status: '', brand: '' }
  activeTab.value = 'all'
}

function handleTabChange(tabKey) {
  activeTab.value = tabKey
  filters.value.status = ''
  selectedIds.value = []
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredAnnouncements.value.map(a => a.id)
  }
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

async function bulkAction(action) {
  if (!selectedIds.value.length) return

  bulkLoading.value = true
  try {
    await Promise.all(
      selectedIds.value.map(id =>
        adminStore.moderateAnnouncement(id, action)
      )
    )
    toastStore.success(
      `${selectedIds.value.length} объявлений обработано`
    )
    selectedIds.value = []
    adminStore.fetchAnnouncements()
  } catch (err) {
    toastStore.error('Ошибка массовой операции')
  } finally {
    bulkLoading.value = false
  }
}

function goToAnnouncement(announcement) {
  router.push(`/admin/announcements/${announcement.id}`)
}

function exportCSV() {
  const data = filteredAnnouncements.value.map(a => ({
    ID: a.id,
    Марка: a.brand,
    Модель: a.model,
    Год: a.year,
    Цена: a.price,
    Город: a.city,
    Продавец: a.sellerName,
    Статус: a.status,
    Создано: a.createdAt
  }))

  const csv = [
    Object.keys(data[0] || {}).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `announcements-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)

  toastStore.success('Экспорт готов')
}

onMounted(() => {
  adminStore.fetchAnnouncements()
})
</script>

<template>
  <div class="cv-aa">
    <header class="cv-aa__header">
      <div class="cv-aa__header-left">
        <span class="cv-aa__eyebrow">
          <span class="cv-aa__eyebrow-dot" aria-hidden="true"></span>
          Админ · Объявления
        </span>
        <h1 class="cv-aa__title">Объявления</h1>
        <p class="cv-aa__subtitle">
          Всего <strong>{{ stats.total.toLocaleString('ru-RU') }}</strong>
          <template v-if="stats.pending">
            · <strong class="cv-aa__subtitle-warning">{{ stats.pending }} на модерации</strong>
          </template>
          <template v-if="stats.blocked">
            · <strong class="cv-aa__subtitle-danger">{{ stats.blocked }} заблокировано</strong>
          </template>
        </p>
      </div>

      <div class="cv-aa__header-actions">
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

    <section class="cv-aa__stats">
      <button
        v-for="stat in statCards"
        :key="stat.key"
        type="button"
        class="cv-aa__stat"
        :data-accent="stat.accent"
        @click="handleTabChange(stat.key)"
      >
        <span class="cv-aa__stat-icon" aria-hidden="true">
          <svg v-if="stat.icon === 'clock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
          </svg>
          <svg v-else-if="stat.icon === 'check'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          <svg v-else-if="stat.icon === 'x'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2"/>
            <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
          </svg>
        </span>

        <div class="cv-aa__stat-content">
          <span class="cv-aa__stat-value">{{ stat.value.toLocaleString('ru-RU') }}</span>
          <span class="cv-aa__stat-label">{{ stat.label }}</span>
        </div>
      </button>
    </section>

    <section class="cv-aa__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="cv-aa__tab"
        :class="{ 'cv-aa__tab--active': activeTab === tab.key }"
        :data-color="tab.color"
        @click="handleTabChange(tab.key)"
      >
        <span class="cv-aa__tab-label">{{ tab.label }}</span>
        <span class="cv-aa__tab-count">{{ tab.count }}</span>
      </button>
    </section>

    <div class="cv-aa__toolbar">
      <AdminFilters
        v-model:search="search"
        :filters="filterConfig"
        :active-filters="filters"
        @update:filter="handleFilter"
        @reset="resetFilters"
      />

      <div class="cv-aa__toolbar-right">
        <div class="cv-aa__sort">
          <select v-model="sortBy" class="cv-aa__sort-select">
            <option v-for="opt in sortOptions" :key="opt.key" :value="opt.key">
              {{ opt.label }}
            </option>
          </select>
          <span class="cv-aa__sort-arrow" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </span>
        </div>
      </div>
    </div>

    <Transition name="cv-aa-bulk">
      <div v-if="selectedIds.length" class="cv-aa__bulk">
        <span class="cv-aa__bulk-count">
          Выбрано: <strong>{{ selectedIds.length }}</strong>
        </span>

        <div class="cv-aa__bulk-actions">
          <button
            type="button"
            class="cv-aa__bulk-btn cv-aa__bulk-btn--primary"
            :disabled="bulkLoading"
            @click="bulkAction('approve')"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            Одобрить
          </button>

          <button
            type="button"
            class="cv-aa__bulk-btn cv-aa__bulk-btn--danger"
            :disabled="bulkLoading"
            @click="bulkAction('block')"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="16" height="11" rx="2"/>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
            </svg>
            Заблокировать
          </button>

          <button
            type="button"
            class="cv-aa__bulk-btn"
            @click="selectedIds = []"
          >
            Отменить
          </button>
        </div>
      </div>
    </Transition>

    <div class="cv-aa__table-wrap">
      <AdminTable
        :columns="columns"
        :items="filteredAnnouncements"
        :loading="adminStore.loading"
        empty-text="Объявления не найдены"
        :empty-icon="'car'"
        empty-hint="Попробуйте изменить фильтры или сбросить поиск"
        @row-click="goToAnnouncement"
      >
        <template #select="{ item }">
          <label class="cv-aa__checkbox-wrap" @click.stop>
            <input
              type="checkbox"
              :checked="selectedIds.includes(item.id)"
              class="cv-aa__checkbox"
              @change="toggleSelect(item.id)"
            />
            <span class="cv-aa__checkbox-box">
              <svg v-if="selectedIds.includes(item.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
          </label>
        </template>

        <template #announcement="{ item }">
          <div class="cv-aa__item">
            <div class="cv-aa__item-image-wrap">
              <img
                v-if="item.photos?.[0]"
                :src="item.photos[0]"
                :alt="item.title"
                class="cv-aa__item-image"
                loading="lazy"
              />
              <div v-else class="cv-aa__item-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-5-5-11 11"/>
                </svg>
              </div>

              <span v-if="item.hasReports" class="cv-aa__item-badge cv-aa__item-badge--report">
                {{ item.reportsCount || 1 }}
              </span>

              <span
                v-else-if="isFresh(item.createdAt)"
                class="cv-aa__item-badge cv-aa__item-badge--new"
              >
                NEW
              </span>
            </div>

            <div class="cv-aa__item-info">
              <p class="cv-aa__item-name">
                {{ item.brand }} {{ item.model }}, {{ item.year }}
              </p>
              <p class="cv-aa__item-details">
                #{{ item.id }}
                <template v-if="item.city"> · {{ item.city }}</template>
                <template v-if="item.views"> · {{ item.views }} просмотров</template>
              </p>
            </div>
          </div>
        </template>

        <template #price="{ item }">
          <span class="cv-aa__price">{{ formatPrice(item.price) }}</span>
        </template>

        <template #seller="{ item }">
          <div class="cv-aa__seller">
            <span class="cv-aa__seller-avatar">
              {{ item.sellerName?.charAt(0) || '?' }}
            </span>
            <div class="cv-aa__seller-info">
              <span class="cv-aa__seller-name">{{ item.sellerName || 'Не указан' }}</span>
              <span v-if="item.sellerType" class="cv-aa__seller-type">
                {{ item.sellerType }}
              </span>
            </div>
          </div>
        </template>

        <template #status="{ item }">
          <AdminStatusBadge :status="item.status" type="announcement" />
        </template>

        <template #createdAt="{ item }">
          <span class="cv-aa__date">{{ formatDate(item.createdAt, 'short') }}</span>
        </template>
      </AdminTable>
    </div>

    <div v-if="filteredAnnouncements.length" class="cv-aa__select-all">
      <label class="cv-aa__select-all-wrap" @click.prevent="toggleSelectAll">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate="someSelected"
          class="cv-aa__checkbox"
        />
        <span class="cv-aa__checkbox-box">
          <svg v-if="allSelected" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          <svg v-else-if="someSelected" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <path d="M5 12h14"/>
          </svg>
        </span>
        <span>Выбрать все ({{ filteredAnnouncements.length }})</span>
      </label>
    </div>
  </div>
</template>

<script>
function isFresh(dateStr) {
  if (!dateStr) return false
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 24 * 60 * 60 * 1000
}

export default {
  methods: { isFresh }
}
</script>

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
  display: inline-block;
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
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-aa__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.6);
}

.cv-aa__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-aa__subtitle-warning {
  color: #F0C080 !important;
}

.cv-aa__subtitle-danger {
  color: #E8A88A !important;
}

.cv-aa__header-actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
}

.cv-aa__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-aa__stat {
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
  position: relative;
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

.cv-aa__stat:active {
  transform: translateY(-1px) scale(0.98);
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

.cv-aa__stat[data-accent="warning"] .cv-aa__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-aa__stat[data-accent="success"] .cv-aa__stat-icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-aa__stat[data-accent="danger"] .cv-aa__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-aa__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
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
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-aa__tabs {
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

.cv-aa__tabs::-webkit-scrollbar { display: none; }

.cv-aa__tab {
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

.cv-aa__tab:hover:not(.cv-aa__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-aa__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-aa__tab-label {
  white-space: nowrap;
}

.cv-aa__tab-count {
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

.cv-aa__tab--active .cv-aa__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-aa__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-aa__toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-aa__sort {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cv-aa__sort-select {
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
  min-width: 160px;
}

.cv-aa__sort-select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-aa__sort-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
}

.cv-aa__sort-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
}

.cv-aa__sort-arrow {
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

.cv-aa__bulk {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.03));
  border: 1px solid rgba(201, 169, 97, 0.32);
  flex-wrap: wrap;
}

.cv-aa__bulk-count {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.8);
}

.cv-aa__bulk-count strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-aa__bulk-actions {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-aa__bulk-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-aa__bulk-btn:hover:not(:disabled) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-aa__bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cv-aa__bulk-btn--primary {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.4);
}

.cv-aa__bulk-btn--primary:hover:not(:disabled) {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.6);
}

.cv-aa__bulk-btn--danger {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.08);
  border-color: rgba(184, 119, 85, 0.28);
}

.cv-aa__bulk-btn--danger:hover:not(:disabled) {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.5);
  border-color: rgba(232, 168, 138, 0.6);
}

.cv-aa-bulk-enter-active,
.cv-aa-bulk-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aa-bulk-enter-from,
.cv-aa-bulk-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.cv-aa__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cv-aa__item-image-wrap {
  position: relative;
  flex-shrink: 0;
}

.cv-aa__item-image {
  width: 56px;
  height: 42px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-aa__item-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 42px;
  border-radius: 8px;
  color: rgba(200, 190, 175, 0.3);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-aa__item-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 6px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.cv-aa__item-badge--report {
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A, #B87755);
}

.cv-aa__item-badge--new {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
}

.cv-aa__item-info {
  min-width: 0;
  flex: 1;
}

.cv-aa__item-name {
  margin: 0 0 2px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aa__item-details {
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aa__price {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: #E8D5A0;
  font-variant-numeric: tabular-nums;
}

.cv-aa__seller {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-aa__seller-avatar {
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

.cv-aa__seller-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.cv-aa__seller-name {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aa__seller-type {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-aa__date {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
  white-space: nowrap;
}

.cv-aa__checkbox-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
}

.cv-aa__checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.cv-aa__checkbox-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 6px;
  color: #1A1208;
  background: rgba(255, 255, 255, 0.03);
  border: 1.5px solid rgba(201, 169, 97, 0.32);
  transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aa__checkbox-wrap:hover .cv-aa__checkbox-box {
  border-color: rgba(201, 169, 97, 0.6);
}

.cv-aa__checkbox:checked + .cv-aa__checkbox-box,
.cv-aa__checkbox:indeterminate + .cv-aa__checkbox-box {
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow: 0 2px 8px rgba(201, 169, 97, 0.4);
}

.cv-aa__select-all {
  display: flex;
  align-items: center;
  padding: 4px 8px;
}

.cv-aa__select-all-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
  transition: all 0.22s ease;
}

.cv-aa__select-all-wrap:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.06);
}

@media (max-width: 1280px) {
  .cv-aa__stats { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1024px) {
  .cv-aa__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-aa__title { font-size: 26px; letter-spacing: -0.4px; }
}

@media (max-width: 768px) {
  .cv-aa { gap: 16px; }
  .cv-aa__title { font-size: 22px; }
  .cv-aa__subtitle { font-size: 12.5px; }
  .cv-aa__header-actions { width: 100%; }
  .cv-aa__header-actions > * { width: 100%; }

  .cv-aa__stats { gap: 10px; }
  .cv-aa__stat { padding: 12px 14px; gap: 10px; }
  .cv-aa__stat-icon { width: 36px; height: 36px; }
  .cv-aa__stat-value { font-size: 18px; }
  .cv-aa__stat-label { font-size: 10.5px; }

  .cv-aa__tabs { padding: 5px; gap: 4px; }
  .cv-aa__tab { padding: 8px 12px; font-size: 12px; gap: 6px; }
  .cv-aa__tab-count { min-width: 20px; height: 18px; font-size: 10px; padding: 0 6px; }

  .cv-aa__toolbar { flex-direction: column; align-items: stretch; }
  .cv-aa__toolbar-right { width: 100%; }
  .cv-aa__sort { width: 100%; }
  .cv-aa__sort-select { width: 100%; }

  .cv-aa__bulk { padding: 10px 14px; gap: 10px; }
  .cv-aa__bulk-actions { width: 100%; flex-direction: column; }
  .cv-aa__bulk-btn { width: 100%; justify-content: center; }
}

@media (max-width: 480px) {
  .cv-aa__title { font-size: 20px; }
  .cv-aa__stats { grid-template-columns: 1fr; }
}
</style>