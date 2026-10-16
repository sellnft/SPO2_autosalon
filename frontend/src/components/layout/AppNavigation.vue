<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { label: 'Главная', to: '/', icon: 'home' },
  { label: 'Каталог', to: '/announcements', icon: 'car' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Поддержка', to: '/feedback', icon: 'chat' }
]

/**
 * Активен ли пункт меню.
 * - `/` — только точное совпадение
 * - остальные — точное совпадение или префикс с разделителем `/`,
 *   чтобы `/announcements-old` не подсвечивал `/announcements`
 */
function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}

const ariaCurrent = (path) => (isActive(path) ? 'page' : undefined)
</script>

<template>
  <nav class="cv-nav" aria-label="Основная навигация">
    <ul class="cv-nav__list">
      <li v-for="link in links" :key="link.to" class="cv-nav__item">
        <RouterLink
          :to="link.to"
          class="cv-nav__link"
          :class="{ 'cv-nav__link--active': isActive(link.to) }"
          :aria-current="ariaCurrent(link.to)"
        >
          <span class="cv-nav__icon" aria-hidden="true">
            <svg v-if="link.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10.5L12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
              <path d="M9.5 21V14h5v7" />
            </svg>

            <svg v-else-if="link.icon === 'car'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13" />
              <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" />
              <circle cx="7.5" cy="15.5" r="0.9" fill="currentColor" />
              <circle cx="16.5" cy="15.5" r="0.9" fill="currentColor" />
            </svg>

            <svg v-else-if="link.icon === 'heart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z" />
            </svg>

            <svg v-else-if="link.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z" />
              <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
            </svg>
          </span>

          <span class="cv-nav__label">{{ link.label }}</span>
          <span class="cv-nav__indicator" aria-hidden="true"></span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* ============================================================
   Нижняя мобильная навигация
   Единый паттерн активного пункта (совпадает с AppHeader и табами):
     активный = bronze-light + лёгкий градиентный фон + подчёркивание
   ============================================================ */

.cv-nav {
  /* Layout-токены */
  --cv-nav-gap: 2px;
  --cv-nav-link-size: 14px;
  --cv-nav-link-weight: 500;
  --cv-nav-px: 16px;
  --cv-nav-py: 9px;
  --cv-nav-radius: 10px;
  --cv-nav-icon-size: 18px;
  --cv-nav-indicator-w: 18px;
  --cv-nav-indicator-h: 2px;

  /* Палитра (совпадает с остальными компонентами) */
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-bronze: #c9a961;
  --cv-bronze-light: #e8d5a0;
  --cv-focus: var(--cv-bronze-light);

  display: flex;
}

.cv-nav__list {
  display: flex;
  align-items: center;
  gap: var(--cv-nav-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-nav__item {
  position: relative;
}

/* --- Ссылка --- */
.cv-nav__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: var(--cv-nav-py) var(--cv-nav-px);
  font-size: var(--cv-nav-link-size);
  font-weight: var(--cv-nav-link-weight);
  color: var(--cv-text-2);
  text-decoration: none;
  border-radius: var(--cv-nav-radius);
  letter-spacing: 0.05px;
  overflow: hidden;
  transition:
    color 0.25s cubic-bezier(0.34, 1.2, 0.64, 1),
    transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

/* Мягкий градиентный фон при hover — общий для всех состояний */
.cv-nav__link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1) 0%, rgba(201, 169, 97, 0.04) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 0;
}

.cv-nav__link:hover {
  color: var(--cv-bronze-light);
  transform: translateY(-1px);
}

.cv-nav__link:hover::before {
  opacity: 1;
}

.cv-nav__link:hover .cv-nav__icon {
  opacity: 1;
  transform: scale(1.08);
}

/* --- Иконка --- */
.cv-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--cv-nav-icon-size);
  height: var(--cv-nav-icon-size);
  color: currentColor;
  opacity: 0.75;
  flex-shrink: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

/* --- Текст --- */
.cv-nav__label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

/* --- Индикатор активности (подчёркивание) --- */
.cv-nav__indicator {
  position: absolute;
  bottom: 3px;
  left: 50%;
  width: var(--cv-nav-indicator-w);
  height: var(--cv-nav-indicator-h);
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--cv-bronze-light), transparent);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 1;
}

/* ============================================================
   Активное состояние — единый паттерн
   цвет + градиентный фон + подчёркивание + акцентная иконка
   ============================================================ */
.cv-nav__link--active {
  color: var(--cv-bronze-light);
}

.cv-nav__link--active::before {
  opacity: 1;
}

.cv-nav__link--active .cv-nav__icon {
  opacity: 1;
  color: var(--cv-bronze);
}

.cv-nav__link--active .cv-nav__indicator {
  transform: translateX(-50%) scaleX(1);
}

/* ============================================================
   Клавиатурный фокус — заметный, во всех состояниях
   ============================================================ */
.cv-nav__link:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
  color: var(--cv-bronze-light);
}

.cv-nav__link:focus-visible .cv-nav__icon {
  opacity: 1;
}

/* Убираем браузерный outline только когда focus-visible сработал */
.cv-nav__link:focus:not(:focus-visible) {
  outline: none;
}

/* ============================================================
   Адаптив: сама навигация используется в мобильной панели,
   поэтому скрываем её на десктопе (как в исходнике).
   ============================================================ */
@media (max-width: 1024px) {
  .cv-nav {
    display: none;
  }
}

/* ============================================================
   Уважение к системным настройкам
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .cv-nav__link,
  .cv-nav__link::before,
  .cv-nav__icon,
  .cv-nav__indicator {
    transition-duration: 0.01ms !important;
  }

  .cv-nav__link:hover {
    transform: none;
  }

  .cv-nav__link:hover .cv-nav__icon {
    transform: none;
  }
}
</style>