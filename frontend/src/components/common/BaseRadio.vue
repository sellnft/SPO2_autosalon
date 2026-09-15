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
  description: String,
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
  <label :class="['cv-radio', { 'cv-radio--disabled': disabled, 'cv-radio--with-desc': description }]">
    <input
      :id="inputId"
      type="radio"
      :checked="modelValue === value"
      :disabled="disabled"
      :name="name"
      :value="value"
      class="cv-radio__input"
      @change="handleChange"
    />

    <span class="cv-radio__circle">
      <span class="cv-radio__circle-shine" aria-hidden="true"></span>
      <span class="cv-radio__dot"></span>
    </span>

    <span v-if="label || description || $slots.label" class="cv-radio__content">
      <span v-if="label || $slots.label" class="cv-radio__label">
        <slot name="label">{{ label }}</slot>
      </span>
      <span v-if="description" class="cv-radio__description">{{ description }}</span>
    </span>
  </label>
</template>

<style scoped>
.cv-radio {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
}

.cv-radio--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.cv-radio__circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 1px;
  border-radius: 50%;
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

.cv-radio__circle-shine {
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

.cv-radio:hover:not(.cv-radio--disabled) .cv-radio__circle {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 1px 0 rgba(232, 213, 160, 0.1) inset,
    0 0 16px rgba(201, 169, 97, 0.2);
}

.cv-radio:hover:not(.cv-radio--disabled) .cv-radio__circle-shine {
  left: 100%;
}

.cv-radio__dot {
  position: relative;
  z-index: 1;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: #1A1208;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-radio__input:checked + .cv-radio__circle {
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.45) inset;
  animation: cvRadioPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cvRadioPop {
  0% { transform: scale(0.85); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.cv-radio__input:checked + .cv-radio__circle .cv-radio__dot {
  width: 8px;
  height: 8px;
}

.cv-radio__input:focus-visible + .cv-radio__circle {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-radio__content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.cv-radio__label {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.85);
  transition: color 0.25s ease;
}

.cv-radio:hover:not(.cv-radio--disabled) .cv-radio__label {
  color: #F5E6BC;
}

.cv-radio__input:checked ~ .cv-radio__content .cv-radio__label {
  color: #F5E6BC;
  font-weight: 650;
}

.cv-radio__description {
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 640px) {
  .cv-radio {
    gap: 9px;
  }

  .cv-radio__circle {
    width: 19px;
    height: 19px;
  }

  .cv-radio__label {
    font-size: 13px;
  }

  .cv-radio__description {
    font-size: 11.5px;
  }
}
</style>