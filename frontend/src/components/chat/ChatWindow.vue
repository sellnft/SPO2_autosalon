<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

const chatStore = useChatStore()
const router = useRouter()

const chat = computed(() => chatStore.currentChat)

function goToAnnouncement() {
  if (chat.value?.announcementId) {
    router.push(`/announcements/${chat.value.announcementId}`)
  }
}
</script>

<template>
  <div v-if="chat" class="chat-window">
    <header class="chat-window__header">
      <button
        class="chat-window__back"
        @click="chatStore.currentChatId = null"
        aria-label="Назад"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5l-5 5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <div class="chat-window__avatar">
        {{ (chat.sellerName || chat.buyerName)?.charAt(0) }}
      </div>
      
      <div class="chat-window__info">
        <p class="chat-window__name">
          {{ chat.sellerName || chat.buyerName }}
        </p>
        <button
          class="chat-window__announcement"
          @click="goToAnnouncement"
        >
          {{ chat.announcementTitle }}
        </button>
      </div>
    </header>
    
    <MessageList />
    <MessageInput />
  </div>
  
  <div v-else class="chat-window chat-window--empty">
    <div class="chat-window__empty-content">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3>Выберите чат</h3>
      <p>Начните общение, выбрав чат из списка</p>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.chat-window--empty {
  align-items: center;
  justify-content: center;
  background: #FAFBFC;
}

.chat-window__empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #9CA3AF;
  text-align: center;
}

.chat-window__empty-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: #4B5563;
}

.chat-window__empty-content p {
  font-size: 14px;
}

.chat-window__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
}

.chat-window__back {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #374151;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-window__back:hover {
  background: #F3F4F6;
}

.chat-window__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 50%;
}

.chat-window__info {
  flex: 1;
  min-width: 0;
}

.chat-window__name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.chat-window__announcement {
  font-size: 12px;
  color: #0A84FF;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.chat-window__announcement:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .chat-window__back {
    display: flex;
  }
}
</style>