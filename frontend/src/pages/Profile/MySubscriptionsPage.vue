<script setup>
import { ref, onMounted } from 'vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const subscriptionsStore = useSubscriptionsStore()
const announcementsStore = useAnnouncementsStore()
const loading = ref(true)

const subscribedAnnouncements = ref([])

onMounted(async () => {
  try {
    await subscriptionsStore.fetchSubscriptions()
    await announcementsStore.fetchAnnouncements()
    
    subscribedAnnouncements.value = announcementsStore.announcements.filter(
      a => subscriptionsStore.subscriptions.some(s => s.announcementId === a.id)
    )
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="my-subscriptions-page">
    <div class="container">
      <h1 class="my-subscriptions-page__title">Мои подписки</h1>
      
      <EmptyState
        v-if="!loading && !subscribedAnnouncements.length"
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
  padding: 40px 0;
}

.my-subscriptions-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
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
}
</style>