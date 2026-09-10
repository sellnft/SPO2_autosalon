<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDropdown from '@/components/common/BaseDropdown.vue'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const menuItems = [
  { label: 'На сайт', action: 'home' },
  { label: 'Выйти', action: 'logout', danger: true }
]

function handleSelect(item) {
  if (item.action === 'logout') {
    authStore.logout()
    router.push('/')
  } else if (item.action === 'home') {
    router.push('/')
  }
}
</script>

<template>
  <header class="admin-header">
    <button
      class="admin-header__toggle"
      aria-label="Toggle sidebar"
      @click="emit('toggle-sidebar')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    
    <div class="admin-header__breadcrumb">
      <span class="admin-header__breadcrumb-prefix">/</span>
      <span class="admin-header__breadcrumb-current">
        {{ $route.meta.title || 'Админ' }}
      </span>
    </div>
    
    <div class="admin-header__actions">
      <BaseDropdown :items="menuItems" @select="handleSelect">
        <template #trigger>
          <button class="admin-header__user">
            <div class="admin-header__avatar">
              {{ user?.name?.charAt(0) || 'A' }}
            </div>
            <div class="admin-header__user-info">
              <span class="admin-header__user-name">{{ user?.name }}</span>
              <span class="admin-header__user-role">Администратор</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </template>
      </BaseDropdown>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 64px;
  padding: 0 24px;
  background: #161618;
  border-bottom: 1px solid #26262A;
  color: #E5E7EB;
}

.admin-header__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #9CA3AF;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-header__toggle:hover {
  color: #E5E7EB;
  background: #1A1A1D;
}

.admin-header__breadcrumb {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6B7280;
}

.admin-header__breadcrumb-prefix {
  color: #C8A96E;
  font-weight: 700;
}

.admin-header__breadcrumb-current {
  color: #E5E7EB;
  font-weight: 500;
}

.admin-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-header__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  background: none;
  border: none;
  border-radius: 10px;
  color: #E5E7EB;
  cursor: pointer;
  transition: background 0.2s;
}

.admin-header__user:hover {
  background: #1A1A1D;
}

.admin-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 13px;
  font-weight: 700;
  color: #0F0F10;
  background: linear-gradient(135deg, #C8A96E, #A88650);
  border-radius: 50%;
}

.admin-header__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.admin-header__user-name {
  font-size: 13px;
  font-weight: 600;
}

.admin-header__user-role {
  font-size: 11px;
  color: #6B7280;
}

@media (max-width: 640px) {
  .admin-header {
    padding: 0 16px;
  }

  .admin-header__user-info {
    display: none;
  }
}
</style>