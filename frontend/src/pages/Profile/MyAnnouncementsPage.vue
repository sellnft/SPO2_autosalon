<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementList from '@/components/announcements/AnnouncementList.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)

const myAnnouncements = computed(() =>
  announcementsStore.announcements.filter(
    a => a.sellerId === authStore.user?.id
  )
)

onMounted(async () => {
  try {
    await announcementsStore.fetchAnnouncements({ perPage: 100 })
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="my-announcements-page">
    <div class="container">
      <Breadcrumbs />

      <div class="my-announcements-page__header">
        <div>
          <h1 class="my-announcements-page__title">Мои объявления</h1>
          <p class="my-announcements-page__subtitle">
            Всего: {{ myAnnouncements.length }}
          </p>
        </div>

        <BaseButton @click="$router.push('/announcements/create')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Создать объявление
        </BaseButton>
      </div>

      <div v-if="loading" class="my-announcements-page__grid">
        <AnnouncementSkeleton v-for="i in 3" :key="i" />
      </div>

      <EmptyState
        v-else-if="!myAnnouncements.length"
        icon="car"
        title="У вас нет объявлений"
        description="Создайте первое объявление и начните продавать"
        action-text="Создать объявление"
        action-link="/announcements/create"
      />

      <AnnouncementList v-else :announcements="myAnnouncements" />
    </div>
  </div>
</template>

<style scoped>
.my-announcements-page {
  padding: 20px 0 40px;
}

.my-announcements-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}

.my-announcements-page__title {
  margin-bottom: 4px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.my-announcements-page__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.my-announcements-page__grid {
  display: grid;
  gap: 16px;
}

@media (max-width: 640px) {
  .my-announcements-page__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .my-announcements-page__title {
    font-size: 24px;
  }
}
</style>