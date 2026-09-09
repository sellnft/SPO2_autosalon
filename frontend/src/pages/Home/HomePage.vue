<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const searchQuery = ref('')
const selectedBrand = ref('')
const popularAnnouncements = ref([])
const loading = ref(true)

const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' }
]

const bodyTypes = [
  { value: 'Седан', label: 'Седан', icon: '🚗' },
  { value: 'Кроссовер', label: 'Кроссовер', icon: '🚙' },
  { value: 'SUV', label: 'SUV', icon: '🚐' },
  { value: 'Лифтбек', label: 'Лифтбек', icon: '🚘' }
]

const advantages = [
  {
    icon: '🛡️',
    title: 'Проверенные продавцы',
    description: 'Каждый продавец проходит верификацию'
  },
  {
    icon: '💰',
    title: 'Безопасная сделка',
    description: 'Защита платежей через escrow-счет'
  },
  {
    icon: '📊',
    title: 'Честная статистика',
    description: 'Реальные цены и пробеги'
  },
  {
    icon: '⚡',
    title: 'Быстрая связь',
    description: 'Мгновенные уведомления и чат'
  }
]

async function handleSearch() {
  const query = {}
  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedBrand.value) query.brand = selectedBrand.value
  router.push({ path: '/announcements', query })
}

async function loadPopularAnnouncements() {
  loading.value = true
  try {
    const response = await announcementsStore.fetchAnnouncements({
      perPage: 4,
      sortBy: 'views',
      sortOrder: 'desc'
    })
    popularAnnouncements.value = response.items
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPopularAnnouncements()
})
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__background">
        <div class="hero__gradient"></div>
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80" 
          alt="Автомобиль"
          class="hero__image"
        />
      </div>
      
      <div class="hero__content">
        <div class="container">
          <h1 class="hero__title">
            Ваш следующий автомобиль
            <span class="hero__title-accent">уже здесь</span>
          </h1>
          
          <p class="hero__subtitle">
            Технологичная платформа для тех, кто ценит время и качество
          </p>
          
          <!-- Search -->
          <form class="hero__search" @submit.prevent="handleSearch">
            <div class="hero__search-input">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2"/>
                <path d="M15 15l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Поиск по марке, модели или ключевому слову..."
              />
            </div>
            
            <BaseSelect
              v-model="selectedBrand"
              :options="brands"
              placeholder="Все марки"
              class="hero__search-select"
            />
            
            <BaseButton type="submit" size="lg">
              Найти
            </BaseButton>
          </form>
          
          <!-- Stats -->
          <div class="hero__stats">
            <div class="hero__stat">
              <span class="hero__stat-value">25 000+</span>
              <span class="hero__stat-label">объявлений</span>
            </div>
            <div class="hero__stat">
              <span class="hero__stat-value">1 500+</span>
              <span class="hero__stat-label">продавцов</span>
            </div>
            <div class="hero__stat">
              <span class="hero__stat-value">98%</span>
              <span class="hero__stat-label">успешных сделок</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Categories -->
    <section class="categories">
      <div class="container">
        <h2 class="categories__title">Категории</h2>
        
        <div class="categories__grid">
          <button
            v-for="bodyType in bodyTypes"
            :key="bodyType.value"
            class="category-card"
            @click="router.push({ path: '/announcements', query: { bodyType: bodyType.value } })"
          >
            <span class="category-card__icon">{{ bodyType.icon }}</span>
            <span class="category-card__label">{{ bodyType.label }}</span>
          </button>
        </div>
      </div>
    </section>
    
    <!-- Popular Announcements -->
    <section class="popular">
      <div class="container">
        <div class="popular__header">
          <h2 class="popular__title">Популярные автомобили</h2>
          <BaseButton variant="ghost" @click="router.push('/announcements')">
            Смотреть все
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </BaseButton>
        </div>
        
        <div v-if="loading" class="popular__grid">
          <AnnouncementSkeleton v-for="i in 4" :key="i" />
        </div>
        
        <div v-else class="popular__grid">
          <AnnouncementCard
            v-for="announcement in popularAnnouncements"
            :key="announcement.id"
            :announcement="announcement"
          />
        </div>
      </div>
    </section>
    
    <!-- Advantages -->
    <section class="advantages">
      <div class="container">
        <h2 class="advantages__title">Почему мы</h2>
        
        <div class="advantages__grid">
          <div v-for="advantage in advantages" :key="advantage.title" class="advantage-card">
            <span class="advantage-card__icon">{{ advantage.icon }}</span>
            <h3 class="advantage-card__title">{{ advantage.title }}</h3>
            <p class="advantage-card__description">{{ advantage.description }}</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Info Block -->
    <section class="info-block">
      <div class="container">
        <div class="info-block__content">
          <div class="info-block__text">
            <h2 class="info-block__title">
              Современный подход к покупке автомобиля
            </h2>
            <p class="info-block__description">
              Мы создали платформу, которая объединяет лучшие технологии и удобство. 
              Проверенные продавцы, безопасные сделки и прозрачная статистика — 
              всё для вашей уверенности.
            </p>
            <div class="info-block__actions">
              <BaseButton size="lg" @click="router.push('/register')">
                Присоединиться
              </BaseButton>
              <BaseButton variant="outline" size="lg" @click="router.push('/feedback')">
                Связаться с нами
              </BaseButton>
            </div>
          </div>
          
          <div class="info-block__image">
            <img 
              src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80" 
              alt="Автомобиль"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
}

/* Hero */
.hero {
  position: relative;
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero__background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(17, 24, 39, 0.9) 0%,
    rgba(17, 24, 39, 0.7) 50%,
    rgba(17, 24, 39, 0.4) 100%
  );
}

.hero__content {
  position: relative;
  z-index: 1;
  width: 100%;
}

.hero__title {
  max-width: 600px;
  margin-bottom: 16px;
  font-size: 56px;
  font-weight: 800;
  color: white;
  line-height: 1.1;
  letter-spacing: -1px;
}

.hero__title-accent {
  display: block;
  background: linear-gradient(135deg, #0A84FF, #00D4FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__subtitle {
  max-width: 500px;
  margin-bottom: 32px;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.hero__search {
  display: flex;
  gap: 12px;
  max-width: 700px;
  padding: 8px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.hero__search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  color: #6B7280;
}

.hero__search-input input {
  flex: 1;
  font-size: 14px;
  border: none;
  outline: none;
}

.hero__search-select {
  width: 160px;
}

.hero__stats {
  display: flex;
  gap: 40px;
  margin-top: 40px;
}

.hero__stat {
  display: flex;
  flex-direction: column;
}

.hero__stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.hero__stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* Categories */
.categories {
  padding: 60px 0;
}

.categories__title,
.popular__title,
.advantages__title {
  margin-bottom: 32px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.categories__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: #0A84FF;
  box-shadow: 0 10px 15px -3px rgba(10, 132, 255, 0.1);
  transform: translateY(-2px);
}

.category-card__icon {
  font-size: 40px;
}

.category-card__label {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* Popular */
.popular {
  padding: 60px 0;
  background: #F9FAFB;
}

.popular__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.popular__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* Advantages */
.advantages {
  padding: 60px 0;
}

.advantages__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.advantage-card {
  padding: 24px;
  background: white;
  border-radius: 16px;
  transition: all 0.2s;
}

.advantage-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.advantage-card__icon {
  display: block;
  margin-bottom: 16px;
  font-size: 32px;
}

.advantage-card__title {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.advantage-card__description {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
}

/* Info Block */
.info-block {
  padding: 80px 0;
  background: #111827;
}

.info-block__content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.info-block__title {
  margin-bottom: 20px;
  font-size: 36px;
  font-weight: 700;
  color: white;
}

.info-block__description {
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.6;
  color: #9CA3AF;
}

.info-block__actions {
  display: flex;
  gap: 12px;
}

.info-block__image img {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero__title {
    font-size: 40px;
  }
  
  .popular__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .categories__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .advantages__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-block__content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 500px;
  }
  
  .hero__title {
    font-size: 32px;
  }
  
  .hero__search {
    flex-direction: column;
  }
  
  .hero__search-select {
    width: 100%;
  }
  
  .hero__stats {
    gap: 20px;
  }
  
  .hero__stat-value {
    font-size: 20px;
  }
  
  .popular__grid {
    grid-template-columns: 1fr;
  }
  
  .categories__grid {
    grid-template-columns: 1fr;
  }
  
  .advantages__grid {
    grid-template-columns: 1fr;
  }
}
</style>