<script setup>
import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import NotificationItem from './NotificationItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const notificationsStore = useNotificationsStore()

const notifications = computed(() => notificationsStore.notifications)
const hasUnread = computed(() => notificationsStore.hasUnread)

async function markAllAsRead() {
  await notificationsStore.markAllAsRead()
}
</script>

<template>
  <div class="notification-list">
    <div v-if="notifications.length && hasUnread" class="notification-list__header">
      <BaseButton variant="ghost" size="sm" @click="markAllAsRead">
        Отметить все как прочитанные
      </BaseButton>
    </div>
    
    <EmptyState
      v-if="!notifications.length"
      icon="chat"
      title="Нет уведомлений"
      description="Здесь будут появляться ваши уведомления"
    />
    
    <div v-else class="notification-list__items">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
      />
    </div>
  </div>
</template>

<style scoped>
.notification-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.notification-list__header {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-bottom: 1px solid #F3F4F6;
}

.notification-list__items {
  display: flex;
  flex-direction: column;
}
</style>