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
  <nav class="mobile-bottom-nav" aria-label="Мобильная навигация">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      :class="['mobile-bottom-nav__item', { 'mobile-bottom-nav__item--active': isActive(item.to) }]"
      :aria-label="item.label"
    >
      <svg v-if="item.icon === 'home'" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 9.5V21h14V9.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="item.icon === 'search'" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
        <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="item.icon === 'heart'" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s-8-5.5-8-11a4 4 0 018-2.5A4 4 0 0120 10c0 5.5-8 11-8 11z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="item.icon === 'chat'" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else-if="item.icon === 'user'" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="item.icon === 'login'" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
  z-index: 90;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-top: 1px solid #E5E7EB;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.mobile-bottom-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px;
  color: #6B7280;
  text-decoration: none;
  transition: color 0.15s;
  min-height: 56px;
}

.mobile-bottom-nav__item--active {
  color: #0A84FF;
}

.mobile-bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
  }
}
</style>