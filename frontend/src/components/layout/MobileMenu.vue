<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits(['close'])

const menuItems = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог', to: '/announcements' },
  { label: 'Поддержка', to: '/feedback' }
]

const authItems = [
  { label: 'Мой профиль', to: '/profile' },
  { label: 'Мои объявления', to: '/profile/announcements' },
  { label: 'Избранное', to: '/favourites' },
  { label: 'Чаты', to: '/chat' },
  { label: 'Подписки', to: '/profile/subscriptions' },
  { label: 'Настройки', to: '/profile/edit' },
  { label: 'Безопасность', to: '/profile/security' }
]

const guestItems = [
  { label: 'Войти', to: '/login' },
  { label: 'Регистрация', to: '/register' }
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
        <button class="mobile-menu__close" aria-label="Закрыть" @click="emit('close')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <nav class="mobile-menu__nav">
        <div class="mobile-menu__section">
          <p class="mobile-menu__section-title">Навигация</p>
          <button
            v-for="item in menuItems"
            :key="item.label"
            class="mobile-menu__item"
            @click="handleItemClick(item)"
          >
            <span>{{ item.label }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="mobile-menu__section">
          <p class="mobile-menu__section-title">
            {{ authStore.isAuthenticated ? 'Аккаунт' : 'Гостям' }}
          </p>
          <button
            v-for="item in (authStore.isAuthenticated ? authItems : guestItems)"
            :key="item.label"
            class="mobile-menu__item"
            @click="handleItemClick(item)"
          >
            <span>{{ item.label }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <button
            v-if="authStore.isAuthenticated"
            class="mobile-menu__item mobile-menu__item--danger"
            @click="handleItemClick({ action: 'logout' })"
          >
            <span>Выйти</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
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
  width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
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
  width: 36px;
  height: 36px;
  color: #6B7280;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-menu__close:hover {
  background: #F3F4F6;
  color: #111827;
}

.mobile-menu__nav {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.mobile-menu__section {
  margin-bottom: 24px;
}

.mobile-menu__section-title {
  margin-bottom: 8px;
  padding: 0 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9CA3AF;
}

.mobile-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 12px;
  font-size: 15px;
  font-weight: 500;
  color: #374151;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.mobile-menu__item:hover {
  background: #F3F4F6;
  color: #111827;
}

.mobile-menu__item--danger {
  color: #EF4444;
}

.mobile-menu__item--danger:hover {
  background: #FEF2F2;
  color: #DC2626;
}
</style>