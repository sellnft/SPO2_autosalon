<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sellerBenefits } from '../homeData'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

function goToSell() {
  if (!authStore.isAuthenticated) {
    router.push('/register')
  } else {
    router.push('/announcements/create')
  }
}
</script>

<template>
  <section class="sell">
    <div class="sell__bg" aria-hidden="true">
      <div class="sell__bg-orb"></div>
      <div class="sell__bg-carbon"></div>
    </div>

    <div class="sell__container">
      <div class="sell__content">
        <span class="sell__eyebrow">
          <span class="sell__eyebrow-dot" aria-hidden="true" />
          Для продавцов
        </span>

        <h2 class="sell__title">
          Продайте автомобиль
          <span class="sell__title-accent">за 3 дня</span>
        </h2>

        <p class="sell__subtitle">
          Разместите объявление бесплатно и получите первые отклики уже сегодня.
          Тысячи покупателей ищут машину на CarVibe прямо сейчас.
        </p>

        <ul class="sell__benefits">
          <li v-for="b in sellerBenefits" :key="b.text" class="sell__benefit">
            <span class="sell__benefit-icon" aria-hidden="true">
              <svg v-if="b.icon === 'bolt'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z" />
              </svg>
              <svg v-else-if="b.icon === 'users'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 15l4-4 3 3 6-6" />
              </svg>
            </span>
            {{ b.text }}
          </li>
        </ul>

        <div class="sell__actions">
          <BaseButton size="lg" @click="goToSell">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Разместить объявление
          </BaseButton>

          <button type="button" class="sell__link" @click="router.push('/analytics')">
            Узнать цену авто
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>

      <div class="sell__visual" aria-hidden="true">
        <div class="sell__card">
          <div class="sell__card-header">
            <span class="sell__card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 15l4-4 3 3 6-6" />
              </svg>
            </span>
            <span class="sell__card-label">Прогноз цены</span>
          </div>

          <div class="sell__card-price">
            <span class="sell__card-price-value">2 850 000</span>
            <span class="sell__card-price-currency">₽</span>
          </div>

          <div class="sell__card-chart">
            <svg viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sellChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#C9A961" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#C9A961" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,40 L30,35 L60,38 L90,25 L120,22 L150,18 L180,12 L200,10 L200,60 L0,60 Z" fill="url(#sellChartFill)" />
              <path d="M0,40 L30,35 L60,38 L90,25 L120,22 L150,18 L180,12 L200,10" stroke="#E8D5A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>

          <div class="sell__card-footer">
            <span class="sell__card-stat">
              <strong>+12%</strong> к средней цене рынка
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sell {
  position: relative;
  padding: var(--home-section-py, 96px) 0;
  overflow: hidden;
  isolation: isolate;
}

.sell__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.sell__bg-orb {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
}
.sell__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.25;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
}

.sell__container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 64px;
  align-items: center;
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}

.sell__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sell__eyebrow {
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
  color: #e8a88a;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.2), rgba(184, 119, 85, 0.05));
  border: 1px solid rgba(184, 119, 85, 0.42);
}
.sell__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8a88a, #b87755);
  box-shadow: 0 0 8px rgba(184, 119, 85, 0.7);
}

.sell__title {
  margin: 0;
  font-size: 52px;
  font-weight: 800;
  letter-spacing: -1.4px;
  line-height: 1.05;
  color: rgba(245, 240, 230, 0.98);
}
.sell__title-accent {
  display: block;
  background: linear-gradient(135deg, #e8a88a 0%, #b87755 55%, #6b4225 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.sell__subtitle {
  margin: 0;
  max-width: 520px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.75);
}

.sell__benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;
  padding: 0;
  list-style: none;
}
.sell__benefit {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 600;
  color: rgba(220, 210, 195, 0.85);
}
.sell__benefit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 8px;
  color: #e8a88a;
  background: rgba(184, 119, 85, 0.14);
  border: 1px solid rgba(184, 119, 85, 0.32);
}

.sell__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.sell__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #e8a88a;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}
.sell__link svg { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.sell__link:hover {
  color: #f0c080;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(232, 168, 138, 0.5);
}
.sell__link:hover svg { transform: translateX(3px); }
.sell__link:focus-visible {
  outline: 2px solid #e8d5a0;
  outline-offset: 2px;
}

.sell__visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.sell__card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.65));
  border: 1px solid rgba(201, 169, 97, 0.28);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  isolation: isolate;
}
.sell__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.28) 50%, transparent);
}

.sell__card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.sell__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.15);
  border: 1px solid rgba(201, 169, 97, 0.35);
}
.sell__card-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}
.sell__card-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 20px;
}
.sell__card-price-value {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.sell__card-price-currency {
  font-size: 20px;
  font-weight: 800;
  color: rgba(232, 213, 160, 0.6);
}
.sell__card-chart {
  height: 70px;
  margin-bottom: 18px;
}
.sell__card-chart svg { width: 100%; height: 100%; display: block; }

.sell__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
}
.sell__card-stat {
  font-size: 12px;
  font-weight: 600;
  color: rgba(200, 190, 175, 0.65);
}
.sell__card-stat strong { color: #b8cea8; font-weight: 800; }

@media (max-width: 1024px) {
  .sell__container { grid-template-columns: 1fr; gap: 40px; }
  .sell__title { font-size: 38px; }
  .sell__visual { justify-content: flex-start; }
  .sell__card { max-width: 100%; }
}
@media (max-width: 768px) {
  .sell__title { font-size: 32px; letter-spacing: -0.8px; }
  .sell__eyebrow { font-size: 10px; padding: 6px 12px; }
  .sell__actions { flex-direction: column; align-items: stretch; }
  .sell__link { justify-content: center; }
}
@media (max-width: 480px) {
  .sell__title { font-size: 26px; }
}

@media (prefers-reduced-motion: reduce) {
  .sell__link svg { transition: none; }
  .sell__link:hover svg { transform: none; }
}
</style>