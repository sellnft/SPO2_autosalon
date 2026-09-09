<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusInfo = computed(() => {
  const map = {
    active: { label: 'Активно', type: 'success' },
    pending: { label: 'На модерации', type: 'warning' },
    rejected: { label: 'Отклонено', type: 'error' },
    sold: { label: 'Продано', type: 'neutral' }
  }
  return map[props.status] || { label: props.status, type: 'neutral' }
})
</script>

<template>
  <span :class="['announcement-status', `announcement-status--${statusInfo.type}`]">
    {{ statusInfo.label }}
  </span>
</template>

<style scoped>
.announcement-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.announcement-status--success {
  color: #065f46;
  background: #D1FAE5;
}

.announcement-status--warning {
  color: #92400e;
  background: #FEF3C7;
}

.announcement-status--error {
  color: #991b1b;
  background: #FEE2E2;
}

.announcement-status--neutral {
  color: #374151;
  background: #F3F4F6;
}
</style>