<script setup>
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div class="cv-empty-layout">
    <div class="cv-empty-layout__bg" aria-hidden="true">
      <div class="cv-empty-layout__bg-orb cv-empty-layout__bg-orb--1"></div>
      <div class="cv-empty-layout__bg-orb cv-empty-layout__bg-orb--2"></div>
      <div class="cv-empty-layout__bg-grid"></div>
      <div class="cv-empty-layout__bg-carbon"></div>
    </div>

    <div class="cv-empty-layout__content">
      <router-view v-slot="{ Component }">
        <Transition name="cv-empty-page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </div>

    <ToastContainer />
  </div>
</template>

<style scoped>
.cv-empty-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0A0A0C;
  color: rgba(245, 240, 230, 0.9);
  isolation: isolate;
  overflow: hidden;
}

.cv-empty-layout__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-empty-layout__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.5;
}

.cv-empty-layout__bg-orb--1 {
  top: -15%;
  left: 50%;
  transform: translateX(-50%);
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.3), transparent 70%);
  animation: cvEmptyOrbFloat 20s ease-in-out infinite;
}

.cv-empty-layout__bg-orb--2 {
  bottom: -25%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.2), transparent 70%);
  animation: cvEmptyOrbFloat 26s ease-in-out infinite reverse;
  animation-delay: -6s;
}

@keyframes cvEmptyOrbFloat {
  0%, 100% { transform: translate(-50%, 0) scale(1); }
  33% { transform: translate(calc(-50% + 40px), -30px) scale(1.06); }
  66% { transform: translate(calc(-50% - 30px), 20px) scale(0.94); }
}

.cv-empty-layout__bg-orb--2 {
  animation-name: cvEmptyOrbFloat2;
}

@keyframes cvEmptyOrbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(1.06); }
  66% { transform: translate(30px, -20px) scale(0.94); }
}

.cv-empty-layout__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  opacity: 0.55;
}

.cv-empty-layout__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
}

.cv-empty-layout__content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.cv-empty-page-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-empty-page-leave-active {
  transition: all 0.2s ease;
}

.cv-empty-page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-empty-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .cv-empty-layout__bg-orb--1 {
    width: 420px;
    height: 420px;
    filter: blur(90px);
  }

  .cv-empty-layout__bg-orb--2 {
    width: 380px;
    height: 380px;
    filter: blur(90px);
  }

  .cv-empty-layout__bg-grid {
    background-size: 44px 44px;
  }
}
</style>