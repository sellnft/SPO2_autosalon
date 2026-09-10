<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from './AppLogo.vue'
import UserMenu from './UserMenu.vue'
import NotificationBell from './NotificationBell.vue'
import MobileMenu from './MobileMenu.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)
const isSearchOpen = ref(false)
const searchQuery = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/announcements',
      query: { search: searchQuery.value.trim() }
    })
    searchQuery.value = ''
    isSearchOpen.value = false
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    isMobileMenuOpen.value = false
    isSearchOpen.value = false
  }
}

watch(() => route.path, () => {
  isMobileMenuOpen.value = false
  isSearchOpen.value = false
})

watch(isMobileMenuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="app-header">
    <div class="app-header__container">
      <AppLogo class="app-header__logo" />
      
      <nav class="app-header__nav" aria-label="Основная навигация">
        <RouterLink to="/" class="app-header__nav-link">Главная</RouterLink>
        <RouterLink to="/announcements" class="app-header__nav-link">Каталог</RouterLink>
        <RouterLink to="/feedback" class="app-header__nav-link">Поддержка</RouterLink>
      </nav>
      
      <div class="app-header__search">
        <button
          class="app-header__action"
          aria-label="Поиск"
          @click="isSearchOpen = !isSearchOpen"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2"/>
            <path d="M15 15l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <Transition name="search">
          <form v-if="isSearchOpen" class="app-header__search-form" @submit.prevent="handleSearch">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Поиск автомобиля..."
              class="app-header__search-input"
              autofocus
            />
            <button type="button" class="app-header__search-close" @click="isSearchOpen = false" aria-label="Закрыть поиск">
              ✕
            </button>
          </form>
        </Transition>
      </div>
      
      <div class="app-header__actions">
        <RouterLink
          v-if="isAuthenticated"
          to="/favourites"
          class="app-header__action"
          aria-label="Избранное"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </RouterLink>
        
        <NotificationBell v-if="isAuthenticated" />
        <UserMenu v-if="isAuthenticated" />
        
        <div v-else class="app-header__auth">
          <BaseButton size="sm" variant="ghost" @click="router.push('/login')">
            Войти
          </BaseButton>
          <BaseButton size="sm" @click="router.push('/register')">
            Регистрация
          </BaseButton>
        </div>
        
        <button
          class="app-header__menu-toggle"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Меню"
          @click="toggleMobileMenu"
        >
          <svg v-if="!isMobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <MobileMenu
      v-if="isMobileMenuOpen"
      @close="isMobileMenuOpen = false"
    />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #E5E7EB;
}

.app-header__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.app-header__logo {
  flex-shrink: 0;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.app-header__nav-link {
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: all 0.15s;
}

.app-header__nav-link:hover {
  background: #F3F4F6;
  color: #111827;
}

.app-header__nav-link.router-link-active {
  color: #0A84FF;
  background: #F0F7FF;
}

.app-header__search {
  position: relative;
  display: flex;
  align-items: center;
}

.app-header__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6B7280;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.app-header__action:hover {
  background: #F3F4F6;
  color: #111827;
}

.app-header__search-form {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: white;
  border: 1.5px solid #0A84FF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.app-header__search-input {
  flex: 1;
  padding: 11px 0;
  font-size: 14px;
  background: transparent;
  border: none;
  outline: none;
}

.app-header__search-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #9CA3AF;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-header__auth {
  display: flex;
  gap: 8px;
}

.app-header__menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #374151;
  background: none;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.search-enter-active,
.search-leave-active {
  transition: all 0.2s ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.95);
}

@media (max-width: 1024px) {
  .app-header__container {
    padding: 0 20px;
    gap: 16px;
  }
  
  .app-header__nav {
    display: none;
  }
  
  .app-header__search-form {
    width: 320px;
  }
}

@media (max-width: 768px) {
  .app-header__container {
    height: 60px;
    padding: 0 16px;
    gap: 8px;
  }
  
  .app-header__search {
    flex: 1;
    justify-content: flex-end;
  }
  
  .app-header__search-form {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    width: 100%;
    transform: none;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    padding: 0 16px;
  }
  
  .app-header__search-input {
    padding: 14px 0;
  }
  
  .app-header__auth {
    display: none;
  }
  
  .app-header__menu-toggle {
    display: flex;
  }
  
  .app-header__action {
    width: 44px;
    height: 44px;
  }
}
</style>