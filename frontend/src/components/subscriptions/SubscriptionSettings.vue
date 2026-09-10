<script setup>
import { reactive, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      priceChange: true,
      statusChange: true,
      messages: true,
      sold: false
    })
  }
})

const emit = defineEmits(['update:modelValue'])

const toastStore = useToastStore()

const settings = reactive({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  Object.assign(settings, val)
}, { deep: true })

function handleChange() {
  emit('update:modelValue', { ...settings })
}

function handleSave() {
  toastStore.success('Настройки подписки сохранены')
}
</script>

<template>
  <div class="subscription-settings">
    <div class="subscription-settings__item">
      <div>
        <p class="subscription-settings__title">Изменение цены</p>
        <p class="subscription-settings__description">
          Уведомлять при изменении цены
        </p>
      </div>
      <BaseSwitch v-model="settings.priceChange" @change="handleChange" />
    </div>
    
    <div class="subscription-settings__item">
      <div>
        <p class="subscription-settings__title">Изменение статуса</p>
        <p class="subscription-settings__description">
          Уведомлять при изменении статуса объявления
        </p>
      </div>
      <BaseSwitch v-model="settings.statusChange" @change="handleChange" />
    </div>
    
    <div class="subscription-settings__item">
      <div>
        <p class="subscription-settings__title">Новые сообщения</p>
        <p class="subscription-settings__description">
          Уведомлять о новых сообщениях в чате
        </p>
      </div>
      <BaseSwitch v-model="settings.messages" @change="handleChange" />
    </div>
    
    <div class="subscription-settings__item">
      <div>
        <p class="subscription-settings__title">Объявление продано</p>
        <p class="subscription-settings__description">
          Уведомлять, когда объявление продано
        </p>
      </div>
      <BaseSwitch v-model="settings.sold" @change="handleChange" />
    </div>
    
    <BaseButton @click="handleSave">Сохранить настройки</BaseButton>
  </div>
</template>

<style scoped>
.subscription-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.subscription-settings__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.subscription-settings__item:last-of-type {
  border-bottom: none;
}

.subscription-settings__title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.subscription-settings__description {
  font-size: 13px;
  color: #6B7280;
}
</style>