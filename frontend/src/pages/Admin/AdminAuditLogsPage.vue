<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { formatDate } from '@/utils/formatDate'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'

const adminStore = useAdminStore()

const search = ref('')
const filters = ref({ action: '' })

const columns = [
  { key: 'actor', label: 'Актор', width: '20%' },
  { key: 'action', label: 'Действие', width: '25%' },
  { key: 'entity', label: 'Объект', width: '25%' },
  { key: 'ip', label: 'IP', width: '15%' },
  { key: 'createdAt', label: 'Дата', width: '15%' }
]

const filterConfig = [
  {
    key: 'action',
    placeholder: 'Все действия',
    options: [
      { value: 'login', label: 'Вход в систему' },
      { value: 'logout', label: 'Выход' },
      { value: 'create_announcement', label: 'Создание объявления' },
      { value: 'delete_announcement', label: 'Удаление объявления' },
      { value: 'block_user', label: 'Блокировка пользователя' }
    ]
  }
]

const actionLabels = {
  login: 'Вход в систему',
  logout: 'Выход',
  create_announcement: 'Создание объявления',
  update_announcement: 'Обновление объявления',
  delete_announcement: 'Удаление объявления',
  moderate_announcement: 'Модерация объявления',
  block_user: 'Блокировка пользователя',
  unblock_user: 'Разблокировка пользователя',
  reply_feedback: 'Ответ на обращение'
}

const filteredLogs = computed(() => {
  return adminStore.auditLogs.filter(log => {
    const q = search.value.toLowerCase()
    const matchesSearch = !q ||
      log.actorName?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q)
    
    const matchesAction = !filters.value.action || log.action === filters.value.action
    
    return matchesSearch && matchesAction
  })
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { action: '' }
}

onMounted(() => {
  adminStore.fetchAuditLogs()
})
</script>

<template>
  <div class="admin-audit-logs">
    <header class="admin-audit-logs__header">
      <div>
        <h1 class="admin-audit-logs__title">Журнал действий</h1>
        <p class="admin-audit-logs__subtitle">
          Всего записей: {{ filteredLogs.length }}
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
      :items="filteredLogs"
      :loading="adminStore.loading"
      empty-text="Записи не найдены"
    >
      <template #actor="{ item }">
        <div class="admin-audit-logs__actor">
          <div class="admin-audit-logs__avatar">
            {{ (item.actorName || '?').charAt(0) }}
          </div>
          <span>{{ item.actorName || 'Система' }}</span>
        </div>
      </template>
      
      <template #action="{ item }">
        <span class="admin-audit-logs__action">
          {{ actionLabels[item.action] || item.action }}
        </span>
      </template>
      
      <template #entity="{ item }">
        <span class="admin-audit-logs__entity">
          {{ item.details }}
        </span>
      </template>
      
      <template #createdAt="{ item }">
        <span class="admin-audit-logs__date">
          {{ formatDate(item.createdAt, 'datetime') }}
        </span>
      </template>
    </AdminTable>
  </div>
</template>

<style scoped>
.admin-audit-logs {
  max-width: 1400px;
}

.admin-audit-logs__header {
  margin-bottom: 24px;
}

.admin-audit-logs__title {
  margin-bottom: 6px;
  font-size: 28px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-audit-logs__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.admin-audit-logs__actor {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-audit-logs__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 11px;
  font-weight: 700;
  color: #0F0F10;
  background: linear-gradient(135deg, #C8A96E, #A88650);
  border-radius: 50%;
  flex-shrink: 0;
}

.admin-audit-logs__action {
  font-size: 13px;
  font-weight: 500;
  color: #E5E7EB;
}

.admin-audit-logs__entity {
  font-size: 13px;
  color: #9CA3AF;
}

.admin-audit-logs__date {
  font-size: 12px;
  color: #6B7280;
}

@media (max-width: 640px) {
  .admin-audit-logs__title {
    font-size: 22px;
  }
}
</style>