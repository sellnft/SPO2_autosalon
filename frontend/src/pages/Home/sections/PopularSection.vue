<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SectionHead from '../components/SectionHead.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const items = ref([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const res = await announcementsStore.fetchAnnouncements({
      perPage: 6,
      sortBy: 'views',
      sortOrder: 'desc'
    })
    items.value = res.items || []
  } catch (err) {
    console.error('[Home/Popular] failed to load:', err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="popular">
    <div class="popular__container">
      <SectionHead eyebrow="Топ по просмотрам" title="Популярные автомобили">
        <template #actions>
          <BaseButton variant="ghost" @click="router.push('/announcements')">
            Смотреть все
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </BaseButton>
        </template>
      </SectionHead>

      <div class="popular__grid">
        <template v-if="loading">
          <AnnouncementSkeleton v-for="i in 6" :key="`sk-${i}`" />
        </template>
        <template v-else-if="items.length">
          <AnnouncementCard
            v-for="a in items"
            :key="a.id"
            :announcement="a"
          />
        </template>
        <EmptyState
          v-else
          :title="error ? 'Не удалось загрузить популярные авто' : 'Пока нет популярных объявлений'"
          :hint="error ? 'Попробуйте обновить страницу позже' : 'Загляните в каталог — там уже есть объявления'"
          cta-label="В каталог"
          cta-to="/announcements"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.popular {
  padding: var(--home-section-py, 96px) 0;
}
.popular__container {
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.popular__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

@media (max-width: 1024px) {
  .popular__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .popular__grid { grid-template-columns: 1fr; gap: 14px; }
}
</style>