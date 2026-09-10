<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import AdminStatCard from '@/components/admin/AdminStatCard.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

const adminStore = useAdminStore()

onMounted(async () => {
  await adminStore.fetchDashboardStats()
})

const stats = computed(() => adminStore.dashboardStats)
</script>

<template>
  <div class="admin-dashboard">
    <header class="admin-dashboard__header">
      <h1 class="admin-dashboard__title">Обзор</h1>
      <p class="admin-dashboard__subtitle">Ключевые показатели платформы</p>
    </header>
    
    <BaseLoader v-if="!stats" text="Загрузка статистики..." />
    
    <template v-else>
      <div class="admin-dashboard__grid">
        <AdminStatCard
          label="Пользователи"
          :value="stats.totalUsers"
          accent="accent"
        />
        <AdminStatCard
          label="Объявления"
          :value="stats.totalAnnouncements"
          accent="info"
        />
        <AdminStatCard
          label="Активных"
          :value="stats.activeAnnouncements"
          accent="success"
        />
        <AdminStatCard
          label="На модерации"
          :value="stats.pendingAnnouncements"
          accent="warning"
        />
        <AdminStatCard
          label="Обращения"
          :value="stats.totalFeedback"
          accent="info"
        />
        <AdminStatCard
          label="Новые обращения"
          :value="stats.newFeedback"
          accent="danger"
        />
      </div>
      
      <div class="admin-dashboard__section">
        <h2 class="admin-dashboard__section-title">Быстрые действия</h2>
        <div class="admin-dashboard__actions">
          <RouterLink to="/admin/announcements?status=pending" class="admin-dashboard__action">
            <span class="admin-dashboard__action-icon">⏳</span>
            <div>
              <p class="admin-dashboard__action-title">Модерация</p>
              <p class="admin-dashboard__action-description">
                {{ stats.pendingAnnouncements }} объявлений ждут проверки
              </p>
            </div>
          </RouterLink>
          
          <RouterLink to="/admin/feedback?status=open" class="admin-dashboard__action">
            <span class="admin-dashboard__action-icon">💬</span>
            <div>
              <p class="admin-dashboard__action-title">Обращения</p>
              <p class="admin-dashboard__action-description">
                {{ stats.newFeedback }} новых обращений
              </p>
            </div>
          </RouterLink>
          
          <RouterLink to="/admin/users" class="admin-dashboard__action">
            <span class="admin-dashboard__action-icon">👥</span>
            <div>
              <p class="admin-dashboard__action-title">Пользователи</p>
              <p class="admin-dashboard__action-description">
                Всего {{ stats.totalUsers }} пользователей
              </p>
            </div>
          </RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
}

.admin-dashboard__header {
  margin-bottom: 32px;
}

.admin-dashboard__title {
  margin-bottom: 6px;
  font-size: 28px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-dashboard__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.admin-dashboard__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.admin-dashboard__section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-dashboard__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.admin-dashboard__action {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.admin-dashboard__action:hover {
  border-color: #C8A96E;
  background: #1A1A1D;
}

.admin-dashboard__action-icon {
  font-size: 24px;
}

.admin-dashboard__action-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-dashboard__action-description {
  font-size: 12px;
  color: #6B7280;
}

@media (max-width: 1024px) {
  .admin-dashboard__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .admin-dashboard__actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-dashboard__grid {
    grid-template-columns: 1fr;
  }

  .admin-dashboard__title {
    font-size: 22px;
  }
}
</style>