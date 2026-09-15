<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import MessageItem from './MessageItem.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const messagesContainer = ref(null)

const currentUserId = computed(() => authStore.user?.id || null)

function scrollToBottom(smooth = false) {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  })
}

watch(
  () => chatStore.currentMessages.length,
  () => scrollToBottom(true)
)

watch(
  () => chatStore.currentChatId,
  () => scrollToBottom()
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div ref="messagesContainer" class="message-list">
    <BaseLoader
      v-if="chatStore.loading && !chatStore.currentMessages.length"
      text="Загрузка сообщений..."
    />

    <div v-else-if="!chatStore.currentMessages.length" class="message-list__empty">
      <p>Начните переписку</p>
    </div>

    <div v-else class="message-list__messages">
      <MessageItem
        v-for="message in chatStore.currentMessages"
        :key="message.id"
        :message="message"
        :own="message.senderId === currentUserId"
      />
    </div>
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #FAFBFC;
}

.message-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9CA3AF;
  font-size: 14px;
}

.message-list__messages {
  display: flex;
  flex-direction: column;
}
</style>