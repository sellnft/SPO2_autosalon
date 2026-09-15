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
  },
  badge: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['quick-view', 'compare'])

const router = useRouter()
const favouritesStore = useFavouritesStore()

const isFavourite = computed(() =>
  favouritesStore.isFavourite(props.announcement.id)
)

const isNew = computed(() => {
  if (!props.announcement.createdAt) return false
  const created = new Date(props.announcement.createdAt)
  const days = (Date.now() - created.getTime()) / 86400000
  return days <= 3
})

const pricePerKm = computed(() => {
  const { price, mileage } = props.announcement
  if (!price || !mileage || mileage < 1000) return null
  return Math.round(price / (mileage / 1000))
})

const photoCount = computed(() => props.announcement.photos?.length || 0)

function handleClick() {
  router.push(`/announcements/${props.announcement.id}`)
}

function handleQuickView(event) {
  event.stopPropagation()
  emit('quick-view', props.announcement)
}

function handleCompare(event) {
  event.stopPropagation()
  emit('compare', props.announcement)
}
</script>

<template>
  <article
    class="cv-acard"
    :class="{ 'cv-acard--pending': announcement.status === 'pending' }"
    tabindex="0"
    role="article"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <div class="cv-acard__media">
      <div class="cv-acard__image-wrapper">
        <img
          :src="announcement.photos?.[0]"
          :alt="`${announcement.brand} ${announcement.model}`"
          class="cv-acard__image"
          loading="lazy"
          decoding="async"
          width="400"
          height="300"
        />

        <span class="cv-acard__image-overlay" aria-hidden="true"></span>
      </div>

      <FavouriteButton
        :announcement-id="announcement.id"
        :is-favourite="isFavourite"
        class="cv-acard__favourite"
      />

      <div class="cv-acard__badges">
        <span v-if="announcement.status === 'pending'" class="cv-acard__badge cv-acard__badge--pending">
          <span class="cv-acard__badge-dot"></span>
          На модерации
        </span>

        <span v-else-if="isNew" class="cv-acard__badge cv-acard__badge--new">
          ✨ Новое
        </span>

        <span v-if="badge" class="cv-acard__badge cv-acard__badge--custom">
          {{ badge }}
        </span>
      </div>

      <button
        type="button"
        class="cv-acard__quick"
        aria-label="Быстрый просмотр"
        @click="handleQuickView"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span class="cv-acard__quick-text">Быстрый просмотр</span>
      </button>

      <div v-if="photoCount > 1" class="cv-acard__photos-count">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="M21 15l-5-5-11 11"/>
        </svg>
        {{ photoCount }}
      </div>
    </div>

    <div class="cv-acard__content">
      <h3 class="cv-acard__title">
        {{ announcement.brand }} {{ announcement.model }}
      </h3>

      <div class="cv-acard__price-row">
        <p class="cv-acard__price">
          {{ formatPrice(announcement.price) }}
        </p>
        <span v-if="pricePerKm" class="cv-acard__price-per-km">
          ≈ {{ formatPrice(pricePerKm) }}/км
        </span>
      </div>

      <div class="cv-acard__specs">
        <span class="cv-acard__spec">
          <span class="cv-acard__spec-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="6" width="18" height="14" rx="2"/>
              <path d="M3 10h18M8 6V3M16 6V3"/>
            </svg>
          </span>
          {{ announcement.year }}
        </span>

        <span class="cv-acard__spec">
          <span class="cv-acard__spec-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
          </span>
          {{ formatMileage(announcement.mileage) }}
        </span>

        <span class="cv-acard__spec">
          <span class="cv-acard__spec-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v12M16 6v12M6 10h4M14 10h4M6 14h4M14 14h4M8 8h8M8 16h8"/>
            </svg>
          </span>
          {{ announcement.transmission }}
        </span>
      </div>

      <div class="cv-acard__footer">
        <span class="cv-acard__meta">
          <span class="cv-acard__meta-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 13s-5-3.5-5-8a5 5 0 0110 0c0 4.5-5 8-5 8z"/>
              <circle cx="7" cy="5" r="1.5"/>
            </svg>
          </span>
          {{ announcement.city }}
        </span>

        <span class="cv-acard__meta">
          <span class="cv-acard__meta-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/>
              <circle cx="7" cy="7" r="1.5"/>
            </svg>
          </span>
          {{ announcement.views }}
        </span>
      </div>

      <div class="cv-acard__actions">
        <button
          type="button"
          class="cv-acard__action"
          aria-label="Добавить к сравнению"
          @click="handleCompare"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M3 12h12M3 18h6"/>
            <path d="M18 9l3 3-3 3"/>
          </svg>
        </button>

        <button
          type="button"
          class="cv-acard__action"
          aria-label="Поделиться"
          @click.stop="$emit('share', announcement)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.cv-acard {
  position: relative;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  cursor: pointer;
  isolation: isolate;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-acard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.25) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 3;
}

.cv-acard:hover {
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-4px);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.55),
    0 0 40px rgba(201, 169, 97, 0.15),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset;
}

.cv-acard:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-acard--pending {
  opacity: 0.85;
}

.cv-acard__media {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: #0F0F14;
}

.cv-acard__image-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cv-acard__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-acard:hover .cv-acard__image {
  transform: scale(1.06);
}

.cv-acard__image-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, transparent 30%, transparent 60%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
  z-index: 1;
}

.cv-acard__favourite {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 3;
}

.cv-acard__badges {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.cv-acard__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  white-space: nowrap;
}

.cv-acard__badge--pending {
  color: #F0C080;
  background: rgba(60, 40, 10, 0.75);
  border: 1px solid rgba(217, 119, 6, 0.45);
}

.cv-acard__badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  animation: cvAcardDotPulse 1.8s ease-in-out infinite;
}

@keyframes cvAcardDotPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.cv-acard__badge--new {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-acard__badge--custom {
  color: #E8D5A0;
  background: rgba(30, 24, 14, 0.85);
  border: 1px solid rgba(201, 169, 97, 0.4);
}

.cv-acard__quick {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  border-radius: 10px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 8px 24px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  pointer-events: none;
}

.cv-acard:hover .cv-acard__quick {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.cv-acard__quick:hover {
  transform: translateX(-50%) translateY(-2px) scale(1.03);
  box-shadow:
    0 12px 32px rgba(201, 169, 97, 0.55),
    0 0 0 1px rgba(255, 245, 214, 0.2) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-acard__quick:active {
  transform: translateX(-50%) translateY(0) scale(0.98);
}

.cv-acard__quick-text {
  white-space: nowrap;
}

.cv-acard__photos-count {
  position: absolute;
  bottom: 14px;
  right: 14px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: rgba(245, 240, 230, 0.95);
  background: rgba(10, 10, 14, 0.75);
  border: 1px solid rgba(201, 169, 97, 0.25);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cv-acard__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 18px 18px;
}

.cv-acard__title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 650;
  letter-spacing: -0.15px;
  line-height: 1.35;
  color: rgba(245, 240, 230, 0.92);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.25s ease;
}

.cv-acard:hover .cv-acard__title {
  color: #F5E6BC;
}

.cv-acard__price-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.cv-acard__price {
  margin: 0;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 20px rgba(201, 169, 97, 0.15);
}

.cv-acard__price-per-km {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.5);
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.cv-acard__specs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: auto;
  padding-bottom: 14px;
  flex-wrap: wrap;
}

.cv-acard__spec {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  white-space: nowrap;
}

.cv-acard__spec-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}

.cv-acard__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
  margin-bottom: 12px;
}

.cv-acard__meta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: rgba(200, 190, 175, 0.5);
  min-width: 0;
}

.cv-acard__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-acard__actions {
  display: flex;
  gap: 6px;
  opacity: 0.7;
  transition: opacity 0.25s ease;
}

.cv-acard:hover .cv-acard__actions {
  opacity: 1;
}

.cv-acard__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: rgba(220, 210, 195, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-acard__action:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: translateY(-1px);
}

.cv-acard__action:active {
  transform: translateY(0) scale(0.94);
}

.cv-acard__action:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(201, 169, 97, 0.15);
}

@media (max-width: 480px) {
  .cv-acard__content {
    padding: 14px 14px 16px;
  }

  .cv-acard__title {
    font-size: 15px;
  }

  .cv-acard__price {
    font-size: 19px;
  }

  .cv-acard__price-per-km {
    font-size: 11px;
  }

  .cv-acard__spec {
    font-size: 11.5px;
    padding: 4px 8px;
  }

  .cv-acard__quick {
    padding: 8px 14px;
    font-size: 12px;
  }

  .cv-acard__quick-text {
    display: none;
  }
}
</style>