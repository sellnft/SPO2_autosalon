<script setup>
import { ref, computed } from 'vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  }
})

const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)

const isSubscribed = computed(() => 
  subscriptionsStore.subscriptions.some(s => s.announcementId === Number(props.announcementId))
)

async function handleToggle() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы подписаться')
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  
  loading.value = true
  try {
    if (isSubscribed.value) {
      await subscriptionsStore.unsubscribe(props.announcementId)
      toastStore.success('Вы отписались от объявления')
    } else {
      await subscriptionsStore.subscribe(props.announcementId)
      toastStore.success('Вы подписались на изменения')
    }
  } catch (err) {
    toastStore.error(err.message || 'Ошибка')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    class="subscribe-btn"
    :class="{ 'subscribe-btn--active': isSubscribed }"
    :disabled="loading"
    @click="handleToggle"
  >
    <svg width="18" height="18" viewBox="0 0 20 20" :fill="isSubscribed ? 'currentColor' : 'none'">
      <path d="M15 6a5 5 0 10-10 0c0 6-2 7-2 7h14s-2-1-2-7zM8 17a2 2 0 004 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <span>{{ isSubscribed ? 'Вы подписаны' : 'Подписаться' }}</span>
  </button>
</template>

<style scoped>
.subscribe-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.subscribe-btn:hover:not(:disabled) {
  border-color: #0A84FF;
  color: #0A84FF;
}

.subscribe-btn--active {
  color: #0A84FF;
  border-color: #0A84FF;
  background: #F0F7FF;
}

.subscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>