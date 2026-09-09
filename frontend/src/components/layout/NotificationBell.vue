<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useRouter } from 'vue-router'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const isOpen = ref(false)
const dropdownRef = ref(null)

const unreadCount = computed(() => notificationsStore.unreadCount)
const notifications = computed(() => notificationsStore.notifications)

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    notificationsStore.markAsRead()
  }
}

function handleNotificationClick(notification) {
  if (notification.link) {
    router.push(notification.link)
  }
  isOpen.value = false
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="notification-bell">
    <button 
      class="notification-bell__trigger"
      @click="toggleDropdown"
      aria-label="Уведомления"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M15 6a5 5 0 10-10 0c0 6-2 7-2 7h14s-2-1-2-7zM8 17a2 2 0 004 0" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span v-if="unreadCount" class="notification-bell__badge">
        {{ unreadCount }}
      </span>
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="notification-bell__dropdown">
        <div class="notification-bell__header">
          <h4 class="notification-bell__title">Уведомления</h4>
          <button 
            v-if="unreadCount"
            class="notification-bell__mark-all"
            @click="notificationsStore.markAllAsRead"
          >
            Прочитать все
          </button>
        </div>
        
        <div v-if="notifications.length" class="notification-bell__list">
          <button
            v-for="notification in notifications.slice(0, 10)"
            :key="notification.id"
            :class="[
              'notification-bell__item',
              { 'notification-bell__item--unread': !notification.read }
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-bell__item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5v3M8 11h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="notification-bell__item-content">
              <p class="notification-bell__item-title">{{ notification.title }}</p>
              <p class="notification-bell__item-time">{{ notification.time }}</p>
            </div>
          </button>
        </div>
        
        <div v-else class="notification-bell__empty">
          Нет уведомлений
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notification-bell {
  position: relative;
}

.notification-bell__trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6B7280;
  border-radius: 10px;
  transition: all 0.2s;
}

.notification-bell__trigger:hover {
  background: #F3F4F6;
  color: #111827;
}

.notification-bell__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: #EF4444;
  border-radius: 8px;
}

.notification-bell__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-bell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.notification-bell__title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.notification-bell__mark-all {
  font-size: 13px;
  color: #0A84FF;
  transition: color 0.2s;
}

.notification-bell__mark-all:hover {
  color: #0066CC;
}

.notification-bell__list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-bell__item {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  transition: background 0.2s;
}

.notification-bell__item:hover {
  background: #F9FAFB;
}

.notification-bell__item--unread {
  background: #F0F7FF;
}

.notification-bell__item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #0A84FF;
  background: #DBEAFE;
  border-radius: 50%;
}

.notification-bell__item-content {
  flex: 1;
}

.notification-bell__item-title {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.notification-bell__item-time {
  font-size: 12px;
  color: #6B7280;
}

.notification-bell__empty {
  padding: 32px;
  text-align: center;
  font-size: 14px;
  color: #6B7280;
}

/* Transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .notification-bell__dropdown {
    position: fixed;
    top: 60px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>