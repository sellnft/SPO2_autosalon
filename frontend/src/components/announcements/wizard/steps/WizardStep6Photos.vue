<script setup>
import { ref } from 'vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

const toastStore = useToastStore()
const fileInput = ref(null)
const isDragging = ref(false)

const MAX_PHOTOS = 20

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFiles(files) {
  const currentPhotos = [...props.modelValue.photos]

  if (currentPhotos.length + files.length > MAX_PHOTOS) {
    toastStore.error(`Максимум ${MAX_PHOTOS} фото`)
    return
  }

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      toastStore.error('Только изображения')
      continue
    }

    if (file.size > 10 * 1024 * 1024) {
      toastStore.error(`${file.name}: превышает 10 МБ`)
      continue
    }

    // В реальном проекте здесь была бы загрузка на сервер
    // Сейчас используем локальный URL
    const url = URL.createObjectURL(file)
    currentPhotos.push({
      id: `photo-${Date.now()}-${Math.random()}`,
      url,
      name: file.name,
      main: currentPhotos.length === 0
    })
  }

  update('photos', currentPhotos)
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
  
  // Если удалили главное фото, делаем первое главным
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
  <div class="step">
    <div
      :class="['step__dropzone', { 'step__dropzone--dragging': isDragging }]"
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
      
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      
      <p class="step__dropzone-title">
        Перетащите фото или нажмите для выбора
      </p>
      <p class="step__dropzone-hint">
        JPG, PNG, WEBP до 10 МБ • Максимум {{ MAX_PHOTOS }} фото
      </p>
    </div>

    <p v-if="errors.photos" class="step__error">{{ errors.photos }}</p>

    <!-- Preview -->
    <div v-if="modelValue.photos.length" class="step__photos">
      <div
        v-for="(photo, index) in modelValue.photos"
        :key="photo.id"
        :class="['step__photo', { 'step__photo--main': photo.main }]"
      >
        <img :src="photo.url" :alt="photo.name" class="step__photo-image" />
        
        <div class="step__photo-actions">
          <button
            v-if="!photo.main"
            class="step__photo-btn"
            title="Сделать главным"
            @click.stop="setMainPhoto(photo.id)"
          >
            ★
          </button>
          
          <button
            v-if="index > 0"
            class="step__photo-btn"
            title="Влево"
            @click.stop="movePhoto(photo.id, 'left')"
          >
            ←
          </button>
          
          <button
            v-if="index < modelValue.photos.length - 1"
            class="step__photo-btn"
            title="Вправо"
            @click.stop="movePhoto(photo.id, 'right')"
          >
            →
          </button>
          
          <button
            class="step__photo-btn step__photo-btn--delete"
            title="Удалить"
            @click.stop="removePhoto(photo.id)"
          >
            ✕
          </button>
        </div>
        
        <span v-if="photo.main" class="step__photo-badge">Главное</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6B7280;
  background: #F9FAFB;
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.step__dropzone:hover,
.step__dropzone--dragging {
  color: #0A84FF;
  background: #F0F7FF;
  border-color: #0A84FF;
}

.step__dropzone-title {
  margin-top: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.step__dropzone-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #9CA3AF;
}

.step__error {
  margin-top: 8px;
  font-size: 13px;
  color: #EF4444;
}

.step__photos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.step__photo {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  background: #F3F4F6;
}

.step__photo--main {
  border-color: #0A84FF;
}

.step__photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.step__photo-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.step__photo:hover .step__photo-actions {
  opacity: 1;
}

.step__photo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 12px;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.step__photo-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}

.step__photo-btn--delete:hover {
  background: #EF4444;
}

.step__photo-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: #0A84FF;
  border-radius: 4px;
  text-transform: uppercase;
}

@media (max-width: 640px) {
  .step__photos {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>