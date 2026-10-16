<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick
} from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import NotificationItem from '@/components/notifications/NotificationItem.vue'

/**
 * NotificationBell — колокольчик уведомлений с выпадающим списком.
 *
 * Позиционирование:
 *   - dropdown фиксируется через position: fixed
 *   - высота ограничена max-height: min(560px, 100dvh - 24px), поэтому
 *     клампинг по вертикали сводится к отступу 12px от краёв
 *   - по горизонтали клампится с тем же отступом
 *   - при нехватке места снизу — флипается наверх
 *   - при скролле внутри самого dropdown позиция НЕ пересчитывается
 */

const router = useRouter()
const notificationsStore = useNotificationsStore()

const isOpen = ref(false)
const triggerRef = ref(null)
const menuRef = ref(null)
const coords = ref({ top: 0, left: 0 })
const isPositioned = ref(false)

/* ---------- Данные ---------- */

const unreadCount = computed(() => notificationsStore.unreadCount ?? 0)

const recentNotifications = computed(() =>
  (notificationsStore.notifications ?? []).slice(0, 5)
)

// Защитные fallback'и на случай разных имён полей в сторе
const isLoading = computed(() =>
  notificationsStore.isLoading ?? notificationsStore.loading ?? false
)

const hasError = computed(() => Boolean(notificationsStore.error))

const showSkeleton = computed(() => isLoading.value && recentNotifications.value.length === 0)
const showError = computed(() => !isLoading.value && hasError.value && recentNotifications.value.length === 0)
const showEmpty = computed(() =>
  !isLoading.value && !hasError.value && recentNotifications.value.length === 0
)

/* ---------- Positioning ---------- */

const VIEWPORT_PADDING = 12
const TRIGGER_OFFSET = 10

function computePosition() {
  const trigger = triggerRef.value
  const menu = menuRef.value
  if (!trigger || !menu) return

  const triggerRect = trigger.getBoundingClientRect()
  const menuRect = menu.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Высота ограничена CSS (max-height: min(560px, 100dvh - 24px)),
  // поэтому menuRect.height уже не превышает вьюпорт.
  const spaceBelow = vh - triggerRect.bottom - TRIGGER_OFFSET - VIEWPORT_PADDING
  const spaceAbove = triggerRect.top - TRIGGER_OFFSET - VIEWPORT_PADDING
  const needed = menuRect.height

  const shouldFlipUp =
    spaceBelow < needed && spaceAbove >= needed

  let top = shouldFlipUp
    ? triggerRect.top - menuRect.height - TRIGGER_OFFSET
    : triggerRect.bottom + TRIGGER_OFFSET

  // По горизонтали — прижимаем к правому краю триггера
  let left = triggerRect.right - menuRect.width

  // Клампим к вьюпорту
  left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - menuRect.width - VIEWPORT_PADDING))
  top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - menuRect.height - VIEWPORT_PADDING))

  coords.value = { top, left }
  isPositioned.value = true
}

let rafId = 0
function scheduleUpdate() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    if (isOpen.value) computePosition()
  })
}

function handleViewportChange() {
  if (!isOpen.value) return
  scheduleUpdate()
}

function handleWindowScroll(e) {
  if (!isOpen.value) return
  // Игнорируем скролл внутри самого dropdown (список уведомлений)
  if (menuRef.value?.contains(e.target)) return
  scheduleUpdate()
}

/* ---------- Open / close ---------- */

async function open() {
  isOpen.value = true
  isPositioned.value = false
  await nextTick()
  computePosition()
  // Переносим фокус внутрь для клавиатурной доступности
  nextTick(() => {
    const firstFocusable = menuRef.value?.querySelector(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
  })
}

function close({ restoreFocus = true } = {}) {
  isOpen.value = false
  isPositioned.value = false
  if (restoreFocus) {
    triggerRef.value?.querySelector('button')?.focus()
  }
}

function toggle() {
  isOpen.value ? close() : open()
}

function goToAll() {
  close({ restoreFocus: false })
  router.push({ name: 'notifications' })
}

function retry() {
  notificationsStore.fetchNotifications?.()
}

/* ---------- Outside click ---------- */

function handlePointerDown(e) {
  if (!isOpen.value) return
  const t = e.target
  if (!(t instanceof Node)) return
  if (triggerRef.value?.contains(t)) return
  if (menuRef.value?.contains(t)) return
  close({ restoreFocus: false })
}

/* ---------- Escape ---------- */

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) {
    close()
  }
}

/* ---------- Lifecycle ---------- */

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown, true)
  document.addEventListener('keydown', handleKeydown, true)
  window.addEventListener('resize', handleViewportChange, { passive: true })
  window.addEventListener('scroll', handleWindowScroll, { passive: true, capture: true })
  window.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true })
  window.visualViewport?.addEventListener('scroll', handleViewportChange, { passive: true })

  if (!notificationsStore.notifications?.length) {
    notificationsStore.fetchNotifications?.()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.removeEventListener('keydown', handleKeydown, true)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleWindowScroll, true)
  window.visualViewport?.removeEventListener('resize', handleViewportChange)
  window.visualViewport?.removeEventListener('scroll', handleViewportChange)
  if (rafId) cancelAnimationFrame(rafId)
})

// Если данные догрузились, пока dropdown открыт — пересчитываем позицию
watch(
  () => recentNotifications.value.length,
  () => {
    if (isOpen.value) scheduleUpdate()
  }
)
</script>

<template>
  <div ref="triggerRef" class="cv-bell">
    <button
      type="button"
      class="cv-bell__trigger"
      :class="{ 'cv-bell__trigger--active': isOpen }"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      aria-controls="cv-bell-dropdown"
      :aria-label="`Уведомления: ${unreadCount} новых`"
      @click="toggle"
    >
      <span class="cv-bell__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      </span>

      <span v-if="unreadCount" class="cv-bell__badge" aria-hidden="true">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Teleport to="body">
      <Transition name="cv-dropdown">
        <div
          v-if="isOpen"
          id="cv-bell-dropdown"
          ref="menuRef"
          class="cv-bell__dropdown"
          role="dialog"
          aria-label="Уведомления"
          :style="{
            top: coords.top + 'px',
            left: coords.left + 'px',
            visibility: isPositioned ? 'visible' : 'hidden'
          }"
        >
          <div class="cv-bell__glow" aria-hidden="true"></div>
          <div class="cv-bell__carbon" aria-hidden="true"></div>

          <header class="cv-bell__header">
            <h3 class="cv-bell__title">Уведомления</h3>
            <span v-if="unreadCount" class="cv-bell__count">
              {{ unreadCount }} новых
            </span>
          </header>

          <div class="cv-bell__list">
            <!-- Загрузка -->
            <template v-if="showSkeleton">
              <div
                v-for="i in 3"
                :key="`skeleton-${i}`"
                class="cv-bell__skeleton"
                aria-hidden="true"
              >
                <span class="cv-bell__skeleton-icon"></span>
                <span class="cv-bell__skeleton-lines">
                  <span class="cv-bell__skeleton-line cv-bell__skeleton-line--title"></span>
                  <span class="cv-bell__skeleton-line"></span>
                </span>
              </div>
              <span class="cv-bell__sr-only" role="status">Загрузка уведомлений…</span>
            </template>

            <!-- Ошибка -->
            <div v-else-if="showError" class="cv-bell__state cv-bell__state--error" role="alert">
              <span class="cv-bell__state-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5M12 16h.01" />
                </svg>
              </span>
              <span class="cv-bell__state-text">Не удалось загрузить уведомления</span>
              <button type="button" class="cv-bell__retry" @click="retry">
                Повторить
              </button>
            </div>

            <!-- Пусто -->
            <div v-else-if="showEmpty" class="cv-bell__state">
              <span class="cv-bell__state-icon" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                </svg>
              </span>
              <span class="cv-bell__state-text">Нет уведомлений</span>
              <span class="cv-bell__state-hint">
                Здесь появятся оповещения о ваших объявлениях и чатах
              </span>
            </div>

            <!-- Список -->
            <template v-else>
              <NotificationItem
                v-for="n in recentNotifications"
                :key="n.id"
                :notification="n"
                @click="close({ restoreFocus: false })"
              />
            </template>
          </div>

          <button
            v-if="!showSkeleton"
            type="button"
            class="cv-bell__footer"
            @click="goToAll"
          >
            <span>Все уведомления</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </button>

          <div class="cv-bell__accent-line" aria-hidden="true"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============================================================
   NotificationBell
   - dropdown фиксированный, max-height привязан к dvh
   - список — единственный скроллер (flex + min-height: 0)
   - состояние: loading (skeleton) / error / empty / list
   ============================================================ */

.cv-bell {
  /* Layout-токены */
  --cv-bell-trigger-size: 40px;
  --cv-bell-trigger-radius: 11px;
  --cv-bell-dropdown-w: 400px;
  --cv-bell-dropdown-max-h: 560px;
  --cv-bell-z: 1080; /* ниже MobileMenu (1100) */

  /* Палитра */
  --cv-bg: #0a0a0c;
  --cv-bg-2: #121215;
  --cv-border: rgba(201, 169, 97, 0.15);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-text-3: rgba(200, 190, 175, 0.35);
  --cv-bronze: #c9a961;
  --cv-bronze-light: #e8d5a0;
  --cv-bronze-dark: #8b6f3f;
  --cv-focus: var(--cv-bronze-light);

  position: relative;
}

/* ---------- Триггер ---------- */

.cv-bell__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--cv-bell-trigger-size);
  height: var(--cv-bell-trigger-size);
  padding: 0;
  color: var(--cv-text-2);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: var(--cv-bell-trigger-radius);
  cursor: pointer;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.cv-bell__trigger:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.22);
  transform: translateY(-1px);
}

.cv-bell__trigger:hover .cv-bell__icon {
  filter: drop-shadow(0 0 8px rgba(201, 169, 97, 0.5));
}

.cv-bell__trigger:active {
  transform: translateY(0) scale(0.96);
}

.cv-bell__trigger--active {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.35);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.2);
}

.cv-bell__trigger:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
}

.cv-bell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.25s ease;
}

/* ---------- Бейдж ---------- */

.cv-bell__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1a1208;
  background: linear-gradient(135deg, #e8d5a0 0%, #c9a961 55%, #8b6f3f 100%);
  border-radius: 10px;
  border: 2px solid #121215;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
  animation: cvBadgePulse 2.5s ease-in-out infinite;
}

@keyframes cvBadgePulse {
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

/* ---------- Dropdown ---------- */

.cv-bell__dropdown {
  position: fixed;
  width: var(--cv-bell-dropdown-w);
  max-width: calc(100vw - 24px);
  /* Высота ограничена вьюпортом — клампинг по вертикали безопасен */
  max-height: min(var(--cv-bell-dropdown-max-h), calc(100dvh - 24px));
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4) 0%, transparent 30%),
    linear-gradient(180deg, #16161b 0%, #0e0e12 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  border-radius: 20px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 0 80px rgba(201, 169, 97, 0.1);
  overflow: hidden;
  z-index: var(--cv-bell-z);
  isolation: isolate;
}

.cv-bell__glow {
  position: absolute;
  top: -100px;
  right: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-bell__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
}

/* ---------- Header ---------- */

.cv-bell__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px 16px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
  flex-shrink: 0;
}

.cv-bell__title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--cv-text);
  letter-spacing: -0.15px;
}

.cv-bell__count {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 999px;
}

/* ---------- Список (единственный скроллер) ---------- */

.cv-bell__list {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-bell__list::-webkit-scrollbar {
  width: 6px;
}
.cv-bell__list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cv-bronze), var(--cv-bronze-dark));
  border-radius: 3px;
}

/* ---------- Состояния ---------- */

.cv-bell__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 28px 36px;
  text-align: center;
}

.cv-bell__state-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  color: var(--cv-bronze);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 20px;
  opacity: 0.75;
  margin-bottom: 4px;
}

.cv-bell__state--error .cv-bell__state-icon {
  color: #e8a88a;
  background: rgba(184, 119, 85, 0.08);
  border-color: rgba(184, 119, 85, 0.3);
  opacity: 1;
}

.cv-bell__state-text {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--cv-text);
}

.cv-bell__state-hint {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--cv-text-3);
  max-width: 240px;
}

.cv-bell__retry {
  margin-top: 4px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: inherit;
  color: #1a1208;
  background: linear-gradient(135deg, #e8d5a0 0%, #c9a961 55%, #8b6f3f 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.35);
}
.cv-bell__retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(201, 169, 97, 0.55);
}
.cv-bell__retry:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
}

/* ---------- Skeleton ---------- */

.cv-bell__skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.06);
}

.cv-bell__skeleton-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.cv-bell__skeleton-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.08) 50%,
    transparent 100%
  );
  animation: cvSkeleton 1.6s ease-in-out infinite;
}

.cv-bell__skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cv-bell__skeleton-line {
  height: 10px;
  width: 60%;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}
.cv-bell__skeleton-line--title {
  height: 12px;
  width: 40%;
}
.cv-bell__skeleton-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.1) 50%,
    transparent 100%
  );
  animation: cvSkeleton 1.6s ease-in-out infinite;
}

@keyframes cvSkeleton {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Скрытый текст для скринридеров */
.cv-bell__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---------- Футер ---------- */

.cv-bell__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 15px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: var(--cv-bronze-light);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.04), rgba(201, 169, 97, 0.08));
  border: none;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
  cursor: pointer;
  letter-spacing: 0.1px;
  flex-shrink: 0;
  transition: color 0.2s ease, background 0.2s ease;
}

.cv-bell__footer svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-bell__footer:hover {
  color: #ffffff;
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.16));
}

.cv-bell__footer:hover svg {
  transform: translateX(3px);
}

.cv-bell__footer:active {
  background: rgba(201, 169, 97, 0.2);
}

.cv-bell__footer:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: -2px;
}

.cv-bell__accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.05) 15%,
    rgba(201, 169, 97, 0.4) 50%,
    rgba(201, 169, 97, 0.05) 85%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* ---------- Анимация появления ---------- */

.cv-dropdown-enter-active,
.cv-dropdown-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
  transform-origin: top right;
}

.cv-dropdown-enter-from,
.cv-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ---------- Адаптив ---------- */

@media (max-width: 640px) {
  .cv-bell {
    --cv-bell-dropdown-w: calc(100vw - 24px);
    --cv-bell-dropdown-max-h: 480px;
  }

  .cv-bell__header {
    padding: 16px 18px 14px;
  }

  .cv-bell__state {
    padding: 32px 22px 30px;
  }
}

/* ---------- Уважение к системным настройкам ---------- */

@media (prefers-reduced-motion: reduce) {
  .cv-bell__badge {
    animation: none;
  }

  .cv-bell__trigger,
  .cv-bell__icon,
  .cv-bell__footer,
  .cv-bell__footer svg,
  .cv-dropdown-enter-active,
  .cv-dropdown-leave-active {
    transition-duration: 0.01ms !important;
  }

  .cv-bell__skeleton-icon::after,
  .cv-bell__skeleton-line::after {
    animation: none;
  }

  .cv-bell__trigger:hover,
  .cv-bell__trigger:active {
    transform: none;
  }

  .cv-bell__footer:hover svg {
    transform: none;
  }
}
</style>