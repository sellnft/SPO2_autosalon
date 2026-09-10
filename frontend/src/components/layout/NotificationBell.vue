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
  <div ref="dropdownRef" class="notification-bell">
    <button
      class="notification-bell__trigger"
      :aria-label="`Уведомления: ${unreadCount}`"
      @click="toggleDropdown"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M15 6a5 5 0 10-10 0c0 6-2 7-2 7h14s-2-1-2-7zM8 17a2 2 0 004 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      
      <span v-if="unreadCount" class="notification-bell__badge">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="notification-bell__dropdown">
        <div class="notification-bell__header">
          <h3 class="notification-bell__title">Уведомления</h3>
          <span v-if="unreadCount" class="notification-bell__count">
            {{ unreadCount }} новых
          </span>
        </div>
        
        <div class="notification-bell__list">
          <NotificationItem
            v-for="n in recentNotifications"
            :key="n.id"
            :notification="n"
            @click="isOpen = false"
          />
          
          <div v-if="!recentNotifications.length" class="notification-bell__empty">
            Нет уведомлений
          </div>
        </div>
        
        <button class="notification-bell__footer" @click="goToAll">
          Все уведомления
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
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
  background: none;
  border: none;
  cursor: pointer;
}

.notification-bell__trigger:hover {
  background: #F3F4F6;
  color: #111827;
}

.notification-bell__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: #EF4444;
  border-radius: 10px;
  border: 2px solid white;
}

.notification-bell__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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

.notification-bell__count {
  font-size: 12px;
  font-weight: 500;
  color: #0A84FF;
}

.notification-bell__list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-bell__empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 14px;
  color: #9CA3AF;
}

.notification-bell__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 14px;
  font-size: 13px;
  font-weight: 500;
  color: #0A84FF;
  background: #F9FAFB;
  border: none;
  border-top: 1px solid #E5E7EB;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-bell__footer:hover {
  background: #F0F7FF;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .notification-bell__dropdown {
    position: fixed;
    top: 70px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>