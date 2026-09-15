<script setup>
import { computed, ref } from 'vue'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import { formatPrice } from '@/utils/formatPrice'
import { formatMileage } from '@/utils/formatMileage'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  stepNumber: {
    type: Number,
    default: 8
  },
  totalSteps: {
    type: Number,
    default: 8
  }
})

const viewMode = ref('card')

const previewAnnouncement = computed(() => ({
  id: 'preview',
  title: `${props.modelValue.brand || ''} ${props.modelValue.model || ''}`.trim() || 'Новое объявление',
  brand: props.modelValue.brand || '—',
  model: props.modelValue.model || '—',
  year: Number(props.modelValue.year) || null,
  price: Number(props.modelValue.price) || 0,
  mileage: Number(props.modelValue.mileage) || 0,
  bodyType: props.modelValue.bodyType,
  transmission: props.modelValue.transmission,
  drive: props.modelValue.drive,
  color: props.modelValue.color,
  city: props.modelValue.city,
  description: props.modelValue.description,
  photos: (props.modelValue.photos || []).map(p => typeof p === 'string' ? p : p.url),
  views: 0,
  favourites: 0,
  status: 'pending',
  sellerName: 'Вы',
  sellerType: 'Частное лицо',
  negotiable: props.modelValue.negotiable,
  createdAt: new Date().toISOString()
}))

const summary = computed(() => [
  {
    key: 'car',
    label: 'Автомобиль',
    value: `${props.modelValue.brand || '—'} ${props.modelValue.model || '—'}`,
    sub: props.modelValue.year ? `${props.modelValue.year} г.` : null
  },
  {
    key: 'price',
    label: 'Цена',
    value: props.modelValue.price ? formatPrice(props.modelValue.price) : '—',
    sub: props.modelValue.negotiable ? 'возможен торг' : null
  },
  {
    key: 'mileage',
    label: 'Пробег',
    value: props.modelValue.mileage ? formatMileage(props.modelValue.mileage) : '—'
  },
  {
    key: 'specs',
    label: 'Характеристики',
    value: [props.modelValue.engineType, props.modelValue.transmission, props.modelValue.drive]
      .filter(Boolean)
      .join(' · ') || '—'
  },
  {
    key: 'city',
    label: 'Город',
    value: props.modelValue.city || '—'
  },
  {
    key: 'photos',
    label: 'Фотографии',
    value: `${(props.modelValue.photos || []).length} шт.`,
    sub: (props.modelValue.photos || []).length >= 10 ? 'отличный набор' : null
  }
])

const completeness = computed(() => {
  const checks = [
    { field: 'brand', weight: 1 },
    { field: 'model', weight: 1 },
    { field: 'year', weight: 1 },
    { field: 'price', weight: 2 },
    { field: 'mileage', weight: 1 },
    { field: 'bodyType', weight: 1 },
    { field: 'transmission', weight: 1 },
    { field: 'drive', weight: 1 },
    { field: 'color', weight: 1 },
    { field: 'city', weight: 1 },
    { field: 'description', weight: 2, min: 100 },
    { field: 'photos', weight: 3, minCount: 5 }
  ]

  let total = 0
  let filled = 0

  for (const check of checks) {
    total += check.weight
    const value = props.modelValue[check.field]

    if (check.minCount !== undefined) {
      if (Array.isArray(value) && value.length >= check.minCount) filled += check.weight
    } else if (check.min !== undefined) {
      if (typeof value === 'string' && value.length >= check.min) filled += check.weight
    } else if (value !== undefined && value !== null && value !== '') {
      filled += check.weight
    }
  }

  return Math.round((filled / total) * 100)
})

const completenessState = computed(() => {
  const c = completeness.value
  if (c >= 90) return 'ok'
  if (c >= 70) return 'accent'
  if (c >= 50) return 'warn'
  return 'error'
})

const completenessText = computed(() => {
  const c = completeness.value
  if (c >= 90) return 'Объявление готово к публикации'
  if (c >= 70) return 'Хорошо, но можно улучшить'
  if (c >= 50) return 'Заполнено не всё — объявление заметят хуже'
  return 'Много незаполненных полей'
})

const missingFields = computed(() => {
  const result = []
  const checks = [
    { field: 'brand', label: 'Марка' },
    { field: 'model', label: 'Модель' },
    { field: 'year', label: 'Год' },
    { field: 'price', label: 'Цена' },
    { field: 'mileage', label: 'Пробег' },
    { field: 'description', label: 'Описание', min: 100 },
    { field: 'photos', label: 'Фото (минимум 5)', minCount: 5 }
  ]

  for (const check of checks) {
    const value = props.modelValue[check.field]
    let isFilled = false
    if (check.minCount !== undefined) {
      isFilled = Array.isArray(value) && value.length >= check.minCount
    } else if (check.min !== undefined) {
      isFilled = typeof value === 'string' && value.length >= check.min
    } else {
      isFilled = value !== undefined && value !== null && value !== ''
    }
    if (!isFilled) result.push(check.label)
  }

  return result
})
</script>

<template>
  <section class="cv-step">
    <header class="cv-step__header">
      <div class="cv-step__header-left">
        <span class="cv-step__badge">
          <span class="cv-step__badge-label">Шаг</span>
          <span class="cv-step__badge-value">{{ stepNumber }}/{{ totalSteps }}</span>
        </span>

        <div class="cv-step__heading">
          <h2 class="cv-step__title">
            <span class="cv-step__title-dot" aria-hidden="true"></span>
            Превью
          </h2>
          <p class="cv-step__subtitle">Проверьте объявление перед публикацией</p>
        </div>
      </div>

      <div class="cv-step__completeness" :data-state="completenessState">
        <span class="cv-step__completeness-value">{{ completeness }}%</span>
        <span class="cv-step__completeness-label">готово</span>
      </div>
    </header>

    <div class="cv-step__completeness-bar">
      <span
        class="cv-step__completeness-fill"
        :data-state="completenessState"
        :style="{ width: `${completeness}%` }"
      ></span>
    </div>

    <div class="cv-step__completeness-note" :data-state="completenessState">
      <span class="cv-step__completeness-icon" aria-hidden="true">
        <svg v-if="completenessState === 'ok'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8.5l5 5L20 2.5"/>
        </svg>
        <svg v-else-if="completenessState === 'warn' || completenessState === 'error'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v5M12 17h.01"/>
        </svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
        </svg>
      </span>

      <span class="cv-step__completeness-text">{{ completenessText }}</span>

      <span v-if="missingFields.length" class="cv-step__completeness-missing">
        Не хватает: <strong>{{ missingFields.slice(0, 3).join(', ') }}</strong>
        <span v-if="missingFields.length > 3"> и ещё {{ missingFields.length - 3 }}</span>
      </span>
    </div>

    <div class="cv-step__view-toggle">
      <span class="cv-step__view-label">Вид:</span>
      <div class="cv-step__view-buttons">
        <button
          type="button"
          class="cv-step__view-btn"
          :class="{ 'cv-step__view-btn--active': viewMode === 'card' }"
          @click="viewMode = 'card'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Карточка
        </button>
        <button
          type="button"
          class="cv-step__view-btn"
          :class="{ 'cv-step__view-btn--active': viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
          Список
        </button>
      </div>
    </div>

    <div class="cv-step__preview" :data-view="viewMode">
      <AnnouncementCard :announcement="previewAnnouncement" />
    </div>

    <div class="cv-step__summary">
      <header class="cv-step__summary-header">
        <h3 class="cv-step__summary-title">
          <span class="cv-step__summary-title-dot" aria-hidden="true"></span>
          Сводка
        </h3>
      </header>

      <dl class="cv-step__summary-list">
        <div v-for="item in summary" :key="item.key" class="cv-step__summary-item">
          <dt class="cv-step__summary-label">{{ item.label }}</dt>
          <dd class="cv-step__summary-value">
            <span class="cv-step__summary-main">{{ item.value }}</span>
            <span v-if="item.sub" class="cv-step__summary-sub">{{ item.sub }}</span>
          </dd>
        </div>
      </dl>
    </div>

    <div class="cv-step__notice">
      <span class="cv-step__notice-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v5M12 17h.01"/>
        </svg>
      </span>
      <div class="cv-step__notice-content">
        <span class="cv-step__notice-title">После публикации</span>
        <span class="cv-step__notice-text">
          Объявление будет отправлено на модерацию. Обычно проверка занимает до 30 минут.
          Мы уведомим вас в чате и на почту.
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cv-step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 26px 26px;
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

.cv-step::before {
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

.cv-step__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-step__header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.cv-step__badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 54px;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.35),
    0 0 0 1px rgba(255, 245, 214, 0.12) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  flex-shrink: 0;
}

.cv-step__badge-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(26, 18, 8, 0.65);
  line-height: 1;
}

.cv-step__badge-value {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #1A1208;
  line-height: 1;
}

.cv-step__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-step__title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-step__title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-step__subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.55);
}

.cv-step__completeness {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 11px;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.cv-step__completeness[data-state="ok"] {
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.15), rgba(122, 154, 106, 0.04));
  border-color: rgba(122, 154, 106, 0.42);
}

.cv-step__completeness[data-state="accent"] {
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.15), rgba(201, 169, 97, 0.04));
  border-color: rgba(201, 169, 97, 0.42);
}

.cv-step__completeness[data-state="warn"] {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(217, 119, 6, 0.04));
  border-color: rgba(217, 119, 6, 0.42);
}

.cv-step__completeness[data-state="error"] {
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.15), rgba(184, 119, 85, 0.04));
  border-color: rgba(184, 119, 85, 0.42);
}

.cv-step__completeness-value {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  line-height: 1;
}

.cv-step__completeness[data-state="ok"] .cv-step__completeness-value { color: #B8CEA8; }
.cv-step__completeness[data-state="accent"] .cv-step__completeness-value { color: #E8D5A0; }
.cv-step__completeness[data-state="warn"] .cv-step__completeness-value { color: #F0C080; }
.cv-step__completeness[data-state="error"] .cv-step__completeness-value { color: #E8A88A; }

.cv-step__completeness-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.7;
}

.cv-step__completeness-bar {
  position: relative;
  height: 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.cv-step__completeness-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), background 0.35s ease;
  box-shadow: 0 0 12px currentColor;
}

.cv-step__completeness-fill[data-state="ok"] {
  background: linear-gradient(90deg, #7A9A6A, #B8CEA8);
  color: rgba(184, 206, 168, 0.6);
}

.cv-step__completeness-fill[data-state="accent"] {
  background: linear-gradient(90deg, #8B6F3F, #C9A961, #E8D5A0);
  color: rgba(201, 169, 97, 0.6);
}

.cv-step__completeness-fill[data-state="warn"] {
  background: linear-gradient(90deg, #8B4513, #D97706, #F0C080);
  color: rgba(217, 119, 6, 0.6);
}

.cv-step__completeness-fill[data-state="error"] {
  background: linear-gradient(90deg, #6B4225, #B87755, #E8A88A);
  color: rgba(184, 119, 85, 0.6);
}

.cv-step__completeness-note {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 11px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  border: 1px solid transparent;
}

.cv-step__completeness-note[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.1), rgba(122, 154, 106, 0.02));
  border-color: rgba(122, 154, 106, 0.28);
}

.cv-step__completeness-note[data-state="accent"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  border-color: rgba(201, 169, 97, 0.28);
}

.cv-step__completeness-note[data-state="warn"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border-color: rgba(217, 119, 6, 0.28);
}

.cv-step__completeness-note[data-state="error"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.1), rgba(184, 119, 85, 0.02));
  border-color: rgba(184, 119, 85, 0.28);
}

.cv-step__completeness-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-step__completeness-text {
  flex: 1;
  min-width: 0;
}

.cv-step__completeness-missing {
  font-size: 11.5px;
  opacity: 0.75;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.cv-step__completeness-missing strong {
  font-weight: 700;
  color: currentColor;
}

.cv-step__view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.cv-step__view-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__view-buttons {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.15);
}

.cv-step__view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-step__view-btn:hover {
  color: #E8D5A0;
}

.cv-step__view-btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-step__preview {
  display: flex;
  justify-content: center;
}

.cv-step__preview[data-view="card"] {
  padding: 4px 0;
}

.cv-step__preview[data-view="card"] :deep(.cv-acard) {
  max-width: 340px;
  width: 100%;
}

.cv-step__preview[data-view="list"] :deep(.cv-acard) {
  max-width: 720px;
  width: 100%;
}

.cv-step__summary {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.25),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-step__summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-step__summary-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: rgba(245, 240, 230, 0.9);
}

.cv-step__summary-title-dot {
  display: inline-block;
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-step__summary-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
  margin: 0;
}

.cv-step__summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.08);
  min-width: 0;
}

.cv-step__summary-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.45);
}

.cv-step__summary-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0;
  min-width: 0;
}

.cv-step__summary-main {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.05px;
  line-height: 1.3;
  color: #E8D5A0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.cv-step__summary-sub {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-step__notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.03));
  border: 1px solid rgba(217, 119, 6, 0.32);
  border-left: 3px solid rgba(217, 119, 6, 0.7);
}

.cv-step__notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #F0C080;
  flex-shrink: 0;
  margin-top: 1px;
}

.cv-step__notice-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-step__notice-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  color: #F0C080;
}

.cv-step__notice-text {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(240, 192, 128, 0.85);
}

@media (max-width: 768px) {
  .cv-step {
    padding: 20px 18px 22px;
    gap: 18px;
    border-radius: 1rem;
  }

  .cv-step__header {
    padding-bottom: 14px;
  }

  .cv-step__badge {
    min-width: 48px;
    padding: 7px 10px;
    border-radius: 10px;
  }

  .cv-step__badge-value {
    font-size: 14px;
  }

  .cv-step__title {
    font-size: 16px;
  }

  .cv-step__completeness {
    padding: 7px 12px;
  }

  .cv-step__completeness-value {
    font-size: 16px;
  }

  .cv-step__summary-list {
    grid-template-columns: 1fr;
  }

  .cv-step__completeness-note {
    font-size: 12px;
    padding: 9px 12px;
  }

  .cv-step__completeness-missing {
    font-size: 10.5px;
    padding: 2px 8px;
  }
}

@media (max-width: 480px) {
  .cv-step__view-toggle {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .cv-step__view-buttons {
    width: 100%;
  }

  .cv-step__view-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>