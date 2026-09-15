<script setup>
import { useRoute } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const route = useRoute()

const menuItems = [
  { label: 'Обзор', to: '/admin', icon: 'dashboard', badge: null },
  { label: 'Пользователи', to: '/admin/users', icon: 'users', badge: null },
  { label: 'Объявления', to: '/admin/announcements', icon: 'car', badge: 12 },
  { label: 'Обращения', to: '/admin/feedback', icon: 'chat', badge: 3 },
  { label: 'Журнал действий', to: '/admin/audit-logs', icon: 'list', badge: null }
]

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside :class="['cv-aside', { 'cv-aside--closed': !isOpen }]">
    <div class="cv-aside__glow" aria-hidden="true"></div>
    <div class="cv-aside__carbon" aria-hidden="true"></div>

    <header class="cv-aside__brand">
      <RouterLink to="/admin" class="cv-aside__logo">
        <span class="cv-aside__logo-mark">
          <span class="cv-aside__logo-mark-inner">CV</span>
        </span>
        <span class="cv-aside__logo-text">
          <span class="cv-aside__logo-title">CarVibe</span>
          <span class="cv-aside__logo-subtitle">Admin Panel</span>
        </span>
      </RouterLink>

      <button
        type="button"
        class="cv-aside__mobile-close"
        aria-label="Закрыть меню"
        @click="emit('close')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 6l12 12M18 6L6 18"/>
        </svg>
      </button>
    </header>

    <nav class="cv-aside__nav" aria-label="Разделы админки">
      <span class="cv-aside__section-label">Управление</span>

      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'cv-aside__link',
          { 'cv-aside__link--active': isActive(item.to) }
        ]"
        :title="!isOpen ? item.label : undefined"
      >
        <span class="cv-aside__link-glow" aria-hidden="true"></span>

        <span class="cv-aside__icon" aria-hidden="true">
          <svg v-if="item.icon === 'dashboard'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1.5"/>
            <rect x="14" y="3" width="7" height="5" rx="1.5"/>
            <rect x="14" y="12" width="7" height="9" rx="1.5"/>
            <rect x="3" y="16" width="7" height="5" rx="1.5"/>
          </svg>
          <svg v-else-if="item.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
          </svg>
        </span>

        <span class="cv-aside__label">{{ item.label }}</span>

        <span
          v-if="item.badge"
          class="cv-aside__badge"
          :aria-label="`${item.badge} новых`"
        >
          {{ item.badge }}
        </span>

        <span class="cv-aside__arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </span>
      </RouterLink>
    </nav>

    <footer class="cv-aside__footer">
      <RouterLink to="/" class="cv-aside__back" title="На сайт">
        <span class="cv-aside__back-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </span>
        <span class="cv-aside__back-text">На сайт CarVibe</span>
      </RouterLink>

      <div class="cv-aside__version">
        <span class="cv-aside__version-dot" aria-hidden="true"></span>
        <span class="cv-aside__version-text">v2.1.0</span>
      </div>
    </footer>
  </aside>

  <Teleport to="body">
    <Transition name="cv-aside-backdrop">
      <div
        v-if="isOpen"
        class="cv-aside__backdrop"
        @click="emit('close')"
        aria-hidden="true"
      ></div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cv-aside {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 264px;
  flex-shrink: 0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.55) 0%, rgba(15, 13, 10, 0.75) 100%),
    linear-gradient(180deg, #12121A 0%, #0B0B10 100%);
  color: rgba(245, 240, 230, 0.9);
  border-right: 1px solid rgba(201, 169, 97, 0.16);
  isolation: isolate;
  overflow: hidden;
  transition: width 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aside--closed {
  width: 76px;
}

.cv-aside__glow {
  position: absolute;
  top: 15%;
  left: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.18), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.75;
}

.cv-aside__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.3;
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
  mask-image: radial-gradient(ellipse at top left, black 20%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at top left, black 20%, transparent 85%);
}

.cv-aside__brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 18px 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-aside__logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  min-width: 0;
  flex: 1;
}

.cv-aside__logo-mark {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 6px 20px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
  overflow: hidden;
}

.cv-aside__logo-mark::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.5) 50%,
    transparent 70%
  );
  animation: cvAsideShine 4s ease-in-out infinite;
}

@keyframes cvAsideShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-aside__logo-mark-inner {
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #1A1208;
}

.cv-aside__logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-aside__logo-title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.95);
}

.cv-aside__logo-subtitle {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  line-height: 1;
  color: rgba(201, 169, 97, 0.7);
}

.cv-aside--closed .cv-aside__logo-text {
  display: none;
}

.cv-aside--closed .cv-aside__logo {
  justify-content: center;
}

.cv-aside__mobile-close {
  display: none;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-aside__mobile-close:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
  transform: rotate(90deg);
}

.cv-aside__nav {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 18px 12px 12px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-aside__nav::-webkit-scrollbar { width: 6px; }
.cv-aside__nav::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 3px;
}

.cv-aside__section-label {
  padding: 0 12px 8px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.55);
}

.cv-aside--closed .cv-aside__section-label {
  padding: 0;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.cv-aside__link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 11px;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  white-space: nowrap;
}

.cv-aside__link-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.02));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-aside__link:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.28);
  transform: translateX(2px);
}

.cv-aside__link:hover .cv-aside__link-glow {
  opacity: 1;
}

.cv-aside__link:active {
  transform: translateX(2px) scale(0.98);
}

.cv-aside__link:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-aside__link--active {
  color: #F5E6BC;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  border-color: rgba(232, 213, 160, 0.42);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 0 24px rgba(201, 169, 97, 0.15),
    0 1px 0 rgba(232, 213, 160, 0.1) inset;
}

.cv-aside__link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.7);
}

.cv-aside__link--active .cv-aside__link-glow {
  opacity: 1;
}

.cv-aside__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: rgba(201, 169, 97, 0.75);
  transition: all 0.25s ease;
}

.cv-aside__link:hover .cv-aside__icon {
  color: #E8D5A0;
  transform: scale(1.08);
}

.cv-aside__link--active .cv-aside__icon {
  color: #F5E6BC;
}

.cv-aside__label {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aside__badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
  flex-shrink: 0;
  animation: cvAsideBadgePulse 2.5s ease-in-out infinite;
}

@keyframes cvAsideBadgePulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(201, 169, 97, 0.4),
      0 4px 12px rgba(201, 169, 97, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 3px rgba(201, 169, 97, 0.15),
      0 6px 18px rgba(201, 169, 97, 0.6);
  }
}

.cv-aside__arrow {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
  opacity: 0.6;
}

.cv-aside__link:hover .cv-aside__arrow {
  color: #E8D5A0;
  transform: translateX(2px);
  opacity: 1;
}

.cv-aside__link--active .cv-aside__arrow {
  color: #E8D5A0;
  opacity: 1;
}

.cv-aside--closed .cv-aside__label,
.cv-aside--closed .cv-aside__badge,
.cv-aside--closed .cv-aside__arrow {
  display: none;
}

.cv-aside--closed .cv-aside__link {
  justify-content: center;
  padding: 12px;
  gap: 0;
}

.cv-aside--closed .cv-aside__link--active::before {
  top: 25%;
  bottom: 25%;
}

.cv-aside__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 14px 16px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-aside__back {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 9px;
  transition: all 0.22s ease;
  min-width: 0;
}

.cv-aside__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.28);
  transform: translateX(-2px);
}

.cv-aside__back-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-aside__back-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-aside--closed .cv-aside__back-text {
  display: none;
}

.cv-aside--closed .cv-aside__back {
  justify-content: center;
  padding: 10px;
  gap: 0;
}

.cv-aside__version {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-aside--closed .cv-aside__version {
  display: none;
}

.cv-aside__version-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  box-shadow: 0 0 6px rgba(122, 154, 106, 0.7);
  flex-shrink: 0;
  animation: cvAsideVersionPulse 2.4s ease-in-out infinite;
}

@keyframes cvAsideVersionPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.cv-aside__version-text {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-aside__backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 45;
  background: rgba(5, 5, 7, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cv-aside-backdrop-enter-active,
.cv-aside-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.cv-aside-backdrop-enter-from,
.cv-aside-backdrop-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .cv-aside {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    width: 264px;
    box-shadow:
      8px 0 40px rgba(0, 0, 0, 0.6),
      8px 0 80px rgba(201, 169, 97, 0.08);
  }

  .cv-aside--closed {
    transform: translateX(-100%);
    width: 264px;
    box-shadow: none;
  }

  .cv-aside__mobile-close {
    display: inline-flex;
  }

  .cv-aside__backdrop {
    display: block;
  }
}

@media (max-width: 480px) {
  .cv-aside {
    width: 88vw;
    max-width: 300px;
  }
}
</style>