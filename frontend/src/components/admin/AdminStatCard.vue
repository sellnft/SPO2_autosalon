<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  trend: {
    type: String,
    default: null
  },
  trendDirection: {
    type: String,
    default: null,
    validator: (v) => [null, 'up', 'down', 'flat'].includes(v)
  },
  accent: {
    type: String,
    default: 'accent',
    validator: (v) => ['accent', 'info', 'success', 'warning', 'danger'].includes(v)
  },
  icon: {
    type: String,
    default: null
  },
  hint: {
    type: String,
    default: null
  },
  sparkline: {
    type: Array,
    default: null
  }
})

const accentConfig = computed(() => {
  const map = {
    accent: { color: '#C9A961', colorLight: '#E8D5A0', colorDark: '#8B6F3F' },
    info: { color: '#C9A961', colorLight: '#E8D5A0', colorDark: '#8B6F3F' },
    success: { color: '#7A9A6A', colorLight: '#B8CEA8', colorDark: '#4A6B3F' },
    warning: { color: '#D97706', colorLight: '#F0C080', colorDark: '#8B4513' },
    danger: { color: '#B87755', colorLight: '#E8A88A', colorDark: '#6B4225' }
  }
  return map[props.accent] || map.accent
})

const trendConfig = computed(() => {
  if (!props.trendDirection) return null
  const map = {
    up: { state: 'up', text: 'рост' },
    down: { state: 'down', text: 'падение' },
    flat: { state: 'flat', text: 'без изменений' }
  }
  return map[props.trendDirection] || null
})

const sparklinePath = computed(() => {
  if (!props.sparkline || props.sparkline.length < 2) return ''
  const data = props.sparkline
  const width = 120
  const height = 32
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const points = data.map((val, i) => {
    const x = i * stepX
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  })

  return `M${points.join(' L')}`
})

const sparklineArea = computed(() => {
  if (!sparklinePath.value) return ''
  return `${sparklinePath.value} L120,32 L0,32 Z`
})
</script>

<template>
  <article class="cv-stat" :data-accent="accent">
    <div class="cv-stat__glow" aria-hidden="true"></div>
    <div class="cv-stat__carbon" aria-hidden="true"></div>

    <header class="cv-stat__header">
      <span class="cv-stat__label">{{ label }}</span>

      <span v-if="icon" class="cv-stat__icon" aria-hidden="true">
        <svg v-if="icon === 'users'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <svg v-else-if="icon === 'car'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
          <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
        </svg>
        <svg v-else-if="icon === 'chat'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
        </svg>
        <svg v-else-if="icon === 'money'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2"/>
          <circle cx="12" cy="12" r="2.5"/>
          <path d="M6 10v4M18 10v4"/>
        </svg>
        <svg v-else-if="icon === 'chart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3v18h18"/>
          <path d="M7 15l4-4 3 3 6-6"/>
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v5M12 17h.01"/>
        </svg>
      </span>
    </header>

    <div class="cv-stat__body">
      <span class="cv-stat__value">{{ value }}</span>

      <span
        v-if="trend && trendConfig"
        class="cv-stat__trend"
        :data-state="trendConfig.state"
      >
        <span class="cv-stat__trend-icon" aria-hidden="true">
          <svg v-if="trendConfig.state === 'up'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <svg v-else-if="trendConfig.state === 'down'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
          <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
          </svg>
        </span>
        <span class="cv-stat__trend-value">{{ trend }}</span>
      </span>
    </div>

    <div v-if="sparklinePath" class="cv-stat__sparkline" aria-hidden="true">
      <svg width="120" height="32" viewBox="0 0 120 32" fill="none" preserveAspectRatio="none">
        <defs>
          <linearGradient :id="`sparkline-${accent}`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="accentConfig.colorLight" stop-opacity="0.4"/>
            <stop offset="100%" :stop-color="accentConfig.colorLight" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <path
          :d="sparklineArea"
          :fill="`url(#sparkline-${accent})`"
        />

        <path
          :d="sparklinePath"
          :stroke="accentConfig.colorLight"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
      </svg>
    </div>

    <p v-if="hint" class="cv-stat__hint">{{ hint }}</p>

    <span class="cv-stat__accent-line" aria-hidden="true"></span>
  </article>
</template>

<style scoped>
.cv-stat {
  --cv-stat-color: #C9A961;
  --cv-stat-color-light: #E8D5A0;
  --cv-stat-color-dark: #8B6F3F;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px 20px 24px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 1.25rem;
  isolation: isolate;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.22) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 2;
}

.cv-stat[data-accent="accent"],
.cv-stat[data-accent="info"] {
  --cv-stat-color: #C9A961;
  --cv-stat-color-light: #E8D5A0;
  --cv-stat-color-dark: #8B6F3F;
}

.cv-stat[data-accent="success"] {
  --cv-stat-color: #7A9A6A;
  --cv-stat-color-light: #B8CEA8;
  --cv-stat-color-dark: #4A6B3F;
}

.cv-stat[data-accent="warning"] {
  --cv-stat-color: #D97706;
  --cv-stat-color-light: #F0C080;
  --cv-stat-color-dark: #8B4513;
}

.cv-stat[data-accent="danger"] {
  --cv-stat-color: #B87755;
  --cv-stat-color-light: #E8A88A;
  --cv-stat-color-dark: #6B4225;
}

.cv-stat__glow {
  position: absolute;
  top: -50px;
  right: -60px;
  width: 200px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--cv-stat-color), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.18;
  transition: opacity 0.35s ease;
}

.cv-stat:hover .cv-stat__glow {
  opacity: 0.32;
}

.cv-stat__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
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
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
}

.cv-stat:hover {
  border-color: color-mix(in srgb, var(--cv-stat-color) 50%, transparent);
  transform: translateY(-2px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 32px color-mix(in srgb, var(--cv-stat-color) 25%, transparent),
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-stat__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cv-stat__label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
  line-height: 1.2;
}

.cv-stat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 9px;
  color: var(--cv-stat-color-light);
  background: color-mix(in srgb, var(--cv-stat-color) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--cv-stat-color) 30%, transparent);
  transition: all 0.3s ease;
}

.cv-stat:hover .cv-stat__icon {
  background: color-mix(in srgb, var(--cv-stat-color) 25%, transparent);
  border-color: color-mix(in srgb, var(--cv-stat-color) 50%, transparent);
  transform: scale(1.06);
}

.cv-stat__body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-stat__value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1;
  color: rgba(245, 240, 230, 0.95);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 24px color-mix(in srgb, var(--cv-stat-color) 15%, transparent);
}

.cv-stat__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.cv-stat__trend[data-state="up"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.18), rgba(122, 154, 106, 0.05));
  border-color: rgba(122, 154, 106, 0.42);
}

.cv-stat__trend[data-state="down"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.2), rgba(184, 119, 85, 0.05));
  border-color: rgba(184, 119, 85, 0.45);
}

.cv-stat__trend[data-state="flat"] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-stat__trend-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-stat__trend-value {
  min-width: 0;
}

.cv-stat__sparkline {
  position: relative;
  z-index: 1;
  height: 32px;
  margin: 4px -4px -4px;
  opacity: 0.85;
  transition: opacity 0.35s ease;
}

.cv-stat:hover .cv-stat__sparkline {
  opacity: 1;
}

.cv-stat__hint {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(200, 190, 175, 0.5);
}

.cv-stat__accent-line {
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--cv-stat-color-light), var(--cv-stat-color), var(--cv-stat-color-dark));
  box-shadow: 0 0 12px color-mix(in srgb, var(--cv-stat-color) 60%, transparent);
  pointer-events: none;
  transition: all 0.35s ease;
}

.cv-stat:hover .cv-stat__accent-line {
  top: 15%;
  bottom: 15%;
}

@media (max-width: 640px) {
  .cv-stat {
    padding: 16px 18px 16px 20px;
    border-radius: 1rem;
    gap: 10px;
  }

  .cv-stat__value {
    font-size: 26px;
    letter-spacing: -0.6px;
  }

  .cv-stat__label {
    font-size: 10px;
    letter-spacing: 1px;
  }

  .cv-stat__icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .cv-stat__sparkline {
    height: 26px;
  }

  .cv-stat__trend {
    font-size: 10.5px;
    padding: 3px 8px;
  }
}
</style>