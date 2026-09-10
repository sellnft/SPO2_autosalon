<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { formatDate } from '@/utils/formatDate'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'

const router = useRouter()
const adminStore = useAdminStore()

const search = ref('')
const filters = ref({ status: '', priority: '' })

const columns = [
  { key: 'subject', label: 'Обращение', width: '40%' },
  { key: 'user', label: 'Пользователь', width: '20%' },
  { key: 'priority', label: 'Приоритет', width: '13%' },
  { key: 'status', label: 'Статус', width: '15%' },
  { key: 'updatedAt', label: 'Обновлено', width: '12%' }
]

const filterConfig = [
  {
    key: 'status',
    placeholder: 'Все статусы',
    options: [
      { value: 'open', label: 'Открыто' },
      { value: 'in_progress', label: 'В работе' },
      { value: 'waiting_user', label: 'Ждёт ответа' },
      { value: 'resolved', label: 'Решено' },
      { value: 'closed', label: 'Закрыто' }
    ]
  },
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

const filteredFeedback = computed(() => {
  return adminStore.feedback.filter(f => {
    const q = search.value.toLowerCase()
    const matchesSearch = !q ||
      f.subject.toLowerCase().includes(q) ||
      f.userName?.toLowerCase().includes(q)
    
    const matchesStatus = !filters.value.status || f.status === filters.value.status
    const matchesPriority = !filters.value.priority || f.priority === filters.value.priority
    
    return matchesSearch && matchesStatus && matchesPriority
  })
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { status: '', priority: '' }
}

function goToFeedback(feedback) {
  router.push(`/admin/feedback/${feedback.id}`)
}

onMounted(() => {
  adminStore.fetchFeedback()
})
</script>

<template>
  <div class="admin-feedback">
    <header class="admin-feedback__header">
      <div>
        <h1 class="admin-feedback__title">Обращения</h1>
        <p class="admin-feedback__subtitle">
          Всего: {{ adminStore.feedback.length }} • Найдено: {{ filteredFeedback.length }}
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
      :items="filteredFeedback"
      :loading="adminStore.loading"
      empty-text="Обращения не найдены"
      @row-click="goToFeedback"
    >
      <template #subject="{ item }">
        <div>
          <p class="admin-feedback__subject">{{ item.subject }}</p>
          <p class="admin-feedback__id">#{{ item.id }}</p>
        </div>
      </template>
      
      <template #priority="{ item }">
        <span :class="['admin-feedback__priority', `admin-feedback__priority--${item.priority}`]">
          {{ item.priority }}
        </span>
      </template>
      
      <template #status="{ item }">
        <AdminStatusBadge :status="item.status" type="feedback" />
      </template>
      
      <template #updatedAt="{ item }">
        {{ formatDate(item.updatedAt, 'relative') }}
      </template>
    </AdminTable>
  </div>
</template>

<style scoped>
.admin-feedback {
  max-width: 1400px;
}

.admin-feedback__header {
  margin-bottom: 24px;
}

.admin-feedback__title {
  margin-bottom: 6px;
  font-size: 28px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-feedback__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.admin-feedback__subject {
  font-size: 14px;
  font-weight: 600;
  color: #E5E7EB;
  margin-bottom: 2px;
}

.admin-feedback__id {
  font-family: monospace;
  font-size: 12px;
  color: #6B7280;
}

.admin-feedback__priority {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 100px;
  text-transform: uppercase;
}

.admin-feedback__priority--low {
  color: #9CA3AF;
  background: rgba(107, 114, 128, 0.15);
}

.admin-feedback__priority--normal {
  color: #93C5FD;
  background: rgba(10, 132, 255, 0.15);
}

.admin-feedback__priority--high {
  color: #FCD34D;
  background: rgba(245, 158, 11, 0.15);
}

.admin-feedback__priority--critical {
  color: #FCA5A5;
  background: rgba(239, 68, 68, 0.15);
}

@media (max-width: 640px) {
  .admin-feedback__title {
    font-size: 22px;
  }
}
</style>