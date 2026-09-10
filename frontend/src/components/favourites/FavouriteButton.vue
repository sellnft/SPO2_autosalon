<script setup>
import { ref, computed } from 'vue'
import { useFavouritesStore } from '@/stores/favourites'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  },
  variant: {
    type: String,
    default: 'icon', // icon | button
    validator: (v) => ['icon', 'button'].includes(v)
  }
})

const router = useRouter()
const favouritesStore = useFavouritesStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)

const isFavourite = computed(() => 
  favouritesStore.isFavourite(props.announcementId)
)

async function handleToggle(event) {
  if (event) event.stopPropagation()
  
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы добавить в избранное')
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }
  
  loading.value = true
  try {
    if (isFavourite.value) {
      await favouritesStore.removeFromFavourites(props.announcementId)
      toastStore.success('Удалено из избранного')
    } else {
      await favouritesStore.addToFavourites(props.announcementId)
      toastStore.success('Добавлено в избранное')
    }
  } catch (err) {
    toastStore.error(err.message || 'Ошибка')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Icon variant -->
  <button
    v-if="variant === 'icon'"
    class="favourite-btn favourite-btn--icon"
    :class="{ 'favourite-btn--active': isFavourite }"
    :disabled="loading"
    :aria-label="isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'"
    @click="handleToggle"
  >
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      :fill="isFavourite ? 'currentColor' : 'none'"
    >
      <path 
        d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z" 
        stroke="currentColor" 
        stroke-width="1.5"
      />
    </svg>
  </button>
  
  <!-- Button variant -->
  <button
    v-else
    class="favourite-btn favourite-btn--full"
    :class="{ 'favourite-btn--active': isFavourite }"
    :disabled="loading"
    @click="handleToggle"
  >
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 20 20" 
      :fill="isFavourite ? 'currentColor' : 'none'"
    >
      <path 
        d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z" 
        stroke="currentColor" 
        stroke-width="1.5"
      />
    </svg>
    <span>{{ isFavourite ? 'В избранном' : 'В избранное' }}</span>
  </button>
</template>

<style scoped>
.favourite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: none;
}

.favourite-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Icon */
.favourite-btn--icon {
  width: 40px;
  height: 40px;
  color: #6B7280;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favourite-btn--icon:hover:not(:disabled) {
  transform: scale(1.1);
  color: #EF4444;
}

.favourite-btn--icon.favourite-btn--active {
  color: #EF4444;
}

/* Full */
.favourite-btn--full {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
}

.favourite-btn--full:hover:not(:disabled) {
  border-color: #EF4444;
  color: #EF4444;
}

.favourite-btn--full.favourite-btn--active {
  color: #EF4444;
  border-color: #EF4444;
  background: #FEF2F2;
}
</style>