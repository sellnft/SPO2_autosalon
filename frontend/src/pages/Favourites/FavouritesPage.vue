<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFavouritesStore } from '@/stores/favourites'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const favouritesStore = useFavouritesStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)

const favouriteAnnouncements = computed(() => {
  const ids = favouritesStore.favourites.map(f => f.announcementId)
  return announcementsStore.announcements.filter(a => ids.includes(a.id))
})

onMounted(async () => {
  try {
    await Promise.all([
      favouritesStore.fetchFavourites(),
      announcementsStore.fetchAnnouncements({ perPage: 100 })
    ])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="favourites-page">
    <div class="container">
      <Breadcrumbs />
      
      <div class="favourites-page__header">
        <h1 class="favourites-page__title">Избранное</h1>
        <p class="favourites-page__count">
          {{ favouriteAnnouncements.length }} объявлений
        </p>
      </div>
      
      <div v-if="loading" class="favourites-page__grid">
        <AnnouncementSkeleton v-for="i in 6" :key="i" />
      </div>
      
      <EmptyState
        v-else-if="!favouriteAnnouncements.length"
        icon="heart"
        title="В избранном пусто"
        description="Добавляйте понравившиеся автомобили, чтобы не потерять их"
        action-text="Перейти в каталог"
        action-link="/announcements"
      />
      
      <div v-else class="favourites-page__grid">
        <AnnouncementCard
          v-for="announcement in favouriteAnnouncements"
          :key="announcement.id"
          :announcement="announcement"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.favourites-page {
  padding: 20px 0 40px;
}

.favourites-page__header {
  margin-bottom: 32px;
}

.favourites-page__title {
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
}

.favourites-page__count {
  font-size: 14px;
  color: #6B7280;
}

.favourites-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .favourites-page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .favourites-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>