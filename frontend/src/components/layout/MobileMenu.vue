<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits(['close'])

const menuItems = [
  { label: 'Главная', to: '/', icon: 'home' },
  { label: 'Каталог', to: '/announcements', icon: 'car' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Поддержка', to: '/feedback', icon: 'chat' },
  ...(authStore.isAuthenticated ? [
    { label: 'Мой профиль', to: '/profile', icon: 'user' },
    { label: 'Мои объявления', to: '/profile/announcements', icon: 'car' },
    { label: 'Настройки', to: '/profile/edit', icon: 'settings' },
    { label: 'Выйти', action: 'logout', icon: 'logout' }
  ] : [
    { label: 'Войти', to: '/login', icon: 'login' },
    { label: 'Регистрация', to: '/register', icon: 'register' }
  ])
]

function handleItemClick(item) {
  if (item.action === 'logout') {
    authStore.logout()
    router.push('/')
  } else if (item.to) {
    router.push(item.to)
  }
  emit('close')
}
</script>

<template>
  <div class="mobile-menu">
    <div class="mobile-menu__overlay" @click="emit('close')"></div>
    
    <div class="mobile-menu__drawer">
      <div class="mobile-menu__header">
        <h3 class="mobile-menu__title">Меню</h3>
        <button class="mobile-menu__close" @click="emit('close')" aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <nav class="mobile-menu__nav">
        <button
          v-for="item in menuItems"
          :key="item.label"
          class="mobile-menu__item"
          @click="handleItemClick(item)"
        >
          <span class="mobile-menu__item-label">{{ item.label }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.mobile-menu {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.mobile-menu__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.mobile-menu__drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.mobile-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.mobile-menu__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.mobile-menu__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #6B7280;
  border-radius: 8px;
  transition: all 0.2s;
}

.mobile-menu__close:hover {
  background: #F3F4F6;
  color: #111827;
}

.mobile-menu__nav {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  border-radius: 10px;
  transition: all 0.2s;
  text-align: left;
}

.mobile-menu__item:hover {
  background: #F3F4F6;
  color: #111827;
}
</style>