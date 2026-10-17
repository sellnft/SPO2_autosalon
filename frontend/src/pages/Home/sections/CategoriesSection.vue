<script setup>
import { useRouter } from 'vue-router'
import { bodyTypes } from '../homeData'
import SectionHead from '../components/SectionHead.vue'

const router = useRouter()

function goToBodyType(type) {
  router.push({ path: '/announcements', query: { bodyType: type.value } })
}
</script>

<template>
  <section class="categories">
    <div class="categories__container">
      <SectionHead eyebrow="Тип кузова" title="Категории автомобилей" />

      <div class="categories__grid">
        <button
          v-for="type in bodyTypes"
          :key="type.value"
          type="button"
          class="cv-card category"
          @click="goToBodyType(type)"
        >
          <span class="category__icon" aria-hidden="true">
            <svg v-if="type.icon === 'sedan'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 14v3h18v-3M3 14l3-5h12l3 5" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
            <svg v-else-if="type.icon === 'suv'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 14v3h18v-3M3 14l2.5-6h13L21 14" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
            <svg v-else-if="type.icon === 'suv-large'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 14v3h20v-3M2 14l2-7h16l2 7" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
            <svg v-else-if="type.icon === 'hatch'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 14v3h18v-3M3 14l2-5h14v5" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
            <svg v-else-if="type.icon === 'wagon'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 14v3h18v-3M3 14V9h13l5 5" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
            <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 14v3h18v-3M4 14l4-5h8l4 5" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
          </span>
          <span class="category__label">{{ type.label }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.categories {
  padding: var(--home-section-py, 96px) 0;
}
.categories__container {
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.categories__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

/* Единый surface-паттерн карточек (совпадает с feature/review) */
.cv-card {
  position: relative;
  background: linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45));
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 16px;
  overflow: hidden;
  isolation: isolate;
  transition: border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}
.cv-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
}
.cv-card:hover {
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}
.cv-card:focus-visible {
  outline: 2px solid #e8d5a0;
  outline-offset: 2px;
}

.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 16px 24px;
  font-family: inherit;
  color: rgba(220, 210, 195, 0.85);
  cursor: pointer;
}

.category__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
  transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}
.category:hover .category__icon {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(232, 213, 160, 0.55);
  transform: scale(1.05);
}

.category__label {
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 700;
  transition: color 0.25s ease;
}
.category:hover .category__label {
  color: #f5e6bc;
}

@media (max-width: 1024px) {
  .categories__grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .categories__grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .category { padding: 22px 12px 18px; }
  .category__icon { width: 54px; height: 54px; border-radius: 15px; }
  .category__label { font-size: 13px; }
}

@media (prefers-reduced-motion: reduce) {
  .cv-card:hover,
  .category:hover .category__icon { transform: none; }
}
</style>