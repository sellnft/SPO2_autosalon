import config from '@/config'
import axiosInstance from './axios'
import { mockChats } from '@/mock/chats'
import { mockMessages } from '@/mock/messages'

export const chatApi = {
  async getChats() {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return [...mockChats]
    }
    const { data } = await axiosInstance.get('/chats')
    return data
  },

  async getMessages(chatId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      return mockMessages
        .filter(m => m.chatId === Number(chatId))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }
    const { data } = await axiosInstance.get(`/chats/${chatId}/messages`)
    return data
  },

  async sendMessage(chatId, content) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 200))
      const message = {
        id: Date.now(),
        chatId: Number(chatId),
        senderId: 1,
        content,
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sent'
      }
      mockMessages.push(message)
      return message
    }
    const { data } = await axiosInstance.post(`/chats/${chatId}/messages`, { content })
    return data
  },

  async createChat(announcementId, sellerId) {
    if (config.api.useMock) {
      await new Promise(r => setTimeout(r, 300))
      const existing = mockChats.find(c => c.announcementId === Number(announcementId))
      if (existing) return existing

      const chat = {
        id: mockChats.length + 1,
        announcementId: Number(announcementId),
        sellerId: Number(sellerId),
        buyerId: 1,
        sellerName: 'Продавец',
        buyerName: 'Вы',
        announcementTitle: 'Объявление',
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString()
      }
      mockChats.push(chat)
      return chat
    }
    const { data } = await axiosInstance.post('/chats', { announcementId, sellerId })
    return data
  }
}