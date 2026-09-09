<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: String,
  disabled: Boolean,
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  name: String,
  id: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputId = computed(() => props.id || `switch-${Math.random().toString(36).slice(2, 11)}`)

function handleChange(event) {
  emit('update:modelValue', event.target.checked)
  emit('change', event.target.checked)
}
</script>

<template>
  <label :class="['base-switch', `base-switch--${size}`, { 'base-switch--disabled': disabled }]">
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :name="name"
      class="base-switch__input"
      @change="handleChange"
    />
    <span class="base-switch__track">
      <span class="base-switch__thumb"></span>
    </span>
    <span v-if="label" class="base-switch__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.base-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.base-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.base-switch__track {
  position: relative;
  width: 44px;
  height: 24px;
  background: #D1D5DB;
  border-radius: 12px;
  transition: all 0.2s;
}

.base-switch--sm .base-switch__track {
  width: 36px;
  height: 20px;
}

.base-switch--lg .base-switch__track {
  width: 52px;
  height: 28px;
}

.base-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.base-switch--sm .base-switch__thumb {
  width: 16px;
  height: 16px;
}

.base-switch--lg .base-switch__thumb {
  width: 24px;
  height: 24px;
}

.base-switch__input:checked + .base-switch__track {
  background: #0A84FF;
}

.base-switch__input:checked + .base-switch__track .base-switch__thumb {
  transform: translateX(20px);
}

.base-switch--sm .base-switch__input:checked + .base-switch__track .base-switch__thumb {
  transform: translateX(16px);
}

.base-switch--lg .base-switch__input:checked + .base-switch__track .base-switch__thumb {
  transform: translateX(24px);
}

.base-switch__input:focus-visible + .base-switch__track {
  outline: 2px solid #0A84FF;
  outline-offset: 2px;
}

.base-switch__label {
  font-size: 14px;
  color: #374151;
}
</style>