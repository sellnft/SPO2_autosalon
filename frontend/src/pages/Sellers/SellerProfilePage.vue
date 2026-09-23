<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDate } from '@/utils/formatDate'

defineOptions({ name: 'SellerProfilePage' })

const props = defineProps({
  id: { type: [String, Number], required: true }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const seller = ref(null)
const sellerAnnouncements = ref([])

const sellerId = computed(() => Number(props.id))

const isOwnProfile = computed(() =>
  authStore.user?.id && authStore.user.id === sellerId.value
)

const initials = computed(() => seller.value?.name?.charAt(0)?.toUpperCase() || '?')

const activeAnnouncements = computed(() =>
  sellerAnnouncements.value.filter(a => a.status === 'active')
)

const soldAnnouncements = computed(() =>
  sellerAnnouncements.value.filter(a => a.status === 'sold')
)

async function loadSeller() {
  if (!sellerId.value || Number.isNaN(sellerId.value)) {
    router.replace({ name: 'not-found' })
    return
  }

  loading.value = true
  try {
    // Продавец — это user. Тянем из adminStore.users (публичный список seller'ов можно вынести отдельно)
    if (!adminStore.users.length) {
      await adminStore.fetchUsers()
    }
    seller.value = adminStore.users.find(u => u.id === sellerId.value) || null

    if (!seller.value) {
      router.replace({ name: 'not-found' })
      return
    }

    await announcementsStore.fetchAnnouncements({ sellerId: sellerId.value, perPage: 100 })
    sellerAnnouncements.value = announcementsStore.announcements.filter(
      a => a.sellerId === sellerId.value
    )
  } catch (err) {
    console.error('Failed to load seller:', err)
  } finally {
    loading.value = false
  }
}

function goToChat() {
  router.push({ name: 'chat', query: { to: sellerId.value } })
}

function goToAnnouncement(a) {
  router.push({ name: 'announcement-detail', params: { id: a.id } })
}

onMounted(loadSeller)
watch(() => route.params.id, loadSeller)
</script>

<template>
  <div class="cv-sp">
    <button class="cv-sp__back" type="button" @click="router.back()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Назад
    </button>

    <!-- SKELETON -->
    <template v-if="loading">
      <div class="cv-sp__card">
        <div class="cv-sp__skeleton cv-sp__skeleton--avatar"></div>
        <div class="cv-sp__skeleton-lines">
          <div class="cv-sp__skeleton cv-sp__skeleton--line cv-sp__skeleton--w40"></div>
          <div class="cv-sp__skeleton cv-sp__skeleton--line cv-sp__skeleton--w30"></div>
          <div class="cv-sp__skeleton cv-sp__skeleton--line cv-sp__skeleton--w25"></div>
        </div>
      </div>
    </template>

    <template v-else-if="seller">
      <!-- PROFILE CARD -->
      <section class="cv-sp__card">
        <header class="cv-sp__header">
          <div class="cv-sp__avatar">
            <span class="cv-sp__avatar-inner">{{ initials }}</span>
            <span v-if="seller.status === 'active'" class="cv-sp__avatar-dot" aria-hidden="true"></span>
          </div>

          <div class="cv-sp__info">
            <div class="cv-sp__name-row">
              <h1 class="cv-sp__name">{{ seller.name }}</h1>
              <span v-if="seller.role === 'admin'" class="cv-sp__role-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                </svg>
                Проверенный
              </span>
            </div>

            <p class="cv-sp__meta">
              <span class="cv-sp__meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
                  <circle cx="12" cy="10" r="2.5"/>
                </svg>
                {{ seller.city || 'Город не указан' }}
              </span>
              <span class="cv-sp__meta-sep" aria-hidden="true">·</span>
              <span class="cv-sp__meta-item">
                На CarVibe с {{ formatDate(seller.createdAt, 'long') }}
              </span>
            </p>
          </div>

          <div class="cv-sp__actions">
            <BaseButton v-if="!isOwnProfile" @click="goToChat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              </svg>
              Написать
            </BaseButton>
            <BaseButton v-else variant="outline" @click="router.push('/profile/edit')">
              Редактировать
            </BaseButton>
          </div>
        </header>

        <div class="cv-sp__stats">
          <div class="cv-sp__stat">
            <span class="cv-sp__stat-value">{{ activeAnnouncements.length }}</span>
            <span class="cv-sp__stat-label">Активных</span>
          </div>
          <div class="cv-sp__stat">
            <span class="cv-sp__stat-value">{{ soldAnnouncements.length }}</span>
            <span class="cv-sp__stat-label">Продано</span>
          </div>
          <div class="cv-sp__stat">
            <span class="cv-sp__stat-value">{{ sellerAnnouncements.length }}</span>
            <span class="cv-sp__stat-label">Всего</span>
          </div>
        </div>
      </section>

      <!-- ANNOUNCEMENTS -->
      <section class="cv-sp__section">
        <header class="cv-sp__section-head">
          <h2 class="cv-sp__section-title">
            Объявления продавца
            <span class="cv-sp__count">{{ activeAnnouncements.length }}</span>
          </h2>
        </header>

        <div v-if="!activeAnnouncements.length" class="cv-sp__empty">
          <p class="cv-sp__empty-title">У продавца нет активных объявлений</p>
          <p class="cv-sp__empty-hint">Загляните позже — возможно, появится что-то интересное</p>
        </div>

        <div v-else class="cv-sp__grid">
          <AnnouncementCard
            v-for="a in activeAnnouncements"
            :key="a.id"
            :announcement="a"
            @click="goToAnnouncement(a)"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.cv-sp {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-sp__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 8px 14px 8px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-sp__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateX(-2px);
}

.cv-sp__card {
  padding: 28px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-sp__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-sp__header {
  display: flex;
  align-items: center;
  gap: 22px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  flex-wrap: wrap;
}

.cv-sp__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.5),
    0 0 0 5px rgba(10, 10, 12, 0.95),
    0 8px 32px rgba(201, 169, 97, 0.35);
}

.cv-sp__avatar-inner {
  font-size: 34px;
  font-weight: 800;
  color: #1A1208;
  letter-spacing: -0.5px;
}

.cv-sp__avatar-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  border: 3px solid #14141A;
  box-shadow: 0 0 12px rgba(122, 154, 106, 0.75);
}

.cv-sp__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-sp__name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-sp__name {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: rgba(245, 240, 230, 0.98);
}

.cv-sp__role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 999px;
}

.cv-sp__meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0;
  font-size: 13px;
  color: rgba(200, 190, 175, 0.65);
}

.cv-sp__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.cv-sp__meta-item svg {
  color: rgba(201, 169, 97, 0.55);
}

.cv-sp__meta-sep {
  color: rgba(200, 190, 175, 0.3);
}

.cv-sp__actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
}

.cv-sp__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-sp__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.cv-sp__stat-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-sp__stat-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-sp__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cv-sp__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.cv-sp__section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.2px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-sp__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 9px;
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 999px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-sp__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.cv-sp__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 40px 20px;
  text-align: center;
  border-radius: 12px;
  border: 1px dashed rgba(201, 169, 97, 0.16);
}

.cv-sp__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
}

.cv-sp__empty-hint {
  margin: 0;
  font-size: 12.5px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-sp__skeleton {
  position: relative;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.cv-sp__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.08) 50%, transparent);
  animation: cvSpShimmer 1.8s ease-in-out infinite;
}

@keyframes cvSpShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-sp__skeleton--avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cv-sp__skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-sp__skeleton--line { height: 14px; }
.cv-sp__skeleton--w40 { width: 40%; }
.cv-sp__skeleton--w30 { width: 30%; }
.cv-sp__skeleton--w25 { width: 25%; }

@media (max-width: 1024px) {
  .cv-sp__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .cv-sp { padding: 24px 20px 60px; }
  .cv-sp__header { flex-direction: column; align-items: flex-start; }
  .cv-sp__actions { width: 100%; }
  .cv-sp__actions > * { width: 100%; }
  .cv-sp__name { font-size: 22px; }
  .cv-sp__grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .cv-sp__stats { grid-template-columns: 1fr; }
}
</style>