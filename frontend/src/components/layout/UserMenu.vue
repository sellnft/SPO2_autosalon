<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDropdown from '@/components/common/BaseDropdown.vue'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { label: 'Мой профиль', to: '/profile', icon: 'user' },
  { label: 'Мои объявления', to: '/profile/announcements', icon: 'list' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Настройки', to: '/profile/edit', icon: 'settings' },
  { type: 'divider' },
  { label: 'Выйти', action: 'logout', danger: true, icon: 'logout' }
]

function handleSelect(item) {
  if (item.action === 'logout') {
    authStore.logout()
    router.push('/')
  } else if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <BaseDropdown :items="menuItems" @select="handleSelect">
    <template #trigger>
      <button class="cv-user__trigger">
        <span class="cv-user__avatar">
          <span class="cv-user__avatar-inner">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </span>
          <span class="cv-user__status" aria-hidden="true"></span>
        </span>

        <span class="cv-user__text">
          <span class="cv-user__name">{{ authStore.user?.name }}</span>
          <span class="cv-user__role">Premium member</span>
        </span>

        <span class="cv-user__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </span>
      </button>
    </template>
  </BaseDropdown>
</template>

<style scoped>
.cv-user__trigger {
  --cv-bronze: #C9A961;
  --cv-bronze-light: #E8D5A0;
  --cv-bronze-dark: #8B6F3F;
  --cv-copper: #B87755;
  --cv-text: rgba(245, 240, 230, 0.92);
  --cv-text-2: rgba(220, 210, 195, 0.5);
  --cv-border-soft: rgba(255, 255, 255, 0.06);

  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--cv-border-soft);
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-user__trigger:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.28);
  transform: translateY(-1px);
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-user__trigger:active {
  transform: translateY(0) scale(0.98);
}

.cv-user__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}

.cv-user__avatar-inner {
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
    0 2px 10px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.5) inset;
  transition: all 0.25s ease;
}

.cv-user__trigger:hover .cv-user__avatar-inner {
  box-shadow:
    0 0 0 1.5px rgba(232, 213, 160, 0.7),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 16px rgba(201, 169, 97, 0.55),
    0 1px 0 rgba(255, 255, 255, 0.6) inset;
  transform: scale(1.03);
}

.cv-user__status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8A88A, #B87755);
  border: 2px solid #121215;
  box-shadow: 0 0 8px rgba(184, 119, 85, 0.7);
  z-index: 2;
}

.cv-user__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
  max-width: 140px;
}

.cv-user__name {
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.15px;
  line-height: 1.1;
  color: var(--cv-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: color 0.2s ease;
}

.cv-user__trigger:hover .cv-user__name {
  color: var(--cv-bronze-light);
}

.cv-user__role {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  line-height: 1;
  color: var(--cv-text-2);
  background: linear-gradient(135deg, #F5E6BC, #C9A961 55%, #8B6F3F);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  opacity: 0.85;
}

.cv-user__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cv-text-2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.cv-user__trigger:hover .cv-user__chevron {
  color: var(--cv-bronze-light);
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .cv-user__text { display: none; }
  .cv-user__trigger {
    padding: 4px;
    border-radius: 12px;
  }
  .cv-user__avatar {
    width: 36px;
    height: 36px;
  }
  .cv-user__chevron { display: none; }
}

@media (max-width: 400px) {
  .cv-user__avatar { width: 34px; height: 34px; }
  .cv-user__avatar-inner { font-size: 13px; }
}
</style>