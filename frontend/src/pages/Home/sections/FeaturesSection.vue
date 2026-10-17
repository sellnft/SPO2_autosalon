<script setup>
import { features } from '../homeData'
import SectionHead from '../components/SectionHead.vue'
</script>

<template>
  <section class="features">
    <div class="features__container">
      <SectionHead eyebrow="Почему CarVibe" title="Премиум-подход к каждой сделке" centered />

      <div class="features__grid">
        <div v-for="f in features" :key="f.title" class="cv-card feature">
          <span class="feature__icon" aria-hidden="true">
            <svg v-if="f.icon === 'shield'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <svg v-else-if="f.icon === 'chat'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z" />
            </svg>
            <svg v-else-if="f.icon === 'search'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <svg v-else-if="f.icon === 'bell'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <svg v-else-if="f.icon === 'chart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 15l4-4 3 3 6-6" />
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z" />
            </svg>
          </span>

          <h3 class="feature__title">{{ f.title }}</h3>
          <p class="feature__description">{{ f.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: var(--home-section-py, 96px) 0;
}
.features__container {
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

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
}
.cv-card:hover {
  border-color: rgba(201, 169, 97, 0.38);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}

.feature {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px 24px 24px;
}

.feature__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 15px;
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
  transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}
.feature:hover .feature__icon {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(232, 213, 160, 0.55);
  transform: scale(1.05);
}

.feature__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}
.feature__description {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.55;
  color: rgba(200, 190, 175, 0.65);
}

@media (max-width: 1024px) {
  .features__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .features__grid { grid-template-columns: 1fr; gap: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .cv-card:hover,
  .feature:hover .feature__icon { transform: none; }
}
</style>