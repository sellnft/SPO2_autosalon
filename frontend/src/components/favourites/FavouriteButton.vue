<script setup>
import { ref } from 'vue'
import { useFavouritesStore } from '@/stores/favourites'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  },
  isFavourite: {
    type: Boolean,
    default: false
  }
})

const favouritesStore = useFavouritesStore()
const loading = ref(false)

async function toggleFavourite(event) {
  event.stopPropagation()
  loading.value = true
  try {
    if (props.isFavourite) {
      await favouritesStore.removeFromFavourites(props.announcementId)
    } else {
      await favouritesStore.addToFavourites(props.announcementId)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button 
    class="favourite-button"
    :class="{ 'favourite-button--active': isFavourite }"
    @click="toggleFavourite"
    :disabled="loading"
    :aria-label="isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" :fill="isFavourite ? 'currentColor' : 'none'">
      <path d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z" stroke="currentColor" stroke-width="1.5"/>
    </svg>
  </button>
</template>

<style scoped>
.favourite-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6B7280;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.favourite-button:hover {
  transform: scale(1.1);
}

.favourite-button--active {
  color: #EF4444;
}

.favourite-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>