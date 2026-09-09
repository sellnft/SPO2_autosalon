<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDropdown from '@/components/common/BaseDropdown.vue'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { label: 'Мой профиль', to: '/profile', icon: 'user' },
  { label: 'Мои объявления', to: '/profile/announcements', icon: 'car' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Настройки', to: '/profile/edit', icon: 'settings' },
  { type: 'divider' },
  { label: 'Выйти', action: 'logout', icon: 'logout', danger: true }
]

function handleSelect(item) {
  if (item.action === 'logout') {
    authStore.logout()
    router.push('/')
  } else if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <BaseDropdown :items="menuItems" @select="handleSelect">
    <template #trigger>
      <button class="user-menu__trigger">
        <div class="user-menu__avatar">
          {{ authStore.user?.name?.charAt(0) || 'U' }}
        </div>
        <span class="user-menu__name">{{ authStore.user?.name }}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </template>
  </BaseDropdown>
</template>

<style scoped>
.user-menu__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 10px;
  transition: all 0.2s;
}

.user-menu__trigger:hover {
  background: #F3F4F6;
}

.user-menu__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 50%;
}

.user-menu__name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

@media (max-width: 768px) {
  .user-menu__name {
    display: none;
  }
}
</style>