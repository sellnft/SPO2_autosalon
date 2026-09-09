<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const toasts = computed(() => toastStore.toasts)
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `toast--${toast.type}`
        ]"
        role="alert"
      >
        <div class="toast__icon">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else-if="toast.type === 'warning'" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 6v6M10 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M10 9v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="10" cy="6" r="1" fill="currentColor"/>
          </svg>
        </div>
        
        <div class="toast__content">
          <p v-if="toast.title" class="toast__title">{{ toast.title }}</p>
          <p class="toast__message">{{ toast.message }}</p>
        </div>
        
        <button
          class="toast__close"
          @click="toastStore.remove(toast.id)"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
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

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
}

.toast--success {
  border-left: 4px solid #10B981;
}

.toast--error {
  border-left: 4px solid #EF4444;
}

.toast--warning {
  border-left: 4px solid #F59E0B;
}

.toast--info {
  border-left: 4px solid #0A84FF;
}

.toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.toast--success .toast__icon {
  color: #10B981;
  background: #D1FAE5;
}

.toast--error .toast__icon {
  color: #EF4444;
  background: #FEE2E2;
}

.toast--warning .toast__icon {
  color: #F59E0B;
  background: #FEF3C7;
}

.toast--info .toast__icon {
  color: #0A84FF;
  background: #DBEAFE;
}

.toast__content {
  flex: 1;
}

.toast__title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.toast__message {
  font-size: 13px;
  line-height: 1.5;
  color: #6B7280;
}

.toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #9CA3AF;
  border-radius: 6px;
  transition: all 0.2s;
}

.toast__close:hover {
  background: #F3F4F6;
  color: #111827;
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>