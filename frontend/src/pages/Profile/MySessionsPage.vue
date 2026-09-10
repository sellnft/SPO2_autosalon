<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BaseButton from '@/components/common/BaseButton.vue'

const userStore = useUserStore()
const loading = ref(true)

onMounted(async () => {
  try {
    await userStore.fetchSessions()
  } finally {
    loading.value = false
  }
})

async function revokeSession(id) {
  await userStore.revokeSession(id)
}
</script>

<template>
  <div class="sessions-page">
    <div class="container">
      <h1 class="sessions-page__title">Активные сессии</h1>
      
      <div class="sessions-page__list">
        <div
          v-for="session in userStore.sessions"
          :key="session.id"
          class="session"
        >
          <div class="session__info">
            <h3 class="session__device">
              {{ session.device }}
              <span v-if="session.current" class="session__current">Текущая</span>
            </h3>
            <p class="session__details">
              {{ session.location }} • {{ session.ip }}
            </p>
            <p class="session__last-active">
              Активна: {{ new Date(session.lastActive).toLocaleString('ru-RU') }}
            </p>
          </div>
          
          <BaseButton
            v-if="!session.current"
            variant="danger"
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
  padding: 40px 0;
}

.sessions-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
}

.sessions-page__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.session__device {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.session__current {
  padding: 2px 8px;
  font-size: 11px;
  color: #065f46;
  background: #D1FAE5;
  border-radius: 4px;
}

.session__details,
.session__last-active {
  font-size: 13px;
  color: #6B7280;
}
</style>