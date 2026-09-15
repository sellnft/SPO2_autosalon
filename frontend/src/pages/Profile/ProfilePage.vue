<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useFavouritesStore } from '@/stores/favourites'
import { useChatStore } from '@/stores/chat'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()
const favouritesStore = useFavouritesStore()
const chatStore = useChatStore()

const user = computed(() => authStore.user)

const stats = computed(() => [
  {
    label: 'Мои объявления',
    value: announcementsStore.announcements.filter(a => a.sellerId === user.value?.id).length,
    to: '/profile/announcements'
  },
  {
    label: 'Избранное',
    value: favouritesStore.favouritesCount,
    to: '/favourites'
  },
  {
    label: 'Чаты',
    value: chatStore.chats.length,
    to: '/chat'
  },
  {
    label: 'Непрочитанные',
    value: chatStore.totalUnread,
    to: '/chat'
  }
])

const quickLinks = [
  { label: 'Мои объявления', to: '/profile/announcements' },
  { label: 'Избранное', to: '/favourites' },
  { label: 'Подписки', to: '/profile/subscriptions' },
  { label: 'Сохранённые поиски', to: '/profile/saved-searches' },
  { label: 'Уведомления', to: '/profile/notifications' },
  { label: 'Безопасность', to: '/profile/security' },
  { label: 'Активные сессии', to: '/profile/sessions' },
  { label: 'Настройки', to: '/profile/edit' }
]

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
  <div class="profile-page">
    <div class="container">
      <Breadcrumbs />

      <!-- Header -->
      <div class="profile-page__header">
        <div class="profile-page__avatar">
          {{ user?.name?.charAt(0) }}
        </div>

        <div class="profile-page__info">
          <h1 class="profile-page__name">{{ user?.name }}</h1>
          <p class="profile-page__email">{{ user?.email }}</p>
          <p class="profile-page__phone">{{ user?.phone }}</p>
          <p v-if="user?.city" class="profile-page__city">{{ user.city }}</p>
        </div>

        <BaseButton variant="outline" @click="$router.push('/profile/edit')">
          Редактировать
        </BaseButton>
      </div>

      <!-- Stats -->
      <div class="profile-page__stats">
        <RouterLink
          v-for="stat in stats"
          :key="stat.label"
          :to="stat.to"
          class="profile-page__stat"
        >
          <span class="profile-page__stat-value">{{ stat.value }}</span>
          <span class="profile-page__stat-label">{{ stat.label }}</span>
        </RouterLink>
      </div>

      <!-- Quick Links -->
      <div class="profile-page__links">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          class="profile-page__link"
        >
          <span>{{ link.label }}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 20px 0 40px;
}

.profile-page__header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  margin-bottom: 24px;
}

.profile-page__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  font-size: 32px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 50%;
}

.profile-page__info {
  flex: 1;
  min-width: 0;
}

.profile-page__name {
  margin-bottom: 4px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.profile-page__email,
.profile-page__phone,
.profile-page__city {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 2px;
}

.profile-page__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.profile-page__stat {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
}

.profile-page__stat:hover {
  border-color: #0A84FF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.1);
}

.profile-page__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0A84FF;
  line-height: 1;
  margin-bottom: 4px;
}

.profile-page__stat-label {
  font-size: 13px;
  color: #6B7280;
}

.profile-page__links {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.profile-page__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-weight: 500;
  color: #111827;
  text-decoration: none;
  transition: all 0.2s;
}

.profile-page__link:hover {
  background: #F0F7FF;
  border-color: #0A84FF;
  color: #0A84FF;
}

.profile-page__link svg {
  color: #9CA3AF;
}

.profile-page__link:hover svg {
  color: #0A84FF;
}

@media (max-width: 1024px) {
  .profile-page__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .profile-page__links {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-page__header {
    flex-direction: column;
    text-align: center;
  }

  .profile-page__stats {
    grid-template-columns: 1fr;
  }

  .profile-page__links {
    grid-template-columns: 1fr;
  }
}
</style>