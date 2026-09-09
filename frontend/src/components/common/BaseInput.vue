<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: String,
  placeholder: String,
  hint: String,
  error: String,
  success: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  autocomplete: String,
  name: String,
  id: String,
  maxlength: [String, Number],
  autofocus: Boolean
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input', 'change'])

const isFocused = ref(false)

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 11)}`)

const classes = computed(() => [
  'base-input',
  {
    'base-input--focused': isFocused.value,
    'base-input--error': props.error,
    'base-input--success': props.success,
    'base-input--disabled': props.disabled
  }
])

function handleInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

function handleFocus(event) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event) {
  isFocused.value = false
  emit('blur', event)
}
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>
    
    <div :class="classes">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :name="name"
        :maxlength="maxlength"
        :autofocus="autofocus"
        class="base-input__field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="emit('change', $event)"
      />
    </div>
    
    <p v-if="error" class="base-input__error">{{ error }}</p>
    <p v-else-if="hint" class="base-input__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-input-wrapper {
  width: 100%;
}

.base-input__label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.base-input__required {
  color: #EF4444;
  margin-left: 2px;
}

.base-input {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1.5px solid #D1D5DB;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.base-input:hover:not(.base-input--disabled) {
  border-color: #9CA3AF;
}

.base-input--focused {
  border-color: #0A84FF;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
}

.base-input--error {
  border-color: #EF4444;
}

.base-input--error.base-input--focused {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input--success {
  border-color: #10B981;
}

.base-input--disabled {
  background: #F9FAFB;
  cursor: not-allowed;
}

.base-input__field {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #111827;
  background: transparent;
  border: none;
  outline: none;
}

.base-input__field::placeholder {
  color: #9CA3AF;
}

.base-input__field:disabled {
  cursor: not-allowed;
  color: #6B7280;
}

.base-input__error {
  margin-top: 6px;
  font-size: 12px;
  color: #EF4444;
}

.base-input__hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6B7280;
}
</style>