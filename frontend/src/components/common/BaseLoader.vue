<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v)
  },
  variant: {
    type: String,
    default: 'spinner',
    validator: (v) => ['spinner', 'dots', 'bar', 'orbit'].includes(v)
  },
  color: {
    type: String,
    default: ''
  },
  text: String,
  fullscreen: Boolean
})
</script>

<template>
  <div :class="['cv-loader', { 'cv-loader--fullscreen': fullscreen }]">
    <div v-if="fullscreen" class="cv-loader__backdrop" aria-hidden="true"></div>
    <div v-if="fullscreen" class="cv-loader__orb" aria-hidden="true"></div>

    <div class="cv-loader__content">
      <div
        v-if="variant === 'spinner'"
        :class="['cv-loader__spinner', `cv-loader__spinner--${size}`]"
        :style="color ? { '--cv-loader-color': color } : {}"
      >
        <span class="cv-loader__spinner-ring"></span>
        <span class="cv-loader__spinner-core"></span>
      </div>

      <div
        v-else-if="variant === 'dots'"
        class="cv-loader__dots"
        :style="color ? { '--cv-loader-color': color } : {}"
      >
        <span v-for="i in 3" :key="i" class="cv-loader__dot"></span>
      </div>

      <div
        v-else-if="variant === 'bar'"
        :class="['cv-loader__bar', `cv-loader__bar--${size}`]"
        :style="color ? { '--cv-loader-color': color } : {}"
      >
        <span class="cv-loader__bar-fill"></span>
      </div>

      <div
        v-else-if="variant === 'orbit'"
        :class="['cv-loader__orbit', `cv-loader__orbit--${size}`]"
        :style="color ? { '--cv-loader-color': color } : {}"
      >
        <span class="cv-loader__orbit-ring cv-loader__orbit-ring--1"></span>
        <span class="cv-loader__orbit-ring cv-loader__orbit-ring--2"></span>
        <span class="cv-loader__orbit-core"></span>
      </div>
    </div>

    <p v-if="text" class="cv-loader__text">{{ text }}</p>
  </div>
</template>

<style scoped>
.cv-loader {
  --cv-loader-color: #C9A961;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px;
}

.cv-loader--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1200;
  padding: 0;
}

.cv-loader__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 7, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 0;
}

.cv-loader__orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.18), transparent 70%);
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.8;
  animation: cvLoaderOrbPulse 3s ease-in-out infinite;
}

@keyframes cvLoaderOrbPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-loader__content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cv-loader__spinner {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.cv-loader__spinner--sm { width: 20px; height: 20px; }
.cv-loader__spinner--md { width: 32px; height: 32px; }
.cv-loader__spinner--lg { width: 44px; height: 44px; }
.cv-loader__spinner--xl { width: 64px; height: 64px; }

.cv-loader__spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--cv-loader-color);
  border-right-color: var(--cv-loader-color);
  animation: cvLoaderSpin 0.9s linear infinite;
  box-shadow: 0 0 16px rgba(201, 169, 97, 0.35);
  filter: drop-shadow(0 0 4px var(--cv-loader-color));
}

.cv-loader__spinner-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 35%;
  height: 35%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--cv-loader-color), transparent 75%);
  opacity: 0.7;
  animation: cvLoaderCorePulse 1.4s ease-in-out infinite;
}

@keyframes cvLoaderSpin {
  to { transform: rotate(360deg); }
}

@keyframes cvLoaderCorePulse {
  0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.85); }
  50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.15); }
}

.cv-loader__dots {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cv-loader__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--cv-loader-color);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  animation: cvLoaderDot 1.4s ease-in-out infinite;
}

.cv-loader__dot:nth-child(2) { animation-delay: 0.16s; }
.cv-loader__dot:nth-child(3) { animation-delay: 0.32s; }

@keyframes cvLoaderDot {
  0%, 60%, 100% {
    transform: translateY(0) scale(0.85);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10px) scale(1.15);
    opacity: 1;
  }
}

.cv-loader__bar {
  position: relative;
  width: 220px;
  height: 4px;
  border-radius: 4px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.15);
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-loader__bar--sm { width: 140px; height: 3px; }
.cv-loader__bar--md { width: 220px; height: 4px; }
.cv-loader__bar--lg { width: 280px; height: 5px; }
.cv-loader__bar--xl { width: 340px; height: 6px; }

.cv-loader__bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--cv-loader-color) 50%,
    transparent 100%
  );
  background-size: 60% 100%;
  background-repeat: no-repeat;
  animation: cvLoaderBar 1.6s ease-in-out infinite;
  box-shadow: 0 0 12px var(--cv-loader-color);
}

@keyframes cvLoaderBar {
  0% {
    background-position: -60% 0;
  }
  100% {
    background-position: 160% 0;
  }
}

.cv-loader__orbit {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.cv-loader__orbit--sm { width: 28px; height: 28px; }
.cv-loader__orbit--md { width: 40px; height: 40px; }
.cv-loader__orbit--lg { width: 56px; height: 56px; }
.cv-loader__orbit--xl { width: 76px; height: 76px; }

.cv-loader__orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid transparent;
  border-top-color: var(--cv-loader-color);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.4);
}

.cv-loader__orbit-ring--1 {
  inset: 0;
  animation: cvLoaderSpin 1.2s linear infinite;
}

.cv-loader__orbit-ring--2 {
  inset: 22%;
  border-top-color: transparent;
  border-bottom-color: var(--cv-loader-color);
  animation: cvLoaderSpin 1.6s linear infinite reverse;
}

.cv-loader__orbit-core {
  width: 22%;
  height: 22%;
  border-radius: 50%;
  background: var(--cv-loader-color);
  box-shadow:
    0 0 12px var(--cv-loader-color),
    0 0 24px rgba(201, 169, 97, 0.5);
  animation: cvLoaderCorePulse 1.2s ease-in-out infinite;
}

.cv-loader__text {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: rgba(220, 210, 195, 0.6);
  text-align: center;
}

@media (max-width: 640px) {
  .cv-loader {
    padding: 18px;
    gap: 12px;
  }

  .cv-loader__bar--lg { width: 240px; }
  .cv-loader__bar--xl { width: 280px; }

  .cv-loader__text {
    font-size: 12.5px;
  }
}
</style>