<script setup>
import BaseSelect from '@/components/common/BaseSelect.vue'

defineProps({
  modelValue: {
    type: String,
    default: 'createdAt-desc'
  }
})

const emit = defineEmits(['update:modelValue'])

const sortOptions = [
  { value: 'createdAt-desc', label: 'Сначала новые' },
  { value: 'createdAt-asc', label: 'Сначала старые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'year-desc', label: 'Новые по году' },
  { value: 'year-asc', label: 'Старые по году' },
  { value: 'mileage-asc', label: 'Меньше пробег' },
  { value: 'mileage-desc', label: 'Больше пробег' }
]
</script>

<template>
  <div class="announcement-sort">
    <span class="announcement-sort__label">Сортировка:</span>
    <BaseSelect
      :model-value="modelValue"
      :options="sortOptions"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.announcement-sort {
  display: flex;
  align-items: center;
  gap: 12px;
}

.announcement-sort__label {
  font-size: 14px;
  color: #6B7280;
  white-space: nowrap;
}
</style>