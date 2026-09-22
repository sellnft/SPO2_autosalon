<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { useAnnouncementsStore } from '@/stores/announcements'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import AnnouncementList from '@/components/announcements/AnnouncementList.vue'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const showBlockModal = ref(false)
const userAnnouncements = ref([])

const user = computed(() =>
  adminStore.users.find(u => u.id === Number(route.params.id))
)

async function loadUser() {
  loading.value = true
  try {
    if (!adminStore.users.length) {
      await adminStore.fetchUsers()
    }

    if (user.value) {
      await announcementsStore.fetchAnnouncements({ perPage: 100 })
      userAnnouncements.value = announcementsStore.announcements.filter(
        a => a.sellerId === user.value.id
      )
    }
  } finally {
    loading.value = false
  }
}

async function toggleBlock() {
  if (!user.value) return

  try {
    if (user.value.status === 'blocked') {
      await adminStore.unblockUser(user.value.id)
      toastStore.success('Пользователь разблокирован')
    } else {
      await adminStore.blockUser(user.value.id)
      toastStore.success('Пользователь заблокирован')
    }
    showBlockModal.value = false
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

onMounted(loadUser)
</script>

<template>
  <div class="cv-ud">
    <button class="cv-ud__back" @click="router.push('/admin/users')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      К списку пользователей
    </button>

    <!-- === SKELETON === -->
    <template v-if="loading">
      <div class="cv-ud__skeleton-card">
        <div class="cv-ud__skeleton-row">
          <div class="cv-ud__skeleton cv-ud__skeleton--avatar"></div>
          <div class="cv-ud__skeleton-lines">
            <div class="cv-ud__skeleton cv-ud__skeleton--line cv-ud__skeleton--w40"></div>
            <div class="cv-ud__skeleton cv-ud__skeleton--line cv-ud__skeleton--w30"></div>
            <div class="cv-ud__skeleton cv-ud__skeleton--line cv-ud__skeleton--w25"></div>
          </div>
        </div>
      </div>
      <div class="cv-ud__skeleton-card">
        <div class="cv-ud__skeleton cv-ud__skeleton--line cv-ud__skeleton--w20"></div>
        <div class="cv-ud__skeleton cv-ud__skeleton--line cv-ud__skeleton--w70"></div>
      </div>
    </template>

    <template v-else-if="user">
      <!-- === PROFILE CARD === -->
      <section class="cv-ud__card">
        <div class="cv-ud__header">
          <div class="cv-ud__avatar">
            <span class="cv-ud__avatar-inner">{{ user.name.charAt(0) }}</span>
          </div>

          <div class="cv-ud__info">
            <div class="cv-ud__name-row">
              <h1 class="cv-ud__name">{{ user.name }}</h1>
              <AdminStatusBadge :status="user.status" type="user" />
              <span v-if="user.role === 'admin'" class="cv-ud__role-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                </svg>
                Администратор
              </span>
            </div>

            <div class="cv-ud__contacts">
              <span class="cv-ud__contact">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 6h16v12H4z"/>
                  <path d="M4 6l8 7 8-7"/>
                </svg>
                {{ user.email }}
              </span>
              <span class="cv-ud__contact-sep" aria-hidden="true">·</span>
              <span class="cv-ud__contact">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/>
                </svg>
                {{ user.phone || '—' }}
              </span>
            </div>
          </div>

          <div class="cv-ud__actions">
            <BaseButton
              :variant="user.status === 'blocked' ? 'primary' : 'danger'"
              @click="showBlockModal = true"
            >
              <svg v-if="user.status === 'blocked'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 7.5-2"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              {{ user.status === 'blocked' ? 'Разблокировать' : 'Заблокировать' }}
            </BaseButton>
          </div>
        </div>

        <!-- === META GRID === -->
        <div class="cv-ud__meta">
          <div class="cv-ud__meta-item">
            <span class="cv-ud__meta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </span>
            <div class="cv-ud__meta-body">
              <span class="cv-ud__meta-label">ID</span>
              <span class="cv-ud__meta-value cv-ud__meta-value--mono">#{{ user.id }}</span>
            </div>
          </div>

          <div class="cv-ud__meta-item">
            <span class="cv-ud__meta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/>
                <circle cx="12" cy="10" r="2.5"/>
              </svg>
            </span>
            <div class="cv-ud__meta-body">
              <span class="cv-ud__meta-label">Город</span>
              <span class="cv-ud__meta-value">{{ user.city || '—' }}</span>
            </div>
          </div>

          <div class="cv-ud__meta-item">
            <span class="cv-ud__meta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
              </svg>
            </span>
            <div class="cv-ud__meta-body">
              <span class="cv-ud__meta-label">Роль</span>
              <span class="cv-ud__meta-value">
                {{ user.role === 'admin' ? 'Администратор' : 'Пользователь' }}
              </span>
            </div>
          </div>

          <div class="cv-ud__meta-item">
            <span class="cv-ud__meta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M3 10h18M8 3v4M16 3v4"/>
              </svg>
            </span>
            <div class="cv-ud__meta-body">
              <span class="cv-ud__meta-label">Регистрация</span>
              <span class="cv-ud__meta-value">
                {{ formatDate(user.createdAt, 'long') }}
              </span>
            </div>
          </div>

          <div class="cv-ud__meta-item">
            <span class="cv-ud__meta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
            </span>
            <div class="cv-ud__meta-body">
              <span class="cv-ud__meta-label">Последняя активность</span>
              <span class="cv-ud__meta-value">
                {{ formatDate(user.lastActiveAt, 'relative') }}
              </span>
            </div>
          </div>

          <div class="cv-ud__meta-item">
            <span class="cv-ud__meta-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h12l2 5v3a2 2 0 0 1-2 2"/>
                <circle cx="7.5" cy="14.5" r="1.5"/>
                <circle cx="16.5" cy="14.5" r="1.5"/>
              </svg>
            </span>
            <div class="cv-ud__meta-body">
              <span class="cv-ud__meta-label">Объявлений</span>
              <span class="cv-ud__meta-value">{{ user.announcementsCount }}</span>
            </div>
          </div>
        </div>

        <!-- === BLOCK REASON === -->
        <div v-if="user.blockReason" class="cv-ud__block-reason">
          <span class="cv-ud__block-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v4M12 17h.01"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </span>
          <div class="cv-ud__block-body">
            <span class="cv-ud__block-label">Причина блокировки</span>
            <span class="cv-ud__block-text">{{ user.blockReason }}</span>
          </div>
        </div>
      </section>

      <!-- === ANNOUNCEMENTS SECTION === -->
      <section class="cv-ud__section">
        <header class="cv-ud__section-head">
          <div>
            <span class="cv-ud__section-eyebrow">
              <span class="cv-ud__section-dot" aria-hidden="true"></span>
              Объявления пользователя
            </span>
            <h2 class="cv-ud__section-title">
              Объявления
              <span class="cv-ud__section-count">{{ userAnnouncements.length }}</span>
            </h2>
          </div>
        </header>

        <div v-if="!userAnnouncements.length" class="cv-ud__empty">
          <span class="cv-ud__empty-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-3l2-5h12l2 5v3a2 2 0 0 1-2 2"/>
              <circle cx="7.5" cy="14.5" r="1.5"/>
              <circle cx="16.5" cy="14.5" r="1.5"/>
            </svg>
          </span>
          <p class="cv-ud__empty-title">У пользователя пока нет объявлений</p>
          <p class="cv-ud__empty-hint">Как только он что-то опубликует — здесь появится</p>
        </div>

        <AnnouncementList v-else :announcements="userAnnouncements" />
      </section>
    </template>

    <ConfirmModal
      v-model="showBlockModal"
      :title="user?.status === 'blocked' ? 'Разблокировать пользователя?' : 'Заблокировать пользователя?'"
      :message="user?.status === 'blocked'
        ? 'Пользователь снова получит доступ к платформе.'
        : 'Пользователь потеряет доступ к платформе и его объявления будут скрыты.'"
      :confirm-text="user?.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'"
      :variant="user?.status === 'blocked' ? 'primary' : 'danger'"
      @confirm="toggleBlock"
    />
  </div>
</template>

<style scoped>
.cv-ud {
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* === BACK === */
.cv-ud__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 8px 14px 8px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ud__back svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-ud__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateX(-2px);
}

.cv-ud__back:hover svg {
  transform: translateX(-2px);
}

/* === SKELETON === */
.cv-ud__skeleton-card {
  padding: 24px;
  border-radius: 1rem;
  background: linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-ud__skeleton-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.cv-ud__skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-ud__skeleton {
  position: relative;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.cv-ud__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(201, 169, 97, 0.08) 50%, transparent 100%);
  animation: cvUdShimmer 1.8s ease-in-out infinite;
}

@keyframes cvUdShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-ud__skeleton--avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cv-ud__skeleton--line { height: 14px; }
.cv-ud__skeleton--w20 { width: 20%; }
.cv-ud__skeleton--w25 { width: 25%; }
.cv-ud__skeleton--w30 { width: 30%; }
.cv-ud__skeleton--w40 { width: 40%; }
.cv-ud__skeleton--w70 { width: 70%; }

/* === PROFILE CARD === */
.cv-ud__card {
  position: relative;
  padding: 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-ud__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-ud__header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  flex-wrap: wrap;
}

/* === AVATAR === */
.cv-ud__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.5),
    0 0 0 4px rgba(10, 10, 12, 0.95),
    0 8px 28px rgba(201, 169, 97, 0.35);
  position: relative;
}

.cv-ud__avatar-inner {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #1A1208;
}

/* === INFO === */
.cv-ud__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-ud__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-ud__name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-ud__role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 750;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 999px;
}

.cv-ud__contacts {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.65);
}

.cv-ud__contact {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.cv-ud__contact svg {
  color: rgba(201, 169, 97, 0.55);
  flex-shrink: 0;
}

.cv-ud__contact-sep {
  color: rgba(200, 190, 175, 0.3);
}

/* === ACTIONS === */
.cv-ud__actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* === META GRID === */
.cv-ud__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cv-ud__meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.25s ease;
}

.cv-ud__meta-item:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.2);
}

.cv-ud__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.24);
}

.cv-ud__meta-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-ud__meta-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.65);
}

.cv-ud__meta-value {
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-ud__meta-value--mono {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* === BLOCK REASON === */
.cv-ud__block-reason {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  margin-top: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.14), rgba(184, 119, 85, 0.04));
  border: 1px solid rgba(184, 119, 85, 0.32);
  position: relative;
  overflow: hidden;
}

.cv-ud__block-reason::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #E8A88A, #B87755, #6B4225);
}

.cv-ud__block-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border: 1px solid rgba(184, 119, 85, 0.35);
}

.cv-ud__block-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cv-ud__block-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  color: #E8A88A;
}

.cv-ud__block-text {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(245, 240, 230, 0.88);
}

/* === ANNOUNCEMENTS SECTION === */
.cv-ud__section {
  position: relative;
  padding: 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-ud__section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-ud__section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.cv-ud__section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.8);
}

.cv-ud__section-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvUdDot 2.2s ease-in-out infinite;
}

@keyframes cvUdDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-ud__section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.2px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-ud__section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 9px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  border-radius: 999px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
  font-variant-numeric: tabular-nums;
}

/* === EMPTY === */
.cv-ud__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 24px;
  text-align: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px dashed rgba(201, 169, 97, 0.16);
}

.cv-ud__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: rgba(201, 169, 97, 0.5);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.15);
  margin-bottom: 4px;
}

.cv-ud__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.85);
}

.cv-ud__empty-hint {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

/* === RESPONSIVE === */
@media (max-width: 1024px) {
  .cv-ud__meta {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .cv-ud__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cv-ud__actions {
    width: 100%;
  }

  .cv-ud__actions > * {
    width: 100%;
  }

  .cv-ud__name {
    font-size: 20px;
  }

  .cv-ud__avatar {
    width: 60px;
    height: 60px;
  }

  .cv-ud__avatar-inner {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .cv-ud__meta {
    grid-template-columns: 1fr;
  }

  .cv-ud__card,
  .cv-ud__section {
    padding: 18px;
  }
}
</style>