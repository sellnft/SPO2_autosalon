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
  props.feedback.messages?.filter(m =>
    m.authorType === 'admin' && !m.read
  ).length || 0
)

const lastMessage = computed(() => {
  const msgs = props.feedback.messages || []
  return msgs[msgs.length - 1]
})
</script>

<template>
  <RouterLink
    :to="`/feedback/${feedback.id}`"
    class="cv-fb"
  >
    <div class="cv-fb__status-bar" :data-color="statusInfo.color"></div>

    <div class="cv-fb__main">
      <div class="cv-fb__header">
        <h3 class="cv-fb__subject">{{ feedback.subject }}</h3>
        <span
          class="cv-fb__status"
          :data-color="statusInfo.color"
        >
          {{ statusInfo.label }}
        </span>
      </div>

      <div class="cv-fb__meta">
        <span class="cv-fb__id">#{{ feedback.id }}</span>
        <span class="cv-fb__dot">•</span>
        <span
          class="cv-fb__priority"
          :data-color="priorityInfo.color"
        >
          {{ priorityInfo.label }}
        </span>
        <span class="cv-fb__dot">•</span>
        <span class="cv-fb__time">
          {{ formatDate(feedback.updatedAt, 'relative') }}
        </span>
      </div>

      <p v-if="lastMessage" class="cv-fb__preview">
        <span class="cv-fb__preview-author">
          {{ lastMessage.authorName }}:
        </span>
        {{ lastMessage.content }}
      </p>
    </div>

    <div v-if="unreadCount" class="cv-fb__badge">
      {{ unreadCount }}
    </div>

    <span class="cv-fb__arrow" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </span>
  </RouterLink>
</template>

<style scoped>
.cv-fb {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 20px 22px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1rem;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  isolation: isolate;
}

.cv-fb::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.cv-fb:hover {
  border-color: rgba(201, 169, 97, 0.38);
  transform: translateY(-2px);
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.45),
    0 0 32px rgba(201, 169, 97, 0.14);
}

.cv-fb:hover::before {
  opacity: 1;
}

.cv-fb__status-bar {
  position: absolute;
  top: 20px;
  left: 0;
  width: 3px;
  height: 44px;
  border-radius: 0 3px 3px 0;
  background: rgba(200, 190, 175, 0.4);
  transition: all 0.3s ease;
}

.cv-fb:hover .cv-fb__status-bar {
  height: 56px;
  box-shadow: 0 0 16px currentColor;
}

.cv-fb__status-bar[data-color="info"] {
  background: linear-gradient(180deg, #F5E6BC, #C9A961, #8B6F3F);
  color: rgba(201, 169, 97, 0.6);
}

.cv-fb__status-bar[data-color="warning"] {
  background: linear-gradient(180deg, #F0C080, #D97706, #8B4513);
  color: rgba(217, 119, 6, 0.6);
}

.cv-fb__status-bar[data-color="danger"] {
  background: linear-gradient(180deg, #E8A88A, #B87755, #6B4225);
  color: rgba(184, 119, 85, 0.6);
}

.cv-fb__status-bar[data-color="success"] {
  background: linear-gradient(180deg, #B8CEA8, #7A9A6A, #4A6B3F);
  color: rgba(122, 154, 106, 0.6);
}

.cv-fb__status-bar[data-color="neutral"] {
  background: linear-gradient(180deg, #D5CDBE, #8E8779, #4A463E);
  color: rgba(142, 135, 121, 0.5);
}

.cv-fb__main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.cv-fb__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.cv-fb__subject {
  margin: 0;
  flex: 1;
  font-size: 15.5px;
  font-weight: 650;
  letter-spacing: -0.15px;
  line-height: 1.35;
  color: rgba(245, 240, 230, 0.92);
  transition: color 0.25s ease;
}

.cv-fb:hover .cv-fb__subject {
  color: #F5E6BC;
}

.cv-fb__status {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.cv-fb__status[data-color="info"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.2), rgba(201, 169, 97, 0.08));
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-fb__status[data-color="warning"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.08));
  border-color: rgba(217, 119, 6, 0.4);
}

.cv-fb__status[data-color="danger"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.22), rgba(184, 119, 85, 0.08));
  border-color: rgba(184, 119, 85, 0.45);
}

.cv-fb__status[data-color="success"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.2), rgba(122, 154, 106, 0.08));
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-fb__status[data-color="neutral"] {
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-fb__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 12px;
  color: rgba(220, 210, 195, 0.5);
  flex-wrap: wrap;
}

.cv-fb__id {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: rgba(232, 213, 160, 0.85);
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.15);
}

.cv-fb__dot {
  color: rgba(200, 190, 175, 0.25);
}

.cv-fb__priority {
  font-weight: 600;
  letter-spacing: 0.1px;
}

.cv-fb__priority[data-color="info"] { color: #E8D5A0; }
.cv-fb__priority[data-color="warning"] { color: #F0C080; }
.cv-fb__priority[data-color="danger"] { color: #E8A88A; }
.cv-fb__priority[data-color="neutral"] { color: rgba(220, 210, 195, 0.6); }

.cv-fb__time {
  margin-left: auto;
  font-weight: 500;
  letter-spacing: 0.15px;
}

.cv-fb__preview {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
  letter-spacing: 0.05px;
}

.cv-fb__preview-author {
  font-weight: 650;
  color: rgba(245, 240, 230, 0.85);
}

.cv-fb__badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
  animation: cvFbPulse 2.5s ease-in-out infinite;
}

@keyframes cvFbPulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(201, 169, 97, 0.4),
      0 4px 12px rgba(201, 169, 97, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 3px rgba(201, 169, 97, 0.15),
      0 6px 18px rgba(201, 169, 97, 0.6);
  }
}

.cv-fb__arrow {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  flex-shrink: 0;
  color: rgba(200, 190, 175, 0.35);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.6;
}

.cv-fb:hover .cv-fb__arrow {
  color: #E8D5A0;
  transform: translateX(4px);
  opacity: 1;
}

@media (max-width: 640px) {
  .cv-fb {
    padding: 16px 16px 16px 20px;
    gap: 12px;
    border-radius: 0.875rem;
  }

  .cv-fb__status-bar {
    height: 36px;
    top: 16px;
  }

  .cv-fb:hover .cv-fb__status-bar {
    height: 44px;
  }

  .cv-fb__subject {
    font-size: 14.5px;
  }

  .cv-fb__status {
    padding: 4px 9px;
    font-size: 10px;
    letter-spacing: 0.4px;
  }

  .cv-fb__meta {
    margin-bottom: 10px;
  }

  .cv-fb__arrow {
    display: none;
  }
}
</style>