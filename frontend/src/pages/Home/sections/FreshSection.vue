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
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    items.value = res.items || []
  } catch (err) {
    console.error('[Home/Fresh] failed to load:', err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="fresh">
    <div class="fresh__container">
      <SectionHead eyebrow="Только что опубликовано" title="Свежие объявления" dot-variant="olive">
        <template #actions>
          <BaseButton
            variant="ghost"
            @click="router.push({ path: '/announcements', query: { sort: 'createdAt-desc' } })"
          >
            Смотреть все
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </BaseButton>
        </template>
      </SectionHead>

      <div class="fresh__grid">
        <template v-if="loading">
          <AnnouncementSkeleton v-for="i in 6" :key="`sk-${i}`" />
        </template>
        <template v-else-if="items.length">
          <AnnouncementCard v-for="a in items" :key="a.id" :announcement="a" />
        </template>
        <EmptyState
          v-else
          :title="error ? 'Не удалось загрузить свежие авто' : 'Пока нет свежих объявлений'"
          :hint="error ? 'Попробуйте обновить страницу позже' : 'Станьте первым — разместите объявление'"
          cta-label="Разместить"
          cta-to="/announcements/create"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.fresh {
  padding: var(--home-section-py, 96px) 0;
}
.fresh__container {
  max-width: var(--home-container-max, 1440px);
  margin: 0 auto;
  padding: 0 var(--home-container-px, 48px);
}
.fresh__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

@media (max-width: 1024px) {
  .fresh__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .fresh__grid { grid-template-columns: 1fr; gap: 14px; }
}
</style>