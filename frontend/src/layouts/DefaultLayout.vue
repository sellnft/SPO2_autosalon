<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileBottomNavigation from '@/components/layout/MobileBottomNavigation.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()

const isFullWidth = computed(() => route.meta?.fullWidth === true)
const isNoPadding = computed(() => route.meta?.noPadding === true)
const showFooter = computed(() => route.meta?.hideFooter !== true)
const showMobileNav = computed(() => route.meta?.hideMobileNav !== true)
const showBreadcrumbs = computed(() => route.meta?.breadcrumbs === true)
</script>

<template>
  <div class="cv-layout">
    <div class="cv-layout__bg" aria-hidden="true">
      <div class="cv-layout__bg-orb cv-layout__bg-orb--1"></div>
      <div class="cv-layout__bg-orb cv-layout__bg-orb--2"></div>
      <div class="cv-layout__bg-grid"></div>
    </div>

    <AppHeader />

    <main class="cv-layout__main">
      <div
        class="cv-layout__main-inner"
        :class="{
          'cv-layout__main-inner--full': isFullWidth,
          'cv-layout__main-inner--no-padding': isNoPadding
        }"
      >
        <router-view v-slot="{ Component }">
          <Transition name="cv-layout-page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>

    <AppFooter v-if="showFooter" />

    <MobileBottomNavigation v-if="showMobileNav" />

    <ToastContainer />

    <button
      type="button"
      class="cv-layout__scroll-top"
      :class="{ 'cv-layout__scroll-top--visible': false }"
      aria-label="Наверх"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.cv-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0A0A0C;
  color: rgba(245, 240, 230, 0.9);
  isolation: isolate;
}

.cv-layout__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-layout__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.45;
}

.cv-layout__bg-orb--1 {
  top: -10%;
  left: -5%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvLayoutOrb 22s ease-in-out infinite;
}

.cv-layout__bg-orb--2 {
  top: 45%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.18), transparent 70%);
  animation: cvLayoutOrb 28s ease-in-out infinite reverse;
  animation-delay: -8s;
}

@keyframes cvLayoutOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(50px, -40px) scale(1.08); }
  66% { transform: translate(-40px, 30px) scale(0.94); }
}

.cv-layout__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 50% 30%, black 15%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 30%, black 15%, transparent 75%);
  opacity: 0.5;
}

.cv-layout__main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0));
}

.cv-layout__main-inner {
  flex: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 32px 40px;
}

.cv-layout__main-inner--full {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}

.cv-layout__main-inner--no-padding {
  padding: 0;
}

.cv-layout-page-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-layout-page-leave-active {
  transition: all 0.2s ease;
}

.cv-layout-page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-layout-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.cv-layout__scroll-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 900;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(201, 169, 97, 0.3);
  background: rgba(18, 18, 21, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: #E8D5A0;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(201, 169, 97, 0.15);
  transition: all 0.25s ease;
}

.cv-layout__scroll-top:hover {
  background: linear-gradient(135deg, #E8D5A0, #C9A961);
  color: #1A1208;
  border-color: transparent;
  transform: translateY(-4px);
  box-shadow: 0 16px 44px rgba(201, 169, 97, 0.45);
}

@media (max-width: 1280px) {
  .cv-layout__main-inner {
    padding: 20px 24px 32px;
  }
}

@media (max-width: 1024px) {
  .cv-layout__main-inner {
    padding: 18px 20px 28px;
  }
}

@media (max-width: 768px) {
  .cv-layout__main {
    padding-bottom: calc(88px + env(safe-area-inset-bottom, 0));
  }

  .cv-layout__main-inner {
    padding: 14px 16px 24px;
  }

  .cv-layout__bg-orb--1,
  .cv-layout__bg-orb--2 {
    width: 320px;
    height: 320px;
    filter: blur(90px);
  }

  .cv-layout__scroll-top {
    bottom: 88px;
    right: 16px;
    width: 42px;
    height: 42px;
  }
}

@media (min-width: 769px) {
  .cv-layout__scroll-top {
    display: inline-flex;
  }
}
</style>