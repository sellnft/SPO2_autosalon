<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate } from '@/utils/formatDate'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'

const router = useRouter()
const adminStore = useAdminStore()

const search = ref('')
const filters = ref({ status: '', brand: '' })

const columns = [
  { key: 'announcement', label: 'Объявление', width: '35%' },
  { key: 'price', label: 'Цена', width: '15%' },
  { key: 'seller', label: 'Продавец', width: '20%' },
  { key: 'status', label: 'Статус', width: '15%' },
  { key: 'createdAt', label: 'Создано', width: '15%' }
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

const filteredAnnouncements = computed(() => {
  return adminStore.announcements.filter(a => {
    const q = search.value.toLowerCase()
    const matchesSearch = !q ||
      a.title?.toLowerCase().includes(q) ||
      a.brand?.toLowerCase().includes(q) ||
      a.model?.toLowerCase().includes(q) ||
      a.sellerName?.toLowerCase().includes(q)
    
    const matchesStatus = !filters.value.status || a.status === filters.value.status
    
    return matchesSearch && matchesStatus
  })
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { status: '', brand: '' }
}

function goToAnnouncement(announcement) {
  router.push(`/admin/announcements/${announcement.id}`)
}

onMounted(() => {
  adminStore.fetchAnnouncements()
})
</script>

<template>
  <div class="admin-announcements">
    <header class="admin-announcements__header">
      <div>
        <h1 class="admin-announcements__title">Объявления</h1>
        <p class="admin-announcements__subtitle">
          Всего: {{ adminStore.announcements.length }} • Найдено: {{ filteredAnnouncements.length }}
        </p>
      </div>
    </header>
    
    <AdminFilters
      v-model:search="search"
      :filters="filterConfig"
      :active-filters="filters"
      @update:filter="handleFilter"
      @reset="resetFilters"
    />
    
    <AdminTable
      :columns="columns"
      :items="filteredAnnouncements"
      :loading="adminStore.loading"
      empty-text="Объявления не найдены"
      @row-click="goToAnnouncement"
    >
      <template #announcement="{ item }">
        <div class="admin-announcements__item">
          <img
            v-if="item.photos?.[0]"
            :src="item.photos[0]"
            :alt="item.title"
            class="admin-announcements__image"
          />
          <div class="admin-announcements__info">
            <p class="admin-announcements__name">{{ item.brand }} {{ item.model }}</p>
            <p class="admin-announcements__details">
              {{ item.year }} • {{ item.city }}
            </p>
          </div>
        </div>
      </template>
      
      <template #price="{ item }">
        <span class="admin-announcements__price">{{ formatPrice(item.price) }}</span>
      </template>
      
      <template #status="{ item }">
        <AdminStatusBadge :status="item.status" type="announcement" />
      </template>
      
      <template #createdAt="{ item }">
        {{ formatDate(item.createdAt, 'short') }}
      </template>
    </AdminTable>
  </div>
</template>

<style scoped>
.admin-announcements {
  max-width: 1400px;
}

.admin-announcements__header {
  margin-bottom: 24px;
}

.admin-announcements__title {
  margin-bottom: 6px;
  font-size: 28px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-announcements__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.admin-announcements__item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-announcements__image {
  width: 56px;
  height: 42px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.admin-announcements__name {
  font-size: 14px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-announcements__details {
  font-size: 12px;
  color: #6B7280;
}

.admin-announcements__price {
  font-weight: 600;
  color: #C8A96E;
}

@media (max-width: 640px) {
  .admin-announcements__title {
    font-size: 22px;
  }
}
</style>