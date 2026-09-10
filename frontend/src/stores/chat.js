import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatApi } from '@/services/api/chatApi'
import { chatSocket } from '@/services/websocket/chatSocket'

let wsHandler = null

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const currentChatId = ref(null)
  const messages = ref({})
  const loading = ref(false)
  const sending = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const socketConnected = ref(false)
  
  const currentChat = computed(() =>
    chats.value.find(c => c.id === currentChatId.value) || null
  )
  
  const currentMessages = computed(() =>
    messages.value[currentChatId.value] || []
  )
  
  const filteredChats = computed(() => {
    if (!searchQuery.value.trim()) return chats.value
    const q = searchQuery.value.toLowerCase()
    return chats.value.filter(c =>
      c.sellerName?.toLowerCase().includes(q) ||
      c.announcementTitle?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    )
  })
  
  const totalUnread = computed(() =>
    chats.value.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
  )
  
  async function fetchChats() {
    loading.value = true
    error.value = null
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
    if (!chatId) return
    
    try {
      if (!messages.value[chatId]) {
        messages.value[chatId] = []
      }
      
      const msgs = await chatApi.getMessages(chatId)
      messages.value[chatId] = msgs
      
      const chat = chats.value.find(c => c.id === Number(chatId))
      if (chat) {
        chat.unreadCount = 0
      }
      
      return msgs
    } catch (err) {
      error.value = err.message
      throw err
    }
  }
  
  async function selectChat(chatId) {
    currentChatId.value = Number(chatId)
    await fetchMessages(chatId)
  }
  
  async function sendMessage(content) {
    if (!currentChatId.value || !content.trim()) return
    
    sending.value = true
    const chatId = currentChatId.value
    
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      chatId,
      senderId: 1,
      content,
      createdAt: new Date().toISOString(),
      read: false,
      status: 'sending'
    }
    
    if (!messages.value[chatId]) {
      messages.value[chatId] = []
    }
    messages.value[chatId].push(optimisticMessage)
    
    try {
      const sentMessage = await chatApi.sendMessage(chatId, content)
      
      const index = messages.value[chatId].findIndex(
        m => m.id === optimisticMessage.id
      )
      if (index !== -1) {
        messages.value[chatId][index] = { ...sentMessage, status: 'sent' }
      }
      
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.lastMessage = content
        chat.lastMessageAt = new Date().toISOString()
      }
      
      return sentMessage
    } catch (err) {
      const index = messages.value[chatId].findIndex(
        m => m.id === optimisticMessage.id
      )
      if (index !== -1) {
        messages.value[chatId][index].status = 'failed'
      }
      error.value = err.message
      throw err
    } finally {
      sending.value = false
    }
  }
  
  async function createOrOpenChat(announcementId, sellerId) {
    const existing = chats.value.find(c =>
      c.announcementId === Number(announcementId)
    )
    
    if (existing) {
      await selectChat(existing.id)
      return existing
    }
    
    const chat = await chatApi.createChat(announcementId, sellerId)
    chats.value.unshift(chat)
    await selectChat(chat.id)
    return chat
  }
  
  function connectWebSocket() {
    if (socketConnected.value) return
    
    chatSocket.connect()
    
    wsHandler = (message) => {
      const chatId = message.chatId
      
      if (!messages.value[chatId]) {
        messages.value[chatId] = []
      }
      
      const exists = messages.value[chatId].some(m => m.id === message.id)
      if (!exists) {
        messages.value[chatId].push(message)
      }
      
      const chat = chats.value.find(c => c.id === chatId)
      if (chat) {
        chat.lastMessage = message.content
        chat.lastMessageAt = message.createdAt
        
        if (currentChatId.value !== chatId) {
          chat.unreadCount = (chat.unreadCount || 0) + 1
        }
      }
    }
    
    chatSocket.onMessage(wsHandler)
    socketConnected.value = true
  }
  
  function disconnectWebSocket() {
    if (wsHandler) {
      chatSocket.offMessage(wsHandler)
      wsHandler = null
    }
    chatSocket.disconnect()
    socketConnected.value = false
  }
  
  function reset() {
    chats.value = []
    currentChatId.value = null
    messages.value = {}
    error.value = null
    searchQuery.value = ''
  }
  
  return {
    chats,
    currentChatId,
    currentChat,
    currentMessages,
    filteredChats,
    messages,
    loading,
    sending,
    error,
    searchQuery,
    socketConnected,
    totalUnread,
    fetchChats,
    fetchMessages,
    selectChat,
    sendMessage,
    createOrOpenChat,
    connectWebSocket,
    disconnectWebSocket,
    reset
  }
})