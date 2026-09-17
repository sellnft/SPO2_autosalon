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
    <Transition name="cv-drawer">
      <div v-if="modelValue" class="cv-drawer-overlay" @click="handleOverlayClick">
        <div
          :class="[
            'cv-drawer',
            `cv-drawer--${position}`,
            `cv-drawer--${size}`
          ]"
          role="dialog"
          aria-modal="true"
        >
          <div class="cv-drawer__glow" aria-hidden="true"></div>
          <div class="cv-drawer__carbon" aria-hidden="true"></div>

          <header class="cv-drawer__header">
            <h3 class="cv-drawer__title">{{ title }}</h3>
            <button class="cv-drawer__close" aria-label="Закрыть" @click="close">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 5L15 15M15 5L5 15"/>
              </svg>
            </button>
          </header>

          <div class="cv-drawer__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="cv-drawer__footer">
            <slot name="footer" />
          </footer>

          <span class="cv-drawer__accent-line" aria-hidden="true"></span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cv-drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 8500;
  background: rgba(5, 5, 7, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cv-drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.5) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.75),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset;
}

.cv-drawer--right {
  top: 0;
  right: 0;
  height: 100%;
  border-left: 1px solid rgba(201, 169, 97, 0.2);
}

.cv-drawer--left {
  top: 0;
  left: 0;
  height: 100%;
  border-right: 1px solid rgba(201, 169, 97, 0.2);
}

.cv-drawer--top {
  top: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid rgba(201, 169, 97, 0.2);
}

.cv-drawer--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid rgba(201, 169, 97, 0.2);
}

.cv-drawer--sm { width: 320px; }
.cv-drawer--md { width: 420px; }
.cv-drawer--lg { width: 620px; }

.cv-drawer--top.cv-drawer--sm,
.cv-drawer--bottom.cv-drawer--sm { height: 220px; width: auto; }

.cv-drawer--top.cv-drawer--md,
.cv-drawer--bottom.cv-drawer--md { height: 320px; width: auto; }

.cv-drawer--top.cv-drawer--lg,
.cv-drawer--bottom.cv-drawer--lg { height: 480px; width: auto; }

.cv-drawer__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
}

.cv-drawer--right .cv-drawer__glow {
  top: -100px;
  right: -80px;
}

.cv-drawer--left .cv-drawer__glow {
  top: -100px;
  left: -80px;
}

.cv-drawer--top .cv-drawer__glow {
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
}

.cv-drawer--bottom .cv-drawer__glow {
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
}

.cv-drawer__carbon {
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
  mask-image: radial-gradient(ellipse at top, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at top, black 20%, transparent 80%);
}

.cv-drawer__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.05), transparent);
}

.cv-drawer__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-drawer__close:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: rotate(90deg);
}

.cv-drawer__close:active {
  transform: rotate(90deg) scale(0.94);
}

.cv-drawer__body {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-drawer__body::-webkit-scrollbar {
  width: 8px;
}

.cv-drawer__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-drawer__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-drawer__footer {
  position: relative;
  z-index: 1;
  padding: 18px 24px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent);
}

.cv-drawer__accent-line {
  position: absolute;
  pointer-events: none;
  z-index: 2;
}

.cv-drawer--right .cv-drawer__accent-line {
  top: 0;
  bottom: 0;
  left: 0;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(201, 169, 97, 0.35) 50%,
    transparent
  );
}

.cv-drawer--left .cv-drawer__accent-line {
  top: 0;
  bottom: 0;
  right: 0;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(201, 169, 97, 0.35) 50%,
    transparent
  );
}

.cv-drawer--top .cv-drawer__accent-line {
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.35) 50%,
    transparent
  );
}

.cv-drawer--bottom .cv-drawer__accent-line {
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.35) 50%,
    transparent
  );
}

.cv-drawer-enter-active,
.cv-drawer-leave-active {
  transition: opacity 0.3s ease;
}

.cv-drawer-enter-active .cv-drawer,
.cv-drawer-leave-active .cv-drawer {
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-drawer-enter-from,
.cv-drawer-leave-to {
  opacity: 0;
}

.cv-drawer-enter-from .cv-drawer--right,
.cv-drawer-leave-to .cv-drawer--right {
  transform: translateX(100%);
}

.cv-drawer-enter-from .cv-drawer--left,
.cv-drawer-leave-to .cv-drawer--left {
  transform: translateX(-100%);
}

.cv-drawer-enter-from .cv-drawer--top,
.cv-drawer-leave-to .cv-drawer--top {
  transform: translateY(-100%);
}

.cv-drawer-enter-from .cv-drawer--bottom,
.cv-drawer-leave-to .cv-drawer--bottom {
  transform: translateY(100%);
}

@media (max-width: 640px) {
  .cv-drawer--right,
  .cv-drawer--left {
    width: 100%;
    max-width: 100%;
    border-left: none;
    border-right: none;
  }

  .cv-drawer--top.cv-drawer--lg,
  .cv-drawer--bottom.cv-drawer--lg {
    height: 85vh;
  }

  .cv-drawer__header {
    padding: 16px 18px 14px;
  }

  .cv-drawer__body {
    padding: 20px 18px;
  }

  .cv-drawer__footer {
    padding: 14px 18px calc(env(safe-area-inset-bottom, 0) + 14px);
  }

  .cv-drawer__title {
    font-size: 16px;
  }
}
</style>