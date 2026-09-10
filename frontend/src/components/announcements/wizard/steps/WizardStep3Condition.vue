<script setup>
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

const conditions = [
  { value: 'Отличное', label: 'Отличное' },
  { value: 'Хорошее', label: 'Хорошее' },
  { value: 'Удовлетворительное', label: 'Удовлетворительное' },
  { value: 'Требует ремонта', label: 'Требует ремонта' }
]

const steeringOptions = [
  { value: 'Левый', label: 'Левый' },
  { value: 'Правый', label: 'Правый' }
]

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="step">
    <div class="step__grid">
      <BaseSelect
        :model-value="modelValue.condition"
        :options="conditions"
        label="Состояние"
        @update:model-value="update('condition', $event)"
      />
      
      <BaseSelect
        :model-value="modelValue.steeringWheel"
        :options="steeringOptions"
        label="Руль"
        @update:model-value="update('steeringWheel', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.owners"
        label="Количество владельцев"
        type="number"
        placeholder="1"
        @update:model-value="update('owners', $event)"
      />
      
      <BaseInput
        :model-value="modelValue.country"
        label="Страна регистрации"
        placeholder="Россия"
        @update:model-value="update('country', $event)"
      />
    </div>

    <div class="step__switches">
      <div class="step__switch-item">
        <div>
          <p class="step__switch-title">Были ДТП</p>
          <p class="step__switch-description">Отметьте если автомобиль участвовал в авариях</p>
        </div>
        <BaseSwitch
          :model-value="modelValue.hasAccidents"
          @update:model-value="update('hasAccidents', $event)"
        />
      </div>
      
      <div class="step__switch-item">
        <div>
          <p class="step__switch-title">Сервисная история</p>
          <p class="step__switch-description">Есть полная история обслуживания</p>
        </div>
        <BaseSwitch
          :model-value="modelValue.serviceHistory"
          @update:model-value="update('serviceHistory', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.step__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.step__switches {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #F3F4F6;
}

.step__switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.step__switch-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.step__switch-description {
  font-size: 13px;
  color: #6B7280;
}

@media (max-width: 640px) {
  .step__grid {
    grid-template-columns: 1fr;
  }
}
</style>