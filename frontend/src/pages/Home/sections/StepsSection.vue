<script setup>
import { steps } from '../homeData'
import SectionHead from '../components/SectionHead.vue'
</script>

<template>
  <section class="steps">
    <div class="steps__container">
      <SectionHead eyebrow="Как это работает" title="4 шага к вашей новой машине" centered />

      <div class="steps__grid">
        <div v-for="(step, i) in steps" :key="step.number" class="step">
          <div class="step__number-wrap">
            <span class="step__number">{{ step.number }}</span>
            <span v-if="i < steps.length - 1" class="step__connector" aria-hidden="true" />
          </div>
          <h3 class="step__title">{{ step.title }}</h3>
          <p class="step__description">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.steps {
  padding: var(--home-section-py, 96px) 0;
}
.steps__container {
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.steps__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px;
}
.step__number-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}
.step__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #1a1208;
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
  box-shadow: 0 8px 24px rgba(201, 169, 97, 0.3);
  font-variant-numeric: tabular-nums;
}
.step__connector {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(201, 169, 97, 0.5), rgba(201, 169, 97, 0.05));
  position: relative;
}
.step__connector::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.4);
}
.step__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}
.step__description {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.6;
  color: rgba(200, 190, 175, 0.65);
}

@media (max-width: 1024px) {
  .steps__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .steps__grid { grid-template-columns: 1fr; gap: 20px; }
  .step__number { width: 48px; height: 48px; font-size: 18px; border-radius: 14px; }
  .step__connector { display: none; }
}
</style>