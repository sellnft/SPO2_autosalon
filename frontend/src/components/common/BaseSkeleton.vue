<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'circular', 'rectangular', 'rounded'].includes(v)
  },
  width: {
    type: [String, Number],
    default: '100%'
  },
  height: {
    type: [String, Number],
    default: '16px'
  },
  animation: {
    type: String,
    default: 'pulse',
    validator: (v) => ['pulse', 'wave', 'none'].includes(v)
  }
})
</script>

<template>
  <div
    :class="[
      'base-skeleton',
      `base-skeleton--${variant}`,
      `base-skeleton--${animation}`
    ]"
    :style="{ width, height }"
  >
    <slot />
  </div>
</template>

<style scoped>
.base-skeleton {
  display: block;
  background: #E5E7EB;
}

.base-skeleton--text {
  border-radius: 4px;
}

.base-skeleton--circular {
  border-radius: 50%;
}

.base-skeleton--rectangular {
  border-radius: 0;
}

.base-skeleton--rounded {
  border-radius: 8px;
}

.base-skeleton--pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.base-skeleton--wave {
  overflow: hidden;
  position: relative;
}

.base-skeleton--wave::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes skeleton-wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>