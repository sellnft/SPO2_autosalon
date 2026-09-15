<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  title: { type: String, default: 'Произошла ошибка' },
  message: { type: String, default: 'Что-то пошло не так. Попробуйте позже.' },
  retry: { type: Boolean, default: false },
  retryText: { type: String, default: 'Повторить' },
  code: { type: String, default: '' },
  variant: {
    type: String,
    default: 'error',
    validator: (v) => ['error', 'warning', 'info'].includes(v)
  }
})

defineEmits(['retry'])

const iconType = computed(() => {
  const map = {
    error: 'alert',
    warning: 'warning',
    info: 'info'
  }
  return map[props.variant] || 'alert'
})
</script>

<template>
  <div class="cv-error" :data-variant="variant" role="alert">
    <div class="cv-error__orb" aria-hidden="true"></div>

    <div class="cv-error__icon">
      <span class="cv-error__icon-inner">
        <svg v-if="iconType === 'alert'" width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="16" cy="16" r="12"/>
          <path d="M16 10v8"/>
          <path d="M16 22h.01"/>
        </svg>

        <svg v-else-if="iconType === 'warning'" width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 5.5L2.5 25.5a2 2 0 0 0 1.7 3h23.6a2 2 0 0 0 1.7-3L17.7 5.5a2 2 0 0 0-3.4 0z"/>
          <path d="M16 13v5"/>
          <path d="M16 23h.01"/>
        </svg>

        <svg v-else width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="16" cy="16" r="12"/>
          <path d="M16 11v6"/>
          <path d="M16 21h.01"/>
        </svg>
      </span>
      <span class="cv-error__icon-shine" aria-hidden="true"></span>
    </div>

    <h3 class="cv-error__title">{{ title }}</h3>
    <p class="cv-error__text">{{ message }}</p>

    <span v-if="code" class="cv-error__code">
      <span class="cv-error__code-label">Код ошибки</span>
      <span class="cv-error__code-value">{{ code }}</span>
    </span>

    <div v-if="retry" class="cv-error__actions">
      <BaseButton
        variant="outline"
        size="sm"
        @click="$emit('retry')"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 8A6 6 0 1 1 8 2"/>
          <path d="M14 2v6h-6"/>
        </svg>
        {{ retryText }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.cv-error {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
}

.cv-error__orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
  animation: cvErrorOrbPulse 4s ease-in-out infinite;
}

.cv-error[data-variant="error"] .cv-error__orb {
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
}

.cv-error[data-variant="warning"] .cv-error__orb {
  background: radial-gradient(circle, rgba(217, 119, 6, 0.22), transparent 70%);
}

.cv-error[data-variant="info"] .cv-error__orb {
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
}

@keyframes cvErrorOrbPulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.1); }
}

.cv-error__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 22px;
  overflow: hidden;
  animation: cvErrorIconFloat 4s ease-in-out infinite;
}

@keyframes cvErrorIconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-error[data-variant="error"] .cv-error__icon {
  color: #E8A88A;
  background:
    linear-gradient(180deg, rgba(40, 20, 14, 0.55) 0%, rgba(20, 12, 8, 0.7) 100%),
    linear-gradient(180deg, #1F1612 0%, #14100C 100%);
  border: 1px solid rgba(184, 119, 85, 0.35);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.06) inset,
    0 1px 0 rgba(232, 168, 138, 0.15) inset,
    0 0 60px rgba(184, 119, 85, 0.22);
}

.cv-error[data-variant="warning"] .cv-error__icon {
  color: #F0C080;
  background:
    linear-gradient(180deg, rgba(40, 30, 15, 0.55) 0%, rgba(20, 15, 8, 0.7) 100%),
    linear-gradient(180deg, #1F1A12 0%, #14100C 100%);
  border: 1px solid rgba(217, 119, 6, 0.35);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(217, 119, 6, 0.06) inset,
    0 1px 0 rgba(240, 192, 128, 0.15) inset,
    0 0 60px rgba(217, 119, 6, 0.22);
}

.cv-error[data-variant="info"] .cv-error__icon {
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.55) 0%, rgba(20, 16, 10, 0.7) 100%),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.38);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.15) inset,
    0 0 60px rgba(201, 169, 97, 0.22);
}

.cv-error__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
}

.cv-error__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.15) 50%,
    transparent 70%
  );
  animation: cvErrorShine 5s ease-in-out infinite;
  animation-delay: 1.5s;
  pointer-events: none;
}

@keyframes cvErrorShine {
  0%, 60%, 100% { left: -100%; }
  80% { left: 100%; }
}

.cv-error__title {
  position: relative;
  z-index: 1;
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-error[data-variant="error"] .cv-error__title {
  color: #E8A88A;
}

.cv-error[data-variant="warning"] .cv-error__title {
  color: #F0C080;
}

.cv-error[data-variant="info"] .cv-error__title {
  color: #E8D5A0;
}

.cv-error__text {
  position: relative;
  z-index: 1;
  max-width: 420px;
  margin: 0 0 16px;
  font-size: 13.5px;
  line-height: 1.6;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-error__code {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 5px 12px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv-error__code-label {
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(200, 190, 175, 0.4);
  font-size: 10px;
}

.cv-error__code-value {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  color: rgba(220, 210, 195, 0.75);
  font-weight: 700;
}

.cv-error[data-variant="error"] .cv-error__code-value {
  color: #E8A88A;
}

.cv-error__actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-error__actions :deep(svg) {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-error__actions :deep(button:hover) svg {
  transform: rotate(-180deg);
}

@media (max-width: 640px) {
  .cv-error {
    padding: 36px 20px;
  }

  .cv-error__orb {
    width: 260px;
    height: 260px;
  }

  .cv-error__icon {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    margin-bottom: 18px;
  }

  .cv-error__icon svg {
    width: 26px;
    height: 26px;
  }

  .cv-error__title {
    font-size: 16.5px;
  }

  .cv-error__text {
    font-size: 13px;
    margin-bottom: 14px;
  }
}
</style>