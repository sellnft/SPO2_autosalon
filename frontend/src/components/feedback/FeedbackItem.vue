<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  feedback: {
    type: Object,
    required: true
  }
})

const statusInfo = computed(() => {
  const map = {
    open: { label: 'Открыто', color: 'info' },
    in_progress: { label: 'В работе', color: 'warning' },
    waiting_user: { label: 'Ждёт ответа', color: 'danger' },
    resolved: { label: 'Решено', color: 'success' },
    closed: { label: 'Закрыто', color: 'neutral' }
  }
  return map[props.feedback.status] || { label: props.feedback.status, color: 'neutral' }
})

const priorityInfo = computed(() => {
  const map = {
    low: { label: 'Низкий', color: 'neutral' },
    normal: { label: 'Обычный', color: 'info' },
    high: { label: 'Высокий', color: 'warning' },
    critical: { label: 'Критический', color: 'danger' }
  }
  return map[props.feedback.priority] || { label: 'Обычный', color: 'info' }
})

const unreadCount = computed(() => 
  props.feedback.messages.filter(m => 
    m.authorType === 'admin' && !m.read
  ).length
)

const lastMessage = computed(() => {
  const msgs = props.feedback.messages
  return msgs[msgs.length - 1]
})
</script>

<template>
  <RouterLink
    :to="`/feedback/${feedback.id}`"
    class="feedback-item"
  >
    <div class="feedback-item__status-bar" :data-color="statusInfo.color"></div>
    
    <div class="feedback-item__main">
      <div class="feedback-item__header">
        <h3 class="feedback-item__subject">{{ feedback.subject }}</h3>
        <span
          class="feedback-item__status"
          :data-color="statusInfo.color"
        >
          {{ statusInfo.label }}
        </span>
      </div>
      
      <div class="feedback-item__meta">
        <span class="feedback-item__id">#{{ feedback.id }}</span>
        <span class="feedback-item__dot">•</span>
        <span
          class="feedback-item__priority"
          :data-color="priorityInfo.color"
        >
          {{ priorityInfo.label }}
        </span>
        <span class="feedback-item__dot">•</span>
        <span class="feedback-item__time">
          {{ formatDate(feedback.updatedAt, 'relative') }}
        </span>
      </div>
      
      <p v-if="lastMessage" class="feedback-item__preview">
        <span class="feedback-item__preview-author">
          {{ lastMessage.authorName }}:
        </span>
        {{ lastMessage.content }}
      </p>
    </div>
    
    <div v-if="unreadCount" class="feedback-item__badge">
      {{ unreadCount }}
    </div>
  </RouterLink>
</template>

<style scoped>
.feedback-item {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}

.feedback-item:hover {
  border-color: #0A84FF;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.08);
}

.feedback-item__status-bar {
  position: absolute;
  top: 20px;
  left: 0;
  width: 3px;
  height: 40px;
  border-radius: 0 3px 3px 0;
  background: #9CA3AF;
}

.feedback-item__status-bar[data-color="info"] { background: #0A84FF; }
.feedback-item__status-bar[data-color="warning"] { background: #F59E0B; }
.feedback-item__status-bar[data-color="danger"] { background: #EF4444; }
.feedback-item__status-bar[data-color="success"] { background: #10B981; }
.feedback-item__status-bar[data-color="neutral"] { background: #9CA3AF; }

.feedback-item__main {
  flex: 1;
  min-width: 0;
}

.feedback-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.feedback-item__subject {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.feedback-item__status {
  flex-shrink: 0;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.feedback-item__status[data-color="info"] {
  color: #1e40af;
  background: #DBEAFE;
}

.feedback-item__status[data-color="warning"] {
  color: #92400e;
  background: #FEF3C7;
}

.feedback-item__status[data-color="danger"] {
  color: #991b1b;
  background: #FEE2E2;
}

.feedback-item__status[data-color="success"] {
  color: #065f46;
  background: #D1FAE5;
}

.feedback-item__status[data-color="neutral"] {
  color: #374151;
  background: #F3F4F6;
}

.feedback-item__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #6B7280;
}

.feedback-item__id {
  font-family: monospace;
  font-weight: 600;
  color: #374151;
}

.feedback-item__dot {
  color: #D1D5DB;
}

.feedback-item__priority {
  font-weight: 500;
}

.feedback-item__priority[data-color="info"] { color: #0A84FF; }
.feedback-item__priority[data-color="warning"] { color: #F59E0B; }
.feedback-item__priority[data-color="danger"] { color: #EF4444; }
.feedback-item__priority[data-color="neutral"] { color: #6B7280; }

.feedback-item__time {
  margin-left: auto;
}

.feedback-item__preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.5;
  color: #4B5563;
}

.feedback-item__preview-author {
  font-weight: 600;
  color: #111827;
}

.feedback-item__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: #EF4444;
  border-radius: 100px;
}
</style>