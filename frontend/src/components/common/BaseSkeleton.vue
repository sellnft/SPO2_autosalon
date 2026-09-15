<script setup>
defineProps({
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
    default: 'shimmer',
    validator: (v) => ['pulse', 'wave', 'shimmer', 'none'].includes(v)
  },
  lines: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div
    v-if="variant === 'text' && lines > 1"
    class="cv-skeleton-lines"
  >
    <span
      v-for="i in lines"
      :key="i"
      :class="['cv-skeleton', `cv-skeleton--${animation}`]"
      :style="{
        width: i === lines ? '65%' : width,
        height
      }"
    ></span>
  </div>

  <div
    v-else
    :class="[
      'cv-skeleton',
      `cv-skeleton--${variant}`,
      `cv-skeleton--${animation}`
    ]"
    :style="{ width, height }"
  >
    <slot />
  </div>
</template>

<style scoped>
.cv-skeleton-lines {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.cv-skeleton {
  position: relative;
  display: block;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.08);
  overflow: hidden;
  isolation: isolate;
}

.cv-skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.12) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 2;
}

.cv-skeleton--text {
  border-radius: 6px;
  height: 16px;
}

.cv-skeleton--circular {
  border-radius: 50%;
}

.cv-skeleton--rectangular {
  border-radius: 0;
}

.cv-skeleton--rounded {
  border-radius: 12px;
}

.cv-skeleton--pulse {
  animation: cvSkeletonPulse 1.8s ease-in-out infinite;
}

.cv-skeleton--wave {
  overflow: hidden;
}

.cv-skeleton--wave::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 245, 214, 0.06) 50%,
    transparent 100%
  );
  animation: cvSkeletonWave 1.8s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

.cv-skeleton--shimmer {
  overflow: hidden;
}

.cv-skeleton--shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 20%,
    rgba(201, 169, 97, 0.1) 40%,
    rgba(232, 213, 160, 0.22) 50%,
    rgba(201, 169, 97, 0.1) 60%,
    transparent 80%
  );
  background-size: 200% 100%;
  animation: cvSkeletonShimmer 2s linear infinite;
  pointer-events: none;
  z-index: 1;
}

.cv-skeleton--none {
  animation: none;
}

@keyframes cvSkeletonPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

@keyframes cvSkeletonWave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes cvSkeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 640px) {
  .cv-skeleton-lines {
    gap: 8px;
  }

  .cv-skeleton--rounded {
    border-radius: 10px;
  }
}
</style>