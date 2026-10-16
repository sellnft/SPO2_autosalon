<script setup>
import logoImage from '@/assets/images/logo.png'

/**
 * AppLogo — логотип-ссылка на главную.
 *
 * Система размеров построена на CSS-токенах:
 *   размер (sm/md/lg) → набор переменных → все элементы читают переменные
 *   вариант (default/light/mono) → только цвета и фон, размеры не трогает
 *
 * Это гарантирует, что при любой комбинации size + variant логотип
 * имеет согласованные пропорции и размеры.
 */

defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'light', 'mono'].includes(v)
  }
})
</script>

<template>
  <RouterLink
    to="/"
    class="cv-logo"
    :class="[`cv-logo--${size}`, `cv-logo--${variant}`]"
    aria-label="CarVibe — на главную"
  >
    <span class="cv-logo__emblem" aria-hidden="true">
      <img
        :src="logoImage"
        alt=""
        width="42"
        height="42"
        class="cv-logo__image"
        draggable="false"
        decoding="async"
      />
      <span class="cv-logo__emblem-shine"></span>
    </span>

    <span class="cv-logo__text">
      <span class="cv-logo__title">
        Car<span class="cv-logo__title-accent">Vibe</span>
      </span>
      <span class="cv-logo__subtitle">premium auto</span>
    </span>
  </RouterLink>
</template>

<style scoped>
/* ============================================================
   AppLogo
   - Размер (sm/md/lg) управляет только CSS-токенами
   - Вариант (default/light/mono) — только цвета и фон
   - aspect-ratio: 1 гарантирует пропорции эмблемы
   - focus-visible, prefers-reduced-motion
   ============================================================ */

.cv-logo {
  /* --- Размерные токены: значения по умолчанию (= md) --- */
  --cv-logo-emblem-size: 42px;
  --cv-logo-emblem-radius: 12px;
  --cv-logo-image-padding: 6px;
  --cv-logo-title-size: 19px;
  --cv-logo-subtitle-size: 10px;
  --cv-logo-subtitle-tracking: 1.8px;
  --cv-logo-gap: 12px;

  /* --- Палитра --- */
  --cv-bronze-light: #e8d5a0;
  --cv-bronze: #c9a961;
  --cv-bronze-dark: #8b6f3f;
  --cv-title: #f5f0e6;
  --cv-title-accent: #e8d5a0;
  --cv-subtitle: rgba(220, 210, 195, 0.45);
  --cv-focus: var(--cv-bronze-light);

  /* --- Фон эмблемы (переопределяется вариантами) --- */
  --cv-emblem-bg: linear-gradient(180deg, rgba(40, 32, 22, 0.9) 0%, rgba(15, 12, 8, 0.95) 100%);
  --cv-emblem-border: rgba(201, 169, 97, 0.35);
  --cv-emblem-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.15) inset;

  display: inline-flex;
  align-items: center;
  gap: var(--cv-logo-gap);
  text-decoration: none;
  border-radius: 12px;
  min-width: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-logo:hover {
  transform: translateY(-1px);
}

.cv-logo:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 3px;
}

.cv-logo:focus:not(:focus-visible) {
  outline: none;
}

/* --- Эмблема --- */
.cv-logo__emblem {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: var(--cv-logo-emblem-size);
  height: var(--cv-logo-emblem-size);
  aspect-ratio: 1 / 1;

  border-radius: var(--cv-logo-emblem-radius);
  background: var(--cv-emblem-bg);
  border: 1px solid var(--cv-emblem-border);
  box-shadow: var(--cv-emblem-shadow);
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.cv-logo:hover .cv-logo__emblem {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(201, 169, 97, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.1) inset,
    0 1px 0 rgba(232, 213, 160, 0.2) inset;
}

.cv-logo__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  position: relative;
  z-index: 1;
  padding: var(--cv-logo-image-padding);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  transition: transform 0.3s ease;
  user-select: none;
  -webkit-user-drag: none;
}

.cv-logo:hover .cv-logo__image {
  transform: scale(1.05);
}

.cv-logo__emblem-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.25) 50%,
    transparent 70%
  );
  transition: left 0.7s ease;
  pointer-events: none;
  z-index: 2;
}

.cv-logo:hover .cv-logo__emblem-shine {
  left: 100%;
}

/* --- Текст --- */
.cv-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 3px;
  min-width: 0;
}

.cv-logo__title {
  font-size: var(--cv-logo-title-size);
  font-weight: 800;
  color: var(--cv-title);
  letter-spacing: -0.6px;
  line-height: 1.1;
  text-shadow: 0 1px 12px rgba(201, 169, 97, 0.15);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-logo__title-accent {
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.cv-logo__subtitle {
  font-size: var(--cv-logo-subtitle-size);
  font-weight: 600;
  color: var(--cv-subtitle);
  text-transform: uppercase;
  letter-spacing: var(--cv-logo-subtitle-tracking);
  line-height: 1;
  white-space: nowrap;
}

/* ============================================================
   Размеры — задают ТОЛЬКО токены, разметка/структура общая
   ============================================================ */

.cv-logo--sm {
  --cv-logo-emblem-size: 34px;
  --cv-logo-emblem-radius: 10px;
  --cv-logo-image-padding: 4px;
  --cv-logo-title-size: 16px;
  --cv-logo-subtitle-size: 9px;
  --cv-logo-subtitle-tracking: 1.5px;
  --cv-logo-gap: 10px;
}

/* .cv-logo--md — совпадает с дефолтными токенами в .cv-logo,
   отдельные правила не нужны. Оставлено для явности. */

.cv-logo--lg {
  --cv-logo-emblem-size: 52px;
  --cv-logo-emblem-radius: 14px;
  --cv-logo-image-padding: 8px;
  --cv-logo-title-size: 24px;
  --cv-logo-subtitle-size: 11px;
  --cv-logo-subtitle-tracking: 2px;
  --cv-logo-gap: 14px;
}

/* ============================================================
   Варианты — только цвета/фон, размеры не трогаем
   ============================================================ */

.cv-logo--light {
  --cv-title: #1a1208;
  --cv-subtitle: rgba(60, 45, 25, 0.55);
  --cv-emblem-bg: linear-gradient(180deg, #ffffff 0%, #f5efe0 100%);
  --cv-emblem-border: rgba(201, 169, 97, 0.5);
  --cv-emblem-shadow:
    0 4px 16px rgba(139, 111, 63, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.cv-logo--mono {
  --cv-emblem-bg: rgba(255, 255, 255, 0.04);
  --cv-emblem-border: rgba(255, 255, 255, 0.1);
  --cv-emblem-shadow: none;
}

.cv-logo--mono:hover .cv-logo__emblem {
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.2);
}

/* ============================================================
   Адаптив
   ============================================================ */

@media (max-width: 640px) {
  .cv-logo__subtitle {
    display: none;
  }

  /* На мобилке уменьшаем эмблему и заголовок у всех размеров,
     кроме sm (он и так компактный). Используем те же токены. */
  .cv-logo--md {
    --cv-logo-emblem-size: 38px;
    --cv-logo-title-size: 17px;
  }

  .cv-logo--lg {
    --cv-logo-emblem-size: 44px;
    --cv-logo-title-size: 20px;
  }
}

/* ============================================================
   Уважение к системным настройкам
   ============================================================ */

@media (prefers-reduced-motion: reduce) {
  .cv-logo,
  .cv-logo__emblem,
  .cv-logo__image,
  .cv-logo__emblem-shine {
    transition-duration: 0.01ms !important;
  }

  .cv-logo:hover {
    transform: none;
  }

  .cv-logo:hover .cv-logo__image {
    transform: none;
  }

  .cv-logo:hover .cv-logo__emblem-shine {
    left: -100%;
  }
}
</style>