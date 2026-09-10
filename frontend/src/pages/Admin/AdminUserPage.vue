<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { useAnnouncementsStore } from '@/stores/announcements'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import AnnouncementList from '@/components/announcements/AnnouncementList.vue'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const showBlockModal = ref(false)
const userAnnouncements = ref([])

const user = computed(() => 
  adminStore.users.find(u => u.id === Number(route.params.id))
)

async function loadUser() {
  loading.value = true
  try {
    if (!adminStore.users.length) {
      await adminStore.fetchUsers()
    }
    
    if (user.value) {
      await announcementsStore.fetchAnnouncements({ perPage: 100 })
      userAnnouncements.value = announcementsStore.announcements.filter(
        a => a.sellerId === user.value.id
      )
    }
  } finally {
    loading.value = false
  }
}

async function toggleBlock() {
  if (!user.value) return
  
  try {
    // TODO: При реальном backend - вызывать API
    const newStatus = user.value.status === 'blocked' ? 'active' : 'blocked'
    
    if (newStatus === 'blocked') {
      user.value.status = 'blocked'
      user.value.blockReason = 'Заблокирован администратором'
      toastStore.success('Пользователь заблокирован')
    } else {
      user.value.status = 'active'
      user.value.blockReason = null
      toastStore.success('Пользователь разблокирован')
    }
    
    showBlockModal.value = false
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

onMounted(loadUser)
</script>

<template>
  <div class="admin-user">
    <button class="admin-user__back" @click="router.push('/admin/users')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      К списку пользователей
    </button>
    
    <div v-if="loading" class="admin-user__loading">Загрузка...</div>
    
    <template v-else-if="user">
      <!-- Header -->
      <div class="admin-user__card">
        <div class="admin-user__header">
          <div class="admin-user__avatar">
            {{ user.name.charAt(0) }}
          </div>
          
          <div class="admin-user__info">
            <div class="admin-user__name-row">
              <h1 class="admin-user__name">{{ user.name }}</h1>
              <AdminStatusBadge :status="user.status" type="user" />
            </div>
            <p class="admin-user__email">{{ user.email }}</p>
            <p class="admin-user__phone">{{ user.phone }}</p>
          </div>
          
          <div class="admin-user__actions">
            <BaseButton
              :variant="user.status === 'blocked' ? 'primary' : 'danger'"
              @click="showBlockModal = true"
            >
              {{ user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать' }}
            </BaseButton>
          </div>
        </div>
        
        <div class="admin-user__meta">
          <div class="admin-user__meta-item">
            <span class="admin-user__meta-label">ID</span>
            <span class="admin-user__meta-value">#{{ user.id }}</span>
          </div>
          <div class="admin-user__meta-item">
            <span class="admin-user__meta-label">Город</span>
            <span class="admin-user__meta-value">{{ user.city || '—' }}</span>
          </div>
          <div class="admin-user__meta-item">
            <span class="admin-user__meta-label">Роль</span>
            <span class="admin-user__meta-value">
              {{ user.role === 'admin' ? 'Администратор' : 'Пользователь' }}
            </span>
          </div>
          <div class="admin-user__meta-item">
            <span class="admin-user__meta-label">Регистрация</span>
            <span class="admin-user__meta-value">
              {{ formatDate(user.createdAt, 'long') }}
            </span>
          </div>
          <div class="admin-user__meta-item">
            <span class="admin-user__meta-label">Последняя активность</span>
            <span class="admin-user__meta-value">
              {{ formatDate(user.lastActiveAt, 'relative') }}
            </span>
          </div>
          <div class="admin-user__meta-item">
            <span class="admin-user__meta-label">Объявлений</span>
            <span class="admin-user__meta-value">{{ user.announcementsCount }}</span>
          </div>
        </div>
        
        <div v-if="user.blockReason" class="admin-user__block-reason">
          <strong>Причина блокировки:</strong> {{ user.blockReason }}
        </div>
      </div>
      
      <!-- Announcements -->
      <div class="admin-user__section">
        <h2 class="admin-user__section-title">
          Объявления ({{ userAnnouncements.length }})
        </h2>
        
        <div v-if="!userAnnouncements.length" class="admin-user__empty">
          У пользователя нет объявлений
        </div>
        
        <AnnouncementList v-else :announcements="userAnnouncements" />
      </div>
    </template>
    
    <ConfirmModal
      v-model="showBlockModal"
      :title="user?.status === 'blocked' ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'"
      :message="user?.status === 'blocked' 
        ? 'Пользователь снова получит доступ к платформе.' 
        : 'Пользователь потеряет доступ к платформе и его объявления будут скрыты.'"
      :confirm-text="user?.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'"
      :variant="user?.status === 'blocked' ? 'primary' : 'danger'"
      @confirm="toggleBlock"
    />
  </div>
</template>

<style scoped>
.admin-user {
  max-width: 1200px;
}

.admin-user__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 12px;
  font-size: 13px;
  color: #9CA3AF;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-user__back:hover {
  color: #E5E7EB;
  background: #1A1A1D;
}

.admin-user__loading {
  padding: 60px 0;
  text-align: center;
  color: #6B7280;
}

.admin-user__card {
  padding: 24px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  margin-bottom: 24px;
}

.admin-user__header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #26262A;
  margin-bottom: 20px;
}

.admin-user__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0F0F10;
  background: linear-gradient(135deg, #C8A96E, #A88650);
  border-radius: 50%;
}

.admin-user__info {
  flex: 1;
  min-width: 0;
}

.admin-user__name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.admin-user__name {
  font-size: 22px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-user__email,
.admin-user__phone {
  font-size: 13px;
  color: #6B7280;
}

.admin-user__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.admin-user__meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.admin-user__meta-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6B7280;
}

.admin-user__meta-value {
  font-size: 14px;
  color: #E5E7EB;
}

.admin-user__block-reason {
  margin-top: 20px;
  padding: 12px 16px;
  font-size: 13px;
  color: #FCA5A5;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #EF4444;
  border-radius: 8px;
}

.admin-user__section {
  padding: 24px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
}

.admin-user__section-title {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-user__empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  color: #6B7280;
}

@media (max-width: 768px) {
  .admin-user__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-user__meta {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .admin-user__meta {
    grid-template-columns: 1fr;
  }
}
</style>