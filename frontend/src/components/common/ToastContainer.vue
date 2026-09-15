<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const toasts = computed(() => toastStore.toasts)

const iconType = (type) => {
  const map = { success: 'check', error: 'x', warning: 'alert', info: 'info' }
  return map[type] || 'info'
}
</script>

<template>
  <div class="cv-toasts">
    <TransitionGroup name="cv-toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['cv-toast', `cv-toast--${toast.type}`]"
        role="alert"
      >
        <span class="cv-toast__glow" aria-hidden="true"></span>

        <div class="cv-toast__icon">
          <svg v-if="iconType(toast.type) === 'check'" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 10l4 4 8-8"/>
          </svg>

          <svg v-else-if="iconType(toast.type) === 'x'" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 6l8 8M14 6l-8 8"/>
          </svg>

          <svg v-else-if="iconType(toast.type) === 'alert'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>

          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 16h.01"/>
          </svg>
        </div>

        <div class="cv-toast__content">
          <p v-if="toast.title" class="cv-toast__title">{{ toast.title }}</p>
          <p class="cv-toast__message">{{ toast.message }}</p>
        </div>

        <button
          class="cv-toast__close"
          aria-label="Закрыть"
          @click="toastStore.remove(toast.id)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>

        <span class="cv-toast__progress" aria-hidden="true"></span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.cv-toasts {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  pointer-events: none;
}

.cv-toast {
  --cv-toast-color: #C9A961;
  --cv-toast-bg: rgba(40, 32, 22, 0.6);
  --cv-toast-border: rgba(201, 169, 97, 0.35);

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 15px 16px 15px 15px;
  background:
    linear-gradient(180deg, var(--cv-toast-bg) 0%, rgba(15, 13, 10, 0.75) 100%),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid var(--cv-toast-border);
  border-radius: 14px;
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 1px 0 rgba(255, 245, 214, 0.08) inset,
    0 0 40px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  overflow: hidden;
  isolation: isolate;
}

.cv-toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 245, 214, 0.2) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 3;
}

.cv-toast__glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--cv-toast-color), transparent 70%);
  filter: blur(50px);
  opacity: 0.25;
  pointer-events: none;
  z-index: 0;
}

.cv-toast--success {
  --cv-toast-color: #7A9A6A;
  --cv-toast-bg: rgba(25, 35, 20, 0.6);
  --cv-toast-border: rgba(122, 154, 106, 0.4);
}

.cv-toast--error {
  --cv-toast-color: #B87755;
  --cv-toast-bg: rgba(40, 20, 14, 0.6);
  --cv-toast-border: rgba(184, 119, 85, 0.42);
}

.cv-toast--warning {
  --cv-toast-color: #D97706;
  --cv-toast-bg: rgba(40, 30, 15, 0.6);
  --cv-toast-border: rgba(217, 119, 6, 0.4);
}

.cv-toast--info {
  --cv-toast-color: #C9A961;
  --cv-toast-bg: rgba(40, 32, 22, 0.6);
  --cv-toast-border: rgba(201, 169, 97, 0.4);
}

.cv-toast__icon {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.cv-toast__icon svg {
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.4));
}

.cv-toast--success .cv-toast__icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.15);
  border-color: rgba(122, 154, 106, 0.4);
  box-shadow: 0 0 20px rgba(122, 154, 106, 0.2);
}

.cv-toast--error .cv-toast__icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.42);
  box-shadow: 0 0 20px rgba(184, 119, 85, 0.2);
}

.cv-toast--warning .cv-toast__icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.15);
  border-color: rgba(217, 119, 6, 0.4);
  box-shadow: 0 0 20px rgba(217, 119, 6, 0.2);
}

.cv-toast--info .cv-toast__icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  border-color: rgba(201, 169, 97, 0.42);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.2);
}

.cv-toast__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  padding-top: 1px;
}

.cv-toast__title {
  margin: 0 0 4px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-toast__message {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
}

.cv-toast__close {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: rgba(200, 190, 175, 0.45);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.cv-toast__close:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
  transform: rotate(90deg);
}

.cv-toast__close:active {
  transform: rotate(90deg) scale(0.92);
}

.cv-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--cv-toast-color),
    transparent
  );
  opacity: 0.8;
  animation: cvToastProgress 5s linear forwards;
  z-index: 1;
  pointer-events: none;
}

.cv-toast--success .cv-toast__progress {
  background: linear-gradient(90deg, #7A9A6A, #B8CEA8, transparent);
}

.cv-toast--error .cv-toast__progress {
  background: linear-gradient(90deg, #B87755, #E8A88A, transparent);
}

.cv-toast--warning .cv-toast__progress {
  background: linear-gradient(90deg, #D97706, #F0C080, transparent);
}

.cv-toast--info .cv-toast__progress {
  background: linear-gradient(90deg, #C9A961, #E8D5A0, transparent);
}

@keyframes cvToastProgress {
  from { width: 100%; }
  to { width: 0; }
}

.cv-toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-toast-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  right: 0;
  width: 100%;
}

.cv-toast-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}

.cv-toast-leave-to {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}

.cv-toast-move {
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@media (max-width: 640px) {
  .cv-toasts {
    top: 12px;
    right: 12px;
    left: 12px;
    max-width: none;
    gap: 10px;
  }

  .cv-toast {
    padding: 13px 14px 13px 13px;
    border-radius: 12px;
    gap: 12px;
  }

  .cv-toast__icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .cv-toast__title {
    font-size: 13px;
  }

  .cv-toast__message {
    font-size: 12px;
  }

  .cv-toast__close {
    width: 24px;
    height: 24px;
  }

  .cv-toast-enter-from,
  .cv-toast-leave-to {
    transform: translateY(-120%) scale(0.9);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cv-toast-enter-active,
  .cv-toast-leave-active,
  .cv-toast-move {
    transition-duration: 0.15s;
  }

  .cv-toast__progress {
    animation: none;
    opacity: 0;
  }
}
</style>