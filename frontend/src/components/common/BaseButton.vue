<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: Boolean,
  loading: Boolean,
  block: Boolean
})

const emit = defineEmits(['click'])

const classes = computed(() => [
  'cv-btn',
  `cv-btn--${props.variant}`,
  `cv-btn--${props.size}`,
  {
    'cv-btn--disabled': props.disabled,
    'cv-btn--loading': props.loading,
    'cv-btn--block': props.block
  }
])

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span class="cv-btn__glow" aria-hidden="true"></span>

    <span v-if="loading" class="cv-btn__spinner">
      <span class="spinner spinner-sm" />
    </span>

    <span v-if="$slots.default" class="cv-btn__text">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.cv-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-weight: 650;
  letter-spacing: 0.15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
  user-select: none;
  border: 1px solid transparent;
  overflow: hidden;
  isolation: isolate;
}

.cv-btn__glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(255, 245, 214, 0.35), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.cv-btn:hover:not(:disabled) .cv-btn__glow {
  opacity: 1;
}

.cv-btn__spinner {
  position: relative;
  z-index: 1;
  display: inline-flex;
}

.cv-btn__text {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cv-btn--sm {
  padding: 7px 14px;
  font-size: 12.5px;
  border-radius: 10px;
}

.cv-btn--md {
  padding: 11px 22px;
  font-size: 13.5px;
}

.cv-btn--lg {
  padding: 14px 30px;
  font-size: 15px;
  border-radius: 14px;
}

.cv-btn--primary {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.3),
    0 0 0 1px rgba(255, 245, 214, 0.12) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 8px 28px rgba(201, 169, 97, 0.5),
    0 0 32px rgba(201, 169, 97, 0.28),
    0 0 0 1px rgba(255, 245, 214, 0.18) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-btn--secondary {
  color: rgba(245, 240, 230, 0.92);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border-color: rgba(201, 169, 97, 0.2);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-btn--secondary:hover:not(:disabled) {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(201, 169, 97, 0.18);
}

.cv-btn--outline {
  color: rgba(220, 210, 195, 0.8);
  background: transparent;
  border-color: rgba(201, 169, 97, 0.35);
}

.cv-btn--outline:hover:not(:disabled) {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.6);
  background: rgba(201, 169, 97, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.15);
}

.cv-btn--ghost {
  color: rgba(220, 210, 195, 0.75);
  background: transparent;
  border-color: transparent;
}

.cv-btn--ghost:hover:not(:disabled) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.18);
}

.cv-btn--danger {
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A 0%, #B87755 55%, #6B4225 100%);
  border-color: rgba(232, 168, 138, 0.5);
  box-shadow:
    0 4px 16px rgba(184, 119, 85, 0.35),
    0 0 0 1px rgba(255, 210, 190, 0.12) inset,
    0 1px 0 rgba(255, 210, 190, 0.4) inset;
}

.cv-btn--danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 8px 28px rgba(184, 119, 85, 0.55),
    0 0 32px rgba(184, 119, 85, 0.35),
    0 0 0 1px rgba(255, 210, 190, 0.18) inset,
    0 1px 0 rgba(255, 210, 190, 0.5) inset;
}

.cv-btn--success {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE 0%, #A8C088 55%, #6B8452 100%);
  border-color: rgba(184, 206, 168, 0.5);
  box-shadow:
    0 4px 16px rgba(122, 154, 106, 0.3),
    0 0 0 1px rgba(214, 232, 190, 0.12) inset,
    0 1px 0 rgba(214, 232, 190, 0.4) inset;
}

.cv-btn--success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow:
    0 8px 28px rgba(122, 154, 106, 0.5),
    0 0 32px rgba(122, 154, 106, 0.28),
    0 0 0 1px rgba(214, 232, 190, 0.18) inset,
    0 1px 0 rgba(214, 232, 190, 0.5) inset;
}

.cv-btn--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-btn--loading {
  cursor: wait;
}

.cv-btn--block {
  width: 100%;
}

.cv-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
  box-shadow: none;
}

.cv-btn:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

@media (max-width: 640px) {
  .cv-btn--sm {
    padding: 6px 12px;
    font-size: 12px;
  }

  .cv-btn--md {
    padding: 10px 18px;
    font-size: 13px;
  }

  .cv-btn--lg {
    padding: 12px 24px;
    font-size: 14px;
  }
}
</style>