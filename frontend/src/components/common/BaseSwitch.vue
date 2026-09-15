<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: String,
  description: String,
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
  <label
    :class="[
      'cv-switch',
      `cv-switch--${size}`,
      {
        'cv-switch--disabled': disabled,
        'cv-switch--on': modelValue,
        'cv-switch--with-desc': description
      }
    ]"
  >
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :name="name"
      class="cv-switch__input"
      @change="handleChange"
    />

    <span class="cv-switch__track">
      <span class="cv-switch__track-glow" aria-hidden="true"></span>
      <span class="cv-switch__thumb">
        <span class="cv-switch__thumb-shine" aria-hidden="true"></span>
      </span>
    </span>

    <span v-if="label || description || $slots.label" class="cv-switch__content">
      <span v-if="label || $slots.label" class="cv-switch__label">
        <slot name="label">{{ label }}</slot>
      </span>
      <span v-if="description" class="cv-switch__description">{{ description }}</span>
    </span>
  </label>
</template>

<style scoped>
.cv-switch {
  display: inline-flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease;
}

.cv-switch--with-desc {
  align-items: flex-start;
}

.cv-switch--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.cv-switch__track {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: 46px;
  height: 26px;
  padding: 3px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 999px;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
  overflow: hidden;
}

.cv-switch--sm .cv-switch__track {
  width: 38px;
  height: 22px;
  padding: 2.5px;
}

.cv-switch--lg .cv-switch__track {
  width: 54px;
  height: 30px;
  padding: 3.5px;
}

.cv-switch__track-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(232, 213, 160, 0.5), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.cv-switch:hover:not(.cv-switch--disabled) .cv-switch__track {
  border-color: rgba(201, 169, 97, 0.5);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(201, 169, 97, 0.18),
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-switch--on .cv-switch__track {
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.6);
  box-shadow:
    0 4px 18px rgba(201, 169, 97, 0.42),
    0 0 32px rgba(201, 169, 97, 0.28),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.45) inset;
}

.cv-switch--on .cv-switch__track-glow {
  opacity: 1;
  animation: cvSwitchGlow 2.4s ease-in-out infinite;
}

@keyframes cvSwitchGlow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.cv-switch__thumb {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background:
    linear-gradient(180deg, #FFFFFF 0%, #F5EFE0 100%);
  border-radius: 50%;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.8) inset;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translateX(0);
  overflow: hidden;
  z-index: 1;
}

.cv-switch__thumb-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.7) 50%,
    transparent 70%
  );
  transition: left 0.6s ease;
  pointer-events: none;
}

.cv-switch:hover:not(.cv-switch--disabled) .cv-switch__thumb-shine {
  left: 100%;
}

.cv-switch--sm .cv-switch__thumb {
  width: 17px;
  height: 17px;
}

.cv-switch--lg .cv-switch__thumb {
  width: 23px;
  height: 23px;
}

.cv-switch--on .cv-switch__thumb {
  transform: translateX(20px);
  background:
    linear-gradient(180deg, #FFFFFF 0%, #FFF5D6 100%);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.35),
    0 0 16px rgba(255, 245, 214, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.cv-switch--sm.cv-switch--on .cv-switch__thumb {
  transform: translateX(16px);
}

.cv-switch--lg.cv-switch--on .cv-switch__thumb {
  transform: translateX(24px);
}

.cv-switch__input:focus-visible + .cv-switch__track {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-switch__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-top: 2px;
}

.cv-switch__label {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.85);
  transition: color 0.25s ease;
}

.cv-switch:hover:not(.cv-switch--disabled) .cv-switch__label {
  color: #F5E6BC;
}

.cv-switch--on .cv-switch__label {
  color: #F5E6BC;
}

.cv-switch__description {
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 640px) {
  .cv-switch {
    gap: 10px;
  }

  .cv-switch__track {
    width: 44px;
    height: 24px;
    padding: 3px;
  }

  .cv-switch__thumb {
    width: 18px;
    height: 18px;
  }

  .cv-switch--on .cv-switch__thumb {
    transform: translateX(20px);
  }

  .cv-switch__label {
    font-size: 13px;
  }

  .cv-switch__description {
    font-size: 11.5px;
  }
}
</style>