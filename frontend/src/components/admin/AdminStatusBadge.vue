<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'user', 'announcement', 'feedback'].includes(v)
  }
})

const config = computed(() => {
  const maps = {
    user: {
      active: { label: 'Активен', color: 'success' },
      blocked: { label: 'Заблокирован', color: 'danger' },
      pending: { label: 'Ожидает', color: 'warning' }
    },
    announcement: {
      active: { label: 'Опубликовано', color: 'success' },
      pending: { label: 'На модерации', color: 'warning' },
      rejected: { label: 'Отклонено', color: 'danger' },
      blocked: { label: 'Заблокировано', color: 'danger' },
      sold: { label: 'Продано', color: 'neutral' }
    },
    feedback: {
      open: { label: 'Открыто', color: 'info' },
      in_progress: { label: 'В работе', color: 'warning' },
      waiting_user: { label: 'Ждёт ответа', color: 'danger' },
      resolved: { label: 'Решено', color: 'success' },
      closed: { label: 'Закрыто', color: 'neutral' }
    },
    default: {
      active: { label: 'Активно', color: 'success' },
      inactive: { label: 'Неактивно', color: 'neutral' }
    }
  }
  
  const map = maps[props.type] || maps.default
  return map[props.status] || { label: props.status, color: 'neutral' }
})
</script>

<template>
  <span :class="['admin-badge', `admin-badge--${config.color}`]">
    {{ config.label }}
  </span>
</template>

<style scoped>
.admin-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.admin-badge--success {
  color: #6EE7B7;
  background: rgba(16, 185, 129, 0.15);
}

.admin-badge--warning {
  color: #FCD34D;
  background: rgba(245, 158, 11, 0.15);
}

.admin-badge--danger {
  color: #FCA5A5;
  background: rgba(239, 68, 68, 0.15);
}

.admin-badge--info {
  color: #93C5FD;
  background: rgba(10, 132, 255, 0.15);
}

.admin-badge--neutral {
  color: #9CA3AF;
  background: rgba(107, 114, 128, 0.15);
}
</style>