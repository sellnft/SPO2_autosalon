<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import { formatDate } from '@/utils/formatDate'

const userStore = useUserStore()
const toastStore = useToastStore()

const loading = ref(true)

onMounted(async () => {
  try {
    await userStore.fetchSessions()
  } finally {
    loading.value = false
  }
})

async function revokeSession(id) {
  try {
    await userStore.revokeSession(id)
    toastStore.success('Сессия завершена')
  } catch (err) {
    toastStore.error('Не удалось завершить сессию')
  }
}
</script>

<template>
  <div class="sessions-page">
    <div class="container">
      <Breadcrumbs />

      <h1 class="sessions-page__title">Активные сессии</h1>

      <BaseLoader v-if="loading" text="Загрузка..." />

      <div v-else class="sessions-page__list">
        <div
          v-for="session in userStore.sessions"
          :key="session.id"
          class="session"
        >
          <div class="session__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 22h8M12 18v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>

          <div class="session__info">
            <h3 class="session__device">
              {{ session.device }}
              <span v-if="session.current" class="session__current">Текущая</span>
            </h3>
            <p class="session__details">
              {{ session.location }} • {{ session.ip }}
            </p>
            <p class="session__last-active">
              Активна: {{ formatDate(session.lastActive, 'datetime') }}
            </p>
          </div>

          <BaseButton
            v-if="!session.current"
            variant="ghost"
            size="sm"
            @click="revokeSession(session.id)"
          >
            Завершить
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sessions-page {
  padding: 20px 0 40px;
}

.sessions-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.sessions-page__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.session__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  color: #0A84FF;
  background: #F0F7FF;
  border-radius: 12px;
}

.session__info {
  flex: 1;
  min-width: 0;
}

.session__device {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  flex-wrap: wrap;
}

.session__current {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #065f46;
  background: #D1FAE5;
  border-radius: 4px;
}

.session__details,
.session__last-active {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 2px;
}

@media (max-width: 640px) {
  .sessions-page__title {
    font-size: 24px;
  }

  .session {
    flex-wrap: wrap;
  }
}
</style>