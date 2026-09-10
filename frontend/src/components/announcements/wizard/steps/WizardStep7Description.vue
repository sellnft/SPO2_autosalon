<script setup>
import BaseTextarea from '@/components/common/BaseTextarea.vue'

const props = defineProps({
  modelValue: Object,
  errors: Object
})

const emit = defineEmits(['update:modelValue'])

function update(value) {
  emit('update:modelValue', { ...props.modelValue, description: value })
}
</script>

<template>
  <div class="step">
    <BaseTextarea
      :model-value="modelValue.description"
      label="Описание автомобиля"
      placeholder="Расскажите о состоянии, комплектации, истории обслуживания, причинах продажи..."
      :rows="10"
      :maxlength="5000"
      :error="errors.description"
      required
      @update:model-value="update"
    />

    <div class="step__tips">
      <p class="step__tips-title">💡 Что стоит упомянуть:</p>
      <ul class="step__tips-list">
        <li>Комплектация и опции</li>
        <li>История обслуживания</li>
        <li>Недавние ремонты</li>
        <li>Причина продажи</li>
        <li>Условия осмотра</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.step__tips {
  margin-top: 24px;
  padding: 16px;
  background: #F0F7FF;
  border-left: 3px solid #0A84FF;
  border-radius: 8px;
}

.step__tips-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.step__tips-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 20px;
  list-style: disc;
  font-size: 13px;
  color: #4B5563;
}
</style>