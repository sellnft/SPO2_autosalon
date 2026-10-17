<script setup>
import { reviews } from '../homeData'
import SectionHead from '../components/SectionHead.vue'
</script>

<template>
  <section class="reviews">
    <div class="reviews__container">
      <SectionHead eyebrow="Отзывы" title="Что говорят пользователи" />

      <div class="reviews__grid">
        <article v-for="r in reviews" :key="r.id" class="cv-card review">
          <div class="review__rating" :aria-label="`${r.rating} из 5`">
            <svg v-for="i in r.rating" :key="i" width="14" height="14" viewBox="0 0 24 24" fill="#E8D5A0" aria-hidden="true">
              <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18.2 5.5 22l1.7-7.4-5.7-5L9 9z" />
            </svg>
          </div>

          <p class="review__text">«{{ r.text }}»</p>

          <div class="review__author">
            <span class="review__avatar" aria-hidden="true">
              {{ r.initial }}
            </span>
            <div class="review__author-info">
              <span class="review__author-name">{{ r.name }}</span>
              <span class="review__author-meta">{{ r.city }} · {{ r.car }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews {
  padding: var(--home-section-py, 96px) 0;
}
.reviews__container {
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.reviews__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.cv-card {
  position: relative;
  background: linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45));
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 18px;
  overflow: hidden;
  isolation: isolate;
}

.review {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 26px 24px;
}
.review::before {
  content: '„';
  position: absolute;
  top: -28px;
  right: 16px;
  font-size: 140px;
  font-weight: 800;
  font-family: Georgia, serif;
  line-height: 1;
  color: rgba(201, 169, 97, 0.08);
  pointer-events: none;
  z-index: 0;
}
.review > * { position: relative; z-index: 1; }

.review__rating { display: inline-flex; gap: 3px; }

.review__text {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  line-height: 1.65;
  color: rgba(245, 240, 230, 0.85);
}

.review__author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  margin-top: auto;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
}
.review__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 800;
  color: #1a1208;
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
}
.review__author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.review__author-name {
  font-size: 13.5px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.95);
}
.review__author-meta {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 1024px) {
  .reviews__grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .review { padding: 22px 20px 20px; }
  .review::before { font-size: 100px; top: -20px; }
}
</style>