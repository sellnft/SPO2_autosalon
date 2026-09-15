<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  value: {
    type: [String, Number, Boolean],
    default: true
  },
  label: String,
  disabled: Boolean,
  indeterminate: Boolean,
  error: String,
  name: String,
  id: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputId = computed(() => props.id || `checkbox-${Math.random().toString(36).slice(2, 11)}`)

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue === true
})

function handleChange(event) {
  let newValue
  if (Array.isArray(props.modelValue)) {
    if (event.target.checked) {
      newValue = [...props.modelValue, props.value]
    } else {
      newValue = props.modelValue.filter(v => v !== props.value)
    }
  } else {
    newValue = event.target.checked
  }
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<template>
  <div class="base-checkbox-wrapper">
    <label :class="['base-checkbox', { 'base-checkbox--disabled': disabled }]">
      <input
        :id="inputId"
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        :name="name"
        :indeterminate="indeterminate"
        class="base-checkbox__input"
        @change="handleChange"
      />
      <span class="base-checkbox__custom">
        <svg v-if="isChecked && !indeterminate" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span v-if="indeterminate" class="base-checkbox__dash"></span>
      </span>
      <span v-if="label || $slots.label" class="base-checkbox__label">
        <slot name="label">{{ label }}</slot>
      </span>
    </label>
    <p v-if="error" class="base-checkbox__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.base-checkbox-wrapper {
  display: inline-flex;
  flex-direction: column;
}

.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.base-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.base-checkbox__custom {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: white;
  border: 2px solid #D1D5DB;
  border-radius: 6px;
  color: white;
  transition: all 0.2s;
}

.base-checkbox__input:checked + .base-checkbox__custom,
.base-checkbox__input:indeterminate + .base-checkbox__custom {
  background: #0A84FF;
  border-color: #0A84FF;
}

.base-checkbox__input:focus-visible + .base-checkbox__custom {
  outline: 2px solid #0A84FF;
  outline-offset: 2px;
}

.base-checkbox__dash {
  width: 10px;
  height: 2px;
  background: white;
  border-radius: 1px;
}

.base-checkbox__label {
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
}

.base-checkbox__error {
  margin-top: 4px;
  font-size: 12px;
  color: #EF4444;
}
</style>