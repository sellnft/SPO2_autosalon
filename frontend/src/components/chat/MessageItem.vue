<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  own: {
    type: Boolean,
    default: false
  }
})

const statusIcon = computed(() => {
  const map = {
    sending: '⏱',
    sent: '✓',
    received: '✓✓',
    failed: '✕'
  }
  return map[props.message.status] || ''
})
</script>

<template>
  <div :class="['message-item', { 'message-item--own': own }]">
    <div class="message-item__bubble">
      <p class="message-item__content">{{ message.content }}</p>
      
      <div class="message-item__meta">
        <span class="message-item__time">
          {{ formatDate(message.createdAt, 'time') }}
        </span>
        <span
          v-if="own && statusIcon"
          :class="[
            'message-item__status',
            `message-item__status--${message.status}`
          ]"
        >
          {{ statusIcon }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 8px;
}

.message-item--own {
  justify-content: flex-end;
}

.message-item__bubble {
  max-width: 70%;
  padding: 10px 14px;
  background: #F3F4F6;
  border-radius: 16px 16px 16px 4px;
  word-wrap: break-word;
}

.message-item--own .message-item__bubble {
  background: #0A84FF;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message-item__content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-item__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.message-item__time {
  font-size: 11px;
  color: #9CA3AF;
}

.message-item--own .message-item__time {
  color: rgba(255, 255, 255, 0.7);
}

.message-item__status {
  font-size: 11px;
}

.message-item--own .message-item__status {
  color: rgba(255, 255, 255, 0.7);
}

.message-item__status--sending {
  animation: pulse 1s infinite;
}

.message-item__status--failed {
  color: #FCA5A5;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>