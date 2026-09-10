<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminTable from '@/components/admin/AdminTable.vue'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AdminFilters from '@/components/admin/AdminFilters.vue'
import { formatDate } from '@/utils/formatDate'

const router = useRouter()
const adminStore = useAdminStore()

const search = ref('')
const filters = ref({ role: '', status: '' })

const columns = [
  { key: 'user', label: 'Пользователь', width: '30%' },
  { key: 'city', label: 'Город', width: '15%' },
  { key: 'role', label: 'Роль', width: '12%' },
  { key: 'status', label: 'Статус', width: '13%' },
  { key: 'announcementsCount', label: 'Объявлений', width: '12%', align: 'center' },
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
  },
  {
    key: 'status',
    placeholder: 'Все статусы',
    options: [
      { value: 'active', label: 'Активные' },
      { value: 'blocked', label: 'Заблокированные' }
    ]
  }
]

const filteredUsers = computed(() => {
  return adminStore.users.filter(u => {
    const q = search.value.toLowerCase()
    const matchesSearch = !q || 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    
    const matchesRole = !filters.value.role || u.role === filters.value.role
    const matchesStatus = !filters.value.status || u.status === filters.value.status
    
    return matchesSearch && matchesRole && matchesStatus
  })
})

function handleFilter({ key, value }) {
  filters.value = { ...filters.value, [key]: value }
}

function resetFilters() {
  search.value = ''
  filters.value = { role: '', status: '' }
}

function goToUser(user) {
  router.push(`/admin/users/${user.id}`)
}

onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<template>
  <div class="admin-users">
    <header class="admin-users__header">
      <div>
        <h1 class="admin-users__title">Пользователи</h1>
        <p class="admin-users__subtitle">
          Всего: {{ adminStore.users.length }} • Найдено: {{ filteredUsers.length }}
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
      :items="filteredUsers"
      :loading="adminStore.loading"
      empty-text="Пользователи не найдены"
      @row-click="goToUser"
    >
      <template #user="{ item }">
        <div class="admin-users__user">
          <div class="admin-users__avatar">
            {{ item.name.charAt(0) }}
          </div>
          <div>
            <p class="admin-users__name">{{ item.name }}</p>
            <p class="admin-users__email">{{ item.email }}</p>
          </div>
        </div>
      </template>
      
      <template #role="{ item }">
        <span :class="['admin-users__role', `admin-users__role--${item.role}`]">
          {{ item.role === 'admin' ? 'Админ' : 'Пользователь' }}
        </span>
      </template>
      
      <template #status="{ item }">
        <AdminStatusBadge :status="item.status" type="user" />
      </template>
      
      <template #createdAt="{ item }">
        {{ formatDate(item.createdAt, 'short') }}
      </template>
    </AdminTable>
  </div>
</template>

<style scoped>
.admin-users {
  max-width: 1400px;
}

.admin-users__header {
  margin-bottom: 24px;
}

.admin-users__title {
  margin-bottom: 6px;
  font-size: 28px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-users__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.admin-users__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-users__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 14px;
  font-weight: 700;
  color: #0F0F10;
  background: linear-gradient(135deg, #C8A96E, #A88650);
  border-radius: 50%;
  flex-shrink: 0;
}

.admin-users__name {
  font-size: 14px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-users__email {
  font-size: 12px;
  color: #6B7280;
}

.admin-users__role {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 100px;
}

.admin-users__role--user {
  color: #93C5FD;
  background: rgba(10, 132, 255, 0.15);
}

.admin-users__role--admin {
  color: #0F0F10;
  background: #C8A96E;
}

@media (max-width: 640px) {
  .admin-users__title {
    font-size: 22px;
  }
}
</style>