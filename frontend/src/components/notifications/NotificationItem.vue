<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const notificationsStore = useNotificationsStore()

const iconType = computed(() => {
  const map = {
    chat: '💬',
    price: '💰',
    status: '✅',
    sold: '🎉',
    support: '💬',
    security: '🔒',
    system: '⚙️'
  }
  return map[props.notification.type] || '📢'
})

async function handleClick() {
  if (!props.notification.read) {
    await notificationsStore.markAsRead(props.notification.id)
  }
  
  if (props.notification.link) {
    router.push(props.notification.link)
  }
}
</script>

<template>
  <button
    :class="['notification-item', { 'notification-item--unread': !notification.read }]"
    @click="handleClick"
  >
    <div class="notification-item__icon" :data-type="notification.type">
      {{ iconType }}
    </div>
    
    <div class="notification-item__content">
      <div class="notification-item__header">
        <p class="notification-item__title">{{ notification.title }}</p>
        <span v-if="!notification.read" class="notification-item__dot"></span>
      </div>
      
      <p class="notification-item__message">{{ notification.message }}</p>
      
      <p class="notification-item__time">
        {{ formatDate(notification.createdAt, 'relative') }}
      </p>
    </div>
  </button>
</template>

<style scoped>
.notification-item {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 16px;
  text-align: left;
  background: white;
  border: none;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #F9FAFB;
}

.notification-item--unread {
  background: #F0F7FF;
}

.notification-item--unread:hover {
  background: #E0EFFF;
}

.notification-item__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  border-radius: 50%;
  background: #F3F4F6;
}

.notification-item__icon[data-type="chat"] {
  background: #DBEAFE;
}

.notification-item__icon[data-type="price"] {
  background: #FEF3C7;
}

.notification-item__icon[data-type="status"],
.notification-item__icon[data-type="sold"] {
  background: #D1FAE5;
}

.notification-item__icon[data-type="security"] {
  background: #FEE2E2;
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-item__title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.notification-item__dot {
  width: 8px;
  height: 8px;
  background: #0A84FF;
  border-radius: 50%;
}

.notification-item__message {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: #6B7280;
}

.notification-item__time {
  font-size: 12px;
  color: #9CA3AF;
}
</style>