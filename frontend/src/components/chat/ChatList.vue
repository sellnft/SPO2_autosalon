<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import ChatItem from './ChatItem.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

const chatStore = useChatStore()

const chats = computed(() => chatStore.filteredChats)

function handleSelect(chatId) {
  chatStore.selectChat(chatId)
}
</script>

<template>
  <div class="cv-chat-list">
    <div class="cv-chat-list__glow" aria-hidden="true"></div>

    <header class="cv-chat-list__header">
      <h2 class="cv-chat-list__title">Сообщения</h2>
      <span v-if="chatStore.totalUnread" class="cv-chat-list__count">
        {{ chatStore.totalUnread }}
      </span>
    </header>

    <div class="cv-chat-list__search">
      <BaseInput
        v-model="chatStore.searchQuery"
        placeholder="Поиск по чатам..."
      />
    </div>

    <div class="cv-chat-list__body">
      <BaseLoader
        v-if="chatStore.loading && !chats.length"
        text="Загрузка чатов..."
      />

      <EmptyState
        v-else-if="!chats.length"
        icon="chat"
        title="Нет чатов"
        description="Начните общение с продавцом из объявления"
      />

      <div v-else class="cv-chat-list__items">
        <ChatItem
          v-for="chat in chats"
          :key="chat.id"
          :chat="chat"
          :active="chatStore.currentChatId === chat.id"
          @select="handleSelect"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv-chat-list {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #12121A 0%, #0E0E14 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
}

.cv-chat-list__glow {
  position: absolute;
  top: -120px;
  left: -100px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.16), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-chat-list__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.05), transparent);
}

.cv-chat-list__header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.28) 50%,
    transparent
  );
  pointer-events: none;
}

.cv-chat-list__title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.25px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.95);
}

.cv-chat-list__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
  animation: cvChatListCountPulse 2.5s ease-in-out infinite;
}

@keyframes cvChatListCountPulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(201, 169, 97, 0.4),
      0 4px 12px rgba(201, 169, 97, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 3px rgba(201, 169, 97, 0.15),
      0 6px 18px rgba(201, 169, 97, 0.6);
  }
}

.cv-chat-list__search {
  position: relative;
  z-index: 1;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.08);
  background: rgba(0, 0, 0, 0.1);
}

.cv-chat-list__body {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-chat-list__body::-webkit-scrollbar {
  width: 8px;
}

.cv-chat-list__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-chat-list__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-chat-list__items {
  display: flex;
  flex-direction: column;
}

@media (max-width: 640px) {
  .cv-chat-list {
    border-radius: 1rem;
  }

  .cv-chat-list__header {
    padding: 16px 18px 14px;
    gap: 8px;
  }

  .cv-chat-list__title {
    font-size: 17px;
  }

  .cv-chat-list__count {
    min-width: 22px;
    height: 22px;
    font-size: 11px;
    padding: 0 7px;
  }

  .cv-chat-list__search {
    padding: 12px 14px;
  }
}
</style>