<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSwitch from '@/components/common/BaseSwitch.vue'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="step">
    <div class="step__price">
      <BaseInput
        :model-value="modelValue.price"
        label="Цена, ₽"
        type="number"
        placeholder="5000000"
        :error="errors.price"
        required
        size="lg"
        @update:model-value="update('price', $event)"
      />
      
      <p v-if="modelValue.price" class="step__price-hint">
        {{ Number(modelValue.price).toLocaleString('ru-RU') }} ₽
      </p>
    </div>

    <div class="step__switch-item">
      <div>
        <p class="step__switch-title">Возможен торг</p>
        <p class="step__switch-description">Готовы обсудить цену</p>
      </div>
      <BaseSwitch
        :model-value="modelValue.negotiable"
        @update:model-value="update('negotiable', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.step__price {
  max-width: 400px;
  margin: 0 auto 32px;
  text-align: center;
}

.step__price-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6B7280;
}

.step__switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
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
</style>