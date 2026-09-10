// TODO: При реальном backend - заменить на реальное WebSocket подключение
import config from '@/config'
import { tokenStorage } from '@/services/storage/tokenStorage'

class ChatSocket {
  constructor() {
    this.socket = null
    this.messageHandlers = []
    this.connected = false
    this.mockInterval = null
  }
  
  connect() {
    if (this.connected) return
    
    if (config.api.useMock) {
      // Mock WebSocket - имитация
      console.log('[Mock WS] Connecting...')
      this.connected = true
      console.log('[Mock WS] Connected')
      return
    }
    
    // TODO: При реальном backend
    // const token = tokenStorage.getAccessToken()
    // this.socket = new WebSocket(`${config.api.wsURL}/chat?token=${token}`)
    // this.socket.onopen = () => { this.connected = true }
    // this.socket.onmessage = (event) => {
    //   const message = JSON.parse(event.data)
    //   this.messageHandlers.forEach(h => h(message))
    // }
    // this.socket.onclose = () => { this.connected = false }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval)
      this.mockInterval = null
    }
    this.connected = false
    this.messageHandlers = []
  }
  
  onMessage(handler) {
    this.messageHandlers.push(handler)
  }
  
  offMessage(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
  }
  
  sendMessage(chatId, content) {
    if (config.api.useMock) {
      // Mock отправка - просто возвращаем сообщение
      const message = {
        id: Date.now(),
        chatId: Number(chatId),
        senderId: 1,
        content,
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sent'
      }
      
      // Имитация ответа собеседника через 2-3 секунды
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          chatId: Number(chatId),
          senderId: this.getChatPartner(chatId),
          content: this.getAutoResponse(),
          createdAt: new Date().toISOString(),
          read: false,
          status: 'received'
        }
        this.messageHandlers.forEach(h => h(response))
      }, 2000 + Math.random() * 2000)
      
      return message
    }
    
    // TODO: При реальном backend
    // this.socket.send(JSON.stringify({ chatId, content }))
  }
  
  getChatPartner(chatId) {
    // Mock - собеседник
    return chatId === 1 ? 3 : 2
  }
  
  getAutoResponse() {
    const responses = [
      'Здравствуйте! Да, автомобиль ещё продаётся.',
      'Можете приехать посмотреть в любое время.',
      'Цена обсуждаема при осмотре.',
      'Все документы в порядке, обслуживание у дилера.',
      'Есть небольшие сколы, могу скинуть фото.',
      'Давайте встретимся завтра в 15:00?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  emitMessage(message) {
    this.messageHandlers.forEach(h => h(message))
  }
}

export const chatSocket = new ChatSocket()