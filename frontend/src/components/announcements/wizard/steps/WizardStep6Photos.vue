<script setup>
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  stepNumber: {
    type: Number,
    default: 6
  },
  totalSteps: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const toastStore = useToastStore()
const fileInput = ref(null)
const isDragging = ref(false)

const MAX_PHOTOS = 20
const MAX_SIZE = 10 * 1024 * 1024

const recommendedOrder = [
  'Экстерьер 3/4 спереди',
  'Экстерьер 3/4 сзади',
  'Салон спереди',
  'Салон сзади',
  'Приборная панель',
  'Двигатель',
  'Багажник',
  'VIN под капотом',
  'ПТС / СТС',
  'Дефекты'
]

const photosCount = computed(() => props.modelValue.photos?.length || 0)
const filledCount = computed(() => {
  let count = 0
  if (photosCount.value > 0) count++
  if (photosCount.value >= 5) count++
  if (photosCount.value >= 10) count++
  return Math.min(count, 3)
})

const photoStatus = computed(() => {
  const c = photosCount.value
  if (c === 0) return { state: 'neutral', text: 'Добавьте хотя бы одно фото' }
  if (c < 5) return { state: 'warn', text: 'Рекомендуем минимум 5 фото' }
  if (c < 10) return { state: 'accent', text: 'Хорошо, добавьте салон и двигатель' }
  return { state: 'ok', text: 'Отличный набор — объявление получает больше просмотров' }
})

const estimatedViews = computed(() => {
  const c = photosCount.value
  if (c === 0) return null
  if (c < 3) return 'низкое'
  if (c < 8) return 'среднее'
  return 'высокое'
})

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFiles(files) {
  const currentPhotos = [...(props.modelValue.photos || [])]

  if (currentPhotos.length + files.length > MAX_PHOTOS) {
    toastStore.error(`Максимум ${MAX_PHOTOS} фото`)
    return
  }

  let addedCount = 0
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      toastStore.error(`${file.name}: не изображение`)
      continue
    }

    if (file.size > MAX_SIZE) {
      toastStore.error(`${file.name}: превышает 10 МБ`)
      continue
    }

    const url = URL.createObjectURL(file)
    currentPhotos.push({
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      url,
      name: file.name,
      main: currentPhotos.length === 0
    })
    addedCount++
  }

  if (addedCount > 0) {
    toastStore.success(`Добавлено ${addedCount} ${pluralize(addedCount)}`)
  }

  update('photos', currentPhotos)
}

function pluralize(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'фото'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'фото'
  return 'фото'
}

function handleFileInput(event) {
  handleFiles(Array.from(event.target.files))
  event.target.value = ''
}

function handleDrop(event) {
  isDragging.value = false
  handleFiles(Array.from(event.dataTransfer.files))
}

function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function removePhoto(photoId) {
  const photos = props.modelValue.photos.filter(p => p.id !== photoId)

  if (photos.length && !photos.some(p => p.main)) {
    photos[0].main = true
  }

  update('photos', photos)
}

function setMainPhoto(photoId) {
  const photos = props.modelValue.photos.map(p => ({
    ...p,
    main: p.id === photoId
  }))
  update('photos', photos)
}

function movePhoto(photoId, direction) {
  const photos = [...props.modelValue.photos]
  const index = photos.findIndex(p => p.id === photoId)
  if (index === -1) return

  const newIndex = direction === 'left' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= photos.length) return

  ;[photos[index], photos[newIndex]] = [photos[newIndex], photos[index]]
  update('photos', photos)
}

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
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
            Фотографии
          </h2>
          <p class="cv-step__subtitle">Первое фото станет главным в объявлении</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ photosCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">{{ MAX_PHOTOS }}</span>
      </span>
    </header>

    <div
      :class="['cv-step__dropzone', { 'cv-step__dropzone--dragging': isDragging }]"
      @click="triggerFileInput"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        hidden
        @change="handleFileInput"
      />

      <span class="cv-step__dropzone-icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <path d="M17 8l-5-5-5 5"/>
          <path d="M12 3v12"/>
        </svg>
      </span>

      <p class="cv-step__dropzone-title">
        Перетащите фото или нажмите для выбора
      </p>
      <p class="cv-step__dropzone-hint">
        JPG, PNG, WEBP до 10 МБ • Максимум {{ MAX_PHOTOS }} фото
      </p>

      <div class="cv-step__dropzone-badges">
        <span class="cv-step__badge-chip">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          До 20 фото
        </span>
        <span class="cv-step__badge-chip">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          JPG, PNG, WEBP
        </span>
        <span class="cv-step__badge-chip">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          До 10 МБ
        </span>
      </div>
    </div>

    <p v-if="errors.photos" class="cv-step__hint cv-step__hint--error">
      <span class="cv-step__hint-icon" aria-hidden="true">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8v5M12 17h.01"/>
          <circle cx="12" cy="12" r="9"/>
        </svg>
      </span>
      {{ errors.photos }}
    </p>

    <div v-if="photosCount" class="cv-step__status" :data-state="photoStatus.state">
      <span class="cv-step__status-icon" aria-hidden="true">
        <svg v-if="photoStatus.state === 'ok'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8.5l5 5L20 2.5"/>
        </svg>
        <svg v-else-if="photoStatus.state === 'warn'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v5M12 17h.01"/>
        </svg>
        <svg v-else-if="photoStatus.state === 'accent'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="M21 15l-5-5-11 11"/>
        </svg>
      </span>

      <span class="cv-step__status-text">{{ photoStatus.text }}</span>

      <span v-if="estimatedViews" class="cv-step__status-views">
        <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/>
          <circle cx="7" cy="7" r="1.5"/>
        </svg>
        <span>Прогноз просмотров: <strong>{{ estimatedViews }}</strong></span>
      </span>
    </div>

    <div v-if="photosCount" class="cv-step__photos">
      <div
        v-for="(photo, index) in modelValue.photos"
        :key="photo.id"
        :class="['cv-step__photo', { 'cv-step__photo--main': photo.main }]"
      >
        <img :src="photo.url" :alt="photo.name" class="cv-step__photo-image" />

        <span v-if="photo.main" class="cv-step__photo-badge">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18.2 5.5 22l1.7-7.4-5.7-5L9 9z"/>
          </svg>
          Главное
        </span>

        <span class="cv-step__photo-index">#{{ index + 1 }}</span>

        <div class="cv-step__photo-actions">
          <button
            v-if="!photo.main"
            type="button"
            class="cv-step__photo-btn cv-step__photo-btn--star"
            title="Сделать главным"
            aria-label="Сделать главным"
            @click.stop="setMainPhoto(photo.id)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
            </svg>
          </button>

          <button
            v-if="index > 0"
            type="button"
            class="cv-step__photo-btn"
            title="Влево"
            aria-label="Переместить влево"
            @click.stop="movePhoto(photo.id, 'left')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          <button
            v-if="index < modelValue.photos.length - 1"
            type="button"
            class="cv-step__photo-btn"
            title="Вправо"
            aria-label="Переместить вправо"
            @click.stop="movePhoto(photo.id, 'right')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button
            type="button"
            class="cv-step__photo-btn cv-step__photo-btn--delete"
            title="Удалить"
            aria-label="Удалить фото"
            @click.stop="removePhoto(photo.id)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="photosCount" class="cv-step__tips">
      <span class="cv-step__tips-icon" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
      </span>
      <span class="cv-step__tips-title">Порядок фото:</span>
      <span class="cv-step__tips-list">
        {{ recommendedOrder.slice(0, 5).join(' · ') }}
      </span>
    </div>
  </section>
</template>

<style scoped>
.cv-step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.cv-step__progress {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.22);
  flex-shrink: 0;
}

.cv-step__progress-value {
  font-size: 15px;
  font-weight: 800;
  color: #E8D5A0;
  letter-spacing: -0.2px;
}

.cv-step__progress-sep {
  font-size: 12px;
  color: rgba(200, 190, 175, 0.4);
}

.cv-step__progress-total {
  font-size: 12px;
  font-weight: 700;
  color: rgba(220, 210, 195, 0.6);
}

.cv-step__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 38px 20px 32px;
  text-align: center;
  color: rgba(200, 190, 175, 0.55);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.25), rgba(15, 13, 10, 0.35)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 2px dashed rgba(201, 169, 97, 0.28);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  isolation: isolate;
  overflow: hidden;
}

.cv-step__dropzone::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: radial-gradient(ellipse at center, rgba(201, 169, 97, 0.12), transparent 70%);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: -1;
}

.cv-step__dropzone:hover,
.cv-step__dropzone--dragging {
  color: #E8D5A0;
  border-color: rgba(232, 213, 160, 0.6);
  border-style: solid;
  transform: translateY(-2px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(201, 169, 97, 0.15);
}

.cv-step__dropzone:hover::before,
.cv-step__dropzone--dragging::before {
  opacity: 1;
}

.cv-step__dropzone-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  margin-bottom: 12px;
  border-radius: 20px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 0 32px rgba(201, 169, 97, 0.12);
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-step__dropzone:hover .cv-step__dropzone-icon,
.cv-step__dropzone--dragging .cv-step__dropzone-icon {
  transform: translateY(-4px) scale(1.05);
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 48px rgba(201, 169, 97, 0.35);
}

.cv-step__dropzone-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  transition: color 0.25s ease;
}

.cv-step__dropzone:hover .cv-step__dropzone-title,
.cv-step__dropzone--dragging .cv-step__dropzone-title {
  color: #F5E6BC;
}

.cv-step__dropzone-hint {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__dropzone-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  justify-content: center;
}

.cv-step__badge-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.2px;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.15);
  border-radius: 999px;
  white-space: nowrap;
}

.cv-step__badge-chip svg {
  color: #B8CEA8;
  flex-shrink: 0;
}

.cv-step__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  line-height: 1.4;
}

.cv-step__hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
}

.cv-step__hint--error {
  color: #E8A88A;
}

.cv-step__hint--error .cv-step__hint-icon {
  color: #E8A88A;
}

.cv-step__status {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 11px;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  line-height: 1.4;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cv-step__status[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.14), rgba(122, 154, 106, 0.04));
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-step__status[data-state="accent"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.32);
}

.cv-step__status[data-state="warn"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.14), rgba(217, 119, 6, 0.04));
  border: 1px solid rgba(217, 119, 6, 0.32);
}

.cv-step__status[data-state="neutral"] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv-step__status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-step__status-text {
  flex: 1;
  min-width: 0;
}

.cv-step__status-views {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.cv-step__status-views strong {
  color: currentColor;
  font-weight: 800;
  margin-left: 2px;
}

.cv-step__photos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.cv-step__photo {
  position: relative;
  aspect-ratio: 4/3;
  border: 1.5px solid rgba(201, 169, 97, 0.14);
  border-radius: 12px;
  overflow: hidden;
  background: #0F0F14;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  isolation: isolate;
}

.cv-step__photo:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-2px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(201, 169, 97, 0.15);
}

.cv-step__photo--main {
  border-color: rgba(232, 213, 160, 0.65);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.15),
    0 12px 32px rgba(0, 0, 0, 0.45);
}

.cv-step__photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-step__photo:hover .cv-step__photo-image {
  transform: scale(1.06);
}

.cv-step__photo-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-step__photo-index {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: rgba(245, 240, 230, 0.9);
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 7px;
  transition: opacity 0.25s ease;
}

.cv-step__photo--main .cv-step__photo-index {
  opacity: 0;
}

.cv-step__photo-actions {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 8px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.7) 100%);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cv-step__photo:hover .cv-step__photo-actions {
  opacity: 1;
}

.cv-step__photo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: rgba(245, 240, 230, 0.9);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.22s ease;
}

.cv-step__photo-btn:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.25);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-step__photo-btn:active {
  transform: translateY(0) scale(0.94);
}

.cv-step__photo-btn--star:hover {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  border-color: rgba(232, 213, 160, 0.6);
}

.cv-step__photo-btn--delete:hover {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.7);
  border-color: rgba(232, 168, 138, 0.5);
}

.cv-step__tips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: 11px;
  background: rgba(201, 169, 97, 0.04);
  border: 1px dashed rgba(201, 169, 97, 0.22);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.55);
}

.cv-step__tips-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-step__tips-title {
  font-weight: 700;
  color: rgba(220, 210, 195, 0.75);
}

.cv-step__tips-list {
  color: rgba(200, 190, 175, 0.55);
}

@media (max-width: 900px) {
  .cv-step__photos {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .cv-step {
    padding: 20px 18px 22px;
    gap: 16px;
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

  .cv-step__dropzone {
    padding: 28px 16px 24px;
  }

  .cv-step__dropzone-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    margin-bottom: 8px;
  }

  .cv-step__dropzone-icon svg {
    width: 32px;
    height: 32px;
  }

  .cv-step__dropzone-title {
    font-size: 13.5px;
  }

  .cv-step__dropzone-hint {
    font-size: 11px;
  }

  .cv-step__dropzone-badges {
    margin-top: 10px;
    gap: 4px;
  }

  .cv-step__badge-chip {
    padding: 4px 9px;
    font-size: 10px;
  }

  .cv-step__photos {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .cv-step__photo-actions {
    padding: 0 4px;
    gap: 4px;
  }

  .cv-step__photo-btn {
    width: 28px;
    height: 28px;
    border-radius: 7px;
  }

  .cv-step__photo-btn svg {
    width: 12px;
    height: 12px;
  }

  .cv-step__photo-badge {
    padding: 3px 8px;
    font-size: 9px;
  }

  .cv-step__status {
    font-size: 12px;
    padding: 9px 12px;
    gap: 8px;
  }

  .cv-step__status-views {
    font-size: 10px;
    padding: 3px 8px;
  }
}

@media (max-width: 480px) {
  .cv-step__photos {
    gap: 6px;
  }

  .cv-step__photo-btn {
    width: 26px;
    height: 26px;
  }

  .cv-step__photo-index {
    min-width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>