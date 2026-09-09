<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const navItems = [
  { label: 'Главная', to: '/', icon: 'home' },
  { label: 'Каталог', to: '/announcements', icon: 'search' },
  { label: 'Избранное', to: '/favourites', icon: 'heart', auth: true },
  { label: 'Профиль', to: '/profile', icon: 'user', auth: true }
]

const filteredItems = navItems.filter(item => !item.auth || authStore.isAuthenticated)

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="mobile-bottom-nav" aria-label="Мобильная навигация">
    <RouterLink
      v-for="item in filteredItems"
      :key="item.to"
      :to="item.to"
      :class="[
        'mobile-bottom-nav__item',
        { 'mobile-bottom-nav__item--active': isActive(item.to) }
      ]"
    >
      <svg v-if="item.icon === 'home'" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M5 9.5V21h14V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="item.icon === 'search'" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
        <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="item.icon === 'heart'" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-8-5.5-8-11a4 4 0 018-2.5A4 4 0 0120 10c0 5.5-8 11-8 11z" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      
      <span class="mobile-bottom-nav__label">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: white;
  border-top: 1px solid #E5E7EB;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  color: #6B7280;
  transition: color 0.2s;
}

.mobile-bottom-nav__item--active {
  color: #0A84FF;
}

.mobile-bottom-nav__label {
  font-size: 11px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
  }
}
</style>