<script setup>
import { computed } from 'vue'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import { formatPrice } from '@/utils/formatPrice'

const props = defineProps({
  modelValue: Object
})

const previewAnnouncement = computed(() => ({
  id: 'preview',
  title: `${props.modelValue.brand} ${props.modelValue.model}`,
  brand: props.modelValue.brand,
  model: props.modelValue.model,
  year: Number(props.modelValue.year),
  price: Number(props.modelValue.price),
  mileage: Number(props.modelValue.mileage),
  bodyType: props.modelValue.bodyType,
  transmission: props.modelValue.transmission,
  drive: props.modelValue.drive,
  color: props.modelValue.color,
  city: props.modelValue.city,
  description: props.modelValue.description,
  photos: props.modelValue.photos.map(p => p.url),
  views: 0,
  favourites: 0,
  status: 'pending',
  sellerName: 'Вы',
  sellerType: 'Частное лицо'
}))
</script>

<template>
  <div class="step">
    <p class="step__hint">
      Проверьте, как будет выглядеть ваше объявление
    </p>

    <div class="step__preview">
      <AnnouncementCard :announcement="previewAnnouncement" />
    </div>

    <div class="step__summary">
      <h3 class="step__summary-title">Сводка</h3>
      
      <dl class="step__summary-list">
        <div class="step__summary-item">
          <dt>Автомобиль</dt>
          <dd>{{ modelValue.brand }} {{ modelValue.model }}, {{ modelValue.year }}</dd>
        </div>
        <div class="step__summary-item">
          <dt>Цена</dt>
          <dd>{{ formatPrice(modelValue.price) }}</dd>
        </div>
        <div class="step__summary-item">
          <dt>Пробег</dt>
          <dd>{{ Number(modelValue.mileage).toLocaleString('ru-RU') }} км</dd>
        </div>
        <div class="step__summary-item">
          <dt>Город</dt>
          <dd>{{ modelValue.city }}</dd>
        </div>
        <div class="step__summary-item">
          <dt>Фото</dt>
          <dd>{{ modelValue.photos.length }} шт</dd>
        </div>
      </dl>
    </div>

    <div class="step__notice">
      После публикации объявление будет отправлено на модерацию
    </div>
  </div>
</template>

<style scoped>
.step__hint {
  margin-bottom: 20px;
  font-size: 14px;
  color: #6B7280;
}

.step__preview {
  max-width: 320px;
  margin: 0 auto 32px;
}

.step__summary {
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
  margin-bottom: 20px;
}

.step__summary-title {
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.step__summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step__summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.step__summary-item dt {
  color: #6B7280;
}

.step__summary-item dd {
  font-weight: 500;
  color: #111827;
  text-align: right;
}

.step__notice {
  padding: 12px 16px;
  font-size: 13px;
  color: #92400e;
  background: #FEF3C7;
  border-radius: 8px;
  text-align: center;
}
</style>