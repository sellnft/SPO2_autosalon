<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavouritesStore } from '@/stores/favourites'
import { formatPrice } from '@/utils/formatPrice'
import { formatMileage } from '@/utils/formatMileage'
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const favouritesStore = useFavouritesStore()

const isFavourite = computed(() => 
  favouritesStore.isFavourite(props.announcement.id)
)

function handleClick() {
  router.push(`/announcements/${props.announcement.id}`)
}
</script>

<template>
  <article
    class="announcement-card"
    tabindex="0"
    role="article"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <div class="announcement-card__image-wrapper">
      <img
        :src="announcement.photos[0]"
        :alt="`${announcement.brand} ${announcement.model}`"
        class="announcement-card__image"
        loading="lazy"
        decoding="async"
        width="400"
        height="300"
      />
      
      <FavouriteButton
        :announcement-id="announcement.id"
        class="announcement-card__favourite"
      />
      
      <span
        v-if="announcement.status === 'pending'"
        class="announcement-card__status"
      >
        На модерации
      </span>
    </div>
    
    <div class="announcement-card__content">
      <h3 class="announcement-card__title">
        {{ announcement.brand }} {{ announcement.model }}
      </h3>
      
      <p class="announcement-card__price">
        {{ formatPrice(announcement.price) }}
      </p>
      
      <div class="announcement-card__specs">
        <span>{{ announcement.year }}</span>
        <span class="announcement-card__dot">•</span>
        <span>{{ formatMileage(announcement.mileage) }}</span>
        <span class="announcement-card__dot">•</span>
        <span>{{ announcement.transmission }}</span>
      </div>
      
      <div class="announcement-card__footer">
        <span class="announcement-card__location">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M7 13s-5-3.5-5-8a5 5 0 0110 0c0 4.5-5 8-5 8z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="7" cy="5" r="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          {{ announcement.city }}
        </span>
        
        <span class="announcement-card__views">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="7" cy="7" r="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          {{ announcement.views }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.announcement-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
}

.announcement-card:hover {
  border-color: #0A84FF;
  box-shadow: 0 10px 15px -3px rgba(10, 132, 255, 0.1);
  transform: translateY(-2px);
}

.announcement-card:focus-visible {
  outline: 2px solid #0A84FF;
  outline-offset: 2px;
}

.announcement-card__image-wrapper {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #F3F4F6;
}

.announcement-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.announcement-card:hover .announcement-card__image {
  transform: scale(1.05);
}

.announcement-card__favourite {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.announcement-card__status {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  background: #FEF3C7;
  border-radius: 6px;
}

.announcement-card__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.announcement-card__title {
  margin-bottom: 8px;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.announcement-card__price {
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #0A84FF;
  line-height: 1.2;
}

.announcement-card__specs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: auto;
  padding-bottom: 12px;
  font-size: 13px;
  color: #6B7280;
  flex-wrap: wrap;
}

.announcement-card__dot {
  color: #D1D5DB;
}

.announcement-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
}

.announcement-card__location,
.announcement-card__views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9CA3AF;
}

@media (max-width: 480px) {
  .announcement-card__title {
    font-size: 16px;
  }
  
  .announcement-card__price {
    font-size: 18px;
  }
}
</style>