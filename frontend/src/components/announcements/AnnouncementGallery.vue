<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})

const activeIndex = ref(0)

const currentPhoto = computed(() => props.photos[activeIndex.value] || '')

// Сброс индекса при смене photos
watch(() => props.photos, () => {
  activeIndex.value = 0
}, { deep: true })

function nextPhoto() {
  if (activeIndex.value < props.photos.length - 1) {
    activeIndex.value++
  }
}

function prevPhoto() {
  if (activeIndex.value > 0) {
    activeIndex.value--
  }
}

function setPhoto(index) {
  activeIndex.value = index
}
</script>

<template>
  <div v-if="photos.length" class="announcement-gallery">
    <div class="announcement-gallery__main">
      <img
        v-if="currentPhoto"
        :src="currentPhoto"
        alt="Автомобиль"
        class="announcement-gallery__image"
      />
      <div v-else class="announcement-gallery__placeholder">
        Нет фото
      </div>
      
      <button
        v-if="photos.length > 1"
        class="announcement-gallery__nav announcement-gallery__nav--prev"
        :disabled="activeIndex === 0"
        aria-label="Предыдущее фото"
        @click="prevPhoto"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <button
        v-if="photos.length > 1"
        class="announcement-gallery__nav announcement-gallery__nav--next"
        :disabled="activeIndex === photos.length - 1"
        aria-label="Следующее фото"
        @click="nextPhoto"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <span v-if="photos.length > 1" class="announcement-gallery__counter">
        {{ activeIndex + 1 }} / {{ photos.length }}
      </span>
    </div>
    
    <div v-if="photos.length > 1" class="announcement-gallery__thumbnails">
      <button
        v-for="(photo, index) in photos"
        :key="index"
        :class="[
          'announcement-gallery__thumbnail',
          { 'announcement-gallery__thumbnail--active': index === activeIndex }
        ]"
        :aria-label="`Фото ${index + 1}`"
        @click="setPhoto(index)"
      >
        <img :src="photo" :alt="`Фото ${index + 1}`" loading="lazy" />
      </button>
    </div>
  </div>
  
  <div v-else class="announcement-gallery__empty">
    Нет фотографий
  </div>
</template>

<style scoped>
.announcement-gallery {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.announcement-gallery__main {
  position: relative;
  aspect-ratio: 16/10;
  background: #F3F4F6;
  border-radius: 16px;
  overflow: hidden;
}

.announcement-gallery__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.announcement-gallery__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9CA3AF;
  font-size: 14px;
}

.announcement-gallery__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.announcement-gallery__nav:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.7);
}

.announcement-gallery__nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.announcement-gallery__nav--prev {
  left: 16px;
}

.announcement-gallery__nav--next {
  right: 16px;
}

.announcement-gallery__counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
}

.announcement-gallery__thumbnails {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.announcement-gallery__thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.6;
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  transition: all 0.2s;
}

.announcement-gallery__thumbnail--active {
  opacity: 1;
  box-shadow: 0 0 0 2px #0A84FF;
}

.announcement-gallery__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.announcement-gallery__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/10;
  background: #F3F4F6;
  border-radius: 16px;
  color: #9CA3AF;
  font-size: 14px;
}
</style>