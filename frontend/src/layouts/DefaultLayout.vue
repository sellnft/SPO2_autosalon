<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
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

/* --- Scroll to top --- */
const SCROLL_THRESHOLD = 400
const isScrollTopVisible = ref(false)

const handleScroll = () => {
  isScrollTopVisible.value = window.scrollY > SCROLL_THRESHOLD
}

const scrollToTop = () => {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({
    top: 0,
    behavior: prefersReduced ? 'auto' : 'smooth'
  })
}

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
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

    <Transition name="cv-layout-scroll-top">
      <button
        v-show="isScrollTopVisible"
        type="button"
        class="cv-layout__scroll-top"
        aria-label="Наверх"
        @click="scrollToTop"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.cv-layout {
  /* Layout tokens — можно переопределять извне (в т.ч. через :deep или глобально) */
  --cv-layout-max-width: 1440px;
  --cv-layout-padding-x: 32px;
  --cv-layout-padding-top: 24px;
  --cv-layout-padding-bottom: 40px;

  --cv-layout-nav-height: 72px;
  --cv-layout-nav-height-mobile: 88px;

  --cv-layout-scroll-top-size: 46px;
  --cv-layout-scroll-top-offset: 32px;
  --cv-layout-scroll-top-z: 950;

  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a0a0c;
  color: rgba(245, 240, 230, 0.9);
  isolation: isolate;
}

/* --- Фон --- */
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

/* --- Основной контент --- */
.cv-layout__main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(var(--cv-layout-nav-height) + env(safe-area-inset-bottom, 0px));
}

.cv-layout__main-inner {
  flex: 1;
  width: 100%;
  max-width: var(--cv-layout-max-width);
  margin: 0 auto;
  padding: var(--cv-layout-padding-top) var(--cv-layout-padding-x) var(--cv-layout-padding-bottom);
}

.cv-layout__main-inner--full {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}

.cv-layout__main-inner--no-padding {
  padding: 0;
}

/* --- Page transition --- */
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

/* --- Scroll to top --- */
.cv-layout__scroll-top {
  position: fixed;
  bottom: calc(var(--cv-layout-scroll-top-offset) + env(safe-area-inset-bottom, 0px));
  right: var(--cv-layout-scroll-top-offset);
  z-index: var(--cv-layout-scroll-top-z);
  width: var(--cv-layout-scroll-top-size);
  height: var(--cv-layout-scroll-top-size);
  border-radius: 14px;
  border: 1px solid rgba(201, 169, 97, 0.3);
  background: rgba(18, 18, 21, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: #e8d5a0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 12px 36px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(201, 169, 97, 0.15);
  transition:
    background 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease,
    opacity 0.25s ease;
}

.cv-layout__scroll-top:hover {
  background: linear-gradient(135deg, #e8d5a0, #c9a961);
  color: #1a1208;
  border-color: transparent;
  transform: translateY(-4px);
  box-shadow: 0 16px 44px rgba(201, 169, 97, 0.45);
}

.cv-layout__scroll-top:focus-visible {
  outline: 2px solid #e8d5a0;
  outline-offset: 3px;
}

/* Transition для самой кнопки */
.cv-layout-scroll-top-enter-active,
.cv-layout-scroll-top-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.cv-layout-scroll-top-enter-from,
.cv-layout-scroll-top-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}

/* --- Адаптив --- */
@media (max-width: 1280px) {
  .cv-layout {
    --cv-layout-padding-x: 24px;
    --cv-layout-padding-top: 20px;
    --cv-layout-padding-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .cv-layout {
    --cv-layout-padding-x: 20px;
    --cv-layout-padding-top: 18px;
    --cv-layout-padding-bottom: 28px;
  }
}

@media (max-width: 768px) {
  .cv-layout {
    --cv-layout-padding-x: 16px;
    --cv-layout-padding-top: 14px;
    --cv-layout-padding-bottom: 24px;
    --cv-layout-scroll-top-offset: 16px;
    --cv-layout-scroll-top-size: 42px;
  }

  .cv-layout__main {
    padding-bottom: calc(var(--cv-layout-nav-height-mobile) + env(safe-area-inset-bottom, 0px));
  }

  /* Кнопка выше мобильной навигации */
  .cv-layout__scroll-top {
    bottom: calc(
      var(--cv-layout-nav-height-mobile) +
      env(safe-area-inset-bottom, 0px) +
      12px
    );
  }

  .cv-layout__bg-orb--1,
  .cv-layout__bg-orb--2 {
    width: 320px;
    height: 320px;
    filter: blur(90px);
  }
}

/* --- Уважение к системным настройкам --- */
@media (prefers-reduced-motion: reduce) {
  .cv-layout__bg-orb--1,
  .cv-layout__bg-orb--2 {
    animation: none;
  }

  .cv-layout-page-enter-active,
  .cv-layout-page-leave-active,
  .cv-layout-scroll-top-enter-active,
  .cv-layout-scroll-top-leave-active {
    transition: none;
  }

  .cv-layout__scroll-top:hover {
    transform: none;
  }
}
</style>