<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDropdown from '@/components/common/BaseDropdown.vue'

const emit = defineEmits(['toggle-sidebar'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const pageTitle = computed(() => route.meta?.title || 'Админ-панель')

const userInitial = computed(() => {
  return user.value?.name?.charAt(0)?.toUpperCase() || 'A'
})

const menuItems = [
  { label: 'На сайт', action: 'home', icon: 'home' },
  { label: 'Настройки', action: 'settings', icon: 'settings' },
  { type: 'divider' },
  { label: 'Выйти', action: 'logout', danger: true, icon: 'logout' }
]

function handleSelect(item) {
  if (item.action === 'logout') {
    authStore.logout()
    router.push('/')
  } else if (item.action === 'home') {
    router.push('/')
  } else if (item.action === 'settings') {
    router.push('/profile/edit')
  }
}
</script>

<template>
  <header class="cv-aheader">
    <div class="cv-aheader__glow" aria-hidden="true"></div>
    <div class="cv-aheader__carbon" aria-hidden="true"></div>

    <div class="cv-aheader__inner">
      <button
        type="button"
        class="cv-aheader__toggle"
        aria-label="Toggle sidebar"
        @click="emit('toggle-sidebar')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
      </button>

      <div class="cv-aheader__breadcrumb">
        <span class="cv-aheader__breadcrumb-prefix" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
        <span class="cv-aheader__breadcrumb-label">Админ</span>
        <span class="cv-aheader__breadcrumb-sep" aria-hidden="true">/</span>
        <span class="cv-aheader__breadcrumb-current">{{ pageTitle }}</span>
      </div>

      <div class="cv-aheader__actions">
        <div class="cv-aheader__status">
          <span class="cv-aheader__status-dot" aria-hidden="true"></span>
          <span class="cv-aheader__status-text">Онлайн</span>
        </div>

        <BaseDropdown :items="menuItems" placement="bottom-end" @select="handleSelect">
          <template #trigger>
            <button type="button" class="cv-aheader__user">
              <span class="cv-aheader__avatar">
                <span class="cv-aheader__avatar-inner">{{ userInitial }}</span>
                <span class="cv-aheader__avatar-dot" aria-hidden="true"></span>
              </span>

              <span class="cv-aheader__user-info">
                <span class="cv-aheader__user-name">{{ user?.name || 'Администратор' }}</span>
                <span class="cv-aheader__user-role">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2l2.5 2 3.5-.5L19.5 7l3 1.5-.5 3.5L24 14.5 22 17l.5 3.5-3 1.5-1.5 3-3.5-.5L12 26l-2.5-2-3.5.5L4.5 21.5 1.5 20l.5-3.5L0 14l2-2.5L1.5 8l3-1.5L6 3.5 9.5 4z" transform="scale(0.85) translate(2 2)"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                  Администратор
                </span>
              </span>

              <span class="cv-aheader__chevron" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </span>
            </button>
          </template>
        </BaseDropdown>
      </div>
    </div>

    <span class="cv-aheader__accent-line" aria-hidden="true"></span>
  </header>
</template>

<style scoped>
.cv-aheader {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 68px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.6) 0%, rgba(15, 13, 10, 0.75) 100%),
    linear-gradient(180deg, #12121A 0%, #0E0E14 100%);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border-bottom: 1px solid rgba(201, 169, 97, 0.16);
  isolation: isolate;
  overflow: hidden;
}

.cv-aheader__glow {
  position: absolute;
  top: -80px;
  right: 10%;
  width: 320px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.16), transparent 70%);
  filter: blur(70px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.75;
}

.cv-aheader__carbon {
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
}

.cv-aheader__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
  padding: 0 24px;
}

.cv-aheader__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.15);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aheader__toggle:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-aheader__toggle:active {
  transform: translateY(0) scale(0.96);
}

.cv-aheader__toggle:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-aheader__breadcrumb {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
}

.cv-aheader__breadcrumb-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-aheader__breadcrumb-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.65);
}

.cv-aheader__breadcrumb-sep {
  color: rgba(201, 169, 97, 0.35);
  font-weight: 600;
}

.cv-aheader__breadcrumb-current {
  color: rgba(245, 240, 230, 0.9);
  font-weight: 650;
  letter-spacing: 0.05px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.cv-aheader__actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-aheader__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.2px;
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.12), rgba(122, 154, 106, 0.03));
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-aheader__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvAdminPulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvAdminPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-aheader__status-text {
  white-space: nowrap;
}

.cv-aheader__user {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  font-family: inherit;
  color: rgba(245, 240, 230, 0.9);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aheader__user:hover {
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(201, 169, 97, 0.12);
}

.cv-aheader__user:active {
  transform: translateY(0) scale(0.98);
}

.cv-aheader__user:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
}

.cv-aheader__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.cv-aheader__avatar-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 50%;
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 14px rgba(201, 169, 97, 0.3),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
  transition: all 0.25s ease;
}

.cv-aheader__user:hover .cv-aheader__avatar-inner {
  transform: scale(1.04);
  box-shadow:
    0 0 0 1.5px rgba(232, 213, 160, 0.7),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 6px 20px rgba(201, 169, 97, 0.5),
    0 1px 0 rgba(255, 245, 214, 0.6) inset;
}

.cv-aheader__avatar-dot {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  border: 2px solid #121215;
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.75);
  z-index: 2;
}

.cv-aheader__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  line-height: 1.2;
  min-width: 0;
}

.cv-aheader__user-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.cv-aheader__user-role {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(232, 213, 160, 0.75);
}

.cv-aheader__user-role svg {
  color: #C9A961;
  flex-shrink: 0;
}

.cv-aheader__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-aheader__user:hover .cv-aheader__chevron {
  color: #E8D5A0;
  transform: translateY(1px);
}

.cv-aheader__accent-line {
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

@media (max-width: 900px) {
  .cv-aheader__status {
    display: none;
  }

  .cv-aheader__user-name {
    max-width: 120px;
  }

  .cv-aheader__breadcrumb-current {
    max-width: 200px;
  }
}

@media (max-width: 640px) {
  .cv-aheader {
    height: 60px;
  }

  .cv-aheader__inner {
    padding: 0 14px;
    gap: 10px;
  }

  .cv-aheader__toggle {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .cv-aheader__breadcrumb-current {
    max-width: 140px;
    font-size: 12px;
  }

  .cv-aheader__user {
    padding: 5px;
    border-radius: 11px;
    gap: 0;
  }

  .cv-aheader__user-info {
    display: none;
  }

  .cv-aheader__chevron {
    display: none;
  }

  .cv-aheader__avatar {
    width: 34px;
    height: 34px;
  }

  .cv-aheader__avatar-inner {
    font-size: 13px;
  }
}
</style>