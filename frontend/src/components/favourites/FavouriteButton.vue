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
    default: 'icon',
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
  <button
    v-if="variant === 'icon'"
    class="cv-fav cv-fav--icon"
    :class="{ 'cv-fav--active': isFavourite }"
    :disabled="loading"
    :aria-label="isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'"
    @click="handleToggle"
  >
    <span class="cv-fav__glow" aria-hidden="true"></span>
    <svg width="18" height="18" viewBox="0 0 20 20" :fill="isFavourite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z"/>
    </svg>
  </button>

  <button
    v-else
    class="cv-fav cv-fav--full"
    :class="{ 'cv-fav--active': isFavourite }"
    :disabled="loading"
    @click="handleToggle"
  >
    <span class="cv-fav__icon-wrap" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 20 20" :fill="isFavourite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 17.5l-1.45-1.32C3.4 11.36 1 9.28 1 6.5 1 4 3 2 5.5 2c1.54 0 3.04.83 3.5 2.36C9.46 2.83 10.96 2 12.5 2 15 2 17 4 17 6.5c0 2.78-2.4 4.86-7.55 9.68L10 17.5z"/>
      </svg>
    </span>
    <span class="cv-fav__label">{{ isFavourite ? 'В избранном' : 'В избранное' }}</span>
    <span v-if="isFavourite" class="cv-fav__pulse" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.cv-fav {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-fav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cv-fav--icon {
  width: 42px;
  height: 42px;
  color: rgba(220, 210, 195, 0.65);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 12px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.35),
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-fav__glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at center, rgba(184, 119, 85, 0.35), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.cv-fav--icon:hover:not(:disabled) {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.5);
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(184, 119, 85, 0.35),
    0 1px 0 rgba(255, 210, 190, 0.1) inset;
}

.cv-fav--icon:hover:not(:disabled) .cv-fav__glow {
  opacity: 1;
}

.cv-fav--icon:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cv-fav--icon.cv-fav--active {
  color: #E8A88A;
  background:
    linear-gradient(180deg, rgba(60, 32, 20, 0.5), rgba(30, 16, 10, 0.6)),
    linear-gradient(180deg, #1F1610 0%, #14100C 100%);
  border-color: rgba(184, 119, 85, 0.55);
  box-shadow:
    0 6px 24px rgba(184, 119, 85, 0.28),
    0 0 32px rgba(184, 119, 85, 0.22),
    0 1px 0 rgba(255, 210, 190, 0.15) inset;
}

.cv-fav--icon.cv-fav--active:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 10px 32px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(184, 119, 85, 0.5),
    0 1px 0 rgba(255, 210, 190, 0.2) inset;
}

.cv-fav--full {
  padding: 12px 20px 12px 18px;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: rgba(220, 210, 195, 0.8);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 12px;
}

.cv-fav--full::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.14), rgba(184, 119, 85, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: -1;
}

.cv-fav--full:hover:not(:disabled) {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.48);
  transform: translateY(-1px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(184, 119, 85, 0.18);
}

.cv-fav--full:hover:not(:disabled)::before {
  opacity: 1;
}

.cv-fav--full:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cv-fav--full.cv-fav--active {
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A 0%, #B87755 55%, #6B4225 100%);
  border-color: rgba(232, 168, 138, 0.5);
  box-shadow:
    0 6px 24px rgba(184, 119, 85, 0.4),
    0 0 0 1px rgba(255, 210, 190, 0.15) inset,
    0 1px 0 rgba(255, 210, 190, 0.4) inset;
}

.cv-fav--full.cv-fav--active:hover:not(:disabled) {
  color: #1A1208;
  border-color: rgba(232, 168, 138, 0.7);
  transform: translateY(-1px);
  box-shadow:
    0 10px 32px rgba(184, 119, 85, 0.55),
    0 0 0 1px rgba(255, 210, 190, 0.2) inset,
    0 1px 0 rgba(255, 210, 190, 0.5) inset;
}

.cv-fav__icon-wrap {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-fav:hover:not(:disabled) .cv-fav__icon-wrap {
  transform: scale(1.12);
}

.cv-fav--active .cv-fav__icon-wrap {
  animation: cvFavPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cvFavPop {
  0% { transform: scale(1); }
  40% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.cv-fav__label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.cv-fav__pulse {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1A1208;
  animation: cvFavPulse 2.2s ease-in-out infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes cvFavPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(26, 18, 8, 0.5);
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 8px rgba(26, 18, 8, 0);
    opacity: 0.8;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(26, 18, 8, 0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .cv-fav--icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .cv-fav--full {
    padding: 11px 18px 11px 16px;
    font-size: 13px;
    gap: 7px;
  }

  .cv-fav__pulse {
    right: 8px;
  }
}
</style>