<script setup>
import { computed, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import NotificationItem from './NotificationItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  /**
   * Опционально: если передан — рендерим этот список.
   * Если не передан — читаем notificationsStore.notifications (как раньше).
   */
  notifications: {
    type: Array,
    default: null
  },
  /** Показывать кнопки действий у каждого item */
  actions: {
    type: Boolean,
    default: false
  },
  /** Управлять данными через emit'ы, не лезть в стор */
  manual: {
    type: Boolean,
    default: false
  },
  /** Скрыть внутренний header с «Отметить все» */
  hideHeader: {
    type: Boolean,
    default: false
  },
  /** Показывать EmptyState при пустом списке */
  showEmpty: {
    type: Boolean,
    default: true
  },
  emptyTitle: {
    type: String,
    default: 'Нет уведомлений'
  },
  emptyDescription: {
    type: String,
    default: 'Здесь будут появляться ваши уведомления'
  }
})

const emit = defineEmits(['click', 'mark-read', 'delete', 'mark-all'])

const notificationsStore = useNotificationsStore()

const notifications = computed(() =>
  props.notifications !== null
    ? props.notifications
    : notificationsStore.notifications
)

const hasUnread = computed(() =>
  notifications.value.some(n => !n.read)
)

function handleItemClick(n) {
  emit('click', n)
}

function handleMarkRead(n) {
  emit('mark-read', n)
}

function handleDelete(n) {
  emit('delete', n)
}

async function markAllAsRead() {
  if (props.manual) {
    emit('mark-all')
    return
  }
  await notificationsStore.markAllAsRead()
}

onMounted(() => {
  // Автозагрузка — только если мы работаем в «старом» режиме (без переданного пропа)
  if (
    props.notifications === null &&
    !props.manual &&
    !notificationsStore.notifications.length &&
    !notificationsStore.loading
  ) {
    notificationsStore.fetchNotifications()
  }
})
</script>

<template>
  <div class="cv-notif">
    <header
      v-if="!hideHeader && notifications.length && hasUnread"
      class="cv-notif__header"
    >
      <span class="cv-notif__header-label">Непрочитанные</span>
      <BaseButton variant="ghost" size="sm" @click="markAllAsRead">
        Отметить все прочитанными
      </BaseButton>
    </header>

    <EmptyState
      v-if="showEmpty && !notifications.length"
      icon="chat"
      :title="emptyTitle"
      :description="emptyDescription"
    />

    <div v-else class="cv-notif__items">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        :actions="actions"
        :manual="manual"
        @click="handleItemClick"
        @mark-read="handleMarkRead"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.cv-notif {
  position: relative;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.5) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
}

.cv-notif::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.28) 50%, transparent);
  pointer-events: none;
  z-index: 1;
}

.cv-notif__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.05), transparent);
}

.cv-notif__header-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #C9A961;
  opacity: 0.85;
}

.cv-notif__items {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 640px) {
  .cv-notif { border-radius: 1rem; }
  .cv-notif__header {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>