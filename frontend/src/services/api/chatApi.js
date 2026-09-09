// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockChats } from '@/mock/chats'
import { mockMessages } from '@/mock/messages'

export const chatApi = {
  async getChats() {
    if (config.api.useMock) {
      return mockChats
    }
    // const { data } = await axiosInstance.get('/chats')
    // return data
  },
  
  async getMessages(chatId) {
    if (config.api.useMock) {
      return mockMessages.filter(m => m.chatId === Number(chatId))
    }
    // const { data } = await axiosInstance.get(`/chats/${chatId}/messages`)
    // return data
  },
  
  async sendMessage(chatId, content) {
    if (config.api.useMock) {
      const message = {
        id: mockMessages.length + 1,
        chatId: Number(chatId),
        senderId: 1, // Текущий пользователь
        content,
        createdAt: new Date().toISOString(),
        read: false
      }
      mockMessages.push(message)
      return message
    }
    // const { data } = await axiosInstance.post(`/chats/${chatId}/messages`, { content })
    // return data
  },
  
  async createChat(announcementId, sellerId) {
    if (config.api.useMock) {
      const chat = {
        id: mockChats.length + 1,
        announcementId: Number(announcementId),
        sellerId: Number(sellerId),
        buyerId: 1, // Текущий пользователь
        createdAt: new Date().toISOString(),
        unreadCount: 0
      }
      mockChats.push(chat)
      return chat
    }
    // const { data } = await axiosInstance.post('/chats', { announcementId, sellerId })
    // return data
  }
}