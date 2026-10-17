<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { brands, cities, heroStats } from '../homeData'
import { useOnScreen } from '../composables/useOnScreen'
import { useCountUp } from '../composables/useCountUp'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const router = useRouter()

const searchQuery = ref('')
const selectedBrand = ref('')
const priceFrom = ref('')
const priceTo = ref('')
const selectedCity = ref('')

const { element: statsRef, isVisible: statsVisible } = useOnScreen({ threshold: 0.3 })

/* Счётчики */
const listings = useCountUp(heroStats[0].value, { duration: 1800 })
const sellers = useCountUp(heroStats[1].value, { duration: 1400 })
const support = useCountUp(heroStats[2].value, { duration: 1000 })

watch(statsVisible, (visible) => {
  if (!visible) return
  listings.start()
  sellers.start()
  support.start()
})

const counters = computed(() => ({
  listings: listings.value.value,
  sellers: sellers.value.value,
  support: support.value.value
}))

function handleSearch() {
  const query = {}
  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedBrand.value) query.brand = selectedBrand.value
  if (priceFrom.value) query.priceFrom = priceFrom.value
  if (priceTo.value) query.priceTo = priceTo.value
  if (selectedCity.value) query.city = selectedCity.value
  router.push({ path: '/announcements', query })
}
</script>

<template>
  <section class="hero">
    <div class="hero__bg" aria-hidden="true">
      <img
        src="@/assets/images/home.png"
        alt=""
        class="hero__bg-image"
        loading="eager"
        fetchpriority="high"
      />
      <div class="hero__bg-overlay"></div>
      <div class="hero__bg-orb"></div>
      <div class="hero__bg-grid"></div>
    </div>

    <div class="hero__container">
      <div class="hero__content">
        <span class="hero__eyebrow">
          <span class="hero__eyebrow-dot" aria-hidden="true" />
          Премиальная платформа
        </span>

        <h1 class="hero__title">
          Ваш следующий автомобиль
          <span class="hero__title-accent">уже здесь</span>
        </h1>

        <p class="hero__subtitle">
          Тысячи проверенных объявлений от продавцов по всей России.
          Умный поиск, честные цены и прямая связь с продавцом.
        </p>

        <form class="hero__search" @submit.prevent="handleSearch">
          <div class="hero__search-main">
            <span class="hero__search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="hero__search-input"
              placeholder="Марка, модель или ключевое слово..."
              aria-label="Поисковый запрос"
            />
          </div>

          <div class="hero__search-extra">
            <div class="hero__search-field">
              <BaseSelect
                :model-value="selectedBrand"
                :options="brands"
                placeholder="Марка"
                searchable
                clearable
                @update:model-value="selectedBrand = $event"
              />
            </div>

            <div class="hero__search-field hero__search-field--price">
              <BaseInput
                :model-value="priceFrom"
                type="number"
                placeholder="Цена от"
                @update:model-value="priceFrom = $event"
              />
              <span class="hero__search-dash">—</span>
              <BaseInput
                :model-value="priceTo"
                type="number"
                placeholder="до"
                @update:model-value="priceTo = $event"
              />
            </div>

            <div class="hero__search-field">
              <BaseSelect
                :model-value="selectedCity"
                :options="cities"
                placeholder="Город"
                searchable
                clearable
                @update:model-value="selectedCity = $event"
              />
            </div>

            <BaseButton type="submit" size="lg" class="hero__search-submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              Найти
            </BaseButton>
          </div>
        </form>

        <div ref="statsRef" class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">
              {{ counters.listings.toLocaleString('ru-RU') }}{{ heroStats[0].suffix }}
            </span>
            <span class="hero__stat-label">{{ heroStats[0].label }}</span>
          </div>
          <span class="hero__stat-divider" aria-hidden="true" />
          <div class="hero__stat">
            <span class="hero__stat-value">
              {{ counters.sellers.toLocaleString('ru-RU') }}{{ heroStats[1].suffix }}
            </span>
            <span class="hero__stat-label">{{ heroStats[1].label }}</span>
          </div>
          <span class="hero__stat-divider" aria-hidden="true" />
          <div class="hero__stat">
            <span class="hero__stat-value">
              {{ counters.support }}{{ heroStats[2].suffix }}
            </span>
            <span class="hero__stat-label">{{ heroStats[2].label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: center;
  overflow: hidden;
  isolation: isolate;
}

.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.hero__bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
.hero__bg-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 10, 12, 0.72) 0%, rgba(10, 10, 12, 0.55) 40%, rgba(10, 10, 12, 0.92) 100%),
    linear-gradient(90deg, rgba(10, 10, 12, 0.85) 0%, rgba(10, 10, 12, 0.4) 60%, rgba(10, 10, 12, 0.75) 100%);
}

/* Один orb, ослабленное свечение */
.hero__bg-orb {
  position: absolute;
  top: -10%;
  left: -5%;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.4), transparent 70%);
}
.hero__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 30% 50%, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 30% 50%, black 20%, transparent 75%);
  opacity: 0.5;
}

.hero__container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 100px var(--home-container-px, 48px) 80px;
}

.hero__content {
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(232, 213, 160, 0.95);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.2), rgba(201, 169, 97, 0.05));
  border: 1px solid rgba(201, 169, 97, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5e6bc, #c9a961);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.hero__title {
  margin: 0;
  font-size: 68px;
  font-weight: 800;
  letter-spacing: -1.8px;
  line-height: 1.05;
  color: rgba(245, 240, 230, 0.98);
}
.hero__title-accent {
  display: block;
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.hero__subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.75);
}

.hero__search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(28, 24, 18, 0.6) 0%, rgba(15, 13, 10, 0.75) 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.hero__search-main {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}
.hero__search-main:focus-within {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.hero__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}
.hero__search-main:focus-within .hero__search-icon {
  color: #e8d5a0;
}

.hero__search-input {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  color: rgba(245, 240, 230, 0.95);
  background: transparent;
  border: none;
  outline: none;
}
.hero__search-input::placeholder {
  color: rgba(200, 190, 175, 0.45);
}

.hero__search-extra {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 0 8px 8px;
}
.hero__search-field { min-width: 0; }
.hero__search-field--price {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 6px;
  align-items: center;
}
.hero__search-dash {
  color: rgba(200, 190, 175, 0.4);
  font-size: 12px;
  text-align: center;
}
.hero__search-submit { white-space: nowrap; }

.hero__stats {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  padding-top: 8px;
}
.hero__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hero__stat-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}
.hero__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}
.hero__stat-divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent, rgba(201, 169, 97, 0.4), transparent);
}

/* --- Адаптив --- */
@media (max-width: 1280px) {
  .hero__title { font-size: 56px; }
}
@media (max-width: 1024px) {
  .hero { min-height: 640px; }
  .hero__title { font-size: 44px; letter-spacing: -1.2px; }
  .hero__subtitle { font-size: 15.5px; }
  .hero__search-extra { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .hero { min-height: 560px; }
  .hero__container { padding: 72px var(--home-container-px, 20px) 60px; }
  .hero__title { font-size: 34px; letter-spacing: -0.8px; }
  .hero__subtitle { font-size: 14.5px; }
  .hero__search-extra { grid-template-columns: 1fr; }
  .hero__search-submit { width: 100%; }
  .hero__stats { gap: 18px; }
  .hero__stat-value { font-size: 22px; }
  .hero__stat-divider { height: 26px; }
}
@media (max-width: 480px) {
  .hero__title { font-size: 28px; }
}

@media (prefers-reduced-motion: reduce) {
  .hero__search-main { transition: none; }
}
</style>