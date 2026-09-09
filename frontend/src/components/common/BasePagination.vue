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
  <div class="base-pagination">
    <p v-if="showTotal" class="base-pagination__total">
      Показано {{ startItem }}-{{ endItem }} из {{ totalItems }}
    </p>
    
    <nav class="base-pagination__nav" aria-label="Pagination">
      <button
        class="base-pagination__btn"
        :disabled="currentPage === 1"
        @click="previousPage"
        aria-label="Previous page"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15l-5-5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <template v-if="showFirstEllipsis">
        <button class="base-pagination__btn" @click="goToPage(1)">1</button>
        <span class="base-pagination__ellipsis">...</span>
      </template>
      
      <button
        v-for="page in pages"
        :key="page"
        :class="[
          'base-pagination__btn',
          { 'base-pagination__btn--active': page === currentPage }
        ]"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
      
      <template v-if="showLastEllipsis">
        <span class="base-pagination__ellipsis">...</span>
        <button class="base-pagination__btn" @click="goToPage(totalPages)">
          {{ totalPages }}
        </button>
      </template>
      
      <button
        class="base-pagination__btn"
        :disabled="currentPage === totalPages"
        @click="nextPage"
        aria-label="Next page"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.base-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
}

.base-pagination__total {
  font-size: 13px;
  color: #6B7280;
}

.base-pagination__nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.base-pagination__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: all 0.2s;
}

.base-pagination__btn:hover:not(:disabled):not(.base-pagination__btn--active) {
  background: #F3F4F6;
}

.base-pagination__btn--active {
  background: #0A84FF;
  color: white;
}

.base-pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.base-pagination__ellipsis {
  padding: 0 4px;
  color: #6B7280;
}

@media (max-width: 640px) {
  .base-pagination {
    flex-direction: column;
    gap: 8px;
  }
}
</style>