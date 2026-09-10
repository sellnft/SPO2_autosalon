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
  <div class="chat-list">
    <div class="chat-list__header">
      <h2 class="chat-list__title">Сообщения</h2>
      <span v-if="chatStore.totalUnread" class="chat-list__count">
        {{ chatStore.totalUnread }}
      </span>
    </div>
    
    <div class="chat-list__search">
      <BaseInput
        v-model="chatStore.searchQuery"
        placeholder="Поиск по чатам..."
        size="sm"
      />
    </div>
    
    <div class="chat-list__body">
      <BaseLoader
        v-if="chatStore.loading"
        text="Загрузка чатов..."
      />
      
      <EmptyState
        v-else-if="!chats.length"
        icon="chat"
        title="Нет чатов"
        description="Начните общение с продавцом из объявления"
      />
      
      <div v-else class="chat-list__items">
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
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.chat-list__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.chat-list__title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.chat-list__count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: #0A84FF;
  border-radius: 11px;
}

.chat-list__search {
  padding: 12px 16px;
  border-bottom: 1px solid #F3F4F6;
}

.chat-list__body {
  flex: 1;
  overflow-y: auto;
}

.chat-list__items {
  display: flex;
  flex-direction: column;
}
</style>