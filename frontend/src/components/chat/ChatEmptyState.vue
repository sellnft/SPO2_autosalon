<script setup>
defineProps({
  type: {
    type: String,
    default: 'no-chats', // no-chats | no-selection | error
    validator: (v) => ['no-chats', 'no-selection', 'error'].includes(v)
  }
})

defineEmits(['retry'])
</script>

<template>
  <div class="chat-empty-state">
    <template v-if="type === 'no-chats'">
      <div class="chat-empty-state__icon">💬</div>
      <h3 class="chat-empty-state__title">Нет чатов</h3>
      <p class="chat-empty-state__text">
        Начните общение с продавцом из объявления
      </p>
      <RouterLink to="/announcements" class="chat-empty-state__link">
        Перейти в каталог
      </RouterLink>
    </template>
    
    <template v-else-if="type === 'no-selection'">
      <div class="chat-empty-state__icon">📨</div>
      <h3 class="chat-empty-state__title">Выберите чат</h3>
      <p class="chat-empty-state__text">
        Выберите чат из списка слева, чтобы начать общение
      </p>
    </template>
    
    <template v-else>
      <div class="chat-empty-state__icon">⚠️</div>
      <h3 class="chat-empty-state__title">Ошибка загрузки</h3>
      <p class="chat-empty-state__text">
        Не удалось загрузить чаты
      </p>
      <button class="chat-empty-state__retry" @click="$emit('retry')">
        Повторить
      </button>
    </template>
  </div>
</template>

<style scoped>
.chat-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  height: 100%;
}

.chat-empty-state__icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.4;
}

.chat-empty-state__title {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.chat-empty-state__text {
  margin-bottom: 20px;
  font-size: 14px;
  color: #9CA3AF;
  max-width: 300px;
}

.chat-empty-state__link,
.chat-empty-state__retry {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #0A84FF;
  background: none;
  border: 1px solid #0A84FF;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.chat-empty-state__link:hover,
.chat-empty-state__retry:hover {
  background: #F0F7FF;
}
</style>