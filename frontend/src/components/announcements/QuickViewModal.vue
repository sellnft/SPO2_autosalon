<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  announcement: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'close'])

const router = useRouter()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const priceFormatted = computed(() => {
  const p = props.announcement?.price
  if (!p && p !== 0) return '—'
  return new Intl.NumberFormat('ru-RU').format(p) + ' ₽'
})

function close() {
  isOpen.value = false
  emit('close')
}

function goToDetail() {
  if (!props.announcement) return
  close()
  router.push({ name: 'announcement-detail', params: { id: props.announcement.id } })
}

function goToSeller() {
  if (!props.announcement?.sellerId) return
  close()
  router.push({ name: 'seller-profile', params: { id: props.announcement.sellerId } })
}

function onBackdropClick(e) {
  if (e.target === e.currentTarget) close()
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

watch(isOpen, (v) => {
  if (typeof document === 'undefined') return
  if (v) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="qv">
      <div v-if="isOpen && announcement" class="qv" @click="onBackdropClick">
        <div class="qv__backdrop" aria-hidden="true"></div>

        <div class="qv__dialog" role="dialog" aria-modal="true">
          <button class="qv__close" type="button" aria-label="Закрыть" @click="close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>

          <div class="qv__image">
            <img
              v-if="announcement.images?.[0]"
              :src="announcement.images[0]"
              :alt="announcement.title"
            />
            <div v-else class="qv__image-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
              </svg>
            </div>
          </div>

          <div class="qv__body">
            <h2 class="qv__title">{{ announcement.title }}</h2>

            <p class="qv__price">{{ priceFormatted }}</p>

            <div class="qv__meta">
              <span v-if="announcement.brand" class="qv__meta-item">{{ announcement.brand }} {{ announcement.model }}</span>
              <span v-if="announcement.year" class="qv__meta-item">{{ announcement.year }}</span>
              <span v-if="announcement.mileage" class="qv__meta-item">{{ announcement.mileage.toLocaleString('ru-RU') }} км</span>
              <span v-if="announcement.city" class="qv__meta-item">{{ announcement.city }}</span>
            </div>

            <p v-if="announcement.description" class="qv__description">
              {{ announcement.description }}
            </p>

            <div class="qv__actions">
              <BaseButton @click="goToDetail">
                Подробнее
              </BaseButton>

              <BaseButton
                v-if="announcement.sellerId"
                variant="outline"
                @click="goToSeller"
              >
                Продавец
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.qv {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.qv__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 7, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.qv__dialog {
  position: relative;
  max-width: 720px;
  width: 100%;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.55)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  border-radius: 20px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.7),
    0 0 80px rgba(201, 169, 97, 0.12);
  overflow: hidden;
  isolation: isolate;
}

.qv__close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: rgba(245, 240, 230, 0.75);
  background: rgba(10, 10, 14, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.22s ease;
}

.qv__close:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  transform: rotate(90deg);
}

.qv__image {
  position: relative;
  aspect-ratio: 16 / 10;
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.qv__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.qv__image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(201, 169, 97, 0.4);
}

.qv__body {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.qv__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.qv__price {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.6px;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.qv__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qv__meta-item {
  display: inline-flex;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 999px;
}

.qv__description {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.qv__actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.qv-enter-active,
.qv-leave-active {
  transition: opacity 0.25s ease;
}

.qv-enter-from,
.qv-leave-to {
  opacity: 0;
}

.qv-enter-active .qv__dialog,
.qv-leave-active .qv__dialog {
  transition: transform 0.3s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.25s ease;
}

.qv-enter-from .qv__dialog,
.qv-leave-to .qv__dialog {
  transform: translateY(20px) scale(0.96);
  opacity: 0;
}

@media (max-width: 640px) {
  .qv { padding: 12px; }
  .qv__dialog { max-height: calc(100vh - 24px); border-radius: 16px; }
  .qv__body { padding: 20px 18px 22px; }
  .qv__title { font-size: 18px; }
  .qv__price { font-size: 22px; }
  .qv__actions { flex-direction: column; }
  .qv__actions > * { width: 100%; }
}
</style>