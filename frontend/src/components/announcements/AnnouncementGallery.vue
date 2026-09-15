<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  }
})

const activeIndex = ref(0)
const isLightboxOpen = ref(false)
const isZoomed = ref(false)
const thumbnailsRef = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)

const currentPhoto = computed(() => props.photos[activeIndex.value] || '')
const hasMany = computed(() => props.photos.length > 1)

function nextPhoto() {
  if (activeIndex.value < props.photos.length - 1) {
    activeIndex.value++
  } else {
    activeIndex.value = 0
  }
}

function prevPhoto() {
  if (activeIndex.value > 0) {
    activeIndex.value--
  } else {
    activeIndex.value = props.photos.length - 1
  }
}

function setPhoto(index) {
  activeIndex.value = index
}

function openLightbox() {
  if (!currentPhoto.value) return
  isLightboxOpen.value = true
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
}

function closeLightbox() {
  isLightboxOpen.value = false
  isZoomed.value = false
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
}

function toggleZoom(event) {
  event.stopPropagation()
  isZoomed.value = !isZoomed.value
}

function handleKeydown(e) {
  if (e.key === 'Escape') closeLightbox()
  else if (e.key === 'ArrowRight') nextPhoto()
  else if (e.key === 'ArrowLeft') prevPhoto()
}

function handleTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

function handleTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  const dy = e.changedTouches[0].clientY - touchStartY.value
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
    dx < 0 ? nextPhoto() : prevPhoto()
  }
}

function scrollThumbnailIntoView() {
  if (!thumbnailsRef.value) return
  const active = thumbnailsRef.value.querySelector('.cv-gal__thumb--active')
  if (active) {
    active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

watch(activeIndex, () => {
  if (isLightboxOpen.value) return
  scrollThumbnailIntoView()
})

watch(() => props.photos, () => {
  activeIndex.value = 0
}, { deep: true })

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div v-if="photos.length" class="cv-gal">
    <div
      class="cv-gal__main"
      @click="openLightbox"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <img
        v-if="currentPhoto"
        :src="currentPhoto"
        alt="Автомобиль"
        class="cv-gal__image"
        draggable="false"
      />
      <div v-else class="cv-gal__placeholder">Нет фото</div>

      <span class="cv-gal__main-overlay" aria-hidden="true"></span>

      <button
        v-if="hasMany"
        class="cv-gal__nav cv-gal__nav--prev"
        aria-label="Предыдущее фото"
        @click.stop="prevPhoto"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 6l-6 6 6 6"/>
        </svg>
      </button>

      <button
        v-if="hasMany"
        class="cv-gal__nav cv-gal__nav--next"
        aria-label="Следующее фото"
        @click.stop="nextPhoto"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 6l6 6-6 6"/>
        </svg>
      </button>

      <span v-if="hasMany" class="cv-gal__counter">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="M21 15l-5-5-11 11"/>
        </svg>
        {{ activeIndex + 1 }} / {{ photos.length }}
      </span>

      <span class="cv-gal__hint" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <path d="M20 20l-3.5-3.5"/>
          <path d="M11 8v6M8 11h6"/>
        </svg>
        <span class="cv-gal__hint-text">Открыть</span>
      </span>
    </div>

    <div v-if="hasMany" ref="thumbnailsRef" class="cv-gal__thumbs">
      <button
        v-for="(photo, index) in photos"
        :key="index"
        :class="['cv-gal__thumb', { 'cv-gal__thumb--active': index === activeIndex }]"
        :aria-label="`Фото ${index + 1}`"
        @click="setPhoto(index)"
      >
        <img :src="photo" :alt="`Фото ${index + 1}`" loading="lazy" draggable="false" />
        <span class="cv-gal__thumb-overlay" aria-hidden="true"></span>
      </button>
    </div>
  </div>

  <div v-else class="cv-gal__empty">
    <div class="cv-gal__empty-icon" aria-hidden="true">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="M21 15l-5-5-11 11"/>
      </svg>
    </div>
    <span class="cv-gal__empty-text">Нет фотографий</span>
  </div>

  <Teleport to="body">
    <Transition name="cv-lightbox">
      <div
        v-if="isLightboxOpen"
        class="cv-lb"
        @click="closeLightbox"
      >
        <div class="cv-lb__backdrop" aria-hidden="true"></div>
        <div class="cv-lb__orb" aria-hidden="true"></div>

        <button
          type="button"
          class="cv-lb__close"
          aria-label="Закрыть"
          @click.stop="closeLightbox"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>

        <button
          v-if="hasMany"
          type="button"
          class="cv-lb__nav cv-lb__nav--prev"
          aria-label="Предыдущее фото"
          @click.stop="prevPhoto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 6l-6 6 6 6"/>
          </svg>
        </button>

        <button
          v-if="hasMany"
          type="button"
          class="cv-lb__nav cv-lb__nav--next"
          aria-label="Следующее фото"
          @click.stop="nextPhoto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </button>

        <div
          class="cv-lb__stage"
          :class="{ 'cv-lb__stage--zoomed': isZoomed }"
          @click.stop="toggleZoom"
          @touchstart.passive="handleTouchStart"
          @touchend.passive="handleTouchEnd"
        >
          <img
            :src="currentPhoto"
            alt="Автомобиль"
            class="cv-lb__image"
            draggable="false"
          />
        </div>

        <div class="cv-lb__footer">
          <span class="cv-lb__counter">
            <strong>{{ activeIndex + 1 }}</strong>
            <span class="cv-lb__counter-sep">/</span>
            <span>{{ photos.length }}</span>
          </span>

          <div class="cv-lb__thumbs">
            <button
              v-for="(photo, index) in photos"
              :key="index"
              :class="['cv-lb__thumb', { 'cv-lb__thumb--active': index === activeIndex }]"
              :aria-label="`Фото ${index + 1}`"
              @click.stop="setPhoto(index)"
            >
              <img :src="photo" :alt="`Фото ${index + 1}`" loading="lazy" draggable="false" />
            </button>
          </div>

          <button
            type="button"
            class="cv-lb__zoom"
            :aria-label="isZoomed ? 'Уменьшить' : 'Увеличить'"
            @click.stop="toggleZoom"
          >
            <svg v-if="!isZoomed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
              <path d="M11 8v6M8 11h6"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
              <path d="M8 11h6"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cv-gal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-gal__main {
  position: relative;
  aspect-ratio: 16/10;
  background: #0A0A0C;
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  cursor: zoom-in;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
  transition: border-color 0.25s ease;
}

.cv-gal__main:hover {
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-gal__main::before {
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
  z-index: 3;
  pointer-events: none;
}

.cv-gal__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-gal__main:hover .cv-gal__image {
  transform: scale(1.03);
}

.cv-gal__main-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, transparent 25%, transparent 65%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
  z-index: 1;
}

.cv-gal__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(200, 190, 175, 0.5);
  font-size: 14px;
}

.cv-gal__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: rgba(245, 240, 230, 0.9);
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(201, 169, 97, 0.25);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  z-index: 2;
}

.cv-gal__nav:hover {
  color: #E8D5A0;
  background: rgba(30, 24, 14, 0.85);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-50%) scale(1.05);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(201, 169, 97, 0.25);
}

.cv-gal__nav:active {
  transform: translateY(-50%) scale(0.96);
}

.cv-gal__nav--prev { left: 16px; }
.cv-gal__nav--next { right: 16px; }

.cv-gal__counter {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: rgba(245, 240, 230, 0.95);
  background: rgba(10, 10, 14, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 9px;
  z-index: 2;
}

.cv-gal__hint {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 9px;
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  z-index: 2;
  pointer-events: none;
}

.cv-gal__main:hover .cv-gal__hint {
  opacity: 1;
  transform: translateY(0);
}

.cv-gal__thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
  scroll-behavior: smooth;
}

.cv-gal__thumbs::-webkit-scrollbar {
  height: 6px;
}

.cv-gal__thumbs::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #C9A961, #8B6F3F);
  border-radius: 3px;
}

.cv-gal__thumb {
  position: relative;
  flex-shrink: 0;
  width: 88px;
  height: 66px;
  padding: 0;
  background: #0A0A0C;
  border: 1.5px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.55;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-gal__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cv-gal__thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
}

.cv-gal__thumb:hover {
  opacity: 0.85;
  transform: translateY(-2px);
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-gal__thumb--active {
  opacity: 1;
  border-color: rgba(232, 213, 160, 0.7);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.15),
    0 6px 20px rgba(201, 169, 97, 0.3);
  transform: translateY(-2px);
}

.cv-gal__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  aspect-ratio: 16/10;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
}

.cv-gal__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 18px;
  color: rgba(201, 169, 97, 0.5);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.18);
}

.cv-gal__empty-text {
  font-size: 13px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.5);
}

.cv-lb {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
}

.cv-lb__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(3, 3, 5, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 0;
}

.cv-lb__orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.12), transparent 70%);
  filter: blur(100px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-lb__close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: rgba(245, 240, 230, 0.85);
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-lb__close:hover {
  color: #E8D5A0;
  background: rgba(30, 24, 14, 0.9);
  border-color: rgba(201, 169, 97, 0.55);
  transform: rotate(90deg);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.3);
}

.cv-lb__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  color: rgba(245, 240, 230, 0.85);
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-lb__nav:hover {
  color: #E8D5A0;
  background: rgba(30, 24, 14, 0.9);
  border-color: rgba(201, 169, 97, 0.55);
  transform: translateY(-50%) scale(1.06);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 32px rgba(201, 169, 97, 0.35);
}

.cv-lb__nav:active {
  transform: translateY(-50%) scale(0.96);
}

.cv-lb__nav--prev { left: 24px; }
.cv-lb__nav--next { right: 24px; }

.cv-lb__stage {
  position: relative;
  z-index: 2;
  max-width: 90vw;
  max-height: 78vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-in;
  transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-lb__stage--zoomed {
  cursor: zoom-out;
  transform: scale(1.6);
}

.cv-lb__image {
  max-width: 100%;
  max-height: 78vh;
  object-fit: contain;
  display: block;
  border-radius: 8px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(201, 169, 97, 0.12) inset;
  user-select: none;
}

.cv-lb__footer {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px 10px 18px;
  background: rgba(10, 10, 14, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
}

.cv-lb__counter {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: rgba(245, 240, 230, 0.85);
  white-space: nowrap;
}

.cv-lb__counter strong {
  font-size: 15px;
  font-weight: 800;
  color: #E8D5A0;
}

.cv-lb__counter-sep {
  color: rgba(201, 169, 97, 0.4);
}

.cv-lb__thumbs {
  display: flex;
  gap: 6px;
  max-width: 40vw;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: none;
  scroll-behavior: smooth;
}

.cv-lb__thumbs::-webkit-scrollbar { display: none; }

.cv-lb__thumb {
  flex-shrink: 0;
  width: 48px;
  height: 36px;
  padding: 0;
  background: #0A0A0C;
  border: 1.5px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.5;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-lb__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cv-lb__thumb:hover {
  opacity: 0.85;
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-2px);
}

.cv-lb__thumb--active {
  opacity: 1;
  border-color: rgba(232, 213, 160, 0.7);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.2),
    0 4px 14px rgba(201, 169, 97, 0.3);
  transform: translateY(-2px);
}

.cv-lb__zoom {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-lb__zoom:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-2px);
}

.cv-lightbox-enter-active,
.cv-lightbox-leave-active {
  transition: opacity 0.3s ease;
}

.cv-lightbox-enter-active .cv-lb__stage,
.cv-lightbox-leave-active .cv-lb__stage {
  transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.3s ease;
}

.cv-lightbox-enter-from,
.cv-lightbox-leave-to {
  opacity: 0;
}

.cv-lightbox-enter-from .cv-lb__stage,
.cv-lightbox-leave-to .cv-lb__stage {
  transform: scale(0.9);
  opacity: 0;
}

@media (max-width: 768px) {
  .cv-gal__nav {
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  .cv-gal__nav--prev { left: 10px; }
  .cv-gal__nav--next { right: 10px; }

  .cv-gal__counter {
    bottom: 10px;
    left: 10px;
    padding: 5px 10px;
    font-size: 11px;
  }

  .cv-gal__hint {
    display: none;
  }

  .cv-gal__thumb {
    width: 72px;
    height: 54px;
    border-radius: 8px;
  }

  .cv-lb__nav {
    width: 44px;
    height: 44px;
  }

  .cv-lb__nav--prev { left: 10px; }
  .cv-lb__nav--next { right: 10px; }

  .cv-lb__close {
    top: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
  }

  .cv-lb__stage,
  .cv-lb__image {
    max-width: 96vw;
    max-height: 70vh;
  }

  .cv-lb__footer {
    bottom: 12px;
    left: 12px;
    right: 12px;
    transform: none;
    width: auto;
    padding: 8px 10px 8px 14px;
    gap: 10px;
  }

  .cv-lb__counter { font-size: 12px; }
  .cv-lb__counter strong { font-size: 14px; }

  .cv-lb__thumbs { max-width: none; flex: 1; }

  .cv-lb__thumb {
    width: 42px;
    height: 32px;
  }

  .cv-lb__zoom {
    width: 36px;
    height: 36px;
  }
}
</style>