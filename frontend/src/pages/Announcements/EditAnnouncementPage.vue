<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useAnnouncementDraft } from '@/composables/useAnnouncementDraft'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import AnnouncementWizard from '@/components/announcements/wizard/AnnouncementWizard.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatPrice } from '@/utils/formatPrice'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()
const draftManager = useAnnouncementDraft()

const showCancelConfirm = ref(false)
const hasChanges = ref(false)
const loading = ref(true)

const announcementId = computed(() => route.params.id)

const announcement = computed(() => announcementsStore.currentAnnouncement)

const announcementTitle = computed(() => {
  const a = announcement.value
  if (!a) return 'Редактирование объявления'
  return `${a.brand || ''} ${a.model || ''}${a.year ? `, ${a.year}` : ''}`.trim() || 'Объявление'
})

const publishedDate = computed(() => {
  if (!announcement.value?.createdAt) return null
  return new Date(announcement.value.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long'
  })
})

const kpiChips = computed(() => {
  const a = announcement.value
  const chips = []

  if (a?.status) {
    const statusMap = {
      active: { text: 'Опубликовано', icon: 'check', color: 'success' },
      pending: { text: 'На модерации', icon: 'clock', color: 'warning' },
      rejected: { text: 'Отклонено', icon: 'x', color: 'danger' },
      sold: { text: 'Продано', icon: 'tag', color: 'neutral' }
    }
    const s = statusMap[a.status] || { text: a.status, icon: 'info', color: 'neutral' }
    chips.push(s)
  }

  if (a?.views) {
    chips.push({ text: `${a.views} просмотров`, icon: 'eye', color: 'accent' })
  }

  chips.push({ text: '8 шагов', icon: 'steps', color: 'neutral' })

  return chips
})

const breadcrumbItems = computed(() => {
  const a = announcement.value
  const title = a ? `${a.brand || ''} ${a.model || ''}`.trim() : 'Объявление'
  return [
    { label: 'Главная', to: '/' },
    { label: 'Мои объявления', to: '/profile/announcements' },
    { label: title, to: `/announcements/${announcementId.value}` },
    { label: 'Редактирование' }
  ]
})

const openAnnouncement = computed(() => `/announcements/${announcementId.value}`)

function goToAnnouncement() {
  router.push(openAnnouncement.value)
}

function handleCancelEdit() {
  if (hasChanges.value) {
    showCancelConfirm.value = true
  } else {
    router.push('/profile/announcements')
  }
}

function confirmCancel() {
  showCancelConfirm.value = false
  draftManager.clearDraft?.()
  router.push('/profile/announcements')
}

function goBack() {
  router.push('/profile/announcements')
}

async function loadAnnouncement() {
  loading.value = true
  try {
    await announcementsStore.fetchAnnouncement(announcementId.value)
  } catch (err) {
    // silent — визард сам обработает
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnnouncement()
})
</script>

<template>
  <div class="cv-edit">
    <div class="cv-edit__bg" aria-hidden="true">
      <div class="cv-edit__bg-orb cv-edit__bg-orb--1"></div>
      <div class="cv-edit__bg-orb cv-edit__bg-orb--2"></div>
      <div class="cv-edit__bg-grid"></div>
    </div>

    <div class="cv-edit__container">
      <Breadcrumbs :items="breadcrumbItems" />

      <header class="cv-edit__hero">
        <div class="cv-edit__hero-glow" aria-hidden="true"></div>

        <div class="cv-edit__hero-content">
          <span class="cv-edit__eyebrow">
            <span class="cv-edit__eyebrow-dot" aria-hidden="true"></span>
            Редактирование
          </span>

          <h1 class="cv-edit__title">{{ announcementTitle }}</h1>

          <div class="cv-edit__meta">
            <span class="cv-edit__meta-item">
              <span class="cv-edit__meta-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                </svg>
              </span>
              ID: #{{ announcementId }}
            </span>

            <template v-if="publishedDate">
              <span class="cv-edit__meta-dot" aria-hidden="true"></span>
              <span class="cv-edit__meta-item">
                <span class="cv-edit__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="14" rx="2"/>
                    <path d="M3 10h18M8 6V3M16 6V3"/>
                  </svg>
                </span>
                Опубликовано {{ publishedDate }}
              </span>
            </template>
          </div>

          <div class="cv-edit__chips">
            <span
              v-for="chip in kpiChips"
              :key="chip.text"
              class="cv-edit__chip"
              :data-color="chip.color"
            >
              <span class="cv-edit__chip-icon" aria-hidden="true">
                <svg v-if="chip.icon === 'check'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
                <svg v-else-if="chip.icon === 'clock'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
                <svg v-else-if="chip.icon === 'x'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
                <svg v-else-if="chip.icon === 'tag'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 6l4-4h4l8 8-8 8-8-8z"/>
                  <circle cx="8" cy="6" r="1"/>
                </svg>
                <svg v-else-if="chip.icon === 'eye'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else-if="chip.icon === 'steps'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18"/>
                </svg>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </span>
              {{ chip.text }}
            </span>
          </div>
        </div>

        <button
          type="button"
          class="cv-edit__link"
          @click="goToAnnouncement"
        >
          <span class="cv-edit__link-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <path d="M15 3h6v6"/>
              <path d="M10 14L21 3"/>
            </svg>
          </span>
          <span class="cv-edit__link-text">Смотреть объявление</span>
          <span class="cv-edit__link-arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </span>
        </button>
      </header>

      <section class="cv-edit__warning">
        <span class="cv-edit__warning-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </span>

        <div class="cv-edit__warning-content">
          <p class="cv-edit__warning-title">После сохранения объявление вернётся на модерацию</p>
          <p class="cv-edit__warning-text">
            Обычно проверка занимает до 30 минут.
            До этого момента объявление будет скрыто из каталога.
          </p>
        </div>
      </section>

      <section class="cv-edit__wizard">
        <AnnouncementWizard
          mode="edit"
          :announcement-id="announcementId"
          @update:changed="hasChanges = $event"
        />
      </section>

      <footer class="cv-edit__footer">
        <button
          type="button"
          class="cv-edit__cancel"
          @click="handleCancelEdit"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Отменить изменения
        </button>

        <RouterLink to="/profile/announcements" class="cv-edit__back">
          Вернуться к моим объявлениям
        </RouterLink>
      </footer>
    </div>

    <ConfirmModal
      v-model="showCancelConfirm"
      title="Отменить изменения?"
      message="Все несохранённые изменения будут потеряны. Продолжить редактирование?"
      confirm-text="Отменить"
      cancel-text="Продолжить"
      variant="danger"
      icon="warning"
      @confirm="confirmCancel"
    />
  </div>
</template>

<style scoped>
.cv-edit {
  position: relative;
  padding: 20px 0 60px;
  isolation: isolate;
}

.cv-edit__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-edit__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}

.cv-edit__bg-orb--1 {
  top: -10%;
  left: -5%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvEditOrb 22s ease-in-out infinite;
}

.cv-edit__bg-orb--2 {
  bottom: -20%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.18), transparent 70%);
  animation: cvEditOrb 26s ease-in-out infinite reverse;
}

@keyframes cvEditOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-edit__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  opacity: 0.5;
}

.cv-edit__container {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-edit__hero {
  position: relative;
  padding: 28px 30px;
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 80px rgba(201, 169, 97, 0.08);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-edit__hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.32) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}

.cv-edit__hero-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-edit__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.cv-edit__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(232, 213, 160, 0.95);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(201, 169, 97, 0.05));
  border: 1px solid rgba(201, 169, 97, 0.35);
}

.cv-edit__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.9);
  animation: cvEditDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvEditDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-edit__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.7px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-edit__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-edit__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cv-edit__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-edit__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
}

.cv-edit__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.cv-edit__chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  border: 1px solid;
}

.cv-edit__chip[data-color="success"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-edit__chip[data-color="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-edit__chip[data-color="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.12);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-edit__chip[data-color="accent"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-edit__chip[data-color="neutral"] {
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-edit__chip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-edit__link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  align-self: flex-start;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  flex-shrink: 0;
  white-space: nowrap;
}

.cv-edit__link:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cv-edit__link:active {
  transform: translateY(0) scale(0.98);
}

.cv-edit__link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-edit__link-text {
  min-width: 0;
}

.cv-edit__link-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.cv-edit__link:hover .cv-edit__link-arrow {
  transform: translateX(3px);
}

.cv-edit__warning {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(217, 119, 6, 0.02));
  border: 1px solid rgba(217, 119, 6, 0.3);
  border-left: 3px solid rgba(217, 119, 6, 0.7);
}

.cv-edit__warning-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #F0C080;
  flex-shrink: 0;
  margin-top: 2px;
}

.cv-edit__warning-content {
  flex: 1;
  min-width: 0;
}

.cv-edit__warning-title {
  margin: 0 0 3px;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: #F0C080;
}

.cv-edit__warning-text {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(240, 192, 128, 0.75);
}

.cv-edit__wizard {
  position: relative;
}

.cv-edit__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-edit__cancel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.08);
  border: 1px solid rgba(184, 119, 85, 0.28);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-edit__cancel:hover {
  background: rgba(184, 119, 85, 0.18);
  border-color: rgba(184, 119, 85, 0.5);
  transform: translateY(-1px);
}

.cv-edit__cancel:active {
  transform: translateY(0) scale(0.97);
}

.cv-edit__back {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(200, 190, 175, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
}

.cv-edit__back:hover {
  color: #E8D5A0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 1024px) {
  .cv-edit__container { padding: 0 32px; }
  .cv-edit__title { font-size: 26px; letter-spacing: -0.5px; }
}

@media (max-width: 768px) {
  .cv-edit { padding: 12px 0 40px; }
  .cv-edit__container { padding: 0 20px; gap: 18px; }

  .cv-edit__hero { padding: 22px 20px; border-radius: 1.25rem; flex-direction: column; }
  .cv-edit__hero-content { width: 100%; }
  .cv-edit__title { font-size: 22px; letter-spacing: -0.4px; }
  .cv-edit__link { width: 100%; justify-content: center; }

  .cv-edit__warning { padding: 12px 14px; gap: 12px; }
  .cv-edit__warning-title { font-size: 12px; }
  .cv-edit__warning-text { font-size: 12px; }

  .cv-edit__footer { flex-direction: column; align-items: stretch; }
  .cv-edit__cancel { width: 100%; justify-content: center; }
  .cv-edit__back { text-align: center; }
}
</style>