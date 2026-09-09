<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
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
</script>

<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- Logo -->
      <AppLogo class="app-header__logo" />
      
      <!-- Desktop Navigation -->
      <nav class="app-header__nav" aria-label="Main navigation">
        <RouterLink to="/" class="app-header__nav-link">Главная</RouterLink>
        <RouterLink to="/announcements" class="app-header__nav-link">Каталог</RouterLink>
        <RouterLink to="/feedback" class="app-header__nav-link">Поддержка</RouterLink>
      </nav>
      
      <!-- Search -->
      <div class="app-header__search">
        <button 
          class="app-header__search-btn"
          @click="isSearchOpen = !isSearchOpen"
          aria-label="Search"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 109 1a8 8 0 000 16zM18 18l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
          </form>
        </Transition>
      </div>
      
      <!-- Actions -->
      <div class="app-header__actions">
        <!-- Favorites -->
        <RouterLink 
          v-if="isAuthenticated"
          to="/favourites" 
          class="app-header__action"
          aria-label="Favorites"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          <span class="app-header__badge">2</span>
        </RouterLink>
        
        <!-- Notifications -->
        <NotificationBell v-if="isAuthenticated" class="app-header__action" />
        
        <!-- User Menu or Auth -->
        <UserMenu v-if="isAuthenticated" />
        <div v-else class="app-header__auth">
          <BaseButton size="sm" variant="ghost" @click="router.push('/login')">
            Войти
          </BaseButton>
          <BaseButton size="sm" variant="primary" @click="router.push('/register')">
            Регистрация
          </BaseButton>
        </div>
        
        <!-- Mobile Menu Toggle -->
        <button 
          class="app-header__menu-toggle"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
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
    
    <!-- Mobile Menu -->
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
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
  gap: 8px;
  flex: 1;
}

.app-header__nav-link {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: all 0.2s;
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

.app-header__search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6B7280;
  border-radius: 10px;
  transition: all 0.2s;
}

.app-header__search-btn:hover {
  background: #F3F4F6;
  color: #111827;
}

.app-header__search-form {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
}

.app-header__search-input {
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
  background: white;
  border: 1.5px solid #D1D5DB;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s;
}

.app-header__search-input:focus {
  border-color: #0A84FF;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
}

.app-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-header__action {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6B7280;
  border-radius: 10px;
  transition: all 0.2s;
}

.app-header__action:hover {
  background: #F3F4F6;
  color: #111827;
}

.app-header__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: #EF4444;
  border-radius: 8px;
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
  border-radius: 10px;
  transition: all 0.2s;
}

.app-header__menu-toggle:hover {
  background: #F3F4F6;
}

/* Search transition */
.search-enter-active,
.search-leave-active {
  transition: all 0.3s ease;
}

.search-enter-from,
.search-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.95);
}

/* Tablet */
@media (max-width: 1024px) {
  .app-header__nav {
    display: none;
  }
  
  .app-header__search-form {
    width: 300px;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .app-header__container {
    height: 60px;
    gap: 12px;
    padding: 0 16px;
  }
  
  .app-header__search {
    flex: 1;
    justify-content: flex-end;
  }
  
  .app-header__search-form {
    position: fixed;
    left: 16px;
    right: 16px;
    top: 60px;
    transform: none;
    width: auto;
  }
  
  .app-header__auth {
    display: none;
  }
  
  .app-header__menu-toggle {
    display: flex;
  }
  
  .app-header__action {
    width: 36px;
    height: 36px;
  }
}
</style>