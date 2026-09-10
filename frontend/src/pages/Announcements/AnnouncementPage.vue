<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatPrice'
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
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(true)
const error = ref(null)
const contactLoading = ref(false)

const announcement = computed(() => announcementsStore.currentAnnouncement)

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

async function contactSeller() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы написать продавцу')
    router.push({
      name: 'login',
      query: { redirect: route.fullPath }
    })
    return
  }

  contactLoading.value = true
  try {
    const chat = await chatStore.createOrOpenChat(
      announcement.value.id,
      announcement.value.sellerId
    )
    router.push({ name: 'chat-detail', params: { id: chat.id } })
  } catch (err) {
    toastStore.error('Не удалось открыть чат')
  } finally {
    contactLoading.value = false
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
      
      <div v-if="loading" class="announcement-page__loading">
        <BaseLoader size="lg" text="Загрузка объявления..." />
      </div>
      
      <ErrorMessage
        v-else-if="error"
        :message="error"
        retry
        @retry="loadAnnouncement"
      />
      
      <template v-else-if="announcement">
        <div class="announcement-page__header">
          <div class="announcement-page__title-row">
            <AnnouncementInfo :announcement="announcement" />
            <AnnouncementStatus :status="announcement.status" />
          </div>
          
          <div class="announcement-page__actions">
            <AnnouncementActions :announcement="announcement" />
            <AnnouncementShare :announcement-id="announcement.id" />
          </div>
        </div>
        
        <div class="announcement-page__content">
          <div class="announcement-page__main">
            <AnnouncementGallery :photos="announcement.photos" />
            
            <AnnouncementSpecs :announcement="announcement" />
            
            <AnnouncementDescription :description="announcement.description" />
          </div>
          
          <aside class="announcement-page__sidebar">
            <div class="announcement-page__price-card">
              <AnnouncementPrice :price="announcement.price" />
              <AnnouncementLocation :city="announcement.city" />
            </div>
            
            <AnnouncementSeller :announcement="announcement" />
          </aside>
        </div>
        
        <!-- Mobile Sticky CTA -->
        <div class="announcement-page__mobile-cta">
          <div class="announcement-page__mobile-price">
            {{ formatPrice(announcement.price) }}
          </div>
          <BaseButton
            size="lg"
            :loading="contactLoading"
            @click="contactSeller"
          >
            Написать
          </BaseButton>
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
  gap: 16px;
  margin-bottom: 24px;
}

.announcement-page__title-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.announcement-page__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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

.announcement-page__mobile-cta {
  display: none;
}

@media (max-width: 1024px) {
  .announcement-page__content {
    grid-template-columns: 1fr;
  }
  
  .announcement-page__sidebar {
    order: -1;
  }

  .announcement-page__mobile-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: fixed;
    bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    z-index: 80;
    padding: 12px 16px;
    background: white;
    border-top: 1px solid #E5E7EB;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  }

  .announcement-page__mobile-price {
    font-size: 20px;
    font-weight: 700;
    color: #0A84FF;
  }
}

@media (max-width: 640px) {
  .announcement-page__header {
    flex-direction: column;
  }
  
  .announcement-page__actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>