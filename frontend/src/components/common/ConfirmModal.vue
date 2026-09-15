<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (v) => ['danger', 'primary', 'warning', 'success'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const iconType = computed(() => {
  if (props.icon) return props.icon
  const map = {
    danger: 'warning',
    warning: 'warning',
    primary: 'question',
    success: 'check'
  }
  return map[props.variant] || 'warning'
})

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    :hide-close="loading"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="cv-confirm">
      <div class="cv-confirm__icon" :data-variant="variant">
        <span class="cv-confirm__icon-glow" aria-hidden="true"></span>

        <svg v-if="iconType === 'warning'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>

        <svg v-else-if="iconType === 'question'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.5-1 .9-1 1.7"/>
          <path d="M12 17h.01"/>
        </svg>

        <svg v-else-if="iconType === 'check'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M8 12l3 3 5-6"/>
        </svg>

        <svg v-else-if="iconType === 'trash'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"/>
          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
        </svg>

        <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </div>

      <p class="cv-confirm__message">{{ message }}</p>

      <div class="cv-confirm__actions">
        <BaseButton
          variant="ghost"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </BaseButton>

        <BaseButton
          :variant="variant"
          :loading="loading"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.cv-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4px 8px 8px;
}

.cv-confirm__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  margin-bottom: 20px;
  border-radius: 20px;
  isolation: isolate;
  animation: cvConfirmPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cvConfirmPop {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  60% {
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.cv-confirm__icon-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

.cv-confirm__icon[data-variant="danger"] {
  color: #E8A88A;
  background:
    linear-gradient(180deg, rgba(40, 20, 14, 0.55) 0%, rgba(20, 12, 8, 0.7) 100%),
    linear-gradient(180deg, #1F1612 0%, #14100C 100%);
  border: 1px solid rgba(184, 119, 85, 0.35);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.06) inset,
    0 1px 0 rgba(232, 168, 138, 0.15) inset,
    0 0 60px rgba(184, 119, 85, 0.2);
}

.cv-confirm__icon[data-variant="danger"] .cv-confirm__icon-glow {
  background: radial-gradient(circle, rgba(184, 119, 85, 0.45), transparent 70%);
}

.cv-confirm__icon[data-variant="warning"] {
  color: #F0C080;
  background:
    linear-gradient(180deg, rgba(40, 30, 15, 0.55) 0%, rgba(20, 15, 8, 0.7) 100%),
    linear-gradient(180deg, #1F1A12 0%, #14100C 100%);
  border: 1px solid rgba(217, 119, 6, 0.35);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(217, 119, 6, 0.06) inset,
    0 1px 0 rgba(240, 192, 128, 0.15) inset,
    0 0 60px rgba(217, 119, 6, 0.2);
}

.cv-confirm__icon[data-variant="warning"] .cv-confirm__icon-glow {
  background: radial-gradient(circle, rgba(217, 119, 6, 0.45), transparent 70%);
}

.cv-confirm__icon[data-variant="primary"] {
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.55) 0%, rgba(20, 16, 10, 0.7) 100%),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.38);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.15) inset,
    0 0 60px rgba(201, 169, 97, 0.2);
}

.cv-confirm__icon[data-variant="primary"] .cv-confirm__icon-glow {
  background: radial-gradient(circle, rgba(201, 169, 97, 0.45), transparent 70%);
}

.cv-confirm__icon[data-variant="success"] {
  color: #B8CEA8;
  background:
    linear-gradient(180deg, rgba(30, 40, 20, 0.55) 0%, rgba(15, 20, 10, 0.7) 100%),
    linear-gradient(180deg, #161C12 0%, #10140C 100%);
  border: 1px solid rgba(122, 154, 106, 0.38);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(122, 154, 106, 0.06) inset,
    0 1px 0 rgba(184, 206, 168, 0.15) inset,
    0 0 60px rgba(122, 154, 106, 0.2);
}

.cv-confirm__icon[data-variant="success"] .cv-confirm__icon-glow {
  background: radial-gradient(circle, rgba(122, 154, 106, 0.45), transparent 70%);
}

.cv-confirm__icon svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
}

.cv-confirm__message {
  margin: 0 0 26px;
  max-width: 380px;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
}

.cv-confirm__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  width: 100%;
}

.cv-confirm__actions > * {
  min-width: 120px;
}

@media (max-width: 480px) {
  .cv-confirm__icon {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    margin-bottom: 18px;
  }

  .cv-confirm__icon svg {
    width: 22px;
    height: 22px;
  }

  .cv-confirm__message {
    font-size: 13.5px;
    margin-bottom: 22px;
  }

  .cv-confirm__actions {
    flex-direction: column-reverse;
  }

  .cv-confirm__actions > * {
    width: 100%;
    min-width: 0;
  }
}
</style>