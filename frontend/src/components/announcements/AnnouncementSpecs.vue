<script setup>
import { computed, ref } from 'vue'
import { formatMileage } from '@/utils/formatMileage'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  },
  columns: {
    type: Number,
    default: 2,
    validator: (v) => [1, 2, 3].includes(v)
  },
  highlightImportant: {
    type: Boolean,
    default: true
  },
  showTitle: {
    type: Boolean,
    default: true
  }
})

const isExpanded = ref(false)

const importantKeys = ['year', 'mileage', 'engineVolume', 'transmission', 'drive']

const allSpecs = computed(() => [
  { key: 'year', label: 'Год выпуска', value: props.announcement.year, icon: 'calendar' },
  { key: 'mileage', label: 'Пробег', value: formatMileage(props.announcement.mileage), icon: 'gauge' },
  { key: 'bodyType', label: 'Кузов', value: props.announcement.bodyType, icon: 'car' },
  { key: 'engineType', label: 'Двигатель', value: props.announcement.engineType, icon: 'engine' },
  { key: 'engineVolume', label: 'Объём двигателя', value: props.announcement.engineVolume ? `${props.announcement.engineVolume} л` : '—', icon: 'drop' },
  { key: 'power', label: 'Мощность', value: props.announcement.power ? `${props.announcement.power} л.с.` : '—', icon: 'bolt' },
  { key: 'transmission', label: 'КПП', value: props.announcement.transmission, icon: 'gear' },
  { key: 'drive', label: 'Привод', value: props.announcement.drive, icon: 'wheel' },
  { key: 'color', label: 'Цвет', value: props.announcement.color, icon: 'palette', color: props.announcement.colorHex },
  { key: 'steeringWheel', label: 'Руль', value: props.announcement.steeringWheel || 'Левый', icon: 'steering' },
  { key: 'owners', label: 'Владельцев', value: props.announcement.owners || '—', icon: 'user' },
  { key: 'city', label: 'Город', value: props.announcement.city, icon: 'pin' }
])

const visibleSpecs = computed(() => {
  if (isExpanded.value) return allSpecs.value
  return allSpecs.value.slice(0, 6)
})

const hiddenCount = computed(() => allSpecs.value.length - 6)

const hasHidden = computed(() => allSpecs.value.length > 6)

function isImportant(spec) {
  return props.highlightImportant && importantKeys.includes(spec.key)
}
</script>

<template>
  <section class="cv-specs">
    <header v-if="showTitle" class="cv-specs__header">
      <h3 class="cv-specs__title">
        <span class="cv-specs__title-dot" aria-hidden="true"></span>
        Характеристики
      </h3>
      <span class="cv-specs__count">{{ allSpecs.length }}</span>
    </header>

    <dl class="cv-specs__list" :data-columns="columns">
      <div
        v-for="spec in visibleSpecs"
        :key="spec.key"
        class="cv-specs__item"
        :class="{ 'cv-specs__item--important': isImportant(spec) }"
      >
        <dt class="cv-specs__label">
          <span class="cv-specs__label-icon" aria-hidden="true">
            <svg v-if="spec.icon === 'calendar'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="6" width="18" height="14" rx="2"/>
              <path d="M3 10h18M8 6V3M16 6V3"/>
            </svg>
            <svg v-else-if="spec.icon === 'gauge'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            <svg v-else-if="spec.icon === 'car'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
              <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
            </svg>
            <svg v-else-if="spec.icon === 'engine'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v6l4 2-4 2v6"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
            <svg v-else-if="spec.icon === 'drop'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.5S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12.5-7-12.5z"/>
            </svg>
            <svg v-else-if="spec.icon === 'bolt'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
            </svg>
            <svg v-else-if="spec.icon === 'gear'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v12M16 6v12M6 10h4M14 10h4M6 14h4M14 14h4M8 8h8M8 16h8"/>
            </svg>
            <svg v-else-if="spec.icon === 'wheel'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else-if="spec.icon === 'palette'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="8" cy="10" r="1.2" fill="currentColor"/>
              <circle cx="12" cy="8" r="1.2" fill="currentColor"/>
              <circle cx="16" cy="10" r="1.2" fill="currentColor"/>
              <circle cx="15" cy="15" r="1.2" fill="currentColor"/>
            </svg>
            <svg v-else-if="spec.icon === 'steering'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="2.5"/>
              <path d="M12 3v7M4 15l6-3M20 15l-6-3"/>
            </svg>
            <svg v-else-if="spec.icon === 'user'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
            </svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
              <circle cx="12" cy="11" r="2.5"/>
            </svg>
          </span>
          <span class="cv-specs__label-text">{{ spec.label }}</span>
        </dt>

        <dd class="cv-specs__value">
          <span
            v-if="spec.key === 'color' && spec.color"
            class="cv-specs__color-swatch"
            :style="{ background: spec.color }"
            aria-hidden="true"
          ></span>
          <span class="cv-specs__value-text">{{ spec.value || '—' }}</span>
        </dd>
      </div>
    </dl>

    <button
      v-if="hasHidden"
      type="button"
      class="cv-specs__toggle"
      :aria-expanded="isExpanded"
      @click="isExpanded = !isExpanded"
    >
      <span class="cv-specs__toggle-text">
        {{ isExpanded ? 'Свернуть' : `Показать все (${hiddenCount})` }}
      </span>
      <span
        class="cv-specs__toggle-chevron"
        :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
        aria-hidden="true"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </span>
    </button>
  </section>
</template>

<style scoped>
.cv-specs {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 24px 24px;
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

.cv-specs::before {
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

.cv-specs__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cv-specs__title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-specs__title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-specs__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.35);
}

.cv-specs__list {
  display: grid;
  gap: 2px 26px;
  margin: 0;
}

.cv-specs__list[data-columns="1"] {
  grid-template-columns: 1fr;
}

.cv-specs__list[data-columns="2"] {
  grid-template-columns: repeat(2, 1fr);
}

.cv-specs__list[data-columns="3"] {
  grid-template-columns: repeat(3, 1fr);
}

.cv-specs__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  min-height: 44px;
  transition: all 0.22s ease;
}

.cv-specs__item::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(201, 169, 97, 0.1) 0%,
    rgba(201, 169, 97, 0.06) 60%,
    transparent 100%
  );
  pointer-events: none;
}

.cv-specs__item:hover {
  padding-left: 6px;
}

.cv-specs__item:hover .cv-specs__label-icon {
  color: #E8D5A0;
  transform: scale(1.08);
}

.cv-specs__item--important .cv-specs__label-icon {
  color: rgba(201, 169, 97, 0.85);
}

.cv-specs__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(200, 190, 175, 0.55);
  min-width: 0;
}

.cv-specs__label-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-specs__label-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cv-specs__value {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  text-align: right;
  flex-shrink: 0;
  max-width: 60%;
}

.cv-specs__value-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cv-specs__item--important .cv-specs__value {
  color: #F5E6BC;
}

.cv-specs__color-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 2px 8px rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
}

.cv-specs__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 18px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-specs__toggle:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-specs__toggle:active {
  transform: translateY(0) scale(0.98);
}

.cv-specs__toggle:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-specs__toggle-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .cv-specs__list[data-columns="3"] {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .cv-specs {
    padding: 18px 18px 20px;
    gap: 14px;
    border-radius: 1rem;
  }

  .cv-specs__list[data-columns="2"],
  .cv-specs__list[data-columns="3"] {
    grid-template-columns: 1fr;
  }

  .cv-specs__item {
    padding: 10px 0;
    gap: 12px;
  }

  .cv-specs__label {
    font-size: 12px;
  }

  .cv-specs__value {
    font-size: 13px;
    max-width: 55%;
  }

  .cv-specs__count {
    min-width: 22px;
    height: 20px;
    font-size: 10.5px;
  }

  .cv-specs__toggle {
    padding: 10px 14px;
    font-size: 12px;
  }
}
</style>