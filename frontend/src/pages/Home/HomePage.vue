<script setup>
import HeroSection from './sections/HeroSection.vue'
import BrandsBar from './sections/BrandsBar.vue'
import CategoriesSection from './sections/CategoriesSection.vue'
import PopularSection from './sections/PopularSection.vue'
import SellCtaSection from './sections/SellCtaSection.vue'
import StepsSection from './sections/StepsSection.vue'
import FeaturesSection from './sections/FeaturesSection.vue'
import ReviewsSection from './sections/ReviewsSection.vue'
import FreshSection from './sections/FreshSection.vue'
import FinalCtaSection from './sections/FinalCtaSection.vue'
</script>

<template>
  <div class="cv-home">
    <HeroSection />
    <BrandsBar />
    <CategoriesSection />
    <PopularSection />
    <SellCtaSection />
    <StepsSection />
    <FeaturesSection />
    <ReviewsSection />
    <FreshSection />
    <FinalCtaSection />
  </div>
</template>

<style scoped>
/* ============================================================
   Общие токены главной.
   Все секции читают эти переменные → единый ритм.
   ============================================================ */
.cv-home {
  --home-container-max: 1440px;
  --home-container-px: 48px;
  --home-section-py: 96px;

  display: flex;
  flex-direction: column;
}

@media (max-width: 1280px) {
  .cv-home { --home-container-px: 32px; }
}

@media (max-width: 1024px) {
  .cv-home {
    --home-container-px: 24px;
    --home-section-py: 64px;
  }
}

@media (max-width: 768px) {
  .cv-home {
    --home-container-px: 20px;
    --home-section-py: 48px;
  }
}

@media (max-width: 480px) {
  .cv-home { --home-container-px: 16px; }
}
</style>