<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: String,
  placeholder: String,
  hint: String,
  error: String,
  rows: {
    type: Number,
    default: 4
  },
  maxlength: [String, Number],
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  autoResize: Boolean,
  name: String,
  id: String
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const isFocused = ref(false)
const textareaRef = ref(null)

const inputId = computed(() => props.id || `textarea-${Math.random().toString(36).slice(2, 11)}`)

function autoResize() {
  if (props.autoResize && textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

function handleInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
  autoResize()
}
</script>

<template>
  <div class="base-textarea-wrapper">
    <label v-if="label" :for="inputId" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required">*</span>
    </label>
    
    <div 
      :class="[
        'base-textarea',
        { 
          'base-textarea--focused': isFocused,
          'base-textarea--error': error,
          'base-textarea--disabled': disabled
        }
      ]"
    >
      <textarea
        :id="inputId"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        :maxlength="maxlength"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :name="name"
        class="base-textarea__field"
        @input="handleInput"
        @focus="isFocused = true; emit('focus', $event)"
        @blur="isFocused = false; emit('blur', $event)"
      ></textarea>
      
      <div v-if="maxlength" class="base-textarea__counter">
        {{ String(modelValue).length }} / {{ maxlength }}
      </div>
    </div>
    
    <p v-if="error" class="base-textarea__error">{{ error }}</p>
    <p v-else-if="hint" class="base-textarea__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.base-textarea-wrapper {
  width: 100%;
}

.base-textarea__label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.base-textarea__required {
  color: #EF4444;
  margin-left: 2px;
}

.base-textarea {
  position: relative;
  background: white;
  border: 1.5px solid #D1D5DB;
  border-radius: 12px;
  transition: all 0.2s;
}

.base-textarea:hover:not(.base-textarea--disabled) {
  border-color: #9CA3AF;
}

.base-textarea--focused {
  border-color: #0A84FF;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
}

.base-textarea--error {
  border-color: #EF4444;
}

.base-textarea--disabled {
  background: #F9FAFB;
  cursor: not-allowed;
}

.base-textarea__field {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  color: #111827;
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 100px;
}

.base-textarea__field::placeholder {
  color: #9CA3AF;
}

.base-textarea__field:disabled {
  cursor: not-allowed;
}

.base-textarea__counter {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: #9CA3AF;
  pointer-events: none;
}

.base-textarea__error {
  margin-top: 6px;
  font-size: 12px;
  color: #EF4444;
}

.base-textarea__hint {
  margin-top: 6px;
  font-size: 12px;
  color: #6B7280;
}
</style>