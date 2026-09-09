<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementGallery from '@/components/announcements/AnnouncementGallery.vue'
import AnnouncementInfo from '@/components/announcements/AnnouncementInfo.vue'
import AnnouncementPrice from '@/components/announcements/AnnouncementPrice.vue'
import AnnouncementActions from '@/components/announcements/AnnouncementActions.vue'
import AnnouncementSeller from '@/components/announcements/AnnouncementSeller.vue'
import AnnouncementSpecs from '@/components/announcements/AnnouncementSpecs.vue'
import AnnouncementDescription from '@/components/announcements/AnnouncementDescription.vue'
import AnnouncementLocation from '@/components/announcements/AnnouncementLocation.vue'
import AnnouncementShare from '@/components/announcements/AnnouncementShare.vue'
import AnnouncementStatus from '@/components/announcements/AnnouncementStatus.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const error = ref(null)

async function loadAnnouncement() {
  loading.value = true
  error.value = null
  try {
    await announcementsStore.fetchAnnouncement(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnnouncement()
})
</script>

<template>
  <div class="announcement-page">
    <div class="container">
      <Breadcrumbs />
      
      <!-- Loading -->
      <div v-if="loading" class="announcement-page__loading">
        <BaseLoader size="lg" text="Загрузка объявления..." />
      </div>
      
      <!-- Error -->
      <ErrorMessage
        v-else-if="error"
        :message="error"
        retry
        @retry="loadAnnouncement"
      />
      
      <!-- Content -->
      <template v-else-if="announcementsStore.currentAnnouncement">
        <div class="announcement-page__header">
          <div class="announcement-page__title-row">
            <AnnouncementInfo :announcement="announcementsStore.currentAnnouncement" />
            <AnnouncementStatus :status="announcementsStore.currentAnnouncement.status" />
          </div>
          
          <div class="announcement-page__actions">
            <AnnouncementActions :announcement="announcementsStore.currentAnnouncement" />
            <AnnouncementShare :announcement-id="announcementsStore.currentAnnouncement.id" />
          </div>
        </div>
        
        <div class="announcement-page__content">
          <div class="announcement-page__main">
            <AnnouncementGallery :photos="announcementsStore.currentAnnouncement.photos" />
            
            <AnnouncementSpecs :announcement="announcementsStore.currentAnnouncement" />
            
            <AnnouncementDescription :description="announcementsStore.currentAnnouncement.description" />
          </div>
          
          <aside class="announcement-page__sidebar">
            <div class="announcement-page__price-card">
              <AnnouncementPrice :price="announcementsStore.currentAnnouncement.price" />
              <AnnouncementLocation :city="announcementsStore.currentAnnouncement.city" />
            </div>
            
            <AnnouncementSeller :announcement="announcementsStore.currentAnnouncement" />
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.announcement-page {
  padding: 20px 0 40px;
  min-height: 100vh;
}

.announcement-page__loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.announcement-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.announcement-page__title-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.announcement-page__actions {
  display: flex;
  gap: 8px;
}

.announcement-page__content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

.announcement-page__main {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.announcement-page__sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.announcement-page__price-card {
  padding: 24px;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1024px) {
  .announcement-page__content {
    grid-template-columns: 1fr;
  }
  
  .announcement-page__sidebar {
    order: -1;
  }
}

@media (max-width: 640px) {
  .announcement-page__header {
    flex-direction: column;
    gap: 16px;
  }
  
  .announcement-page__actions {
    width: 100%;
  }
}
</style>