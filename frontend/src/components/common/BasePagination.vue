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
  }
})

const emit = defineEmits(['update:currentPage', 'change'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.perPage))

const pages = computed(() => {
  const pages = []
  const half = Math.floor(props.maxPages / 2)

  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxPages - 1)

  if (end - start < props.maxPages - 1) {
    start = Math.max(1, end - props.maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
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
  <div class="cv-pag">
    <p v-if="showTotal" class="cv-pag__total">
      <span class="cv-pag__total-range">{{ startItem }}–{{ endItem }}</span>
      <span class="cv-pag__total-sep">из</span>
      <span class="cv-pag__total-count">{{ totalItems }}</span>
    </p>

    <div v-if="totalPages > 1" class="cv-pag__progress" aria-hidden="true">
      <span class="cv-pag__progress-fill" :style="{ width: `${progress}%` }"></span>
    </div>

    <nav class="cv-pag__nav" aria-label="Pagination">
      <button
        class="cv-pag__btn cv-pag__btn--arrow"
        :disabled="currentPage === 1"
        aria-label="Предыдущая страница"
        @click="previousPage"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12.5 15l-5-5 5-5"/>
        </svg>
      </button>

      <template v-if="showFirstEllipsis">
        <button class="cv-pag__btn" @click="goToPage(1)">1</button>
        <span class="cv-pag__ellipsis" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </template>

      <button
        v-for="page in pages"
        :key="page"
        :class="[
          'cv-pag__btn',
          { 'cv-pag__btn--active': page === currentPage }
        ]"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <template v-if="showLastEllipsis">
        <span class="cv-pag__ellipsis" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <button class="cv-pag__btn" @click="goToPage(totalPages)">
          {{ totalPages }}
        </button>
      </template>

      <button
        class="cv-pag__btn cv-pag__btn--arrow"
        :disabled="currentPage === totalPages"
        aria-label="Следующая страница"
        @click="nextPage"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7.5 5l5 5-5 5"/>
        </svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.cv-pag {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
}

.cv-pag__total {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.5);
}

.cv-pag__total-range {
  font-weight: 700;
  color: #E8D5A0;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.2);
}

.cv-pag__total-sep {
  color: rgba(200, 190, 175, 0.4);
}

.cv-pag__total-count {
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
}

.cv-pag__progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(201, 169, 97, 0.08);
  border-radius: 2px;
  overflow: hidden;
  pointer-events: none;
}

.cv-pag__progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #8B6F3F, #C9A961, #E8D5A0);
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.6);
}

.cv-pag__nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cv-pag__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-pag__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-pag__btn:hover:not(:disabled):not(.cv-pag__btn--active) {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-pag__btn:hover:not(:disabled):not(.cv-pag__btn--active)::before {
  opacity: 1;
}

.cv-pag__btn:active:not(:disabled) {
  transform: translateY(0) scale(0.96);
}

.cv-pag__btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 0 24px rgba(201, 169, 97, 0.25),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.45) inset;
  cursor: default;
  transform: none;
}

.cv-pag__btn--active::before {
  opacity: 0;
}

.cv-pag__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  filter: saturate(0.5);
}

.cv-pag__btn--arrow {
  min-width: 38px;
  padding: 0;
}

.cv-pag__ellipsis {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0 8px;
  height: 38px;
}

.cv-pag__ellipsis span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.4);
  animation: cvPagDot 1.4s ease-in-out infinite;
}

.cv-pag__ellipsis span:nth-child(2) {
  animation-delay: 0.15s;
}

.cv-pag__ellipsis span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes cvPagDot {
  0%, 100% { opacity: 0.3; transform: scale(0.85); }
  50% { opacity: 0.9; transform: scale(1.15); }
}

@media (max-width: 640px) {
  .cv-pag {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    padding: 14px 0;
  }

  .cv-pag__total {
    justify-content: center;
  }

  .cv-pag__nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 3px;
  }

  .cv-pag__btn {
    min-width: 36px;
    height: 36px;
    font-size: 13px;
    padding: 0 8px;
  }

  .cv-pag__ellipsis {
    height: 36px;
    padding: 0 4px;
  }
}
</style>