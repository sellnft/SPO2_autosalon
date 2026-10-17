<script setup>
import { useRouter } from 'vue-router'
import { brands } from '../homeData'

const router = useRouter()

function handleQuickSearch(brand) {
  router.push({ path: '/announcements', query: { brand } })
}
</script>

<template>
  <section class="brands">
    <div class="brands__container">
      <span class="brands__label">Популярные марки:</span>
      <div class="brands__scroll">
        <button
          v-for="brand in brands"
          :key="brand.value"
          type="button"
          class="brands__chip"
          @click="handleQuickSearch(brand.value)"
        >
          {{ brand.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.brands {
  padding: 24px 0;
  border-bottom: 1px solid rgba(201, 169, 97, 0.1);
}
.brands__container {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.brands__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
  flex-shrink: 0;
  white-space: nowrap;
}
.brands__scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 4px 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
}
.brands__scroll::-webkit-scrollbar { display: none; }

.brands__chip {
  flex-shrink: 0;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.brands__chip:hover {
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}
.brands__chip:focus-visible {
  outline: 2px solid #e8d5a0;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .brands__container {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .brands__scroll { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .brands__chip:hover { transform: none; }
}
</style>