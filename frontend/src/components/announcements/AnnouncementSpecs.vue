<script setup>
import { computed } from 'vue'
import { formatMileage } from '@/utils/formatMileage'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

const specs = computed(() => [
  { label: 'Год выпуска', value: props.announcement.year },
  { label: 'Пробег', value: formatMileage(props.announcement.mileage) },
  { label: 'Кузов', value: props.announcement.bodyType },
  { label: 'Двигатель', value: props.announcement.engineType },
  { label: 'Объём двигателя', value: `${props.announcement.engineVolume} л` },
  { label: 'Мощность', value: `${props.announcement.power} л.с.` },
  { label: 'КПП', value: props.announcement.transmission },
  { label: 'Привод', value: props.announcement.drive },
  { label: 'Цвет', value: props.announcement.color },
  { label: 'Город', value: props.announcement.city }
])
</script>

<template>
  <div class="announcement-specs">
    <h3 class="announcement-specs__title">Характеристики</h3>
    
    <dl class="announcement-specs__list">
      <div 
        v-for="spec in specs" 
        :key="spec.label"
        class="announcement-specs__item"
      >
        <dt class="announcement-specs__label">{{ spec.label }}</dt>
        <dd class="announcement-specs__value">{{ spec.value }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.announcement-specs {
  padding: 24px;
  background: white;
  border-radius: 16px;
}

.announcement-specs__title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.announcement-specs__list {
  display: grid;
  gap: 16px;
}

.announcement-specs__item {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #F3F4F6;
}

.announcement-specs__item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.announcement-specs__label {
  font-size: 14px;
  color: #6B7280;
}

.announcement-specs__value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}
</style>