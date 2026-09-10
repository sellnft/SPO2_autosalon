<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' },
  { value: 'Mazda', label: 'Mazda' },
  { value: 'Skoda', label: 'Skoda' }
]

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="step">
    <div class="step__grid">
      <BaseSelect
        :model-value="modelValue.brand"
        :options="brands"
        label="Марка"
        placeholder="Выберите марку"
        :error="errors.brand"
        required
        @update:model-value="update('brand', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.model"
        label="Модель"
        placeholder="X5, Camry, etc."
        :error="errors.model"
        required
        @update:model-value="update('model', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.year"
        label="Год выпуска"
        type="number"
        placeholder="2022"
        :error="errors.year"
        required
        @update:model-value="update('year', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.vin"
        label="VIN (необязательно)"
        placeholder="17 символов"
        maxlength="17"
        @update:model-value="update('vin', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.step__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 640px) {
  .step__grid {
    grid-template-columns: 1fr;
  }
}
</style>