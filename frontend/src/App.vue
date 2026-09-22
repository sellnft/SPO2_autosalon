<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFavouritesStore } from '@/stores/favourites'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useNotificationsStore } from '@/stores/notifications'
import { useChatStore } from '@/stores/chat'
import { useToastStore } from '@/stores/toast'
import config from '@/config'

const router = useRouter()
const authStore = useAuthStore()
const favouritesStore = useFavouritesStore()
const subscriptionsStore = useSubscriptionsStore()
const notificationsStore = useNotificationsStore()
const chatStore = useChatStore()
const toastStore = useToastStore()

/* ============================================================
 *  Внутренние хелперы
 * ============================================================ */

function log(...args) {
  if (config.debug.enableLogs) {
    console.log('%c[App]', 'color:#C9A961;font-weight:bold', ...args)
  }
}

/**
 * Загрузить пользовательские данные параллельно.
 * allSettled — чтобы падение одного не блокировало остальные.
 */
async function preloadUserData() {
  if (!authStore.isAuthenticated) return

  log('Preloading user data…')

  const results = await Promise.allSettled([
    favouritesStore.fetchFavourites(),
    subscriptionsStore.fetchSubscriptions(),
    notificationsStore.fetchNotifications(),
    notificationsStore.fetchUnreadCount?.()
  ])

  // Логируем неудачи, но не падаем
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const names = ['favourites', 'subscriptions', 'notifications', 'unreadCount']
      console.warn(`[App] preload ${names[i]} failed:`, r.reason?.message || r.reason)
    }
  })

  log('Preload done')
}

/**
 * Сбросить все пользовательские сторы (при logout).
 */
function resetUserStores() {
  log('Resetting user stores')
  favouritesStore.reset()
  subscriptionsStore.reset()
  notificationsStore.reset()
  chatStore.reset()
}

/* ============================================================
 *  Auth events
 * ============================================================ */

function handleAuthExpired() {
  log('Session expired')
  // Уже разлогиниваемся и редиректим
  authStore.reset?.()
  resetUserStores()
  toastStore.error('Сессия истекла, войдите заново')

  const redirect = router.currentRoute.value.fullPath
  router.push({
    name: 'login',
    query: redirect && redirect !== '/' ? { redirect } : undefined
  })
}

/* ============================================================
 *  Network events
 * ============================================================ */

let offlineToastId = null

function handleOnline() {
  log('Network online')
  if (offlineToastId) {
    toastStore.remove(offlineToastId)
    offlineToastId = null
  }
  toastStore.success('Соединение восстановлено', '', { duration: 2000 })

  // Обновляем данные, которые могли устареть
  if (authStore.isAuthenticated) {
    notificationsStore.fetchUnreadCount?.()
  }
}

function handleOffline() {
  log('Network offline')
  offlineToastId = toastStore.show({
    type: 'warning',
    message: 'Нет подключения к сети',
    sticky: true
  })
}

/* ============================================================
 *  Watch пользователя — сброс/перезагрузка при смене
 * ============================================================ */

watch(
  () => authStore.user?.id,
  async (newId, oldId) => {
    if (newId === oldId) return

    log('User changed:', oldId, '→', newId)

    // Сбрасываем старые данные
    resetUserStores()

    // Загружаем новые
    if (newId) {
      await preloadUserData()
    }
  }
)

/* ============================================================
 *  Lifecycle
 * ============================================================ */

onMounted(async () => {
  // Регистрация глобальных слушателей
  window.addEventListener('cv:auth-expired', handleAuthExpired)
  window.addEventListener('cv:network-online', handleOnline)
  window.addEventListener('cv:network-offline', handleOffline)

  // Первичная загрузка
  await preloadUserData()
})

onUnmounted(() => {
  window.removeEventListener('cv:auth-expired', handleAuthExpired)
  window.removeEventListener('cv:network-online', handleOnline)
  window.removeEventListener('cv:network-offline', handleOffline)
})
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.meta?.layoutKey || route.path" />
  </router-view>
</template>

<style>
/* ============================================================
 *  #app — контейнер приложения
 *  isolation: isolate создаёт stacking context,
 *  чтобы внутренние z-index'ы не убегали наружу.
 * ============================================================ */

#app {
  position: relative;
  min-height: 100vh;
  isolation: isolate;
}

/* ============================================================
 *  Teleport-контейнеры должны быть выше #app.
 *  Точнее — мы полагаемся на высокие z-index из компонентов.
 * ============================================================ */

body > .cv-modal-overlay,
body > .cv-toasts,
body > .cv-toast-container,
body > .cv-legal,
body > .cv-drawer-overlay,
body > .cv-confirm-overlay {
  position: fixed;
  z-index: 1000;
}

/* Modal выше toast — тосты не перекрывают модалку */
body > .cv-toasts,
body > .cv-toast-container {
  z-index: 1100;
}

/* Confirm выше всего — это блокирующее действие */
body > .cv-confirm-overlay {
  z-index: 1200;
}
</style>