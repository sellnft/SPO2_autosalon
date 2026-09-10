<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()

const menuItems = [
  {
    label: 'Обзор',
    to: '/admin',
    icon: 'dashboard'
  },
  {
    label: 'Пользователи',
    to: '/admin/users',
    icon: 'users'
  },
  {
    label: 'Объявления',
    to: '/admin/announcements',
    icon: 'car'
  },
  {
    label: 'Обращения',
    to: '/admin/feedback',
    icon: 'chat'
  },
  {
    label: 'Журнал действий',
    to: '/admin/audit-logs',
    icon: 'list'
  }
]

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside :class="['admin-sidebar', { 'admin-sidebar--closed': !isOpen }]">
    <div class="admin-sidebar__brand">
      <RouterLink to="/admin" class="admin-sidebar__logo">
        <span class="admin-sidebar__logo-mark">AP</span>
        <span class="admin-sidebar__logo-text">Admin</span>
      </RouterLink>
    </div>
    
    <nav class="admin-sidebar__nav">
      <RouterLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'admin-sidebar__link',
          { 'admin-sidebar__link--active': isActive(item.to) }
        ]"
      >
        <span class="admin-sidebar__icon">
          <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
            <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else-if="item.icon === 'users'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="item.icon === 'car'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 17h14M5 17a2 2 0 100 4 2 2 0 000-4zM19 17a2 2 0 100 4 2 2 0 000-4zM3 17V9l2-6h14l2 6v8M3 13h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="item.icon === 'chat'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="admin-sidebar__label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    
    <div class="admin-sidebar__footer">
      <RouterLink to="/" class="admin-sidebar__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        На сайт
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  flex-shrink: 0;
  background: #0F0F10;
  color: #E5E7EB;
  transition: width 0.3s ease, transform 0.3s ease;
}

.admin-sidebar--closed {
  width: 72px;
}

.admin-sidebar__brand {
  padding: 24px 20px;
  border-bottom: 1px solid #1F1F22;
}

.admin-sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.admin-sidebar__logo-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 800;
  color: #0F0F10;
  background: linear-gradient(135deg, #C8A96E, #A88650);
  border-radius: 8px;
  letter-spacing: 1px;
}

.admin-sidebar__logo-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.admin-sidebar--closed .admin-sidebar__logo-text {
  display: none;
}

.admin-sidebar__nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.admin-sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #9CA3AF;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}

.admin-sidebar__link:hover {
  color: #E5E7EB;
  background: #1A1A1D;
}

.admin-sidebar__link--active {
  color: #C8A96E;
  background: rgba(200, 169, 110, 0.1);
}

.admin-sidebar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-sidebar--closed .admin-sidebar__label {
  display: none;
}

.admin-sidebar--closed .admin-sidebar__link {
  justify-content: center;
}

.admin-sidebar__footer {
  padding: 16px 12px;
  border-top: 1px solid #1F1F22;
}

.admin-sidebar__back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #6B7280;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
}

.admin-sidebar__back:hover {
  color: #E5E7EB;
  background: #1A1A1D;
}

.admin-sidebar--closed .admin-sidebar__back {
  justify-content: center;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 50;
    transform: translateX(0);
  }

  .admin-sidebar--closed {
    transform: translateX(-100%);
    width: 260px;
  }
}
</style>