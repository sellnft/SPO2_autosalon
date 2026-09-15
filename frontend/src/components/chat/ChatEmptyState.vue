<script setup>
defineProps({
  type: {
    type: String,
    default: 'no-chats',
    validator: (v) => ['no-chats', 'no-selection', 'error'].includes(v)
  }
})

defineEmits(['retry'])
</script>

<template>
  <div class="cv-chat-empty">
    <div class="cv-chat-empty__orb" aria-hidden="true"></div>

    <template v-if="type === 'no-chats'">
      <div class="cv-chat-empty__icon">
        <span class="cv-chat-empty__emoji">💬</span>
      </div>
      <h3 class="cv-chat-empty__title">Нет чатов</h3>
      <p class="cv-chat-empty__text">
        Начните общение с продавцом из объявления
      </p>
      <RouterLink to="/announcements" class="cv-chat-empty__action">
        <span>Перейти в каталог</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 4l4 4-4 4"/>
        </svg>
      </RouterLink>
    </template>

    <template v-else-if="type === 'no-selection'">
      <div class="cv-chat-empty__icon">
        <span class="cv-chat-empty__emoji">📨</span>
      </div>
      <h3 class="cv-chat-empty__title">Выберите чат</h3>
      <p class="cv-chat-empty__text">
        Выберите чат из списка слева, чтобы начать общение
      </p>
    </template>

    <template v-else>
      <div class="cv-chat-empty__icon cv-chat-empty__icon--error">
        <span class="cv-chat-empty__emoji">⚠️</span>
      </div>
      <h3 class="cv-chat-empty__title">Ошибка загрузки</h3>
      <p class="cv-chat-empty__text">
        Не удалось загрузить чаты
      </p>
      <button class="cv-chat-empty__action" @click="$emit('retry')">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 8A6 6 0 1 1 8 2"/>
          <path d="M14 2v6h-6"/>
        </svg>
        <span>Повторить</span>
      </button>
    </template>
  </div>
</template>

<style scoped>
.cv-chat-empty {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
}

.cv-chat-empty__orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-chat-empty__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: 24px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.1);
  animation: cvEmptyFloat 4s ease-in-out infinite;
}

.cv-chat-empty__icon--error {
  background:
    linear-gradient(180deg, rgba(40, 20, 14, 0.5) 0%, rgba(20, 12, 8, 0.6) 100%),
    linear-gradient(180deg, #1C1612 0%, #14100C 100%);
  border-color: rgba(184, 119, 85, 0.28);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.06) inset,
    0 1px 0 rgba(232, 168, 138, 0.12) inset,
    0 0 60px rgba(184, 119, 85, 0.15);
}

@keyframes cvEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-chat-empty__emoji {
  font-size: 40px;
  line-height: 1;
  filter: saturate(0.85) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.cv-chat-empty__title {
  position: relative;
  z-index: 1;
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-chat-empty__text {
  position: relative;
  z-index: 1;
  margin: 0 0 24px;
  font-size: 13.5px;
  line-height: 1.6;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.55);
  max-width: 300px;
}

.cv-chat-empty__action {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 22px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 6px 24px rgba(201, 169, 97, 0.3),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-chat-empty__action:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 32px rgba(201, 169, 97, 0.5),
    0 0 0 1px rgba(255, 245, 214, 0.2) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-chat-empty__action:active {
  transform: translateY(0) scale(0.98);
}

.cv-chat-empty__action svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-chat-empty__action:hover svg {
  transform: translateX(3px);
}

@media (max-width: 640px) {
  .cv-chat-empty {
    padding: 48px 20px;
  }

  .cv-chat-empty__orb {
    width: 260px;
    height: 260px;
  }

  .cv-chat-empty__icon {
    width: 84px;
    height: 84px;
    border-radius: 20px;
    margin-bottom: 20px;
  }

  .cv-chat-empty__emoji {
    font-size: 34px;
  }

  .cv-chat-empty__title {
    font-size: 16.5px;
  }

  .cv-chat-empty__text {
    font-size: 13px;
    margin-bottom: 20px;
  }

  .cv-chat-empty__action {
    padding: 10px 18px;
    font-size: 13px;
    gap: 7px;
  }
}
</style>