<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  value: {
    type: [String, Number],
    required: true
  },
  label: String,
  disabled: Boolean,
  name: String,
  id: String
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputId = computed(() => props.id || `radio-${Math.random().toString(36).slice(2, 11)}`)

function handleChange() {
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<template>
  <label :class="['base-radio', { 'base-radio--disabled': disabled }]">
    <input
      :id="inputId"
      type="radio"
      :checked="modelValue === value"
      :disabled="disabled"
      :name="name"
      :value="value"
      class="base-radio__input"
      @change="handleChange"
    />
    <span class="base-radio__custom"></span>
    <span v-if="label" class="base-radio__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.base-radio {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.base-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.base-radio__custom {
  position: relative;
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #D1D5DB;
  border-radius: 50%;
  transition: all 0.2s;
}

.base-radio__input:checked + .base-radio__custom {
  border-color: #0A84FF;
}

.base-radio__input:checked + .base-radio__custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: #0A84FF;
  border-radius: 50%;
}

.base-radio__input:focus-visible + .base-radio__custom {
  outline: 2px solid #0A84FF;
  outline-offset: 2px;
}

.base-radio__label {
  font-size: 14px;
  color: #374151;
}
</style>