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
    validator: (v) => ['default', 'user', 'announcement', 'feedback', 'payment', 'audit'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  withDot: {
    type: Boolean,
    default: false
  },
  withIcon: {
    type: Boolean,
    default: false
  }
})

const maps = {
  user: {
    active: { label: 'Активен', color: 'success', icon: 'check' },
    blocked: { label: 'Заблокирован', color: 'danger', icon: 'lock' },
    pending: { label: 'Ожидает', color: 'warning', icon: 'clock' },
    deleted: { label: 'Удалён', color: 'neutral', icon: 'trash' }
  },
  announcement: {
    active: { label: 'Опубликовано', color: 'success', icon: 'check' },
    pending: { label: 'На модерации', color: 'warning', icon: 'clock' },
    rejected: { label: 'Отклонено', color: 'danger', icon: 'x' },
    blocked: { label: 'Заблокировано', color: 'danger', icon: 'lock' },
    sold: { label: 'Продано', color: 'neutral', icon: 'tag' },
    draft: { label: 'Черновик', color: 'draft', icon: 'edit' },
    expired: { label: 'Истекло', color: 'expired', icon: 'clock-off' }
  },
  feedback: {
    open: { label: 'Открыто', color: 'info', icon: 'chat' },
    in_progress: { label: 'В работе', color: 'warning', icon: 'clock' },
    waiting_user: { label: 'Ждёт ответа', color: 'danger', icon: 'user-wait' },
    resolved: { label: 'Решено', color: 'success', icon: 'check' },
    closed: { label: 'Закрыто', color: 'neutral', icon: 'lock' }
  },
  payment: {
    paid: { label: 'Оплачено', color: 'success', icon: 'check' },
    pending: { label: 'Ожидает', color: 'warning', icon: 'clock' },
    failed: { label: 'Ошибка', color: 'danger', icon: 'x' },
    refunded: { label: 'Возврат', color: 'neutral', icon: 'undo' }
  },
  audit: {
    created: { label: 'Создание', color: 'success', icon: 'plus' },
    updated: { label: 'Изменение', color: 'warning', icon: 'edit' },
    deleted: { label: 'Удаление', color: 'danger', icon: 'trash' },
    login: { label: 'Вход', color: 'info', icon: 'login' },
    logout: { label: 'Выход', color: 'neutral', icon: 'logout' }
  },
  default: {
    active: { label: 'Активно', color: 'success', icon: 'check' },
    inactive: { label: 'Неактивно', color: 'neutral', icon: 'minus' }
  }
}

const config = computed(() => {
  const map = maps[props.type] || maps.default
  return map[props.status] || { label: props.status, color: 'neutral', icon: 'dot' }
})

const showDot = computed(() =>
  props.withDot || config.value.color === 'warning'
)
</script>

<template>
  <span
    :class="[
      'cv-badge',
      `cv-badge--${config.color}`,
      `cv-badge--${size}`
    ]"
  >
    <span
      v-if="showDot && !withIcon"
      class="cv-badge__dot"
      aria-hidden="true"
    ></span>

    <span
      v-else-if="withIcon"
      class="cv-badge__icon"
      aria-hidden="true"
    >
      <svg v-if="config.icon === 'check'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6.5L4.5 9L10 3"/>
      </svg>
      <svg v-else-if="config.icon === 'x'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3l6 6M9 3l-6 6"/>
      </svg>
      <svg v-else-if="config.icon === 'clock'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="4.5"/>
        <path d="M6 3.5V6l1.7 1"/>
      </svg>
      <svg v-else-if="config.icon === 'clock-off'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="4.5"/>
        <path d="M6 3.5V6l1.7 1"/>
        <path d="M2 2l8 8"/>
      </svg>
      <svg v-else-if="config.icon === 'lock'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="8" height="6" rx="1"/>
        <path d="M4 5V3.5a2 2 0 0 1 4 0V5"/>
      </svg>
      <svg v-else-if="config.icon === 'tag'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6l4-4h4v4l-4 4z"/>
        <circle cx="8" cy="4" r="0.7" fill="currentColor"/>
      </svg>
      <svg v-else-if="config.icon === 'edit'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 2l2 2-6 6H2V8z"/>
      </svg>
      <svg v-else-if="config.icon === 'trash'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3h8M4 3v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3M5 3V2h2v1"/>
      </svg>
      <svg v-else-if="config.icon === 'plus'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2v8M2 6h8"/>
      </svg>
      <svg v-else-if="config.icon === 'minus'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6h8"/>
      </svg>
      <svg v-else-if="config.icon === 'undo'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3v3h3"/>
        <path d="M2 6a4 4 0 1 0 1-3"/>
      </svg>
      <svg v-else-if="config.icon === 'login'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 2h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7"/>
        <path d="M5 8l3-2-3-2M8 6H2"/>
      </svg>
      <svg v-else-if="config.icon === 'logout'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 2H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/>
        <path d="M7 8l3-2-3-2M10 6H4"/>
      </svg>
      <svg v-else-if="config.icon === 'chat'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 5.5a4 4 0 0 1-4 4H4l-2 1.5V7a4 4 0 0 1 4-4h1a4 4 0 0 1 3 2.5z"/>
      </svg>
      <svg v-else-if="config.icon === 'user-wait'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="4" r="2"/>
        <path d="M2 11c0-2 2-3 4-3s4 1 4 3"/>
      </svg>
      <svg v-else width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="6" r="3"/>
      </svg>
    </span>

    <span class="cv-badge__label">{{ config.label }}</span>
  </span>
</template>

<style scoped>
.cv-badge {
  --cv-badge-color: rgba(220, 210, 195, 0.75);
  --cv-badge-bg: rgba(255, 255, 255, 0.04);
  --cv-badge-border: rgba(255, 255, 255, 0.08);
  --cv-badge-glow: rgba(201, 169, 97, 0);

  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--cv-badge-color);
  background: var(--cv-badge-bg);
  border: 1px solid var(--cv-badge-border);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 0 16px var(--cv-badge-glow);
}

.cv-badge--sm {
  padding: 3px 8px;
  font-size: 9.5px;
  gap: 5px;
}

.cv-badge--md {
  padding: 4px 11px;
  font-size: 10.5px;
}

.cv-badge--lg {
  padding: 6px 14px;
  font-size: 11.5px;
}

.cv-badge--success {
  --cv-badge-color: #B8CEA8;
  --cv-badge-bg: linear-gradient(135deg, rgba(122, 154, 106, 0.2), rgba(122, 154, 106, 0.05));
  --cv-badge-border: rgba(122, 154, 106, 0.42);
  --cv-badge-glow: rgba(122, 154, 106, 0.18);
}

.cv-badge--warning {
  --cv-badge-color: #F0C080;
  --cv-badge-bg: linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(217, 119, 6, 0.05));
  --cv-badge-border: rgba(217, 119, 6, 0.42);
  --cv-badge-glow: rgba(217, 119, 6, 0.22);
}

.cv-badge--danger {
  --cv-badge-color: #E8A88A;
  --cv-badge-bg: linear-gradient(135deg, rgba(184, 119, 85, 0.22), rgba(184, 119, 85, 0.05));
  --cv-badge-border: rgba(184, 119, 85, 0.48);
  --cv-badge-glow: rgba(184, 119, 85, 0.25);
}

.cv-badge--info {
  --cv-badge-color: #E8D5A0;
  --cv-badge-bg: linear-gradient(135deg, rgba(201, 169, 97, 0.2), rgba(201, 169, 97, 0.05));
  --cv-badge-border: rgba(201, 169, 97, 0.42);
  --cv-badge-glow: rgba(201, 169, 97, 0.2);
}

.cv-badge--neutral {
  --cv-badge-color: rgba(220, 210, 195, 0.75);
  --cv-badge-bg: rgba(255, 255, 255, 0.05);
  --cv-badge-border: rgba(255, 255, 255, 0.1);
  --cv-badge-glow: rgba(255, 255, 255, 0.04);
}

.cv-badge--draft {
  --cv-badge-color: rgba(201, 169, 97, 0.85);
  --cv-badge-bg: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.03));
  --cv-badge-border: rgba(201, 169, 97, 0.3);
  --cv-badge-glow: rgba(201, 169, 97, 0.12);
  border-style: dashed;
}

.cv-badge--expired {
  --cv-badge-color: rgba(184, 119, 85, 0.8);
  --cv-badge-bg: rgba(184, 119, 85, 0.06);
  --cv-badge-border: rgba(184, 119, 85, 0.3);
  --cv-badge-glow: rgba(184, 119, 85, 0.1);
}

.cv-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;
  animation: cvBadgePulse 2.2s ease-in-out infinite;
}

.cv-badge--sm .cv-badge__dot {
  width: 5px;
  height: 5px;
}

.cv-badge--success .cv-badge__dot,
.cv-badge--neutral .cv-badge__dot,
.cv-badge--draft .cv-badge__dot {
  animation: none;
  opacity: 0.75;
}

.cv-badge--success .cv-badge__dot {
  opacity: 1;
}

@keyframes cvBadgePulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-badge__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-badge__label {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cv-badge {
    gap: 5px;
  }

  .cv-badge--lg {
    padding: 5px 11px;
    font-size: 10.5px;
  }

  .cv-badge--md {
    padding: 3px 9px;
    font-size: 10px;
  }
}
</style>