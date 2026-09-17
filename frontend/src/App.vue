<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFavouritesStore } from '@/stores/favourites'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useNotificationsStore } from '@/stores/notifications'

const authStore = useAuthStore()
const favouritesStore = useFavouritesStore()
const subscriptionsStore = useSubscriptionsStore()
const notificationsStore = useNotificationsStore()

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await Promise.all([
        favouritesStore.fetchFavourites(),
        subscriptionsStore.fetchSubscriptions(),
        notificationsStore.fetchNotifications()
      ])
    } catch (err) {
      console.error('Failed to preload user data:', err)
    }
  }
})
</script>

<template>
  <router-view />
</template>

<style>
#app {
  position: relative;
  min-height: 100vh;
  isolation: auto;
}

body {
  position: relative;
}

/* Гарантируем, что Teleport-элементы в body находятся ВЫШЕ #app */
body > .cv-modal-overlay,
body > .cv-toasts,
body > .cv-legal,
body > .cv-drawer-overlay {
  position: fixed;
}
</style>