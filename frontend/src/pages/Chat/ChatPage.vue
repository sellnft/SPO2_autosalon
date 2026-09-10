<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import ChatList from '@/components/chat/ChatList.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ChatEmptyState from '@/components/chat/ChatEmptyState.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const isMobileView = computed(() => chatStore.currentChatId !== null)

async function loadChats() {
  try {
    await chatStore.fetchChats()
    
    // Открываем чат из URL если есть
    if (route.params.id) {
      await chatStore.selectChat(route.params.id)
    }
  } catch (err) {
    // Ошибка уже в store
  }
}

function handleSelectChat(chatId) {
  router.replace({ name: 'chat-detail', params: { id: chatId } })
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    chatStore.selectChat(newId)
  } else {
    chatStore.currentChatId = null
  }
})

watch(() => chatStore.currentChatId, (id) => {
  if (id && route.params.id !== String(id)) {
    router.replace({ name: 'chat-detail', params: { id } })
  } else if (!id && route.params.id) {
    router.replace({ name: 'chat' })
  }
})

onMounted(() => {
  chatStore.connectWebSocket()
  loadChats()
})

onUnmounted(() => {
  chatStore.disconnectWebSocket()
})
</script>

<template>
  <div class="chat-page">
    <div class="container">
      <Breadcrumbs />
      
      <div class="chat-page__container">
        <!-- Chat List -->
        <aside
          :class="[
            'chat-page__list',
            { 'chat-page__list--hidden-mobile': isMobileView }
          ]"
        >
          <ChatList @select="handleSelectChat" />
        </aside>
        
        <!-- Chat Window -->
        <main
          :class="[
            'chat-page__window',
            { 'chat-page__window--hidden-mobile': !isMobileView && !chatStore.currentChatId }
          ]"
        >
          <ChatWindow v-if="chatStore.currentChat" />
          <ChatEmptyState v-else type="no-selection" />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  padding: 20px 0;
  height: calc(100vh - 72px);
}

.chat-page__container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 16px;
  height: calc(100vh - 160px);
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
}

.chat-page__list {
  border-right: 1px solid #E5E7EB;
  overflow: hidden;
}

.chat-page__window {
  overflow: hidden;
}

/* Mobile */
@media (max-width: 768px) {
  .chat-page {
    padding: 12px 0;
    height: calc(100vh - 60px);
  }
  
  .chat-page__container {
    grid-template-columns: 1fr;
    height: calc(100vh - 100px);
    border-radius: 12px;
  }
  
  .chat-page__list--hidden-mobile {
    display: none;
  }
  
  .chat-page__window--hidden-mobile {
    display: none;
  }
}
</style>