<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLogo from './AppLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits(['close'])

const drawerRef = ref(null)
const closeBtnRef = ref(null)
const previousActiveElement = ref(null)

const menuItems = [
  { label: 'Главная', to: '/', icon: 'home' },
  { label: 'Каталог', to: '/announcements', icon: 'car' },
  { label: 'Поддержка', to: '/feedback', icon: 'chat' }
]

const authItems = [
  { label: 'Мой профиль', to: '/profile', icon: 'user' },
  { label: 'Мои объявления', to: '/profile/announcements', icon: 'list' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Чаты', to: '/chat', icon: 'chat' },
  { label: 'Подписки', to: '/profile/subscriptions', icon: 'star' },
  { label: 'Настройки', to: '/profile/edit', icon: 'settings' },
  { label: 'Безопасность', to: '/profile/security', icon: 'shield' }
]

const guestItems = [
  { label: 'Войти', to: '/login', icon: 'login' },
  { label: 'Регистрация', to: '/register', icon: 'user-plus' }
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

function requestClose() {
  emit('close')
}

/* ---------- Escape ---------- */
function handleKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    requestClose()
    return
  }

  /* ---------- Focus trap ---------- */
  if (e.key === 'Tab' && drawerRef.value) {
    const focusable = drawerRef.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

/* ---------- Body scroll lock ---------- */
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

function lockBodyScroll() {
  previousBodyOverflow = document.body.style.overflow
  previousBodyPaddingRight = document.body.style.paddingRight

  // Компенсация скроллбара, чтобы не «дёргался» layout при скрытии overflow
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow
  document.body.style.paddingRight = previousBodyPaddingRight
}

onMounted(() => {
  previousActiveElement.value = document.activeElement

  lockBodyScroll()
  document.addEventListener('keydown', handleKeydown)

  nextTick(() => {
    closeBtnRef.value?.focus()
  })
})

onBeforeUnmount(() => {
  unlockBodyScroll()
  document.removeEventListener('keydown', handleKeydown)

  // Возврат фокуса на элемент, с которого открыли меню
  if (previousActiveElement.value && typeof previousActiveElement.value.focus === 'function') {
    previousActiveElement.value.focus()
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      class="cv-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Мобильное меню"
    >
      <div class="cv-menu__overlay" @click="requestClose"></div>

      <aside ref="drawerRef" class="cv-menu__drawer">
        <div class="cv-menu__glow" aria-hidden="true"></div>
        <div class="cv-menu__carbon" aria-hidden="true"></div>

        <header class="cv-menu__header">
          <AppLogo size="sm" />
          <button
            ref="closeBtnRef"
            class="cv-menu__close"
            type="button"
            aria-label="Закрыть"
            @click="requestClose"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        </header>

        <nav class="cv-menu__nav">
          <section class="cv-menu__section">
            <p class="cv-menu__section-title">Навигация</p>

            <button
              v-for="item in menuItems"
              :key="item.label"
              type="button"
              class="cv-menu__item"
              @click="handleItemClick(item)"
            >
              <span class="cv-menu__item-icon" aria-hidden="true">
                <svg v-if="item.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 10.5L12 3l9 7.5"/>
                  <path d="M5 9.5V21h14V9.5"/>
                  <path d="M9.5 21V14h5v7"/>
                </svg>
                <svg v-else-if="item.icon === 'car'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                  <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
                  <circle cx="7.5" cy="15.5" r="0.9" fill="currentColor"/>
                  <circle cx="16.5" cy="15.5" r="0.9" fill="currentColor"/>
                </svg>
                <svg v-else-if="item.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
                  <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
                </svg>
              </span>
              <span class="cv-menu__item-label">{{ item.label }}</span>
              <span class="cv-menu__item-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </section>

          <section class="cv-menu__section">
            <p class="cv-menu__section-title">
              {{ authStore.isAuthenticated ? 'Аккаунт' : 'Гостям' }}
            </p>

            <button
              v-for="item in (authStore.isAuthenticated ? authItems : guestItems)"
              :key="item.label"
              type="button"
              class="cv-menu__item"
              @click="handleItemClick(item)"
            >
              <span class="cv-menu__item-icon" aria-hidden="true">
                <svg v-if="item.icon === 'user'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
                <svg v-else-if="item.icon === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
                <svg v-else-if="item.icon === 'heart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
                </svg>
                <svg v-else-if="item.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
                </svg>
                <svg v-else-if="item.icon === 'star'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l3 6.5 7 1-5 5 1.2 7L12 18.8 5.8 22l1.2-7-5-5 7-1 3-6.5z"/>
                </svg>
                <svg v-else-if="item.icon === 'settings'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
                </svg>
                <svg v-else-if="item.icon === 'shield'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <svg v-else-if="item.icon === 'login'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <path d="M10 17l5-5-5-5"/>
                  <path d="M15 12H3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <path d="M20 8v6M23 11h-6"/>
                </svg>
              </span>
              <span class="cv-menu__item-label">{{ item.label }}</span>
              <span class="cv-menu__item-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>

            <button
              v-if="authStore.isAuthenticated"
              type="button"
              class="cv-menu__item cv-menu__item--danger"
              @click="handleItemClick({ action: 'logout' })"
            >
              <span class="cv-menu__item-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <path d="M16 17l5-5-5-5"/>
                  <path d="M21 12H9"/>
                </svg>
              </span>
              <span class="cv-menu__item-label">Выйти</span>
              <span class="cv-menu__item-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </section>
        </nav>

        <footer class="cv-menu__footer">
          <span class="cv-menu__footer-text">CarVibe © 2026</span>
          <span class="cv-menu__footer-mark">premium auto</span>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.cv-menu {
  --cv-bg: #0A0A0C;
  --cv-bg-2: #121215;
  --cv-border: rgba(201, 169, 97, 0.15);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-text-3: rgba(200, 190, 175, 0.35);
  --cv-bronze: #C9A961;
  --cv-bronze-light: #E8D5A0;
  --cv-bronze-dark: #8B6F3F;
  --cv-copper: #B87755;

  position: fixed;
  inset: 0;
  /* Выше AppHeader и AdminHeader (у них 1000) */
  z-index: 1100;
  /* Защита от горизонтального overflow при анимации slide-in */
  overflow: hidden;
}

.cv-menu__overlay {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 7, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: cvFadeIn 0.25s ease;
}

.cv-menu__drawer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 340px;
  max-width: 88vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #14141A 0%, #0A0A0C 100%);
  border-right: 1px solid var(--cv-border);
  box-shadow:
    8px 0 60px rgba(0, 0, 0, 0.7),
    8px 0 120px rgba(201, 169, 97, 0.06);
  animation: cvSlideIn 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
  /* iOS safe-area */
  padding-top: env(safe-area-inset-top, 0);
  padding-left: env(safe-area-inset-left, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
  box-sizing: border-box;
}

@keyframes cvFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes cvSlideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.cv-menu__glow {
  position: absolute;
  top: -120px;
  right: -100px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.cv-menu__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.45;
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
  mask-image: radial-gradient(ellipse at top left, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at top left, black 20%, transparent 80%);
}

.cv-menu__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 20px 20px;
  border-bottom: 1px solid var(--cv-border);
  flex-shrink: 0;
}

.cv-menu__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: var(--cv-text-2);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--cv-border-soft);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.cv-menu__close:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
  transform: rotate(90deg);
}

.cv-menu__close:focus-visible {
  outline: 2px solid var(--cv-bronze);
  outline-offset: 2px;
}

.cv-menu__nav {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 20px 14px 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
  min-height: 0;
}

.cv-menu__nav::-webkit-scrollbar { width: 6px; }
.cv-menu__nav::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cv-bronze), var(--cv-bronze-dark));
  border-radius: 3px;
}

.cv-menu__section {
  margin-bottom: 26px;
}
.cv-menu__section:last-child { margin-bottom: 0; }

.cv-menu__section-title {
  margin: 0 0 8px;
  padding: 0 12px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--cv-bronze);
  opacity: 0.75;
}

.cv-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 12px;
  font-size: 14.5px;
  font-weight: 500;
  font-family: inherit;
  color: var(--cv-text-2);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  margin-bottom: 2px;
}

.cv-menu__item::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.cv-menu__item:hover,
.cv-menu__item:focus-visible {
  color: var(--cv-bronze-light);
  border-color: rgba(201, 169, 97, 0.2);
  transform: translateX(2px);
  outline: none;
}

.cv-menu__item:hover::before,
.cv-menu__item:focus-visible::before {
  opacity: 1;
}

.cv-menu__item:active {
  transform: translateX(2px) scale(0.98);
}

.cv-menu__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--cv-border-soft);
  color: currentColor;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-menu__item:hover .cv-menu__item-icon,
.cv-menu__item:focus-visible .cv-menu__item-icon {
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
  color: var(--cv-bronze-light);
}

.cv-menu__item-label {
  flex: 1;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-menu__item-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cv-text-3);
  flex-shrink: 0;
  transition: all 0.25s ease;
  opacity: 0.5;
}

.cv-menu__item:hover .cv-menu__item-arrow,
.cv-menu__item:focus-visible .cv-menu__item-arrow {
  color: var(--cv-bronze-light);
  transform: translateX(2px);
  opacity: 1;
}

.cv-menu__item--danger {
  color: rgba(232, 168, 138, 0.85);
}

.cv-menu__item--danger:hover,
.cv-menu__item--danger:focus-visible {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-menu__item--danger:hover::before,
.cv-menu__item--danger:focus-visible::before {
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.15), rgba(184, 119, 85, 0.04));
}

.cv-menu__item--danger:hover .cv-menu__item-icon,
.cv-menu__item--danger:focus-visible .cv-menu__item-icon {
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.4);
  color: #E8A88A;
}

.cv-menu__item--danger:hover .cv-menu__item-arrow,
.cv-menu__item--danger:focus-visible .cv-menu__item-arrow {
  color: #E8A88A;
}

.cv-menu__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px calc(env(safe-area-inset-bottom, 0) + 18px);
  border-top: 1px solid var(--cv-border);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.3), transparent);
  flex-shrink: 0;
}

.cv-menu__footer-text {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--cv-text-3);
  letter-spacing: 0.2px;
}

.cv-menu__footer-mark {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.6px;
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

@media (max-width: 400px) {
  .cv-menu__drawer { width: 300px; }
  .cv-menu__item { font-size: 14px; padding: 11px 10px; }
  .cv-menu__item-icon { width: 32px; height: 32px; }
}
</style>