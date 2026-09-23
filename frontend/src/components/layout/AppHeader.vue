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
const isScrolled = ref(false)

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

function handleScroll() {
  isScrolled.value = window.scrollY > 12
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
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="cv-header" :class="{ 'cv-header--scrolled': isScrolled }">
    <!-- Изолированный слой фона: забирает overflow:hidden на себя,
         чтобы glow/carbon не вылезали за пределы шапки. -->
    <div class="cv-header__bg" aria-hidden="true">
      <div class="cv-header__glow"></div>
      <div class="cv-header__carbon"></div>
    </div>

    <div class="cv-header__container">
      <RouterLink to="/" class="cv-header__logo" aria-label="CarVibe — на главную">
        <AppLogo />
      </RouterLink>

      <nav class="cv-header__nav" aria-label="Основная навигация">
        <RouterLink to="/" class="cv-header__nav-link">
          <span>Главная</span>
        </RouterLink>
        <RouterLink to="/announcements" class="cv-header__nav-link">
          <span>Каталог</span>
        </RouterLink>
        <RouterLink to="/feedback" class="cv-header__nav-link">
          <span>Поддержка</span>
        </RouterLink>
      </nav>

      <div class="cv-header__search">
        <button
          class="cv-header__icon-btn"
          aria-label="Поиск"
          :class="{ 'cv-header__icon-btn--active': isSearchOpen }"
          @click="isSearchOpen = !isSearchOpen"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.8"/>
            <path d="M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>

        <Transition name="cv-search">
          <form v-if="isSearchOpen" class="cv-header__search-form" @submit.prevent="handleSearch">
            <span class="cv-header__search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.8"/>
                <path d="M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Марка, модель или город..."
              class="cv-header__search-input"
              autofocus
            />
            <button
              type="button"
              class="cv-header__search-close"
              aria-label="Закрыть поиск"
              @click="isSearchOpen = false"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
            </button>
          </form>
        </Transition>
      </div>

      <div class="cv-header__actions">
        <RouterLink
          v-if="isAuthenticated"
          to="/favourites"
          class="cv-header__icon-btn"
          aria-label="Избранное"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
          </svg>
        </RouterLink>

        <NotificationBell v-if="isAuthenticated" class="cv-header__popover" />
        <UserMenu v-if="isAuthenticated" class="cv-header__popover" />

        <div v-else class="cv-header__auth">
          <BaseButton size="sm" variant="ghost" @click="router.push('/login')">
            Войти
          </BaseButton>
          <BaseButton size="sm" @click="router.push('/register')">
            Регистрация
          </BaseButton>
        </div>

        <button
          class="cv-header__menu-toggle"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Меню"
          @click="toggleMobileMenu"
        >
          <svg v-if="!isMobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="cv-header__accent-line" aria-hidden="true"></div>

    <!-- MobileMenu телепортим в body, чтобы fixed работал корректно
         и не ломался о backdrop-filter родителя. -->
    <Teleport to="body">
      <MobileMenu
        v-if="isMobileMenuOpen"
        @close="isMobileMenuOpen = false"
      />
    </Teleport>
  </header>
</template>

<style scoped>
.cv-header {
  --cv-bg: #0A0A0C;
  --cv-bg-2: #121215;
  --cv-border: rgba(201, 169, 97, 0.12);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-bronze: #C9A961;
  --cv-bronze-light: #E8D5A0;
  --cv-bronze-dark: #8B6F3F;

  position: sticky;
  top: 0;
  /* Явный stacking context поверх контента страницы.
     Достаточно высокий, чтобы перекрывать любые секции. */
  z-index: 1000;
  background: linear-gradient(180deg, rgba(18, 18, 21, 0.92) 0%, rgba(10, 10, 12, 0.88) 100%);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border-bottom: 1px solid var(--cv-border);
  color: var(--cv-text);
  /* ВАЖНО: не hidden — иначе выпадашки обрезаются.
     Обрезку фона делает .cv-header__bg ниже. */
  overflow: visible;
  isolation: isolate;
  transition: box-shadow 0.3s ease;
}

.cv-header--scrolled {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

/* Изолированный слой фона — вот он обрезает декоративные элементы. */
.cv-header__bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  border-radius: inherit;
}

.cv-header__glow {
  position: absolute;
  top: -180px;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(201, 169, 97, 0.16), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}

.cv-header__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
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
}

.cv-header__container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 28px;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.cv-header__logo {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.25s ease, filter 0.25s ease;
  filter: drop-shadow(0 0 0 rgba(201, 169, 97, 0));
}

.cv-header__logo:hover {
  transform: translateY(-1px);
  filter: drop-shadow(0 4px 20px rgba(201, 169, 97, 0.35));
}

.cv-header__nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.cv-header__nav-link {
  position: relative;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--cv-text-2);
  text-decoration: none;
  border-radius: 10px;
  transition: color 0.2s ease, background 0.2s ease;
}

.cv-header__nav-link span {
  position: relative;
  z-index: 1;
}

.cv-header__nav-link::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  width: calc(100% - 24px);
  height: 1.5px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--cv-bronze-light), transparent);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-header__nav-link:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.05);
}

.cv-header__nav-link.router-link-active {
  color: var(--cv-bronze-light);
}

.cv-header__nav-link.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

.cv-header__search {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 20;
}

.cv-header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--cv-text-2);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 11px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cv-header__icon-btn:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.2);
  transform: translateY(-1px);
}

.cv-header__icon-btn--active {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-header__search-form {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 400px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px 0 14px;
  background: linear-gradient(180deg, #1A1A20 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    0 0 0 3px rgba(201, 169, 97, 0.08),
    0 0 32px rgba(201, 169, 97, 0.15);
  z-index: 30;
}

.cv-header__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cv-bronze);
  flex-shrink: 0;
}

.cv-header__search-input {
  flex: 1;
  padding: 12px 0;
  font-size: 14px;
  font-family: inherit;
  color: var(--cv-text);
  background: transparent;
  border: none;
  outline: none;
  letter-spacing: 0.1px;
}

.cv-header__search-input::placeholder {
  color: var(--cv-text-2);
  opacity: 0.7;
}

.cv-header__search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  display: none;
}

.cv-header__search-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  color: var(--cv-text-2);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--cv-border-soft);
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.cv-header__search-close:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
  transform: rotate(90deg);
}

.cv-header__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 20;
}

/* Общий класс-хак для выпадающих элементов внутри actions.
   Гарантирует, что popover'ы UserMenu и NotificationBell
   окажутся над контентом страницы. */
.cv-header__popover {
  position: relative;
  z-index: 30;
}

.cv-header__auth {
  display: flex;
  gap: 8px;
}

.cv-header__menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--cv-text);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--cv-border-soft);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-header__menu-toggle:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.25);
}

.cv-header__accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.05) 15%,
    rgba(201, 169, 97, 0.35) 50%,
    rgba(201, 169, 97, 0.05) 85%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* Transition для поиска. Убрал transform из keyframes,
   чтобы не конфликтовало с translateY(-50%) на desktop. */
.cv-search-enter-active,
.cv-search-leave-active {
  transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-search-enter-from,
.cv-search-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.94);
}

@media (max-width: 1024px) {
  .cv-header__container {
    padding: 0 20px;
    gap: 16px;
  }

  .cv-header__nav {
    display: none;
  }

  .cv-header__search-form {
    width: 340px;
  }
}

@media (max-width: 768px) {
  .cv-header__container {
    height: 62px;
    padding: 0 16px;
    gap: 8px;
  }

  .cv-header__bg .cv-header__glow {
    width: 400px;
    height: 200px;
  }

  .cv-header__search {
    flex: 1;
    justify-content: flex-end;
  }

  .cv-header__search-form {
    position: fixed;
    top: 62px;
    left: 0;
    right: 0;
    width: 100%;
    /* На mobile центрирование translateY(-50%) не нужно,
       форма прибита к верхней кромке. */
    transform: none;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    padding: 0 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
    z-index: 1000;
  }

  /* На mobile keyframes тоже без translateY, иначе форма прыгает. */
  .cv-search-enter-from,
  .cv-search-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }

  .cv-header__search-input {
    padding: 14px 0;
  }

  .cv-header__auth {
    display: none;
  }

  .cv-header__menu-toggle {
    display: inline-flex;
  }

  .cv-header__icon-btn {
    width: 42px;
    height: 42px;
  }
}
</style>