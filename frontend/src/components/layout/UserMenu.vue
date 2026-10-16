<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseDropdown from '@/components/common/BaseDropdown.vue'

const router = useRouter()
const authStore = useAuthStore()

/* ---------- Данные пользователя ---------- */

const displayName = computed(() => authStore.user?.name?.trim() || 'Пользователь')

const avatarLetter = computed(() => {
  const name = authStore.user?.name?.trim()
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
})

/**
 * Роль / статус показывается только если он реально есть у пользователя.
 * Поддержаны разные возможные формы хранения:
 *   - user.subscription.plan
 *   - user.plan
 *   - user.subscriptionPlan
 *   - user.isPremium
 *   - user.role
 * Если ничего не найдено — пустая строка, и весь блок роли не рендерится.
 */
const displayRole = computed(() => {
  const u = authStore.user
  if (!u) return ''

  const plan = u.subscription?.plan || u.plan || u.subscriptionPlan

  if (plan === 'premium' || u.isPremium === true) return 'Premium'
  if (plan === 'pro') return 'Pro'
  if (plan === 'basic') return 'Basic'

  if (u.role === 'admin') return 'Администратор'
  if (u.role === 'moderator') return 'Модератор'

  return ''
})

/* ---------- Меню ---------- */

const menuItems = [
  { label: 'Мой профиль', to: { name: 'profile' }, icon: 'user' },
  { label: 'Мои объявления', to: { name: 'my-announcements' }, icon: 'list' },
  { label: 'Избранное', to: { name: 'favourites' }, icon: 'heart' },
  { label: 'Уведомления', to: { name: 'notifications' }, icon: 'bell' },
  { label: 'Настройки уведомлений', to: { name: 'notification-settings' }, icon: 'bell-ring' },
  { label: 'Настройки', to: { name: 'profile-edit' }, icon: 'settings' },
  { type: 'divider' },
  { label: 'Выйти', action: 'logout', danger: true, icon: 'logout' }
]

function handleSelect(item) {
  if (item.action === 'logout') {
    authStore.logout()
    router.push({ name: 'home' })
  } else if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <BaseDropdown :items="menuItems" @select="handleSelect">
    <template #trigger>
      <button
        type="button"
        class="cv-user__trigger"
        :aria-label="`Меню пользователя: ${displayName}`"
      >
        <span class="cv-user__avatar">
          <span class="cv-user__avatar-inner" aria-hidden="true">
            {{ avatarLetter }}
          </span>
          <span class="cv-user__status" aria-hidden="true"></span>
        </span>

        <span class="cv-user__text">
          <span class="cv-user__name">{{ displayName }}</span>
          <span v-if="displayRole" class="cv-user__role">{{ displayRole }}</span>
        </span>

        <span class="cv-user__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
    </template>
  </BaseDropdown>
</template>

<style scoped>
/* ============================================================
   UserMenu
   - Роль отображается только при наличии данных (v-if в шаблоне)
   - Единые токены с остальными триггерами в шапке
   - focus-visible, prefers-reduced-motion
   ============================================================ */

.cv-user__trigger {
  /* Layout-токены */
  --cv-user-avatar-size: 34px;
  --cv-user-avatar-size-mobile: 36px;
  --cv-user-padding: 5px 12px 5px 5px;
  --cv-user-gap: 10px;
  --cv-user-radius: 14px;
  --cv-user-name-size: 13px;
  --cv-user-role-size: 10px;
  --cv-user-text-max-w: 140px;

  /* Палитра */
  --cv-bronze: #c9a961;
  --cv-bronze-light: #e8d5a0;
  --cv-bronze-dark: #8b6f3f;
  --cv-copper: #b87755;
  --cv-text: rgba(245, 240, 230, 0.92);
  --cv-text-2: rgba(220, 210, 195, 0.5);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-focus: var(--cv-bronze-light);

  display: inline-flex;
  align-items: center;
  gap: var(--cv-user-gap);
  padding: var(--cv-user-padding);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--cv-border-soft);
  border-radius: var(--cv-user-radius);
  cursor: pointer;
  font-family: inherit;
  transition:
    background 0.25s cubic-bezier(0.34, 1.2, 0.64, 1),
    border-color 0.25s cubic-bezier(0.34, 1.2, 0.64, 1),
    transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1),
    box-shadow 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
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

.cv-user__trigger:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
}

.cv-user__trigger:focus:not(:focus-visible) {
  outline: none;
}

/* ---------- Аватар ---------- */

.cv-user__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--cv-user-avatar-size);
  height: var(--cv-user-avatar-size);
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
  color: #1a1208;
  background: linear-gradient(135deg, #f5e6bc 0%, #c9a961 55%, #8b6f3f 100%);
  border-radius: 50%;
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 2px 10px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.5) inset;
  transition: box-shadow 0.25s ease;
}

.cv-user__trigger:hover .cv-user__avatar-inner {
  box-shadow:
    0 0 0 1.5px rgba(232, 213, 160, 0.7),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 16px rgba(201, 169, 97, 0.55),
    0 1px 0 rgba(255, 255, 255, 0.6) inset;
}

.cv-user__status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8a88a, #b87755);
  border: 2px solid #121215;
  box-shadow: 0 0 8px rgba(184, 119, 85, 0.7);
  z-index: 2;
}

/* ---------- Текст ---------- */

.cv-user__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  min-width: 0;
  max-width: var(--cv-user-text-max-w);
}

.cv-user__name {
  font-size: var(--cv-user-name-size);
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
  font-size: var(--cv-user-role-size);
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  line-height: 1;
  background: linear-gradient(135deg, #f5e6bc, #c9a961 55%, #8b6f3f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  opacity: 0.85;
}

/* ---------- Шеврон ---------- */

.cv-user__chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cv-text-2);
  flex-shrink: 0;
  transition:
    color 0.25s ease,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-user__trigger:hover .cv-user__chevron {
  color: var(--cv-bronze-light);
  transform: translateY(1px);
}

/* ---------- Адаптив ---------- */

@media (max-width: 768px) {
  .cv-user__trigger {
    padding: 4px;
    border-radius: 12px;
  }

  .cv-user__text {
    display: none;
  }

  .cv-user__avatar {
    width: var(--cv-user-avatar-size-mobile);
    height: var(--cv-user-avatar-size-mobile);
  }

  .cv-user__chevron {
    display: none;
  }
}

@media (max-width: 400px) {
  .cv-user__trigger {
    --cv-user-avatar-size-mobile: 34px;
  }

  .cv-user__avatar-inner {
    font-size: 13px;
  }
}

/* ============================================================
   Уважение к системным настройкам
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .cv-user__trigger,
  .cv-user__avatar-inner,
  .cv-user__name,
  .cv-user__chevron {
    transition-duration: 0.01ms !important;
  }

  .cv-user__trigger:hover,
  .cv-user__trigger:active {
    transform: none;
  }

  .cv-user__trigger:hover .cv-user__chevron {
    transform: none;
  }
}
</style>