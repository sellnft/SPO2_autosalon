<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
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

const searchRootRef = ref(null)
const searchInputRef = ref(null)

const isAuthenticated = computed(() => authStore.isAuthenticated)

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ path: '/announcements', query: { search: q } })
  searchQuery.value = ''
  isSearchOpen.value = false
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function toggleSearch() {
  isSearchOpen.value = !isSearchOpen.value
}

function closeSearch() {
  isSearchOpen.value = false
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    isMobileMenuOpen.value = false
    isSearchOpen.value = false
  }
}

function handleClickOutside(e) {
  if (!isSearchOpen.value) return
  const root = searchRootRef.value
  if (root && !root.contains(e.target)) {
    isSearchOpen.value = false
  }
}

function handleScroll() {
  isScrolled.value = window.scrollY > 12
}

// Автофокус при открытии поиска (программно, без autofocus-атрибута,
// чтобы не срабатывал при маунте и не открывал клавиатуру неожиданно).
watch(isSearchOpen, async (open) => {
  if (!open) return
  await nextTick()
  searchInputRef.value?.focus()
})

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
    isSearchOpen.value = false
  }
)

// Блокировка скролла body — на стороне MobileMenu.
// AppHeader намеренно НЕ трогает document.body.style.overflow,
// чтобы не конфликтовать с модалкой правовых документов в AppFooter.

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('mousedown', handleClickOutside)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('mousedown', handleClickOutside)
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
      <RouterLink
        to="/"
        class="cv-header__logo"
        aria-label="CarVibe — на главную"
      >
        <AppLogo />
      </RouterLink>

      <nav class="cv-header__nav" aria-label="Основная навигация">
        <RouterLink to="/" class="cv-header__nav-link">
          <span class="cv-header__nav-label">Главная</span>
        </RouterLink>
        <RouterLink to="/announcements" class="cv-header__nav-link">
          <span class="cv-header__nav-label">Каталог</span>
        </RouterLink>
        <RouterLink to="/feedback" class="cv-header__nav-link">
          <span class="cv-header__nav-label">Поддержка</span>
        </RouterLink>
      </nav>

      <div ref="searchRootRef" class="cv-header__search">
        <button
          type="button"
          class="cv-header__icon-btn"
          :class="{ 'cv-header__icon-btn--active': isSearchOpen }"
          aria-label="Поиск"
          :aria-expanded="isSearchOpen"
          @click="toggleSearch"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.8" />
            <path d="M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>

        <Transition name="cv-search">
          <form
            v-if="isSearchOpen"
            class="cv-header__search-form"
            role="search"
            @submit.prevent="handleSearch"
          >
            <span class="cv-header__search-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.8" />
                <path d="M15 15l4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </span>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="search"
              placeholder="Марка, модель или город..."
              class="cv-header__search-input"
              aria-label="Поисковый запрос"
            />
            <button
              type="button"
              class="cv-header__icon-btn cv-header__icon-btn--sm cv-header__search-close"
              aria-label="Закрыть поиск"
              @click="closeSearch"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </form>
        </Transition>
      </div>

      <div class="cv-header__actions">
        <RouterLink
          v-if="isAuthenticated"
          to="/favourites"
          class="cv-header__icon-btn cv-header__action-desktop"
          aria-label="Избранное"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
        </RouterLink>

        <NotificationBell
          v-if="isAuthenticated"
          class="cv-header__popover cv-header__action-desktop"
        />
        <UserMenu
          v-if="isAuthenticated"
          class="cv-header__popover cv-header__action-desktop"
        />

        <div v-else class="cv-header__auth cv-header__action-desktop">
          <BaseButton size="sm" variant="ghost" @click="router.push('/login')">
            Войти
          </BaseButton>
          <BaseButton size="sm" @click="router.push('/register')">
            Регистрация
          </BaseButton>
        </div>

        <button
          type="button"
          class="cv-header__icon-btn cv-header__menu-toggle"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Меню"
          @click="toggleMobileMenu"
        >
          <svg
            v-if="!isMobileMenuOpen"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <div class="cv-header__accent-line" aria-hidden="true"></div>

    <!-- MobileMenu сам делает Teleport в body и держит свой Transition.
         Управляем через prop is-open, чтобы работала анимация закрытия. -->
    <MobileMenu
      :is-open="isMobileMenuOpen"
      @close="closeMobileMenu"
    />
  </header>
</template>

<style scoped>
/* ============================================================
   Шапка
   - Единая система токенов: высота, паддинги, гэпы, размеры кнопок
   - Адаптив: desktop (>= 1025), tablet (<= 1024), mobile (<= 768)
   - Active-state nav унифицирован с cv-nav (нижняя мобильная навигация):
     цвет + градиентный фон + подчёркивание-индикатор
   ============================================================ */

.cv-header {
  /* Layout-токены */
  --cv-header-h: 72px;
  --cv-header-px: 28px;
  --cv-header-gap: 28px;
  --cv-header-icon-size: 40px;
  --cv-header-icon-size-sm: 32px;
  --cv-header-icon-radius: 12px;
  --cv-header-focus: var(--cv-bronze-light);

  /* Nav-токены (совпадают с cv-nav по смыслу) */
  --cv-header-nav-px: 16px;
  --cv-header-nav-py: 9px;
  --cv-header-nav-radius: 10px;
  --cv-header-nav-size: 14px;
  --cv-header-nav-weight: 500;
  --cv-header-nav-indicator-w: calc(100% - 24px);
  --cv-header-nav-indicator-h: 1.5px;

  /* Палитра (те же значения, что в остальных layout-ах) */
  --cv-bg: #0a0a0c;
  --cv-bg-2: #121215;
  --cv-border: rgba(201, 169, 97, 0.12);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-bronze: #c9a961;
  --cv-bronze-light: #e8d5a0;
  --cv-bronze-dark: #8b6f3f;

  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(180deg, rgba(18, 18, 21, 0.92) 0%, rgba(10, 10, 12, 0.88) 100%);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border-bottom: 1px solid var(--cv-border);
  color: var(--cv-text);
  overflow: visible;
  isolation: isolate;
  transition: box-shadow 0.3s ease;
}

.cv-header--scrolled {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

/* --- Фон (клипает только себя) --- */
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

/* --- Контейнер --- */
.cv-header__container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--cv-header-px);
  height: var(--cv-header-h);
  display: flex;
  align-items: center;
  gap: var(--cv-header-gap);
  min-width: 0;
}

/* --- Логотип --- */
.cv-header__logo {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border-radius: 10px;
  transition: transform 0.25s ease, filter 0.25s ease;
  filter: drop-shadow(0 0 0 rgba(201, 169, 97, 0));
}

.cv-header__logo:hover {
  transform: translateY(-1px);
  filter: drop-shadow(0 4px 20px rgba(201, 169, 97, 0.35));
}

/* --- Основная навигация --- */
.cv-header__nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.cv-header__nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 0;
  padding: var(--cv-header-nav-py) var(--cv-header-nav-px);
  font-size: var(--cv-header-nav-size);
  font-weight: var(--cv-header-nav-weight);
  color: var(--cv-text-2);
  text-decoration: none;
  border-radius: var(--cv-header-nav-radius);
  letter-spacing: 0.05px;
  transition:
    color 0.25s cubic-bezier(0.34, 1.2, 0.64, 1),
    transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-header__nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1) 0%, rgba(201, 169, 97, 0.04) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 0;
  pointer-events: none;
}

.cv-header__nav-link::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  width: var(--cv-header-nav-indicator-w);
  height: var(--cv-header-nav-indicator-h);
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--cv-bronze-light), transparent);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.cv-header__nav-label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.cv-header__nav-link:hover {
  color: var(--cv-bronze-light);
  transform: translateY(-1px);
}

.cv-header__nav-link:hover::before {
  opacity: 1;
}

.cv-header__nav-link.router-link-active {
  color: var(--cv-bronze-light);
}

.cv-header__nav-link.router-link-active::before {
  opacity: 1;
}

.cv-header__nav-link.router-link-active::after {
  transform: translateX(-50%) scaleX(1);
}

/* --- Поиск --- */
.cv-header__search {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 20;
}

.cv-header__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cv-bronze);
  flex-shrink: 0;
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
  padding: 0 8px 0 14px;
  background: linear-gradient(180deg, #1a1a20 0%, #14141a 100%);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    0 0 0 3px rgba(201, 169, 97, 0.08),
    0 0 32px rgba(201, 169, 97, 0.15);
  z-index: 30;
}

.cv-header__search-input {
  flex: 1;
  min-width: 0;
  padding: 12px 0;
  font-size: 16px; /* >= 16px, иначе iOS Safari зумит на фокус */
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

/* --- Универсальная иконочная кнопка --- */
.cv-header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--cv-header-icon-size);
  height: var(--cv-header-icon-size);
  flex-shrink: 0;
  padding: 0;
  color: var(--cv-text-2);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: var(--cv-header-icon-radius);
  cursor: pointer;
  text-decoration: none;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.cv-header__icon-btn:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.2);
}

.cv-header__icon-btn:active {
  transform: scale(0.96);
}

.cv-header__icon-btn--active {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-header__icon-btn--sm {
  width: var(--cv-header-icon-size-sm);
  height: var(--cv-header-icon-size-sm);
  border-radius: 10px;
}

/* --- Действия справа --- */
.cv-header__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 20;
  flex-shrink: 0;
}

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

/* --- Анимация открытия поиска --- */
.cv-search-enter-active,
.cv-search-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-search-enter-from,
.cv-search-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.94);
}

/* ============================================================
   Единый focus-visible для всех интерактивных элементов шапки
   ============================================================ */
.cv-header__logo:focus-visible,
.cv-header__nav-link:focus-visible,
.cv-header__icon-btn:focus-visible,
.cv-header__menu-toggle:focus-visible {
  outline: 2px solid var(--cv-header-focus);
  outline-offset: 2px;
}

.cv-header__logo:focus:not(:focus-visible),
.cv-header__nav-link:focus:not(:focus-visible),
.cv-header__icon-btn:focus:not(:focus-visible) {
  outline: none;
}

/* ============================================================
   Планшет (<= 1024): nav скрыт, поиск — full-width dropdown
   ============================================================ */
@media (max-width: 1024px) {
  .cv-header {
    --cv-header-px: 20px;
    --cv-header-gap: 16px;
  }

  .cv-header__nav {
    display: none;
  }

  .cv-header__search-form {
    position: fixed;
    top: var(--cv-header-h);
    left: 0;
    right: 0;
    width: 100%;
    transform: none;
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    padding: 0 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  }

  .cv-search-enter-from,
  .cv-search-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }

  .cv-header__search-input {
    padding: 14px 0;
  }
}

/* ============================================================
   Мобилка (<= 768): только logo, поиск и burger
   ============================================================ */
@media (max-width: 768px) {
  .cv-header {
    --cv-header-h: 62px;
    --cv-header-px: 16px;
    --cv-header-gap: 8px;
    --cv-header-icon-size: 42px;
  }

  .cv-header__action-desktop {
    display: none;
  }

  .cv-header__menu-toggle {
    display: inline-flex;
  }

  .cv-header__search {
    flex: 1;
    justify-content: flex-end;
  }

  .cv-header__bg .cv-header__glow {
    width: 400px;
    height: 200px;
  }
}

/* ============================================================
   Узкая мобилка (<= 480): ещё плотнее
   ============================================================ */
@media (max-width: 480px) {
  .cv-header {
    --cv-header-px: 12px;
    --cv-header-gap: 6px;
    --cv-header-icon-size: 40px;
  }

  .cv-header__glow {
    width: 320px;
  }
}

/* ============================================================
   Уважение к системным настройкам
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .cv-header,
  .cv-header *,
  .cv-search-enter-active,
  .cv-search-leave-active {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }

  .cv-header__nav-link:hover,
  .cv-header__logo:hover {
    transform: none;
  }
}
</style>