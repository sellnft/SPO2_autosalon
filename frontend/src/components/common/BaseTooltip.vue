<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  placement: {
    type: String,
    default: 'top',
    validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v)
  },
  delay: {
    type: Number,
    default: 200
  },
  disabled: Boolean,
  maxWidth: {
    type: [String, Number],
    default: ''
  }
})

const isVisible = ref(false)
let timeoutId = null

function show() {
  if (props.disabled) return
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    isVisible.value = true
  }, props.delay)
}

function hide() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  isVisible.value = false
}

onUnmounted(() => {
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div
    class="cv-tooltip-wrap"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />

    <Transition name="cv-tooltip">
      <div
        v-if="isVisible"
        :class="['cv-tooltip', `cv-tooltip--${placement}`]"
        :style="maxWidth ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth } : {}"
        role="tooltip"
      >
        <span class="cv-tooltip__glow" aria-hidden="true"></span>
        <span class="cv-tooltip__text">{{ content }}</span>
        <span class="cv-tooltip__arrow" aria-hidden="true"></span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-tooltip-wrap {
  position: relative;
  display: inline-flex;
}

.cv-tooltip {
  position: absolute;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  line-height: 1.4;
  color: rgba(245, 240, 230, 0.95);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.85) 0%, rgba(15, 13, 10, 0.92) 100%),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 10px;
  white-space: nowrap;
  pointer-events: none;
  isolation: isolate;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 0 32px rgba(201, 169, 97, 0.12),
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-tooltip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.3) 50%,
    transparent
  );
  border-radius: inherit inherit 0 0;
  pointer-events: none;
  z-index: 2;
}

.cv-tooltip__glow {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.35), transparent 70%);
  filter: blur(30px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-tooltip__text {
  position: relative;
  z-index: 1;
  white-space: inherit;
}

.cv-tooltip--top {
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
}

.cv-tooltip--bottom {
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
}

.cv-tooltip--left {
  right: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
}

.cv-tooltip--right {
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
}

.cv-tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.85) 0%, rgba(15, 13, 10, 0.92) 100%),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  transform: rotate(45deg);
  z-index: 1;
}

.cv-tooltip--top .cv-tooltip__arrow {
  bottom: -5px;
  left: 50%;
  margin-left: -4px;
  border-top: none;
  border-left: none;
}

.cv-tooltip--bottom .cv-tooltip__arrow {
  top: -5px;
  left: 50%;
  margin-left: -4px;
  border-bottom: none;
  border-right: none;
}

.cv-tooltip--left .cv-tooltip__arrow {
  right: -5px;
  top: 50%;
  margin-top: -4px;
  border-bottom: none;
  border-left: none;
}

.cv-tooltip--right .cv-tooltip__arrow {
  left: -5px;
  top: 50%;
  margin-top: -4px;
  border-top: none;
  border-right: none;
}

.cv-tooltip-enter-active,
.cv-tooltip-leave-active {
  transition: all 0.22s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-tooltip-enter-from,
.cv-tooltip-leave-to {
  opacity: 0;
  transform:
    translateX(-50%)
    translateY(-4px)
    scale(0.95);
}

.cv-tooltip--bottom.cv-tooltip-enter-from,
.cv-tooltip--bottom.cv-tooltip-leave-to {
  transform:
    translateX(-50%)
    translateY(4px)
    scale(0.95);
}

.cv-tooltip--left.cv-tooltip-enter-from,
.cv-tooltip--left.cv-tooltip-leave-to {
  transform:
    translateY(-50%)
    translateX(-4px)
    scale(0.95);
}

.cv-tooltip--right.cv-tooltip-enter-from,
.cv-tooltip--right.cv-tooltip-leave-to {
  transform:
    translateY(-50%)
    translateX(4px)
    scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .cv-tooltip-enter-active,
  .cv-tooltip-leave-active {
    transition: opacity 0.12s ease;
  }

  .cv-tooltip-enter-from,
  .cv-tooltip-leave-to {
    transform: none;
  }
}

@media (max-width: 640px) {
  .cv-tooltip {
    font-size: 11.5px;
    padding: 7px 12px;
    border-radius: 9px;
  }

  .cv-tooltip__glow {
    display: none;
  }
}
</style>