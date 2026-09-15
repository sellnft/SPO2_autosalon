<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { label: 'Главная', to: '/', icon: 'home' },
  { label: 'Каталог', to: '/announcements', icon: 'car' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Поддержка', to: '/feedback', icon: 'chat' }
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="cv-nav" aria-label="Основная навигация">
    <ul class="cv-nav__list">
      <li v-for="link in links" :key="link.to" class="cv-nav__item">
        <RouterLink
          :to="link.to"
          :class="[
            'cv-nav__link',
            { 'cv-nav__link--active': isActive(link.to) }
          ]"
        >
          <span class="cv-nav__icon" aria-hidden="true">
            <svg v-if="link.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10.5L12 3l9 7.5"/>
              <path d="M5 9.5V21h14V9.5"/>
              <path d="M9.5 21V14h5v7"/>
            </svg>

            <svg v-else-if="link.icon === 'car'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
              <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
              <circle cx="7.5" cy="15.5" r="0.9" fill="currentColor"/>
              <circle cx="16.5" cy="15.5" r="0.9" fill="currentColor"/>
            </svg>

            <svg v-else-if="link.icon === 'heart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
            </svg>

            <svg v-else-if="link.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
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
.cv-nav {
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-bronze: #C9A961;
  --cv-bronze-light: #E8D5A0;

  display: flex;
}

.cv-nav__list {
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-nav__item {
  position: relative;
}

.cv-nav__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--cv-text-2);
  text-decoration: none;
  border-radius: 10px;
  letter-spacing: 0.05px;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: currentColor;
  opacity: 0.75;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.cv-nav__label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.cv-nav__indicator {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--cv-bronze-light), transparent);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

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

.cv-nav__link--active {
  color: var(--cv-bronze-light);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14) 0%, rgba(201, 169, 97, 0.06) 100%);
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.2) inset,
    0 4px 18px rgba(201, 169, 97, 0.1);
}

.cv-nav__link--active .cv-nav__icon {
  opacity: 1;
  color: var(--cv-bronze);
}

.cv-nav__link--active .cv-nav__indicator {
  transform: translateX(-50%) scaleX(1);
}

.cv-nav__link--active::before {
  opacity: 0;
}

@media (max-width: 1024px) {
  .cv-nav {
    display: none;
  }
}
</style>