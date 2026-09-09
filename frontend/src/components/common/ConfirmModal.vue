<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Подтверждение'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Подтвердить'
  },
  cancelText: {
    type: String,
    default: 'Отмена'
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (v) => ['danger', 'primary', 'warning'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="confirm-modal">
      <p class="confirm-modal__message">{{ message }}</p>
      
      <div class="confirm-modal__actions">
        <BaseButton
          variant="ghost"
          :disabled="loading"
          @click="$emit('cancel'); $emit('update:modelValue', false)"
        >
          {{ cancelText }}
        </BaseButton>
        
        <BaseButton
          :variant="variant"
          :loading="loading"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.confirm-modal__message {
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.confirm-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>