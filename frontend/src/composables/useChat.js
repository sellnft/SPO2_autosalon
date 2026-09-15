import { computed, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

export function useChat() {
  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const toastStore = useToastStore()
  const router = useRouter()

  const chats = computed(() => chatStore.chats)
  const currentChat = computed(() => chatStore.currentChat)
  const messages = computed(() => chatStore.currentMessages)
  const totalUnread = computed(() => chatStore.totalUnread)
  const loading = computed(() => chatStore.loading)

  async function openChatWithSeller(announcementId, sellerId) {
    if (!authStore.isAuthenticated) {
      toastStore.info('Войдите, чтобы написать продавцу')
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
      return null
    }

    try {
      const chat = await chatStore.createOrOpenChat(announcementId, sellerId)
      router.push({ name: 'chat-detail', params: { id: chat.id } })
      return chat
    } catch (err) {
      toastStore.error('Не удалось открыть чат')
      return null
    }
  }

  async function sendMessage(content) {
    if (!content.trim()) return
    try {
      return await chatStore.sendMessage(content)
    } catch (err) {
      toastStore.error('Не удалось отправить сообщение')
      throw err
    }
  }

  return {
    chats,
    currentChat,
    messages,
    totalUnread,
    loading,
    openChatWithSeller,
    sendMessage,
    selectChat: chatStore.selectChat,
    fetchChats: chatStore.fetchChats
  }
}