<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v)
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

const modalRef = ref(null)

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
    <Transition name="modal">
      <div v-if="modelValue" class="base-modal-overlay" @click="handleOverlayClick">
        <div
          ref="modalRef"
          :class="['base-modal', `base-modal--${size}`]"
          role="dialog"
          aria-modal="true"
        >
          <div class="base-modal__header">
            <h3 class="base-modal__title">{{ title }}</h3>
            <button class="base-modal__close" aria-label="Закрыть" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="base-modal__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.base-modal {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.base-modal--sm { max-width: 400px; }
.base-modal--md { max-width: 600px; }
.base-modal--lg { max-width: 800px; }
.base-modal--xl { max-width: 1100px; }

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.base-modal__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.base-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #6B7280;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.base-modal__close:hover {
  background: #F3F4F6;
  color: #111827;
}

.base-modal__body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.base-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #E5E7EB;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .base-modal,
.modal-leave-active .base-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .base-modal,
.modal-leave-to .base-modal {
  transform: translateY(-20px) scale(0.95);
}

@media (max-width: 640px) {
  .base-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .base-modal {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 16px 16px 0 0;
  }

  .base-modal__body {
    padding: 20px;
  }
}
</style>