<script setup>
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

const cities = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург',
  'Новосибирск', 'Ростов-на-Дону', 'Уфа', 'Самара',
  'Нижний Новгород', 'Воронеж', 'Краснодар', 'Иркутск'
]

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="step">
    <BaseInput
      :model-value="modelValue.city"
      label="Город"
      placeholder="Начните вводить название"
      :error="errors.city"
      required
      @update:model-value="update('city', $event)"
    />

    <div class="step__cities">
      <button
        v-for="city in cities"
        :key="city"
        :class="['step__city', { 'step__city--active': modelValue.city === city }]"
        @click="update('city', city)"
      >
        {{ city }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.step__cities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.step__city {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  background: #F3F4F6;
  border: 1px solid transparent;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.step__city:hover {
  background: #E5E7EB;
}

.step__city--active {
  color: #0A84FF;
  background: #F0F7FF;
  border-color: #0A84FF;
}
</style>