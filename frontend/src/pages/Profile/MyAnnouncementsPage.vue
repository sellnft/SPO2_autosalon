<script setup>
import { ref, onMounted } from 'vue'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementList from '@/components/announcements/AnnouncementList.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const announcementsStore = useAnnouncementsStore()
const loading = ref(true)

onMounted(async () => {
  try {
    await announcementsStore.fetchAnnouncements()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="my-announcements-page">
    <div class="container">
      <div class="my-announcements-page__header">
        <h1 class="my-announcements-page__title">Мои объявления</h1>
        <BaseButton @click="$router.push('/announcements/create')">
          + Создать объявление
        </BaseButton>
      </div>
      
      <div v-if="loading" class="my-announcements-page__grid">
        <AnnouncementSkeleton v-for="i in 3" :key="i" />
      </div>
      
      <EmptyState
        v-else-if="!announcementsStore.announcements.length"
        icon="car"
        title="У вас нет объявлений"
        description="Создайте первое объявление и начните продавать"
        action-text="Создать объявление"
        action-link="/announcements/create"
      />
      
      <AnnouncementList
        v-else
        :announcements="announcementsStore.announcements"
      />
    </div>
  </div>
</template>

<style scoped>
.my-announcements-page {
  padding: 40px 0;
}

.my-announcements-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.my-announcements-page__title {
  font-size: 32px;
  font-weight: 700;
}

.my-announcements-page__grid {
  display: grid;
  gap: 16px;
}
</style>