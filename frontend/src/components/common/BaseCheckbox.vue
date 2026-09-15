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
  <div class="cv-check-wrap">
    <label
      :class="['cv-check', { 'cv-check--disabled': disabled, 'cv-check--error': error }]"
      :for="inputId"
    >
      <input
        :id="inputId"
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        :name="name"
        :indeterminate="indeterminate"
        class="cv-check__input"
        @change="handleChange"
      />

      <span class="cv-check__box">
        <span class="cv-check__box-shine" aria-hidden="true"></span>

        <svg v-if="isChecked && !indeterminate" class="cv-check__check" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 6.5L4.5 9L10 3"/>
        </svg>

        <span v-if="indeterminate" class="cv-check__dash"></span>
      </span>

      <span v-if="label || $slots.label" class="cv-check__label">
        <slot name="label">{{ label }}</slot>
      </span>
    </label>

    <p v-if="error" class="cv-check__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.cv-check-wrap {
  display: inline-flex;
  flex-direction: column;
}

.cv-check {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
}

.cv-check--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-check__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.cv-check__box {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 6px;
  color: #1A1208;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.32);
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  box-shadow:
    0 1px 0 rgba(232, 213, 160, 0.05) inset,
    0 1px 3px rgba(0, 0, 0, 0.3);
}

.cv-check__box-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.4) 50%,
    transparent 70%
  );
  transition: left 0.6s ease;
  pointer-events: none;
}

.cv-check:hover:not(.cv-check--disabled) .cv-check__box {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 1px 0 rgba(232, 213, 160, 0.1) inset,
    0 0 16px rgba(201, 169, 97, 0.2);
}

.cv-check:hover:not(.cv-check--disabled) .cv-check__box-shine {
  left: 100%;
}

.cv-check__input:checked + .cv-check__box,
.cv-check__input:indeterminate + .cv-check__box {
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.45) inset;
  animation: cvCheckPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cvCheckPop {
  0% { transform: scale(0.85); }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.cv-check__input:focus-visible + .cv-check__box {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-check__check {
  position: relative;
  z-index: 1;
  animation: cvCheckDraw 0.25s ease-out;
}

@keyframes cvCheckDraw {
  from {
    opacity: 0;
    transform: scale(0.4) rotate(-15deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.cv-check__dash {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 2.5px;
  border-radius: 2px;
  background: #1A1208;
  box-shadow: 0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-check__label {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.85);
  transition: color 0.25s ease;
}

.cv-check:hover:not(.cv-check--disabled) .cv-check__label {
  color: #F5E6BC;
}

.cv-check--error .cv-check__box {
  border-color: rgba(184, 119, 85, 0.65);
}

.cv-check__error {
  margin: 5px 0 0 30px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: #E8A88A;
}

@media (max-width: 640px) {
  .cv-check {
    gap: 9px;
  }

  .cv-check__box {
    width: 19px;
    height: 19px;
  }

  .cv-check__label {
    font-size: 13px;
  }

  .cv-check__error {
    margin-left: 28px;
    font-size: 11.5px;
  }
}
</style>