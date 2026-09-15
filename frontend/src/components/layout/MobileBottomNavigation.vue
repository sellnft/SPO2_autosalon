<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const navItems = computed(() => {
  const items = [
    { label: 'Главная', to: '/', icon: 'home' },
    { label: 'Каталог', to: '/announcements', icon: 'search' }
  ]

  if (authStore.isAuthenticated) {
    items.push(
      { label: 'Избранное', to: '/favourites', icon: 'heart' },
      { label: 'Чаты', to: '/chat', icon: 'chat' },
      { label: 'Профиль', to: '/profile', icon: 'user' }
    )
  } else {
    items.push(
      { label: 'Войти', to: '/login', icon: 'login' },
      { label: 'Регистрация', to: '/register', icon: 'user-plus' }
    )
  }

  return items
})

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="cv-mobile-nav" aria-label="Мобильная навигация">
    <div class="cv-mobile-nav__glow" aria-hidden="true"></div>

    <div class="cv-mobile-nav__bar">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="['cv-mobile-nav__item', { 'cv-mobile-nav__item--active': isActive(item.to) }]"
        :aria-label="item.label"
      >
        <span class="cv-mobile-nav__indicator" aria-hidden="true"></span>

        <span class="cv-mobile-nav__icon">
          <svg v-if="item.icon === 'home'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
            <path d="M9.5 21V14h5v7"/>
          </svg>

          <svg v-else-if="item.icon === 'search'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M20 20l-4-4"/>
          </svg>

          <svg v-else-if="item.icon === 'heart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
          </svg>

          <svg v-else-if="item.icon === 'chat'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
            <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
          </svg>

          <svg v-else-if="item.icon === 'user'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
          </svg>

          <svg v-else-if="item.icon === 'login'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
          </svg>

          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <path d="M20 8v6M23 11h-6"/>
          </svg>
        </span>

        <span class="cv-mobile-nav__label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.cv-mobile-nav {
  --cv-bg-2: #121215;
  --cv-bg: #0A0A0C;
  --cv-border: rgba(201, 169, 97, 0.15);
  --cv-text-2: rgba(220, 210, 195, 0.5);
  --cv-bronze: #C9A961;
  --cv-bronze-light: #E8D5A0;

  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  padding: 0 12px calc(env(safe-area-inset-bottom, 0) + 12px);
  pointer-events: none;
}

.cv-mobile-nav__glow {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(201, 169, 97, 0.35), transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
}

.cv-mobile-nav__bar {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 8px 6px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.6) 0%, rgba(15, 13, 10, 0.85) 100%);
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.08);
  pointer-events: auto;
  overflow: hidden;
}

.cv-mobile-nav__bar::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
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
  border-radius: inherit;
  opacity: 0.6;
}

.cv-mobile-nav__item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px 10px;
  min-height: 56px;
  color: var(--cv-text-2);
  text-decoration: none;
  border-radius: 16px;
  transition: color 0.25s ease, transform 0.25s ease;
  z-index: 1;
}

.cv-mobile-nav__item::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.04));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.cv-mobile-nav__indicator {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--cv-bronze-light), transparent);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.8);
}

.cv-mobile-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
}

.cv-mobile-nav__label {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.2px;
  transition: color 0.25s ease;
  white-space: nowrap;
}

.cv-mobile-nav__item:active {
  transform: scale(0.94);
}

.cv-mobile-nav__item--active {
  color: var(--cv-bronze-light);
}

.cv-mobile-nav__item--active::before {
  opacity: 1;
}

.cv-mobile-nav__item--active .cv-mobile-nav__indicator {
  transform: translateX(-50%) scale(1);
}

.cv-mobile-nav__item--active .cv-mobile-nav__icon {
  filter: drop-shadow(0 0 8px rgba(201, 169, 97, 0.55));
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .cv-mobile-nav {
    display: block;
  }
}

@media (max-width: 380px) {
  .cv-mobile-nav__label {
    font-size: 9px;
  }
  .cv-mobile-nav__icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>