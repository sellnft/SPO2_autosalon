<script setup>
import { ref } from 'vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  },
  isSubscribed: {
    type: Boolean,
    default: false
  }
})

const subscriptionsStore = useSubscriptionsStore()
const loading = ref(false)

async function toggleSubscription() {
  loading.value = true
  try {
    if (props.isSubscribed) {
      await subscriptionsStore.unsubscribe(props.announcementId)
    } else {
      await subscriptionsStore.subscribe(props.announcementId)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button 
    class="subscribe-button"
    :class="{ 'subscribe-button--active': isSubscribed }"
    @click="toggleSubscription"
    :disabled="loading"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" :fill="isSubscribed ? 'currentColor' : 'none'">
      <path d="M10 18s-6-4.5-6-10a4 4 0 016-2 4 4 0 016 2c0 5.5-6 10-6 10z" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span>{{ isSubscribed ? 'В подписках' : 'Подписаться' }}</span>
  </button>
</template>

<style scoped>
.subscribe-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  transition: all 0.2s;
}

.subscribe-button:hover {
  border-color: #0A84FF;
  color: #0A84FF;
}

.subscribe-button--active {
  color: #0A84FF;
  border-color: #0A84FF;
  background: #F0F7FF;
}

.subscribe-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>