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
  <div :class="['cv-msg', { 'cv-msg--own': own }]">
    <div class="cv-msg__bubble">
      <p class="cv-msg__content">{{ message.content }}</p>

      <div class="cv-msg__meta">
        <span class="cv-msg__time">
          {{ formatDate(message.createdAt, 'time') }}
        </span>
        <span
          v-if="own && statusIcon"
          :class="[
            'cv-msg__status',
            `cv-msg__status--${message.status}`
          ]"
        >
          {{ statusIcon }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv-msg {
  display: flex;
  margin-bottom: 10px;
  animation: cvMsgEnter 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes cvMsgEnter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cv-msg--own {
  justify-content: flex-end;
}

.cv-msg__bubble {
  position: relative;
  max-width: 70%;
  padding: 11px 15px;
  word-wrap: break-word;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 16px 16px 16px 4px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
  transition: all 0.25s ease;
}

.cv-msg--own .cv-msg__bubble {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.4);
  border-radius: 16px 16px 4px 16px;
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.28),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-msg__content {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  letter-spacing: 0.05px;
  white-space: pre-wrap;
  color: rgba(245, 240, 230, 0.92);
}

.cv-msg--own .cv-msg__content {
  color: #1A1208;
  font-weight: 500;
}

.cv-msg__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  margin-top: 5px;
}

.cv-msg__time {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: rgba(200, 190, 175, 0.45);
}

.cv-msg--own .cv-msg__time {
  color: rgba(26, 18, 8, 0.55);
}

.cv-msg__status {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(232, 213, 160, 0.75);
}

.cv-msg--own .cv-msg__status {
  color: rgba(26, 18, 8, 0.75);
}

.cv-msg__status--sending {
  animation: cvMsgPulse 1.2s ease-in-out infinite;
}

.cv-msg__status--received {
  color: #B8CEA8;
}

.cv-msg--own .cv-msg__status--received {
  color: #1A1208;
  text-shadow: 0 0 8px rgba(26, 18, 8, 0.35);
}

.cv-msg__status--failed {
  color: #E8A88A;
}

.cv-msg--own .cv-msg__status--failed {
  color: #6B2D1A;
}

@keyframes cvMsgPulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.92);
  }
}

@media (max-width: 640px) {
  .cv-msg__bubble {
    max-width: 82%;
    padding: 10px 13px;
  }

  .cv-msg__content {
    font-size: 13.5px;
  }

  .cv-msg__time,
  .cv-msg__status {
    font-size: 10.5px;
  }
}
</style>