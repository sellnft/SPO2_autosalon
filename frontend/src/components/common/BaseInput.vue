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
  autofocus: Boolean,
  clearable: Boolean,
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input', 'change', 'clear'])

const isFocused = ref(false)
const isPasswordVisible = ref(false)

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 11)}`)

const isPassword = computed(() => props.type === 'password')

const actualType = computed(() => {
  if (isPassword.value) {
    return isPasswordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const showClear = computed(() =>
  props.clearable
  && !props.disabled
  && !props.readonly
  && props.modelValue !== ''
  && props.modelValue !== null
  && props.modelValue !== undefined
)

const classes = computed(() => [
  'cv-input',
  `cv-input--${props.size}`,
  {
    'cv-input--focused': isFocused.value,
    'cv-input--error': props.error,
    'cv-input--success': props.success,
    'cv-input--disabled': props.disabled,
    'cv-input--has-clear': showClear.value,
    'cv-input--has-suffix': isPassword.value
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

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}

function togglePassword() {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <div class="cv-input-wrap">
    <label v-if="label" :for="inputId" class="cv-input__label">
      {{ label }}
      <span v-if="required" class="cv-input__required">*</span>
    </label>

    <div :class="classes">
      <span v-if="$slots.prefix" class="cv-input__prefix">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        :type="actualType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :name="name"
        :maxlength="maxlength"
        :autofocus="autofocus"
        class="cv-input__field"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="emit('change', $event)"
      />

      <button
        v-if="showClear"
        type="button"
        class="cv-input__action"
        aria-label="Очистить"
        @click="handleClear"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4l8 8M12 4l-8 8"/>
        </svg>
      </button>

      <button
        v-if="isPassword"
        type="button"
        class="cv-input__action cv-input__action--toggle"
        :aria-label="isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'"
        @click="togglePassword"
      >
        <svg v-if="isPasswordVisible" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a17.5 17.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a17.5 17.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
          <path d="M1 1l22 22"/>
        </svg>
      </button>

      <span v-if="$slots.suffix" class="cv-input__suffix">
        <slot name="suffix" />
      </span>
    </div>

    <p v-if="error" class="cv-input__error">{{ error }}</p>
    <p v-else-if="hint" class="cv-input__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cv-input-wrap {
  width: 100%;
}

.cv-input__label {
  display: block;
  margin-bottom: 8px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-input__required {
  color: #E8A88A;
  margin-left: 3px;
  font-weight: 700;
}

.cv-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-input:hover:not(.cv-input--disabled) {
  border-color: rgba(201, 169, 97, 0.42);
}

.cv-input--focused {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 32px rgba(201, 169, 97, 0.12),
    0 1px 0 rgba(232, 213, 160, 0.08) inset;
}

.cv-input--error {
  border-color: rgba(184, 119, 85, 0.65);
}

.cv-input--error.cv-input--focused {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(184, 119, 85, 0.15),
    0 0 32px rgba(184, 119, 85, 0.15);
}

.cv-input--success {
  border-color: rgba(122, 154, 106, 0.6);
}

.cv-input--success.cv-input--focused {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(122, 154, 106, 0.15),
    0 0 32px rgba(122, 154, 106, 0.12);
}

.cv-input--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-input__field {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  color: rgba(245, 240, 230, 0.92);
  background: transparent;
  border: none;
  outline: none;
  letter-spacing: 0.05px;
}

.cv-input--sm .cv-input__field {
  padding: 9px 14px;
  font-size: 13px;
}

.cv-input--lg .cv-input__field {
  padding: 14px 18px;
  font-size: 15px;
}

.cv-input__field::placeholder {
  color: rgba(200, 190, 175, 0.4);
  transition: color 0.25s ease;
}

.cv-input--focused .cv-input__field::placeholder {
  color: rgba(200, 190, 175, 0.55);
}

.cv-input__field:disabled {
  cursor: not-allowed;
  color: rgba(220, 210, 195, 0.5);
}

.cv-input__field:-webkit-autofill,
.cv-input__field:-webkit-autofill:hover,
.cv-input__field:-webkit-autofill:focus {
  -webkit-text-fill-color: rgba(245, 240, 230, 0.92);
  -webkit-box-shadow: 0 0 0 1000px #14141A inset;
  transition: background-color 5000s ease-in-out 0s;
}

.cv-input__prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-left: 14px;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-input__suffix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-right: 14px;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-input__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 8px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-input__action:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-input__action:active {
  transform: scale(0.94);
}

.cv-input__action--toggle {
  margin-right: 8px;
}

.cv-input--has-suffix .cv-input__action--toggle {
  margin-right: 6px;
}

.cv-input__error {
  margin: 6px 0 0 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: #E8A88A;
}

.cv-input__hint {
  margin: 6px 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.5);
}

@media (max-width: 640px) {
  .cv-input__field {
    font-size: 16px;
  }

  .cv-input--sm .cv-input__field {
    font-size: 15px;
  }

  .cv-input--lg .cv-input__field {
    font-size: 16px;
  }

  .cv-input__action {
    width: 30px;
    height: 30px;
  }
}
</style>