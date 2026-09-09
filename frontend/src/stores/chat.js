import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatApi } from '@/services/api/chatApi'
import { chatSocket } from '@/services/websocket/chatSocket'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const currentChat = ref(null)
  const messages = ref({})
  const loading = ref(false)
  const error = ref(null)
  
  const totalUnread = computed(() => 
    chats.value.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
  )
  
  async function fetchChats() {
    loading.value = true
    try {
      chats.value = await chatApi.getChats()
      return chats.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchMessages(chatId) {
    loading.value = true
    try {
      messages.value[chatId] = await chatApi.getMessages(chatId)
      return messages.value[chatId]
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function sendMessage(chatId, content) {
    try {
      const message = await chatApi.sendMessage(chatId, content)
      if (!messages.value[chatId]) {
        messages.value[chatId] = []
      }
      messages.value[chatId].push(message)
      return message
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  async function createChat(announcementId, sellerId) {
    try {
      const chat = await chatApi.createChat(announcementId, sellerId)
      chats.value.unshift(chat)
      return chat
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  function connectWebSocket() {
    chatSocket.connect()
    chatSocket.onMessage((message) => {
      const chatId = message.chatId
      if (!messages.value[chatId]) {
        messages.value[chatId] = []
      }
      messages.value[chatId].push(message)
    })
  }
  
  function disconnectWebSocket() {
    chatSocket.disconnect()
  }
  
  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    totalUnread,
    fetchChats,
    fetchMessages,
    sendMessage,
    createChat,
    connectWebSocket,
    disconnectWebSocket
  }
})