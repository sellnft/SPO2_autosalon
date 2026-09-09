<script setup>
import { useRouter } from 'vue-router'
import { formatPrice } from '@/utils/formatPrice'
import { formatMileage } from '@/utils/formatMileage'
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'

defineProps({
  announcements: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
</script>

<template>
  <div class="announcement-list">
    <article
      v-for="announcement in announcements"
      :key="announcement.id"
      class="announcement-item"
      @click="router.push(`/announcements/${announcement.id}`)"
    >
      <div class="announcement-item__image-wrapper">
        <img 
          :src="announcement.photos[0]" 
          :alt="announcement.title"
          class="announcement-item__image"
          loading="lazy"
        />
        <FavouriteButton 
          :announcement-id="announcement.id"
          class="announcement-item__favourite"
        />
      </div>
      
      <div class="announcement-item__content">
        <h3 class="announcement-item__title">
          {{ announcement.brand }} {{ announcement.model }}, {{ announcement.year }}
        </h3>
        
        <div class="announcement-item__specs">
          <span>{{ formatMileage(announcement.mileage) }}</span>
          <span>{{ announcement.engineType }} {{ announcement.engineVolume }}л</span>
          <span>{{ announcement.transmission }}</span>
          <span>{{ announcement.drive }}</span>
        </div>
        
        <p class="announcement-item__location">
          {{ announcement.city }}
        </p>
      </div>
      
      <div class="announcement-item__price">
        {{ formatPrice(announcement.price) }}
      </div>
    </article>
  </div>
</template>

<style scoped>
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.announcement-item:hover {
  border-color: #0A84FF;
  box-shadow: 0 4px 12px rgba(10, 132, 255, 0.1);
}

.announcement-item__image-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 200px;
  height: 150px;
}

.announcement-item__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.announcement-item__favourite {
  position: absolute;
  top: 8px;
  right: 8px;
}

.announcement-item__content {
  flex: 1;
  min-width: 0;
}

.announcement-item__title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.announcement-item__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6B7280;
}

.announcement-item__location {
  font-size: 13px;
  color: #9CA3AF;
}

.announcement-item__price {
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0A84FF;
}

@media (max-width: 640px) {
  .announcement-item {
    flex-direction: column;
  }
  
  .announcement-item__image-wrapper {
    width: 100%;
    height: 200px;
  }
}
</style>