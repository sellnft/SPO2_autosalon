<script setup>
defineProps({
  title: {
    type: String,
    default: 'Произошла ошибка'
  },
  message: {
    type: String,
    default: 'Что-то пошло не так. Попробуйте позже.'
  },
  retry: {
    type: Boolean,
    default: false
  },
  retryText: {
    type: String,
    default: 'Повторить'
  }
})

defineEmits(['retry'])
</script>

<template>
  <div class="error-message" role="alert">
    <div class="error-message__icon">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="2"/>
        <path d="M16 10v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="16" cy="22" r="1" fill="currentColor"/>
      </svg>
    </div>
    
    <h3 class="error-message__title">{{ title }}</h3>
    <p class="error-message__text">{{ message }}</p>
    
    <BaseButton 
      v-if="retry" 
      variant="outline" 
      size="sm"
      @click="$emit('retry')"
    >
      {{ retryText }}
    </BaseButton>
  </div>
</template>

<style scoped>
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-message__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #EF4444;
  background: #FEF2F2;
  border-radius: 50%;
}

.error-message__title {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.error-message__text {
  max-width: 400px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #6B7280;
}
</style>