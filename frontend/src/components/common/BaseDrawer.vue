<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  position: {
    type: String,
    default: 'right',
    validator: (v) => ['left', 'right', 'top', 'bottom'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick(event) {
  if (props.closeOnOverlay && event.target === event.currentTarget) {
    close()
  }
}

function handleKeydown(event) {
  if (props.closeOnEsc && event.key === 'Escape') {
    close()
  }
}

watch(() => props.modelValue, (value) => {
  if (value) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="base-drawer-overlay" @click="handleOverlayClick">
        <div 
          :class="[
            'base-drawer',
            `base-drawer--${position}`,
            `base-drawer--${size}`
          ]"
          role="dialog"
          aria-modal="true"
        >
          <div class="base-drawer__header">
            <h3 class="base-drawer__title">{{ title }}</h3>
            <button class="base-drawer__close" @click="close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <div class="base-drawer__body">
            <slot />
          </div>
          
          <div v-if="$slots.footer" class="base-drawer__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.base-drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.base-drawer--right {
  top: 0;
  right: 0;
  height: 100%;
  width: 400px;
}

.base-drawer--left {
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
}

.base-drawer--top {
  top: 0;
  left: 0;
  right: 0;
  height: 400px;
}

.base-drawer--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 400px;
}

.base-drawer--sm {
  width: 300px;
}

.base-drawer--md {
  width: 400px;
}

.base-drawer--lg {
  width: 600px;
}

.base-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.base-drawer__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.base-drawer__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #6B7280;
  transition: all 0.2s;
}

.base-drawer__close:hover {
  background: #F3F4F6;
  color: #111827;
}

.base-drawer__body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.base-drawer__footer {
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
}

/* Transitions */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .base-drawer,
.drawer-leave-active .base-drawer {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .base-drawer--right,
.drawer-leave-to .base-drawer--right {
  transform: translateX(100%);
}

.drawer-enter-from .base-drawer--left,
.drawer-leave-to .base-drawer--left {
  transform: translateX(-100%);
}

.drawer-enter-from .base-drawer--top,
.drawer-leave-to .base-drawer--top {
  transform: translateY(-100%);
}

.drawer-enter-from .base-drawer--bottom,
.drawer-leave-to .base-drawer--bottom {
  transform: translateY(100%);
}

@media (max-width: 640px) {
  .base-drawer--right,
  .base-drawer--left {
    width: 100%;
    max-width: 100%;
  }
}
</style>