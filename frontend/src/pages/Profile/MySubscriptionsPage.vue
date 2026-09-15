<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const subscriptionsStore = useSubscriptionsStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)

const subscribedAnnouncements = computed(() => {
  const ids = subscriptionsStore.subscribedIds
  return announcementsStore.announcements.filter(a => ids.includes(a.id))
})

onMounted(async () => {
  try {
    await Promise.all([
      subscriptionsStore.fetchSubscriptions(),
      announcementsStore.fetchAnnouncements({ perPage: 100 })
    ])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="my-subscriptions-page">
    <div class="container">
      <Breadcrumbs />

      <div class="my-subscriptions-page__header">
        <h1 class="my-subscriptions-page__title">Мои подписки</h1>
        <p class="my-subscriptions-page__subtitle">
          {{ subscribedAnnouncements.length }} объявлений
        </p>
      </div>

      <BaseLoader v-if="loading" text="Загрузка..." />

      <EmptyState
        v-else-if="!subscribedAnnouncements.length"
        icon="heart"
        title="Нет подписок"
        description="Подписывайтесь на объявления, чтобы следить за изменениями"
        action-text="Перейти в каталог"
        action-link="/announcements"
      />

      <div v-else class="my-subscriptions-page__grid">
        <AnnouncementCard
          v-for="announcement in subscribedAnnouncements"
          :key="announcement.id"
          :announcement="announcement"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-subscriptions-page {
  padding: 20px 0 40px;
}

.my-subscriptions-page__header {
  margin-bottom: 32px;
}

.my-subscriptions-page__title {
  margin-bottom: 4px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.my-subscriptions-page__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.my-subscriptions-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .my-subscriptions-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .my-subscriptions-page__grid {
    grid-template-columns: 1fr;
  }

  .my-subscriptions-page__title {
    font-size: 24px;
  }
}
</style>