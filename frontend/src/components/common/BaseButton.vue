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
  block: Boolean,
  icon: String,
  iconPosition: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'right'].includes(v)
  }
})

const emit = defineEmits(['click'])

const classes = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'base-button--disabled': props.disabled,
    'base-button--loading': props.loading,
    'base-button--block': props.block
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
    <span v-if="loading" class="base-button__spinner">
      <span class="spinner spinner-sm" />
    </span>
    <span v-else-if="icon && iconPosition === 'left'" class="base-button__icon">
      <component :is="icon" />
    </span>
    
    <span v-if="$slots.default" class="base-button__text">
      <slot />
    </span>
    
    <span v-if="icon && iconPosition === 'right'" class="base-button__icon">
      <component :is="icon" />
    </span>
  </button>
</template>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  user-select: none;
  border: 1px solid transparent;
}

/* Sizes */
.base-button--sm {
  padding: 6px 14px;
  font-size: 13px;
}

.base-button--md {
  padding: 10px 20px;
  font-size: 14px;
}

.base-button--lg {
  padding: 14px 28px;
  font-size: 16px;
}

/* Variants */
.base-button--primary {
  background: #0A84FF;
  color: white;
}

.base-button--primary:hover:not(:disabled) {
  background: #0066CC;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
}

.base-button--secondary {
  background: #1A1A1A;
  color: white;
}

.base-button--secondary:hover:not(:disabled) {
  background: #2A2A2A;
  transform: translateY(-1px);
}

.base-button--outline {
  background: transparent;
  border-color: #D1D5DB;
  color: #111827;
}

.base-button--outline:hover:not(:disabled) {
  border-color: #0A84FF;
  color: #0A84FF;
  background: #F0F7FF;
}

.base-button--ghost {
  background: transparent;
  color: #374151;
}

.base-button--ghost:hover:not(:disabled) {
  background: #F3F4F6;
}

.base-button--danger {
  background: #EF4444;
  color: white;
}

.base-button--danger:hover:not(:disabled) {
  background: #DC2626;
  transform: translateY(-1px);
}

.base-button--success {
  background: #10B981;
  color: white;
}

.base-button--success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

/* States */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--loading {
  cursor: wait;
}

.base-button--block {
  width: 100%;
}

/* Active state */
.base-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

/* Focus */
.base-button:focus-visible {
  outline: 2px solid #0A84FF;
  outline-offset: 2px;
}

.base-button__spinner {
  display: inline-flex;
}

.base-button__icon {
  display: inline-flex;
  align-items: center;
}

.base-button__text {
  display: inline-flex;
}
</style>