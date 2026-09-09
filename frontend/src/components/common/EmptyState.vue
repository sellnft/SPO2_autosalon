<script setup>
defineProps({
  icon: {
    type: String,
    default: 'search'
  },
  title: {
    type: String,
    default: 'Ничего не найдено'
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  actionLink: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <svg v-if="icon === 'search'" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="22" cy="22" r="12" stroke="currentColor" stroke-width="2"/>
        <path d="M31 31l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg v-else-if="icon === 'car'" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 36V20l4-10h24l4 10v16" stroke="currentColor" stroke-width="2"/>
        <path d="M8 28h32" stroke="currentColor" stroke-width="2"/>
        <circle cx="16" cy="36" r="4" stroke="currentColor" stroke-width="2"/>
        <circle cx="32" cy="36" r="4" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else-if="icon === 'heart'" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 42S8 32 8 20a8 8 0 0116-4 8 8 0 0116 4c0 12-16 22-16 22z" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else-if="icon === 'chat'" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M8 8h32v24H16L8 40V8z" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
        <path d="M24 16v8l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </div>
    
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    
    <BaseButton 
      v-if="actionText" 
      variant="primary" 
      @click="actionLink ? $router.push(actionLink) : $emit('action')"
    >
      {{ actionText }}
    </BaseButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: #9CA3AF;
  background: #F9FAFB;
  border-radius: 50%;
}

.empty-state__title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.empty-state__description {
  max-width: 400px;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.6;
  color: #6B7280;
}
</style>