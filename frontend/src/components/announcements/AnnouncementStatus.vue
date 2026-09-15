<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'badge',
    validator: (v) => ['badge', 'dot', 'pill', 'text'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  withDot: {
    type: Boolean,
    default: false
  }
})

const statusInfo = computed(() => {
  const map = {
    active: { label: 'Активно', type: 'success', icon: 'check' },
    pending: { label: 'На модерации', type: 'warning', icon: 'clock' },
    rejected: { label: 'Отклонено', type: 'error', icon: 'x' },
    blocked: { label: 'Заблокировано', type: 'error', icon: 'lock' },
    sold: { label: 'Продано', type: 'neutral', icon: 'tag' },
    draft: { label: 'Черновик', type: 'draft', icon: 'edit' },
    expired: { label: 'Истекло', type: 'expired', icon: 'clock-off' }
  }
  return map[props.status] || { label: props.status, type: 'neutral', icon: 'dot' }
})

const showDot = computed(() =>
  props.withDot || props.variant === 'dot' || props.status === 'pending'
)
</script>

<template>
  <span
    :class="[
      'cv-status',
      `cv-status--${statusInfo.type}`,
      `cv-status--${variant}`,
      `cv-status--${size}`
    ]"
  >
    <span
      v-if="showDot && variant !== 'text'"
      class="cv-status__dot"
      aria-hidden="true"
    ></span>

    <span
      v-else-if="variant !== 'dot' && variant !== 'text'"
      class="cv-status__icon"
      aria-hidden="true"
    >
      <svg v-if="statusInfo.icon === 'check'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6.5L4.5 9L10 3"/>
      </svg>

      <svg v-else-if="statusInfo.icon === 'clock'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="4.5"/>
        <path d="M6 3.5V6l1.7 1"/>
      </svg>

      <svg v-else-if="statusInfo.icon === 'x'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3l6 6M9 3l-6 6"/>
      </svg>

      <svg v-else-if="statusInfo.icon === 'lock'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="5" width="8" height="6" rx="1"/>
        <path d="M4 5V3.5a2 2 0 0 1 4 0V5"/>
      </svg>

      <svg v-else-if="statusInfo.icon === 'tag'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 6l4-4h4v4l-4 4z"/>
        <circle cx="8" cy="4" r="0.7" fill="currentColor"/>
      </svg>

      <svg v-else-if="statusInfo.icon === 'edit'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 2l2 2-6 6H2V8z"/>
        <path d="M7 3l2 2"/>
      </svg>

      <svg v-else-if="statusInfo.icon === 'clock-off'" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="4.5"/>
        <path d="M6 3.5V6l1.7 1"/>
        <path d="M2 2l8 8"/>
      </svg>

      <svg v-else width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="6" cy="6" r="3"/>
      </svg>
    </span>

    <span class="cv-status__label">{{ statusInfo.label }}</span>
  </span>
</template>

<style scoped>
.cv-status {
  --cv-status-color: rgba(220, 210, 195, 0.75);
  --cv-status-bg: rgba(255, 255, 255, 0.04);
  --cv-status-border: rgba(255, 255, 255, 0.08);
  --cv-status-glow: rgba(201, 169, 97, 0);

  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
  color: var(--cv-status-color);
  background: var(--cv-status-bg);
  border: 1px solid var(--cv-status-border);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.03) inset,
    0 0 16px var(--cv-status-glow);
}

.cv-status--sm {
  padding: 3px 9px;
  font-size: 10.5px;
  border-radius: 999px;
}

.cv-status--md {
  padding: 4px 11px;
  font-size: 11px;
  border-radius: 999px;
}

.cv-status--lg {
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 999px;
}

.cv-status--success {
  --cv-status-color: #B8CEA8;
  --cv-status-bg: linear-gradient(135deg, rgba(122, 154, 106, 0.18), rgba(122, 154, 106, 0.05));
  --cv-status-border: rgba(122, 154, 106, 0.42);
  --cv-status-glow: rgba(122, 154, 106, 0.18);
}

.cv-status--warning {
  --cv-status-color: #F0C080;
  --cv-status-bg: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(217, 119, 6, 0.04));
  --cv-status-border: rgba(217, 119, 6, 0.42);
  --cv-status-glow: rgba(217, 119, 6, 0.2);
}

.cv-status--error {
  --cv-status-color: #E8A88A;
  --cv-status-bg: linear-gradient(135deg, rgba(184, 119, 85, 0.2), rgba(184, 119, 85, 0.05));
  --cv-status-border: rgba(184, 119, 85, 0.48);
  --cv-status-glow: rgba(184, 119, 85, 0.22);
}

.cv-status--neutral {
  --cv-status-color: rgba(220, 210, 195, 0.75);
  --cv-status-bg: rgba(255, 255, 255, 0.05);
  --cv-status-border: rgba(255, 255, 255, 0.1);
  --cv-status-glow: rgba(255, 255, 255, 0.04);
}

.cv-status--draft {
  --cv-status-color: rgba(201, 169, 97, 0.85);
  --cv-status-bg: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.03));
  --cv-status-border: rgba(201, 169, 97, 0.3);
  --cv-status-glow: rgba(201, 169, 97, 0.12);
  border-style: dashed;
}

.cv-status--expired {
  --cv-status-color: rgba(184, 119, 85, 0.75);
  --cv-status-bg: rgba(184, 119, 85, 0.06);
  --cv-status-border: rgba(184, 119, 85, 0.28);
  --cv-status-glow: rgba(184, 119, 85, 0.1);
}

.cv-status__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  flex-shrink: 0;
  animation: cvStatusPulse 2.2s ease-in-out infinite;
}

.cv-status--success .cv-status__dot {
  animation: none;
}

.cv-status--neutral .cv-status__dot {
  animation: none;
  opacity: 0.6;
}

.cv-status--draft .cv-status__dot {
  animation: none;
}

@keyframes cvStatusPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-status__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-status__label {
  white-space: nowrap;
}

.cv-status--dot {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.cv-status--dot .cv-status__label {
  font-size: inherit;
}

.cv-status--text {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.cv-status--text .cv-status__label {
  text-decoration: underline;
  text-decoration-color: rgba(201, 169, 97, 0.3);
  text-underline-offset: 3px;
}
</style>