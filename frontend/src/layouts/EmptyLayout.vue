<script setup>
import ToastContainer from '@/components/common/ToastContainer.vue'

/**
 * Пустой лейаут для служебных страниц: 404, 403, 500, maintenance, logout и т.п.
 *
 * Особенности:
 *  - Контент центрируется по вертикали и горизонтали.
 *  - Страница может переопределить центрирование через :deep() (например,
 *    если нужна форма по центру сверху, а не посередине).
 *  - Все токены (палитра, отступы) совпадают с cv-layout / cv-admin / cv-auth —
 *    единая стилистика приложения.
 */
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
/* ============================================================
   Единый лейаут для служебных страниц
   - Токены совпадают с cv-layout / cv-admin / cv-auth
   - Контент центрируется; страница может переопределить через :deep()
   ============================================================ */

.cv-empty-layout {
  /* Layout tokens */
  --cv-empty-padding-x: clamp(16px, 4vw, 32px);
  --cv-empty-padding-y: clamp(24px, 5vh, 48px);
  --cv-empty-max-width: 720px;

  /* Палитра (те же значения, что и в основных лейаутах) */
  --cv-empty-bg: #0a0a0c;
  --cv-empty-fg: rgba(245, 240, 230, 0.9);
  --cv-empty-fg-muted: rgba(220, 210, 195, 0.65);
  --cv-empty-accent: #c9a961;
  --cv-empty-accent-soft: rgba(201, 169, 97, 0.3);

  position: relative;
  display: flex;
  flex-direction: column;

  /* Корректно работаем с мобильной клавиатурой и адресной строкой */
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;

  background: var(--cv-empty-bg);
  color: var(--cv-empty-fg);
  isolation: isolate;

  /* Клипаем только по горизонтали (орбы), вертикальный скролл оставляем рабочим */
  overflow-x: clip;
  overflow-y: visible;
}

/* --- Фон --- */
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
  will-change: transform;
}

.cv-empty-layout__bg-orb--1 {
  top: -15%;
  left: 50%;
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.3), transparent 70%);
  animation: cvEmptyOrbFloat1 20s ease-in-out infinite;
}

.cv-empty-layout__bg-orb--2 {
  bottom: -25%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.2), transparent 70%);
  animation: cvEmptyOrbFloat2 26s ease-in-out infinite;
  animation-delay: -6s;
}

/* orb--1 центрируется по горизонтали через translateX(-50%) в keyframes */
@keyframes cvEmptyOrbFloat1 {
  0%, 100% { transform: translate(-50%, 0) scale(1); }
  33% { transform: translate(calc(-50% + 40px), -30px) scale(1.06); }
  66% { transform: translate(calc(-50% - 30px), 20px) scale(0.94); }
}

/* orb--2 без центрирования — двигается независимо */
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

/* --- Контент --- */
.cv-empty-layout__content {
  position: relative;
  z-index: 1;
  flex: 1;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  max-width: var(--cv-empty-max-width);
  margin: 0 auto;
  padding: var(--cv-empty-padding-y) var(--cv-empty-padding-x);

  /* Safe-area для iOS (notch, home indicator) */
  padding-left: max(var(--cv-empty-padding-x), env(safe-area-inset-left, 0));
  padding-right: max(var(--cv-empty-padding-x), env(safe-area-inset-right, 0));

  /* Защита от длинных сообщений об ошибках, стектрейсов, URL */
  overflow-wrap: anywhere;
  word-break: break-word;
  min-width: 0;
}

/*
  Страница внутри может переопределить центрирование,
  если ей нужен, например, верхний align:
    :deep(.some-page) { ... }
  либо через свойство внутри самой страницы.
*/

/* --- Переход страниц --- */
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

/* --- Адаптив --- */
@media (max-width: 1280px) {
  .cv-empty-layout {
    --cv-empty-max-width: 680px;
  }
}

@media (max-width: 1024px) {
  .cv-empty-layout {
    --cv-empty-max-width: 620px;
  }
}

@media (max-width: 768px) {
  .cv-empty-layout {
    --cv-empty-max-width: 100%;
    --cv-empty-padding-x: 18px;
    --cv-empty-padding-y: 32px;
  }

  .cv-empty-layout__bg-orb--1,
  .cv-empty-layout__bg-orb--2 {
    width: 420px;
    height: 420px;
    filter: blur(90px);
  }
}

@media (max-width: 480px) {
  .cv-empty-layout {
    --cv-empty-padding-x: 16px;
    --cv-empty-padding-y: 24px;
  }

  .cv-empty-layout__bg-orb--1,
  .cv-empty-layout__bg-orb--2 {
    width: 340px;
    height: 340px;
    filter: blur(80px);
  }

  .cv-empty-layout__bg-grid {
    background-size: 44px 44px;
  }
}

/* --- Системные настройки --- */
@media (prefers-reduced-motion: reduce) {
  .cv-empty-layout__bg-orb--1,
  .cv-empty-layout__bg-orb--2 {
    animation: none;
  }

  .cv-empty-page-enter-active,
  .cv-empty-page-leave-active {
    transition: none;
  }
}
</style>