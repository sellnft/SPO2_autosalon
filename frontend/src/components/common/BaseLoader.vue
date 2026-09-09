<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v)
  },
  variant: {
    type: String,
    default: 'spinner',
    validator: (v) => ['spinner', 'dots', 'bar'].includes(v)
  },
  color: {
    type: String,
    default: '#0A84FF'
  },
  text: String
})
</script>

<template>
  <div class="base-loader">
    <div v-if="variant === 'spinner'" :class="['base-loader__spinner', `base-loader__spinner--${size}`]">
      <div class="spinner" :style="{ borderColor: color, borderRightColor: 'transparent' }"></div>
    </div>
    
    <div v-else-if="variant === 'dots'" class="base-loader__dots">
      <span v-for="i in 3" :key="i" class="base-loader__dot" :style="{ background: color }"></span>
    </div>
    
    <div v-else-if="variant === 'bar'" class="base-loader__bar">
      <div class="base-loader__bar-fill" :style="{ background: color }"></div>
    </div>
    
    <p v-if="text" class="base-loader__text">{{ text }}</p>
  </div>
</template>

<style scoped>
.base-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.base-loader__spinner--sm .spinner {
  width: 16px;
  height: 16px;
}

.base-loader__spinner--md .spinner {
  width: 24px;
  height: 24px;
}

.base-loader__spinner--lg .spinner {
  width: 32px;
  height: 32px;
}

.base-loader__spinner--xl .spinner {
  width: 48px;
  height: 48px;
}

.base-loader__dots {
  display: flex;
  gap: 6px;
}

.base-loader__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: dot-pulse 1.4s ease-in-out infinite;
}

.base-loader__dot:nth-child(2) {
  animation-delay: 0.2s;
}

.base-loader__dot:nth-child(3) {
  animation-delay: 0.4s;
}

.base-loader__bar {
  width: 200px;
  height: 4px;
  background: #E5E7EB;
  border-radius: 2px;
  overflow: hidden;
}

.base-loader__bar-fill {
  height: 100%;
  animation: bar-loading 1.5s ease-in-out infinite;
}

.base-loader__text {
  font-size: 14px;
  color: #6B7280;
}

@keyframes dot-pulse {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

@keyframes bar-loading {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}
</style>