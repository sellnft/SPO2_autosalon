<script setup>
import { ref } from 'vue'

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
  }
})

const isVisible = ref(false)
let timeoutId = null

function show() {
  timeoutId = setTimeout(() => {
    isVisible.value = true
  }, props.delay)
}

function hide() {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  isVisible.value = false
}
</script>

<template>
  <div 
    class="base-tooltip-wrapper"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
  >
    <slot />
    
    <Transition name="tooltip">
      <div 
        v-if="isVisible"
        :class="['base-tooltip', `base-tooltip--${placement}`]"
        role="tooltip"
      >
        {{ content }}
        <div class="base-tooltip__arrow"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.base-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.base-tooltip {
  position: absolute;
  z-index: 50;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  background: #111827;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
}

.base-tooltip--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.base-tooltip--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.base-tooltip--left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.base-tooltip--right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.base-tooltip__arrow {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #111827;
  transform: rotate(45deg);
}

.base-tooltip--top .base-tooltip__arrow {
  bottom: -3px;
  left: 50%;
  margin-left: -3px;
}

.base-tooltip--bottom .base-tooltip__arrow {
  top: -3px;
  left: 50%;
  margin-left: -3px;
}

.base-tooltip--left .base-tooltip__arrow {
  right: -3px;
  top: 50%;
  margin-top: -3px;
}

.base-tooltip--right .base-tooltip__arrow {
  left: -3px;
  top: 50%;
  margin-top: -3px;
}

/* Transition */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>