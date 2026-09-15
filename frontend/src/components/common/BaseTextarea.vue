<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'

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
  showCounter: {
    type: Boolean,
    default: true
  },
  name: String,
  id: String
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const isFocused = ref(false)
const textareaRef = ref(null)

const inputId = computed(() => props.id || `textarea-${Math.random().toString(36).slice(2, 11)}`)

const currentLength = computed(() => String(props.modelValue || '').length)

const counterRatio = computed(() => {
  if (!props.maxlength) return 0
  return Math.min(1, currentLength.value / Number(props.maxlength))
})

const counterState = computed(() => {
  if (!props.maxlength) return 'default'
  const ratio = counterRatio.value
  if (ratio >= 1) return 'limit'
  if (ratio >= 0.8) return 'warning'
  return 'default'
})

function autoResizeFn() {
  if (props.autoResize && textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

function handleInput(event) {
  emit('update:modelValue', event.target.value)
  emit('input', event)
  autoResizeFn()
}

watch(
  () => props.modelValue,
  () => {
    nextTick(autoResizeFn)
  }
)

onMounted(autoResizeFn)
</script>

<template>
  <div class="cv-textarea-wrap">
    <label v-if="label" :for="inputId" class="cv-textarea__label">
      {{ label }}
      <span v-if="required" class="cv-textarea__required">*</span>
    </label>

    <div
      :class="[
        'cv-textarea',
        {
          'cv-textarea--focused': isFocused,
          'cv-textarea--error': error,
          'cv-textarea--disabled': disabled,
          'cv-textarea--readonly': readonly
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
        class="cv-textarea__field"
        @input="handleInput"
        @focus="isFocused = true; emit('focus', $event)"
        @blur="isFocused = false; emit('blur', $event)"
      ></textarea>

      <div v-if="maxlength && showCounter" class="cv-textarea__counter" :data-state="counterState">
        <span class="cv-textarea__counter-current">{{ currentLength }}</span>
        <span class="cv-textarea__counter-sep">/</span>
        <span class="cv-textarea__counter-total">{{ maxlength }}</span>
        <span class="cv-textarea__counter-bar" aria-hidden="true">
          <span
            class="cv-textarea__counter-bar-fill"
            :style="{ width: `${counterRatio * 100}%` }"
          ></span>
        </span>
      </div>
    </div>

    <p v-if="error" class="cv-textarea__error">{{ error }}</p>
    <p v-else-if="hint" class="cv-textarea__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.cv-textarea-wrap {
  width: 100%;
}

.cv-textarea__label {
  display: block;
  margin-bottom: 8px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-textarea__required {
  color: #E8A88A;
  margin-left: 3px;
  font-weight: 700;
}

.cv-textarea {
  position: relative;
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

.cv-textarea:hover:not(.cv-textarea--disabled) {
  border-color: rgba(201, 169, 97, 0.42);
}

.cv-textarea--focused {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 32px rgba(201, 169, 97, 0.12),
    0 1px 0 rgba(232, 213, 160, 0.08) inset;
}

.cv-textarea--error {
  border-color: rgba(184, 119, 85, 0.65);
}

.cv-textarea--error.cv-textarea--focused {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(184, 119, 85, 0.15),
    0 0 32px rgba(184, 119, 85, 0.15);
}

.cv-textarea--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-textarea--readonly {
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.2), rgba(15, 13, 10, 0.25)),
    linear-gradient(180deg, #12121A 0%, #0E0E12 100%);
}

.cv-textarea__field {
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.55;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;
  min-height: 100px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-textarea__field::-webkit-scrollbar {
  width: 8px;
}

.cv-textarea__field::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-textarea__field::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-textarea__field::placeholder {
  color: rgba(200, 190, 175, 0.4);
  transition: color 0.25s ease;
}

.cv-textarea--focused .cv-textarea__field::placeholder {
  color: rgba(200, 190, 175, 0.55);
}

.cv-textarea__field:disabled {
  cursor: not-allowed;
  color: rgba(220, 210, 195, 0.5);
}

.cv-textarea__field:-webkit-autofill,
.cv-textarea__field:-webkit-autofill:hover,
.cv-textarea__field:-webkit-autofill:focus {
  -webkit-text-fill-color: rgba(245, 240, 230, 0.92);
  -webkit-box-shadow: 0 0 0 1000px #14141A inset;
  transition: background-color 5000s ease-in-out 0s;
}

.cv-textarea__counter {
  position: absolute;
  bottom: 10px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2px;
  background: rgba(10, 10, 14, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 8px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.cv-textarea__counter-current {
  color: rgba(220, 210, 195, 0.75);
}

.cv-textarea__counter-sep {
  color: rgba(200, 190, 175, 0.35);
}

.cv-textarea__counter-total {
  color: rgba(200, 190, 175, 0.5);
}

.cv-textarea__counter[data-state="warning"] {
  border-color: rgba(217, 119, 6, 0.4);
  background: rgba(60, 40, 10, 0.85);
}

.cv-textarea__counter[data-state="warning"] .cv-textarea__counter-current {
  color: #F0C080;
}

.cv-textarea__counter[data-state="limit"] {
  border-color: rgba(184, 119, 85, 0.5);
  background: rgba(60, 30, 20, 0.85);
  animation: cvTextareaLimitPulse 1.6s ease-in-out infinite;
}

.cv-textarea__counter[data-state="limit"] .cv-textarea__counter-current {
  color: #E8A88A;
}

@keyframes cvTextareaLimitPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(184, 119, 85, 0);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(184, 119, 85, 0.15);
  }
}

.cv-textarea__counter-bar {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 3px;
  margin-left: 2px;
  border-radius: 2px;
  background: rgba(201, 169, 97, 0.15);
  overflow: hidden;
}

.cv-textarea__counter-bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #8B6F3F, #C9A961, #E8D5A0);
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-textarea__counter[data-state="warning"] .cv-textarea__counter-bar-fill {
  background: linear-gradient(90deg, #8B4513, #D97706, #F0C080);
}

.cv-textarea__counter[data-state="limit"] .cv-textarea__counter-bar-fill {
  background: linear-gradient(90deg, #6B4225, #B87755, #E8A88A);
}

.cv-textarea__error {
  margin: 6px 0 0 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: #E8A88A;
}

.cv-textarea__hint {
  margin: 6px 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.5);
}

@media (max-width: 640px) {
  .cv-textarea__field {
    font-size: 16px;
    padding: 12px 14px;
  }

  .cv-textarea__counter {
    padding: 3px 8px;
    font-size: 10.5px;
  }

  .cv-textarea__counter-bar {
    width: 24px;
  }
}
</style>