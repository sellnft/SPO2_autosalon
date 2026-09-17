<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useFavouritesStore } from '@/stores/favourites'
import { useChatStore } from '@/stores/chat'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()
const favouritesStore = useFavouritesStore()
const chatStore = useChatStore()
const toastStore = useToastStore()

const user = computed(() => authStore.user)

const userInitial = computed(() => user.value?.name?.charAt(0)?.toUpperCase() || 'П')

const userFullName = computed(() => {
  const parts = [user.value?.name, user.value?.lastName].filter(Boolean)
  return parts.join(' ') || 'Пользователь'
})

const emailVerified = computed(() => user.value?.emailVerified ?? false)

const memberSince = computed(() => {
  if (!user.value?.createdAt) return null
  const date = new Date(user.value.createdAt)
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
})

const stats = computed(() => [
  {
    key: 'announcements',
    label: 'Мои объявления',
    value: announcementsStore.announcements.filter(a => a.sellerId === user.value?.id).length,
    to: '/profile/announcements',
    icon: 'car',
    accent: 'accent'
  },
  {
    key: 'favourites',
    label: 'Избранное',
    value: favouritesStore.favouritesCount || 0,
    to: '/favourites',
    icon: 'heart',
    accent: 'danger'
  },
  {
    key: 'chats',
    label: 'Чаты',
    value: chatStore.chats.length || 0,
    to: '/chat',
    icon: 'chat',
    accent: 'info'
  },
  {
    key: 'unread',
    label: 'Непрочитанных',
    value: chatStore.totalUnread || 0,
    to: '/chat',
    icon: 'bell',
    accent: 'warning'
  }
])

const menuSections = [
  {
    title: 'Аккаунт',
    icon: 'user',
    items: [
      { label: 'Редактировать профиль', to: '/profile/edit', icon: 'edit', desc: 'Личные данные и контакты' },
      { label: 'Безопасность', to: '/profile/security', icon: 'shield', desc: 'Пароль и двухфакторка' },
      { label: 'Активные сессии', to: '/profile/sessions', icon: 'device', desc: 'Устройства с доступом' },
      { label: 'Уведомления', to: '/profile/notifications', icon: 'bell', desc: 'Email и push' }
    ]
  },
  {
    title: 'Активность',
    icon: 'activity',
    items: [
      { label: 'Мои объявления', to: '/profile/announcements', icon: 'car', desc: 'Управление публикациями' },
      { label: 'Избранное', to: '/favourites', icon: 'heart', desc: 'Сохранённые автомобили' },
      { label: 'Подписки', to: '/profile/subscriptions', icon: 'bell', desc: 'Отслеживаемые объявления' },
      { label: 'Сохранённые поиски', to: '/profile/saved-searches', icon: 'search', desc: 'Ваши фильтры' }
    ]
  }
]

const completeness = computed(() => {
  const fields = ['name', 'email', 'phone', 'city']
  const filled = fields.filter(f => user.value?.[f]?.trim?.() || user.value?.[f]).length
  return Math.round((filled / fields.length) * 100)
})

const completenessState = computed(() => {
  const c = completeness.value
  if (c === 100) return 'ok'
  if (c >= 50) return 'accent'
  return 'warn'
})

const missingFields = computed(() => {
  const labels = { name: 'имя', email: 'email', phone: 'телефон', city: 'город' }
  return ['name', 'email', 'phone', 'city']
    .filter(f => !user.value?.[f])
    .map(f => labels[f])
})

const hasAvatar = computed(() => !!user.value?.avatar)

async function copyPublicProfileLink() {
  const url = `${window.location.origin}/sellers/${user.value?.id}`
  try {
    await navigator.clipboard.writeText(url)
    toastStore.success('Ссылка на профиль скопирована')
  } catch (err) {
    toastStore.error('Не удалось скопировать')
  }
}

function goToPublicProfile() {
  router.push(`/sellers/${user.value?.id}`)
}

onMounted(() => {
  if (!announcementsStore.announcements.length) {
    announcementsStore.fetchAnnouncements()
  }
  if (!favouritesStore.favourites.length) {
    favouritesStore.fetchFavourites()
  }
  if (!chatStore.chats.length) {
    chatStore.fetchChats()
  }
})
</script>

<template>
  <div class="cv-prof">
    <div class="cv-prof__container">
      <Breadcrumbs />

      <section class="cv-prof__hero">
        <div class="cv-prof__hero-bg" aria-hidden="true">
          <div class="cv-prof__hero-orb cv-prof__hero-orb--1"></div>
          <div class="cv-prof__hero-orb cv-prof__hero-orb--2"></div>
          <div class="cv-prof__hero-carbon"></div>
        </div>

        <div class="cv-prof__hero-content">
          <div class="cv-prof__avatar-wrap">
            <div class="cv-prof__avatar">
              <img
                v-if="hasAvatar"
                :src="user.avatar"
                :alt="userFullName"
                class="cv-prof__avatar-img"
              />
              <span v-else class="cv-prof__avatar-initial">{{ userInitial }}</span>

              <span
                v-if="user?.isOnline"
                class="cv-prof__avatar-online"
                aria-hidden="true"
              ></span>
            </div>
          </div>

          <div class="cv-prof__info">
            <span class="cv-prof__eyebrow">
              <span class="cv-prof__eyebrow-dot" aria-hidden="true"></span>
              Мой профиль
            </span>

            <h1 class="cv-prof__name">{{ userFullName }}</h1>

            <div class="cv-prof__meta">
              <span v-if="user?.isOnline" class="cv-prof__meta-item cv-prof__meta-item--online">
                <span class="cv-prof__meta-dot" aria-hidden="true"></span>
                Онлайн
              </span>

              <span v-if="memberSince" class="cv-prof__meta-item">
                <span class="cv-prof__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="14" rx="2"/>
                    <path d="M3 10h18M8 6V3M16 6V3"/>
                  </svg>
                </span>
                С {{ memberSince }}
              </span>
            </div>

            <div class="cv-prof__contacts">
              <span v-if="user?.email" class="cv-prof__contact">
                <span class="cv-prof__contact-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                  </svg>
                </span>
                <span class="cv-prof__contact-text">{{ user.email }}</span>

                <span
                  v-if="emailVerified"
                  class="cv-prof__contact-status cv-prof__contact-status--ok"
                  aria-label="Email подтверждён"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 8.5l5 5L20 2.5"/>
                  </svg>
                </span>

                <span
                  v-else
                  class="cv-prof__contact-status cv-prof__contact-status--warn"
                  aria-label="Email не подтверждён"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 8v5M12 17h.01"/>
                  </svg>
                </span>
              </span>

              <span v-if="user?.phone" class="cv-prof__contact">
                <span class="cv-prof__contact-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z"/>
                  </svg>
                </span>
                <span class="cv-prof__contact-text">{{ user.phone }}</span>
              </span>

              <span v-if="user?.city" class="cv-prof__contact">
                <span class="cv-prof__contact-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
                    <circle cx="12" cy="11" r="2.5"/>
                  </svg>
                </span>
                <span class="cv-prof__contact-text">{{ user.city }}</span>
              </span>
            </div>
          </div>

          <div class="cv-prof__hero-actions">
            <BaseButton
              variant="outline"
              size="sm"
              @click="goToPublicProfile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <path d="M15 3h6v6"/>
                <path d="M10 14L21 3"/>
              </svg>
              Публичный профиль
            </BaseButton>

            <BaseButton size="sm" @click="router.push('/profile/edit')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3l5 5-11 11H5v-5z"/>
              </svg>
              Редактировать
            </BaseButton>
          </div>
        </div>
      </section>

      <section v-if="completeness < 100" class="cv-prof__completeness" :data-state="completenessState">
        <div class="cv-prof__completeness-header">
          <span class="cv-prof__completeness-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
          </span>

          <div class="cv-prof__completeness-content">
            <span class="cv-prof__completeness-title">
              Профиль заполнен на <strong>{{ completeness }}%</strong>
            </span>
            <span class="cv-prof__completeness-text">
              Добавьте {{ missingFields.join(', ') }} — профиль вызовет больше доверия
            </span>
          </div>

          <button
            type="button"
            class="cv-prof__completeness-btn"
            @click="router.push('/profile/edit')"
          >
            Дозаполнить
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </button>
        </div>

        <div class="cv-prof__completeness-bar">
          <span
            class="cv-prof__completeness-fill"
            :style="{ width: `${completeness}%` }"
          ></span>
        </div>
      </section>

      <section class="cv-prof__stats">
        <RouterLink
          v-for="stat in stats"
          :key="stat.key"
          :to="stat.to"
          class="cv-prof__stat"
          :data-accent="stat.accent"
        >
          <span class="cv-prof__stat-icon" aria-hidden="true">
            <svg v-if="stat.icon === 'car'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
              <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
            </svg>
            <svg v-else-if="stat.icon === 'heart'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
            </svg>
            <svg v-else-if="stat.icon === 'chat'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </span>

          <div class="cv-prof__stat-content">
            <span class="cv-prof__stat-value">{{ stat.value }}</span>
            <span class="cv-prof__stat-label">{{ stat.label }}</span>
          </div>

          <span class="cv-prof__stat-arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </span>
        </RouterLink>
      </section>

      <section class="cv-prof__quick-actions">
        <button
          type="button"
          class="cv-prof__quick-btn cv-prof__quick-btn--primary"
          @click="router.push('/announcements/create')"
        >
          <span class="cv-prof__quick-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </span>
          <span class="cv-prof__quick-content">
            <span class="cv-prof__quick-title">Создать объявление</span>
            <span class="cv-prof__quick-desc">Продайте авто за 3 дня</span>
          </span>
          <span class="cv-prof__quick-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </span>
        </button>

        <button
          type="button"
          class="cv-prof__quick-btn"
          @click="router.push('/announcements')"
        >
          <span class="cv-prof__quick-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
          </span>
          <span class="cv-prof__quick-content">
            <span class="cv-prof__quick-title">Найти автомобиль</span>
            <span class="cv-prof__quick-desc">50 000+ объявлений</span>
          </span>
          <span class="cv-prof__quick-arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </span>
        </button>
      </section>

      <section
        v-for="section in menuSections"
        :key="section.title"
        class="cv-prof__menu"
      >
        <header class="cv-prof__menu-header">
          <span class="cv-prof__menu-icon" aria-hidden="true">
            <svg v-if="section.icon === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M7 15l4-4 3 3 6-6"/>
            </svg>
          </span>
          <h2 class="cv-prof__menu-title">{{ section.title }}</h2>
        </header>

        <div class="cv-prof__menu-grid">
          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="cv-prof__menu-item"
          >
            <span class="cv-prof__menu-item-icon" aria-hidden="true">
              <svg v-if="item.icon === 'edit'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 3l5 5-11 11H5v-5z"/>
              </svg>
              <svg v-else-if="item.icon === 'shield'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <svg v-else-if="item.icon === 'device'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="14" rx="2"/>
                <path d="M8 22h8M12 18v4"/>
              </svg>
              <svg v-else-if="item.icon === 'bell'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
              <svg v-else-if="item.icon === 'car'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
              </svg>
              <svg v-else-if="item.icon === 'heart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
            </span>

            <div class="cv-prof__menu-item-content">
              <span class="cv-prof__menu-item-title">{{ item.label }}</span>
              <span class="cv-prof__menu-item-desc">{{ item.desc }}</span>
            </div>

            <span class="cv-prof__menu-item-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </RouterLink>
        </div>
      </section>

      <section class="cv-prof__danger">
        <div class="cv-prof__danger-content">
          <span class="cv-prof__danger-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </span>
          <span class="cv-prof__danger-text">
            Хотите удалить аккаунт?
          </span>
        </div>

        <button
          type="button"
          class="cv-prof__danger-link"
          @click="router.push('/profile/edit')"
        >
          Перейти к удалению
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cv-prof {
  position: relative;
  padding: 20px 0 60px;
}

.cv-prof__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-prof__hero {
  position: relative;
  padding: 32px 34px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 80px rgba(201, 169, 97, 0.1);
}

.cv-prof__hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-prof__hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
}

.cv-prof__hero-orb--1 {
  top: -40%;
  right: -10%;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.35), transparent 70%);
  animation: cvProfOrb 20s ease-in-out infinite;
}

.cv-prof__hero-orb--2 {
  bottom: -50%;
  left: -10%;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
  animation: cvProfOrb 24s ease-in-out infinite reverse;
}

@keyframes cvProfOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.08); }
}

.cv-prof__hero-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
}

.cv-prof__hero::before {
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

.cv-prof__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.cv-prof__avatar-wrap {
  flex-shrink: 0;
}

.cv-prof__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.5),
    0 0 0 5px rgba(10, 10, 12, 0.95),
    0 12px 40px rgba(201, 169, 97, 0.35),
    0 0 60px rgba(201, 169, 97, 0.2);
  overflow: hidden;
}

.cv-prof__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cv-prof__avatar-initial {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #1A1208;
}

.cv-prof__avatar-online {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  border: 3px solid #121215;
  box-shadow: 0 0 12px rgba(122, 154, 106, 0.9);
  z-index: 2;
}

.cv-prof__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-prof__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(232, 213, 160, 0.95);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(201, 169, 97, 0.05));
  border: 1px solid rgba(201, 169, 97, 0.35);
}

.cv-prof__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.9);
  animation: cvProfDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvProfDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-prof__name {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-prof__meta {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-prof__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cv-prof__meta-item--online {
  color: #B8CEA8;
  font-weight: 700;
}

.cv-prof__meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvProfDot 2.2s ease-in-out infinite;
}

.cv-prof__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
}

.cv-prof__contacts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.cv-prof__contact {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.85);
}

.cv-prof__contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 8px;
  color: rgba(201, 169, 97, 0.75);
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.2);
}

.cv-prof__contact-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-prof__contact-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 50%;
}

.cv-prof__contact-status--ok {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.18);
  border: 1px solid rgba(122, 154, 106, 0.4);
}

.cv-prof__contact-status--warn {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.18);
  border: 1px solid rgba(217, 119, 6, 0.4);
}

.cv-prof__hero-actions {
  display: inline-flex;
  gap: 8px;
  flex-shrink: 0;
  align-self: flex-start;
}

.cv-prof__completeness {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid;
  overflow: hidden;
}

.cv-prof__completeness[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.1), rgba(122, 154, 106, 0.02));
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-prof__completeness[data-state="accent"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-prof__completeness[data-state="warn"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-prof__completeness-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-prof__completeness-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-prof__completeness-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-prof__completeness-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
}

.cv-prof__completeness-title strong {
  font-weight: 800;
}

.cv-prof__completeness-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  opacity: 0.85;
}

.cv-prof__completeness-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #1A1208;
  background: currentColor;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
  filter: brightness(1);
}

.cv-prof__completeness-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.cv-prof__completeness-btn:active {
  transform: translateY(0) scale(0.97);
}

.cv-prof__completeness-bar {
  position: relative;
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.cv-prof__completeness-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: currentColor;
  transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 8px currentColor;
}

.cv-prof__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.cv-prof__stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  text-decoration: none;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-prof__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-prof__stat:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 32px rgba(201, 169, 97, 0.15);
}

.cv-prof__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-prof__stat[data-accent="accent"] .cv-prof__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-prof__stat[data-accent="danger"] .cv-prof__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-prof__stat[data-accent="info"] .cv-prof__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-prof__stat[data-accent="warning"] .cv-prof__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-prof__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.cv-prof__stat-value {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-prof__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-prof__stat-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  opacity: 0.6;
  transition: all 0.25s ease;
}

.cv-prof__stat:hover .cv-prof__stat-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
  opacity: 1;
}

.cv-prof__quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.cv-prof__quick-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.18);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-prof__quick-btn:hover {
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 32px rgba(201, 169, 97, 0.15);
}

.cv-prof__quick-btn--primary {
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.65)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-prof__quick-btn--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.35) 50%, transparent);
}

.cv-prof__quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border: 1px solid rgba(201, 169, 97, 0.32);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-prof__quick-btn--primary .cv-prof__quick-icon {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-prof__quick-btn:hover .cv-prof__quick-icon {
  transform: scale(1.08);
}

.cv-prof__quick-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-prof__quick-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}

.cv-prof__quick-btn--primary .cv-prof__quick-title {
  color: #F5E6BC;
}

.cv-prof__quick-desc {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-prof__quick-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.4);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-prof__quick-btn:hover .cv-prof__quick-arrow {
  color: #E8D5A0;
  transform: translateX(4px);
}

.cv-prof__menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-prof__menu-header {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cv-prof__menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-prof__menu-title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(245, 240, 230, 0.9);
}

.cv-prof__menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.cv-prof__menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-prof__menu-item:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.cv-prof__menu-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: rgba(201, 169, 97, 0.8);
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.2);
  transition: all 0.25s ease;
}

.cv-prof__menu-item:hover .cv-prof__menu-item-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.16);
  border-color: rgba(201, 169, 97, 0.42);
}

.cv-prof__menu-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-prof__menu-item-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}

.cv-prof__menu-item-desc {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(200, 190, 175, 0.55);
}

.cv-prof__menu-item-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  opacity: 0.7;
  transition: all 0.25s ease;
}

.cv-prof__menu-item:hover .cv-prof__menu-item-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
  opacity: 1;
}

.cv-prof__danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.08), rgba(184, 119, 85, 0.02));
  border: 1px solid rgba(184, 119, 85, 0.22);
  border-left: 3px solid rgba(184, 119, 85, 0.6);
}

.cv-prof__danger-content {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.cv-prof__danger-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
}

.cv-prof__danger-text {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(232, 168, 138, 0.9);
}

.cv-prof__danger-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8A88A;
  background: transparent;
  border: 1px solid rgba(184, 119, 85, 0.4);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-prof__danger-link:hover {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.5);
  border-color: rgba(232, 168, 138, 0.6);
  transform: translateY(-1px);
}

.cv-prof__danger-link:active {
  transform: translateY(0) scale(0.97);
}

.cv-prof__danger-link svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-prof__danger-link:hover svg {
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .cv-prof__container { padding: 0 32px; }
  .cv-prof__stats { grid-template-columns: repeat(2, 1fr); }
  .cv-prof__quick-actions { grid-template-columns: 1fr; }
  .cv-prof__menu-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cv-prof { padding: 12px 0 40px; }
  .cv-prof__container { padding: 0 20px; gap: 18px; }

  .cv-prof__hero { padding: 22px 20px; border-radius: 1rem; }
  .cv-prof__hero-content { flex-direction: column; align-items: center; text-align: center; gap: 18px; }
  .cv-prof__avatar { width: 84px; height: 84px; }
  .cv-prof__avatar-initial { font-size: 32px; }
  .cv-prof__info { align-items: center; width: 100%; }
  .cv-prof__eyebrow { align-self: center; }
  .cv-prof__name { font-size: 24px; text-align: center; }
  .cv-prof__meta { justify-content: center; }
  .cv-prof__contacts { align-items: center; width: 100%; }
  .cv-prof__contact { width: 100%; justify-content: center; }
  .cv-prof__hero-actions { width: 100%; flex-direction: column; }
  .cv-prof__hero-actions > * { width: 100%; }

  .cv-prof__completeness { padding: 14px 16px; }
  .cv-prof__completeness-btn { width: 100%; justify-content: center; }

  .cv-prof__stats { grid-template-columns: 1fr; gap: 10px; }
  .cv-prof__stat { padding: 14px 16px; gap: 12px; }
  .cv-prof__stat-icon { width: 38px; height: 38px; border-radius: 10px; }
  .cv-prof__stat-value { font-size: 20px; }

  .cv-prof__quick-btn { padding: 16px 18px; gap: 12px; }
  .cv-prof__quick-icon { width: 40px; height: 40px; }

  .cv-prof__menu-item { padding: 12px 14px; gap: 12px; }
  .cv-prof__menu-item-icon { width: 34px; height: 34px; border-radius: 9px; }

  .cv-prof__danger { flex-direction: column; align-items: stretch; padding: 14px 16px; gap: 12px; }
  .cv-prof__danger-link { width: 100%; justify-content: center; }
}
</style>