<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useFavouritesStore } from '@/stores/favourites'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()
const announcementsStore = useAnnouncementsStore()
const favouritesStore = useFavouritesStore()

const user = computed(() => authStore.user)

const stats = computed(() => [
  { label: 'Мои объявления', value: announcementsStore.announcements.length },
  { label: 'Избранное', value: favouritesStore.favouritesCount },
  { label: 'Активные сессии', value: 2 }
])
</script>

<template>
  <div class="profile-page">
    <div class="container">
      <!-- Header -->
      <div class="profile-page__header">
        <div class="profile-page__avatar">
          {{ user?.name?.charAt(0) }}
        </div>
        
        <div class="profile-page__info">
          <h1 class="profile-page__name">{{ user?.name }}</h1>
          <p class="profile-page__email">{{ user?.email }}</p>
          <p class="profile-page__phone">{{ user?.phone }}</p>
        </div>
        
        <BaseButton variant="outline" @click="$router.push('/profile/edit')">
          Редактировать
        </BaseButton>
      </div>
      
      <!-- Stats -->
      <div class="profile-page__stats">
        <div v-for="stat in stats" :key="stat.label" class="profile-page__stat">
          <span class="profile-page__stat-value">{{ stat.value }}</span>
          <span class="profile-page__stat-label">{{ stat.label }}</span>
        </div>
      </div>
      
      <!-- Quick Links -->
      <div class="profile-page__links">
        <RouterLink to="/profile/announcements" class="profile-page__link">
          Мои объявления
        </RouterLink>
        <RouterLink to="/favourites" class="profile-page__link">
          Избранное
        </RouterLink>
        <RouterLink to="/profile/subscriptions" class="profile-page__link">
          Подписки
        </RouterLink>
        <RouterLink to="/profile/security" class="profile-page__link">
          Безопасность
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 40px 0;
}

.profile-page__header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
}

.profile-page__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  font-size: 32px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 50%;
}

.profile-page__info {
  flex: 1;
}

.profile-page__name {
  margin-bottom: 4px;
  font-size: 24px;
  font-weight: 700;
}

.profile-page__email,
.profile-page__phone {
  font-size: 14px;
  color: #6B7280;
}

.profile-page__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.profile-page__stat {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: white;
  border-radius: 12px;
  text-align: center;
}

.profile-page__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0A84FF;
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
  padding: 20px;
  background: white;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  transition: all 0.2s;
}

.profile-page__link:hover {
  background: #F0F7FF;
  color: #0A84FF;
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