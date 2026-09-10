<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

const engineTypes = [
  { value: 'Бензин', label: 'Бензин' },
  { value: 'Дизель', label: 'Дизель' },
  { value: 'Гибрид', label: 'Гибрид' },
  { value: 'Электро', label: 'Электро' }
]

const transmissions = [
  { value: 'Автомат', label: 'Автомат' },
  { value: 'Механика', label: 'Механика' },
  { value: 'Робот', label: 'Робот' },
  { value: 'Вариатор', label: 'Вариатор' }
]

const drives = [
  { value: 'Передний', label: 'Передний' },
  { value: 'Задний', label: 'Задний' },
  { value: 'Полный', label: 'Полный' }
]

const bodyTypes = [
  { value: 'Седан', label: 'Седан' },
  { value: 'Кроссовер', label: 'Кроссовер' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Хэтчбек', label: 'Хэтчбек' },
  { value: 'Лифтбек', label: 'Лифтбек' },
  { value: 'Универсал', label: 'Универсал' },
  { value: 'Купе', label: 'Купе' }
]

const colors = [
  { value: 'Черный', label: 'Черный' },
  { value: 'Белый', label: 'Белый' },
  { value: 'Серебристый', label: 'Серебристый' },
  { value: 'Серый', label: 'Серый' },
  { value: 'Синий', label: 'Синий' },
  { value: 'Красный', label: 'Красный' },
  { value: 'Зеленый', label: 'Зеленый' },
  { value: 'Коричневый', label: 'Коричневый' },
  { value: 'Оранжевый', label: 'Оранжевый' }
]

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="step">
    <div class="step__grid">
      <BaseInput
        :model-value="modelValue.mileage"
        label="Пробег, км"
        type="number"
        placeholder="50000"
        :error="errors.mileage"
        required
        @update:model-value="update('mileage', $event)"
      />
      
      <BaseSelect
        :model-value="modelValue.engineType"
        :options="engineTypes"
        label="Тип двигателя"
        :error="errors.engineType"
        required
        @update:model-value="update('engineType', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.engineVolume"
        label="Объём, л"
        type="number"
        step="0.1"
        placeholder="2.0"
        @update:model-value="update('engineVolume', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.power"
        label="Мощность, л.с."
        type="number"
        placeholder="200"
        @update:model-value="update('power', $event)"
      />
      
      <BaseSelect
        :model-value="modelValue.transmission"
        :options="transmissions"
        label="КПП"
        :error="errors.transmission"
        required
        @update:model-value="update('transmission', $event)"
      />
      
      <BaseSelect
        :model-value="modelValue.drive"
        :options="drives"
        label="Привод"
        :error="errors.drive"
        required
        @update:model-value="update('drive', $event)"
      />
      
      <BaseSelect
        :model-value="modelValue.bodyType"
        :options="bodyTypes"
        label="Кузов"
        :error="errors.bodyType"
        required
        @update:model-value="update('bodyType', $event)"
      />
      
      <BaseSelect
        :model-value="modelValue.color"
        :options="colors"
        label="Цвет"
        :error="errors.color"
        required
        @update:model-value="update('color', $event)"
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