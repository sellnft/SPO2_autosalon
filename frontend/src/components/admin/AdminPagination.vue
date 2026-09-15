<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true
  },
  perPage: {
    type: Number,
    default: 20
  },
  maxPages: {
    type: Number,
    default: 7
  },
  showTotal: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:currentPage', 'change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.perPage)))

const pages = computed(() => {
  const result = []
  const half = Math.floor(props.maxPages / 2)

  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxPages - 1)

  if (end - start < props.maxPages - 1) {
    start = Math.max(1, end - props.maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    result.push(i)
  }

  return result
})

const showFirstEllipsis = computed(() => pages.value[0] > 1)
const showLastEllipsis = computed(() => pages.value[pages.value.length - 1] < totalPages.value)

const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.perPage + 1
)

const endItem = computed(() =>
  Math.min(props.currentPage * props.perPage, props.totalItems)
)

const progress = computed(() => {
  if (totalPages.value <= 1) return 0
  return ((props.currentPage - 1) / (totalPages.value - 1)) * 100
})

const canPrev = computed(() => props.currentPage > 1)
const canNext = computed(() => props.currentPage < totalPages.value)

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}

function previousPage() {
  goToPage(props.currentPage - 1)
}

function nextPage() {
  goToPage(props.currentPage + 1)
}
</script>

<template>
  <div class="cv-apag">
    <div class="cv-apag__glow" aria-hidden="true"></div>

    <div class="cv-apag__inner">
      <p v-if="showTotal && !compact" class="cv-apag__total">
        <span class="cv-apag__total-range">{{ startItem }}–{{ endItem }}</span>
        <span class="cv-apag__total-sep">из</span>
        <span class="cv-apag__total-count">{{ totalItems.toLocaleString('ru-RU') }}</span>
      </p>

      <p v-else-if="compact" class="cv-apag__total cv-apag__total--compact">
        <span class="cv-apag__total-current">{{ currentPage }}</span>
        <span class="cv-apag__total-sep">/</span>
        <span class="cv-apag__total-count">{{ totalPages }}</span>
      </p>

      <div class="cv-apag__progress" aria-hidden="true">
        <span class="cv-apag__progress-fill" :style="{ width: `${progress}%` }"></span>
      </div>

      <nav class="cv-apag__nav" aria-label="Пагинация">
        <button
          type="button"
          class="cv-apag__btn cv-apag__btn--arrow"
          :disabled="!canPrev"
          aria-label="Предыдущая страница"
          @click="previousPage"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <template v-if="showFirstEllipsis && !compact">
          <button type="button" class="cv-apag__btn" @click="goToPage(1)">1</button>
          <span class="cv-apag__ellipsis" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </template>

        <button
          v-for="page in pages"
          :key="page"
          type="button"
          :class="['cv-apag__btn', { 'cv-apag__btn--active': page === currentPage }]"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <template v-if="showLastEllipsis && !compact">
          <span class="cv-apag__ellipsis" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
          <button type="button" class="cv-apag__btn" @click="goToPage(totalPages)">
            {{ totalPages }}
          </button>
        </template>

        <button
          type="button"
          class="cv-apag__btn cv-apag__btn--arrow"
          :disabled="!canNext"
          aria-label="Следующая страница"
          @click="nextPage"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </button>
      </nav>

      <div v-if="$slots.default" class="cv-apag__slot">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv-apag {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 1rem;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
  isolation: isolate;
  overflow: hidden;
}

.cv-apag::before {
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

.cv-apag__glow {
  position: absolute;
  top: -60px;
  right: -80px;
  width: 280px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-apag__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-apag__total {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.5);
  flex-shrink: 0;
}

.cv-apag__total-range {
  font-weight: 700;
  color: #E8D5A0;
  padding: 3px 9px;
  border-radius: 7px;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.22);
  font-variant-numeric: tabular-nums;
}

.cv-apag__total-sep {
  color: rgba(200, 190, 175, 0.4);
}

.cv-apag__total-count {
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
  font-variant-numeric: tabular-nums;
}

.cv-apag__total--compact {
  gap: 4px;
  font-size: 12px;
}

.cv-apag__total--compact .cv-apag__total-current {
  font-weight: 800;
  color: #E8D5A0;
  font-size: 14px;
}

.cv-apag__progress {
  flex: 1;
  min-width: 100px;
  max-width: 200px;
  height: 3px;
  border-radius: 3px;
  background: rgba(201, 169, 97, 0.1);
  overflow: hidden;
}

.cv-apag__progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #8B6F3F, #C9A961, #E8D5A0);
  border-radius: 3px;
  transition: width 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.5);
}

.cv-apag__nav {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.cv-apag__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.15);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  font-variant-numeric: tabular-nums;
}

.cv-apag__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-apag__btn:hover:not(:disabled):not(.cv-apag__btn--active) {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(201, 169, 97, 0.18);
}

.cv-apag__btn:hover:not(:disabled):not(.cv-apag__btn--active)::before {
  opacity: 1;
}

.cv-apag__btn:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
}

.cv-apag__btn:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-apag__btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 0 20px rgba(201, 169, 97, 0.28),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.45) inset;
  cursor: default;
  font-weight: 800;
  transform: none;
}

.cv-apag__btn--active::before {
  opacity: 0;
}

.cv-apag__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-apag__btn--arrow {
  min-width: 34px;
  padding: 0;
}

.cv-apag__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0 6px;
  height: 34px;
}

.cv-apag__ellipsis span {
  width: 3.5px;
  height: 3.5px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.5);
  animation: cvAdminPagDot 1.4s ease-in-out infinite;
}

.cv-apag__ellipsis span:nth-child(2) { animation-delay: 0.15s; }
.cv-apag__ellipsis span:nth-child(3) { animation-delay: 0.3s; }

@keyframes cvAdminPagDot {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.15); }
}

.cv-apag__slot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .cv-apag {
    padding: 14px 16px;
  }

  .cv-apag__inner {
    gap: 12px;
    justify-content: center;
  }

  .cv-apag__total {
    order: 1;
    flex-basis: 100%;
    justify-content: center;
  }

  .cv-apag__progress {
    order: 2;
    flex-basis: 100%;
    max-width: 100%;
  }

  .cv-apag__nav {
    order: 3;
    flex-wrap: wrap;
    justify-content: center;
    gap: 3px;
  }

  .cv-apag__btn {
    min-width: 32px;
    height: 32px;
    font-size: 12.5px;
    padding: 0 8px;
  }
}

@media (max-width: 480px) {
  .cv-apag__nav .cv-apag__btn:not(.cv-apag__btn--arrow):not(.cv-apag__btn--active) {
    display: none;
  }

  .cv-apag__nav .cv-apag__ellipsis {
    display: inline-flex;
  }
}
</style>