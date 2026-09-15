<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import NotificationItem from '@/components/notifications/NotificationItem.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const isOpen = ref(false)
const dropdownRef = ref(null)

const unreadCount = computed(() => notificationsStore.unreadCount)
const recentNotifications = computed(() => notificationsStore.notifications.slice(0, 5))

async function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value && !notificationsStore.notifications.length) {
    await notificationsStore.fetchNotifications()
  }
}

function goToAll() {
  isOpen.value = false
  router.push('/profile/notifications')
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await notificationsStore.fetchNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="cv-bell">
    <button
      class="cv-bell__trigger"
      :class="{ 'cv-bell__trigger--active': isOpen }"
      :aria-label="`Уведомления: ${unreadCount}`"
      @click="toggleDropdown"
    >
      <span class="cv-bell__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
        </svg>
      </span>

      <span v-if="unreadCount" class="cv-bell__badge">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <Transition name="cv-dropdown">
      <div v-if="isOpen" class="cv-bell__dropdown">
        <div class="cv-bell__glow" aria-hidden="true"></div>
        <div class="cv-bell__carbon" aria-hidden="true"></div>

        <header class="cv-bell__header">
          <h3 class="cv-bell__title">Уведомления</h3>
          <span v-if="unreadCount" class="cv-bell__count">
            {{ unreadCount }} новых
          </span>
        </header>

        <div class="cv-bell__list">
          <NotificationItem
            v-for="n in recentNotifications"
            :key="n.id"
            :notification="n"
            @click="isOpen = false"
          />

          <div v-if="!recentNotifications.length" class="cv-bell__empty">
            <span class="cv-bell__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </span>
            <span class="cv-bell__empty-text">Нет уведомлений</span>
            <span class="cv-bell__empty-hint">Здесь появятся оповещения о ваших объявлениях и чатах</span>
          </div>
        </div>

        <button class="cv-bell__footer" @click="goToAll">
          <span>Все уведомления</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </button>

        <div class="cv-bell__accent-line" aria-hidden="true"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-bell {
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

  position: relative;
}

.cv-bell__trigger {
  position: relative;
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
  transition: all 0.25s ease;
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

.cv-bell__trigger--active {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.35);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.2);
}

.cv-bell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.25s ease;
}

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
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
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

.cv-bell__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 400px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4) 0%, transparent 30%),
    linear-gradient(180deg, #16161B 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  border-radius: 20px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 0 80px rgba(201, 169, 97, 0.1);
  overflow: hidden;
  z-index: 50;
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
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 80%);
}

.cv-bell__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px 16px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
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

.cv-bell__list {
  position: relative;
  z-index: 1;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-bell__list::-webkit-scrollbar { width: 6px; }
.cv-bell__list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--cv-bronze), var(--cv-bronze-dark));
  border-radius: 3px;
}

.cv-bell__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 44px 32px 40px;
  text-align: center;
}

.cv-bell__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  color: var(--cv-bronze);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 20px;
  opacity: 0.7;
  margin-bottom: 4px;
}

.cv-bell__empty-text {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--cv-text);
}

.cv-bell__empty-hint {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--cv-text-3);
  max-width: 240px;
}

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
  transition: all 0.2s ease;
  letter-spacing: 0.1px;
}

.cv-bell__footer svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-bell__footer:hover {
  color: #FFFFFF;
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.16));
}

.cv-bell__footer:hover svg {
  transform: translateX(3px);
}

.cv-bell__footer:active {
  background: rgba(201, 169, 97, 0.2);
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

.cv-dropdown-enter-active,
.cv-dropdown-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-dropdown-enter-from,
.cv-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}

@media (max-width: 640px) {
  .cv-bell__dropdown {
    position: fixed;
    top: 74px;
    right: 12px;
    left: 12px;
    width: auto;
    max-width: 420px;
    margin-left: auto;
    margin-right: 0;
  }
}
</style>