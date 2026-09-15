<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavouritesStore } from '@/stores/favourites'
import { formatPrice } from '@/utils/formatPrice'
import { formatMileage } from '@/utils/formatMileage'
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'

const props = defineProps({
  announcements: {
    type: Array,
    default: () => []
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['quick-view', 'compare', 'share'])

const router = useRouter()
const favouritesStore = useFavouritesStore()

function isFavourite(id) {
  return favouritesStore.isFavourite(id)
}

function isNew(announcement) {
  if (!announcement.createdAt) return false
  const days = (Date.now() - new Date(announcement.createdAt).getTime()) / 86400000
  return days <= 3
}

function isHot(announcement) {
  return (announcement.views || 0) >= 500
}

function goTo(id) {
  router.push(`/announcements/${id}`)
}

function handleQuickView(event, announcement) {
  event.stopPropagation()
  emit('quick-view', announcement)
}

function handleCompare(event, announcement) {
  event.stopPropagation()
  emit('compare', announcement)
}

function handleShare(event, announcement) {
  event.stopPropagation()
  emit('share', announcement)
}
</script>

<template>
  <div class="cv-alist">
    <article
      v-for="announcement in announcements"
      :key="announcement.id"
      class="cv-alist__item"
      @click="goTo(announcement.id)"
    >
      <div class="cv-alist__media">
        <img
          :src="announcement.photos?.[0]"
          :alt="`${announcement.brand} ${announcement.model}`"
          class="cv-alist__image"
          loading="lazy"
          decoding="async"
        />
        <span class="cv-alist__media-overlay" aria-hidden="true"></span>

        <FavouriteButton
          :announcement-id="announcement.id"
          :is-favourite="isFavourite(announcement.id)"
          class="cv-alist__favourite"
        />

        <div class="cv-alist__badges">
          <span v-if="announcement.status === 'pending'" class="cv-alist__badge cv-alist__badge--pending">
            <span class="cv-alist__badge-dot"></span>
            На модерации
          </span>
          <span v-else-if="isNew(announcement)" class="cv-alist__badge cv-alist__badge--new">
            ✨ Новое
          </span>
          <span v-if="isHot(announcement)" class="cv-alist__badge cv-alist__badge--hot">
            🔥 Популярное
          </span>
        </div>

        <button
          v-if="showActions"
          type="button"
          class="cv-alist__quick"
          aria-label="Быстрый просмотр"
          @click="handleQuickView($event, announcement)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Быстрый просмотр</span>
        </button>
      </div>

      <div class="cv-alist__content">
        <div class="cv-alist__head">
          <h3 class="cv-alist__title">
            {{ announcement.brand }} {{ announcement.model }}
            <span class="cv-alist__title-year">, {{ announcement.year }}</span>
          </h3>

          <div class="cv-alist__price-block">
            <span class="cv-alist__price">
              {{ formatPrice(announcement.price) }}
            </span>
            <span v-if="announcement.views" class="cv-alist__views">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/>
                <circle cx="7" cy="7" r="1.5"/>
              </svg>
              {{ announcement.views }}
            </span>
          </div>
        </div>

        <div class="cv-alist__specs">
          <span class="cv-alist__spec">
            <span class="cv-alist__spec-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
            </span>
            {{ formatMileage(announcement.mileage) }}
          </span>

          <span v-if="announcement.engineVolume" class="cv-alist__spec">
            <span class="cv-alist__spec-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3v6l4 2-4 2v6"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </span>
            {{ announcement.engineType }} {{ announcement.engineVolume }}л
          </span>

          <span class="cv-alist__spec">
            <span class="cv-alist__spec-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v12M16 6v12M6 10h4M14 10h4M6 14h4M14 14h4M8 8h8M8 16h8"/>
              </svg>
            </span>
            {{ announcement.transmission }}
          </span>

          <span v-if="announcement.drive" class="cv-alist__spec">
            <span class="cv-alist__spec-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
              </svg>
            </span>
            {{ announcement.drive }}
          </span>
        </div>

        <div class="cv-alist__footer">
          <span class="cv-alist__location">
            <span class="cv-alist__location-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 13s-5-3.5-5-8a5 5 0 0110 0c0 4.5-5 8-5 8z"/>
                <circle cx="7" cy="5" r="1.5"/>
              </svg>
            </span>
            {{ announcement.city }}
          </span>

          <div v-if="showActions" class="cv-alist__actions">
            <button
              type="button"
              class="cv-alist__action"
              aria-label="Сравнить"
              @click="handleCompare($event, announcement)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M3 12h12M3 18h6"/>
                <path d="M18 9l3 3-3 3"/>
              </svg>
            </button>

            <button
              type="button"
              class="cv-alist__action"
              aria-label="Поделиться"
              @click="handleShare($event, announcement)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.cv-alist {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-alist__item {
  position: relative;
  display: flex;
  gap: 18px;
  padding: 16px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  cursor: pointer;
  isolation: isolate;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-alist__item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.22) 50%,
    transparent
  );
  pointer-events: none;
  border-radius: inherit inherit 0 0;
}

.cv-alist__item:hover {
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-2px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 32px rgba(201, 169, 97, 0.14);
}

.cv-alist__item:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
}

.cv-alist__media {
  position: relative;
  flex-shrink: 0;
  width: 220px;
  height: 165px;
  border-radius: 14px;
  overflow: hidden;
  background: #0F0F14;
}

.cv-alist__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-alist__item:hover .cv-alist__image {
  transform: scale(1.06);
}

.cv-alist__media-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, transparent 30%, transparent 60%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
  z-index: 1;
}

.cv-alist__favourite {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
}

.cv-alist__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
}

.cv-alist__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border-radius: 999px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  white-space: nowrap;
}

.cv-alist__badge--pending {
  color: #F0C080;
  background: rgba(60, 40, 10, 0.75);
  border: 1px solid rgba(217, 119, 6, 0.45);
}

.cv-alist__badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  animation: cvAlistDot 1.8s ease-in-out infinite;
}

@keyframes cvAlistDot {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.cv-alist__badge--new {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.35);
}

.cv-alist__badge--hot {
  color: #E8A88A;
  background: rgba(60, 30, 20, 0.75);
  border: 1px solid rgba(184, 119, 85, 0.5);
}

.cv-alist__quick {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%) translateY(16px);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  border-radius: 9px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 8px 24px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset;
  pointer-events: none;
  white-space: nowrap;
}

.cv-alist__item:hover .cv-alist__quick {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.cv-alist__quick:hover {
  transform: translateX(-50%) translateY(-2px) scale(1.03);
  box-shadow:
    0 12px 32px rgba(201, 169, 97, 0.55),
    0 0 0 1px rgba(255, 245, 214, 0.2) inset;
}

.cv-alist__quick:active {
  transform: translateX(-50%) translateY(0) scale(0.97);
}

.cv-alist__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cv-alist__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.cv-alist__title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.15px;
  line-height: 1.35;
  color: rgba(245, 240, 230, 0.92);
  transition: color 0.25s ease;
}

.cv-alist__item:hover .cv-alist__title {
  color: #F5E6BC;
}

.cv-alist__title-year {
  color: rgba(200, 190, 175, 0.6);
  font-weight: 600;
  white-space: nowrap;
}

.cv-alist__price-block {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.cv-alist__price {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.1;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  white-space: nowrap;
}

.cv-alist__views {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(200, 190, 175, 0.45);
}

.cv-alist__specs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.cv-alist__spec {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  white-space: nowrap;
}

.cv-alist__spec-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-alist__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(201, 169, 97, 0.08);
}

.cv-alist__location {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.5);
  min-width: 0;
}

.cv-alist__location-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
}

.cv-alist__actions {
  display: flex;
  gap: 6px;
  opacity: 0.7;
  transition: opacity 0.25s ease;
}

.cv-alist__item:hover .cv-alist__actions {
  opacity: 1;
}

.cv-alist__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: rgba(220, 210, 195, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-alist__action:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: translateY(-1px);
}

.cv-alist__action:active {
  transform: translateY(0) scale(0.94);
}

@media (max-width: 900px) {
  .cv-alist__media {
    width: 180px;
    height: 135px;
  }
}

@media (max-width: 640px) {
  .cv-alist {
    gap: 12px;
  }

  .cv-alist__item {
    flex-direction: column;
    padding: 14px;
    gap: 12px;
    border-radius: 1rem;
  }

  .cv-alist__media {
    width: 100%;
    height: 200px;
  }

  .cv-alist__quick {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
    padding: 7px 12px;
    font-size: 11.5px;
  }

  .cv-alist__head {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-bottom: 12px;
  }

  .cv-alist__price-block {
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    width: 100%;
  }

  .cv-alist__price {
    font-size: 20px;
  }

  .cv-alist__title {
    font-size: 15px;
  }

  .cv-alist__spec {
    font-size: 11px;
    padding: 3px 8px;
  }
}

@media (max-width: 480px) {
  .cv-alist__media {
    height: 180px;
  }

  .cv-alist__quick span {
    display: none;
  }

  .cv-alist__quick {
    padding: 8px 10px;
    border-radius: 10px;
  }
}
</style>