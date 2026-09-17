<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  subtitle: String,
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
  },
  hideClose: Boolean
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
    <Transition name="cv-modal">
      <div v-if="modelValue" class="cv-modal-overlay" @click="handleOverlayClick">
        <div
          ref="modalRef"
          :class="['cv-modal', `cv-modal--${size}`]"
          role="dialog"
          aria-modal="true"
        >
          <div class="cv-modal__glow" aria-hidden="true"></div>
          <div class="cv-modal__carbon" aria-hidden="true"></div>

          <header v-if="title || !hideClose" class="cv-modal__header">
            <div class="cv-modal__title-block">
              <h3 v-if="title" class="cv-modal__title">{{ title }}</h3>
              <p v-if="subtitle" class="cv-modal__subtitle">{{ subtitle }}</p>
            </div>

            <button
              v-if="!hideClose"
              class="cv-modal__close"
              aria-label="Закрыть"
              @click="close"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 5L15 15M15 5L5 15"/>
              </svg>
            </button>
          </header>

          <div class="cv-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="cv-modal__footer">
            <slot name="footer" />
          </footer>

          <span class="cv-modal__accent-line" aria-hidden="true"></span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cv-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(5, 5, 7, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.cv-modal {
  position: relative;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.5) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 1.25rem;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 0 120px rgba(201, 169, 97, 0.08);
  overflow: hidden;
  isolation: isolate;
}

.cv-modal--sm { max-width: 420px; }
.cv-modal--md { max-width: 620px; }
.cv-modal--lg { max-width: 840px; }
.cv-modal--xl { max-width: 1100px; }

.cv-modal__glow {
  position: absolute;
  top: -140px;
  right: -100px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.75;
}

.cv-modal__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
}

.cv-modal__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.05), transparent);
}

.cv-modal__title-block {
  flex: 1;
  min-width: 0;
}

.cv-modal__title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.25px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}

.cv-modal__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.55);
}

.cv-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-modal__close:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: rotate(90deg);
}

.cv-modal__close:active {
  transform: rotate(90deg) scale(0.94);
}

.cv-modal__body {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-modal__body::-webkit-scrollbar {
  width: 8px;
}

.cv-modal__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-modal__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-modal__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 28px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent);
}

.cv-modal__accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.05) 15%,
    rgba(201, 169, 97, 0.4) 50%,
    rgba(201, 169, 97, 0.05) 85%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

.cv-modal-enter-active,
.cv-modal-leave-active {
  transition: opacity 0.28s ease;
}

.cv-modal-enter-active .cv-modal,
.cv-modal-leave-active .cv-modal {
  transition: transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-modal-enter-from,
.cv-modal-leave-to {
  opacity: 0;
}

.cv-modal-enter-from .cv-modal,
.cv-modal-leave-to .cv-modal {
  transform: translateY(-24px) scale(0.94);
}

@media (max-width: 640px) {
  .cv-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .cv-modal {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 1.25rem 1.25rem 0 0;
    border-bottom: none;
  }

  .cv-modal::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: rgba(201, 169, 97, 0.3);
    z-index: 3;
    pointer-events: none;
  }

  .cv-modal__header {
    padding: 26px 20px 16px;
  }

  .cv-modal__title {
    font-size: 17px;
  }

  .cv-modal__subtitle {
    font-size: 12.5px;
  }

  .cv-modal__body {
    padding: 20px;
  }

  .cv-modal__footer {
    padding: 16px 20px calc(env(safe-area-inset-bottom, 0) + 16px);
    flex-direction: column-reverse;
  }

  .cv-modal__footer > * {
    width: 100%;
  }
}
</style>