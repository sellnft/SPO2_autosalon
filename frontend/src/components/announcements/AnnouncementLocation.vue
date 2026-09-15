<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  city: {
    type: String,
    required: true
  },
  region: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  lat: {
    type: Number,
    default: null
  },
  lng: {
    type: Number,
    default: null
  },
  showMap: {
    type: Boolean,
    default: true
  },
  mapHeight: {
    type: Number,
    default: 260
  }
})

const isMapExpanded = ref(false)

const hasCoords = computed(() =>
  props.lat !== null && props.lng !== null
)

const yandexMapUrl = computed(() => {
  if (!hasCoords.value) return ''
  const { lat, lng } = props
  const zoom = 14
  return `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=${zoom}&pt=${lng},${lat},pm2rdm`
})

function toggleMap() {
  if (!hasCoords.value) return
  isMapExpanded.value = !isMapExpanded.value
}
</script>

<template>
  <section class="cv-loc">
    <header class="cv-loc__header">
      <div class="cv-loc__info">
        <span class="cv-loc__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 18s-7-5-7-11a7 7 0 0114 0c0 6-7 11-7 11z"/>
            <circle cx="10" cy="7" r="2.2"/>
          </svg>
        </span>

        <div class="cv-loc__text">
          <h3 class="cv-loc__title">
            {{ city }}<span v-if="region" class="cv-loc__region">, {{ region }}</span>
          </h3>
          <p v-if="address" class="cv-loc__address">{{ address }}</p>
        </div>
      </div>

      <button
        v-if="hasCoords && showMap"
        type="button"
        class="cv-loc__toggle"
        :aria-expanded="isMapExpanded"
        @click="toggleMap"
      >
        <span class="cv-loc__toggle-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/>
            <line x1="8" y1="3" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="21"/>
          </svg>
        </span>
        <span>{{ isMapExpanded ? 'Скрыть карту' : 'Показать на карте' }}</span>
        <span
          class="cv-loc__toggle-chevron"
          :style="{ transform: isMapExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>
    </header>

    <Transition name="cv-loc-map">
      <div
        v-if="hasCoords && showMap && isMapExpanded"
        class="cv-loc__map-wrap"
        :style="{ height: `${mapHeight}px` }"
      >
        <iframe
          :src="yandexMapUrl"
          class="cv-loc__map"
          frameborder="0"
          allowfullscreen
          loading="lazy"
          title="Расположение автомобиля на карте"
        ></iframe>

        <a
          :href="`https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=14&pt=${lng},${lat}`"
          target="_blank"
          rel="noopener noreferrer"
          class="cv-loc__open-external"
          @click.stop
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <path d="M15 3h6v6"/>
            <path d="M10 14L21 3"/>
          </svg>
          Открыть в Яндекс.Картах
        </a>
      </div>
    </Transition>

    <div v-if="!hasCoords && showMap" class="cv-loc__no-map">
      <span class="cv-loc__no-map-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/>
          <line x1="8" y1="3" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="21"/>
        </svg>
      </span>
      <span class="cv-loc__no-map-text">Точный адрес покажет продавец</span>
    </div>
  </section>
</template>

<style scoped>
.cv-loc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 22px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-loc::before {
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

.cv-loc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.cv-loc__info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.cv-loc__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.25);
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.12);
}

.cv-loc__text {
  min-width: 0;
}

.cv-loc__title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.15px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-loc__region {
  color: rgba(200, 190, 175, 0.55);
  font-weight: 500;
}

.cv-loc__address {
  margin: 4px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.6);
}

.cv-loc__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.8);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-loc__toggle:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(201, 169, 97, 0.18);
}

.cv-loc__toggle:active {
  transform: translateY(0) scale(0.97);
}

.cv-loc__toggle:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-loc__toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.85);
  flex-shrink: 0;
}

.cv-loc__toggle-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.cv-loc__map-wrap {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 97, 0.18);
  background: #0F0F14;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
}

.cv-loc__map {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  filter: saturate(0.9) contrast(1.05);
}

.cv-loc__open-external {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 9px;
  text-decoration: none;
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.cv-loc__open-external:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(201, 169, 97, 0.55),
    0 0 0 1px rgba(255, 245, 214, 0.2) inset;
}

.cv-loc__open-external:active {
  transform: translateY(0) scale(0.97);
}

.cv-loc__no-map {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(201, 169, 97, 0.22);
  color: rgba(200, 190, 175, 0.5);
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
}

.cv-loc__no-map-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.55);
  flex-shrink: 0;
}

.cv-loc__no-map-text {
  min-width: 0;
}

.cv-loc-map-enter-active,
.cv-loc-map-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-loc-map-enter-from,
.cv-loc-map-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.cv-loc-map-enter-to,
.cv-loc-map-leave-from {
  opacity: 1;
  max-height: 600px;
  transform: translateY(0);
}

@media (max-width: 640px) {
  .cv-loc {
    padding: 16px 18px;
    gap: 12px;
    border-radius: 1rem;
  }

  .cv-loc__header {
    align-items: flex-start;
  }

  .cv-loc__icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .cv-loc__title {
    font-size: 13.5px;
  }

  .cv-loc__address {
    font-size: 12px;
  }

  .cv-loc__toggle {
    width: 100%;
    justify-content: center;
    padding: 10px 12px;
  }

  .cv-loc__open-external {
    bottom: 8px;
    right: 8px;
    padding: 6px 10px;
    font-size: 10.5px;
  }
}

@media (max-width: 480px) {
  .cv-loc__toggle span:not(.cv-loc__toggle-icon):not(.cv-loc__toggle-chevron) {
    font-size: 12px;
  }
}
</style>