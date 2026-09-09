// TODO: При реальном backend - настроить WebSocket подключение
import config from '@/config'
import { tokenStorage } from '@/services/storage/tokenStorage'

class ChatSocket {
  constructor() {
    this.socket = null
    this.messageHandlers = []
    this.connected = false
  }
  
  connect() {
    if (config.api.useMock) {
      // Mock WebSocket
      console.log('Mock WebSocket connected')
      this.connected = true
      return
    }
    
    // Реальное WebSocket подключение
    // const token = tokenStorage.getAccessToken()
    // this.socket = new WebSocket(`${config.api.wsURL}/chat?token=${token}`)
    // this.socket.onopen = () => { this.connected = true }
    // this.socket.onmessage = (event) => {
    //   const message = JSON.parse(event.data)
    //   this.messageHandlers.forEach(handler => handler(message))
    // }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.connected = false
  }
  
  onMessage(handler) {
    this.messageHandlers.push(handler)
  }
  
  sendMessage(chatId, content) {
    if (config.api.useMock) {
      // Mock отправка
      return {
        id: Date.now(),
        chatId,
        content,
        senderId: 1,
        createdAt: new Date().toISOString(),
        read: false
      }
    }
    
    // Реальная отправка
    // this.socket.send(JSON.stringify({ chatId, content }))
  }
}

export const chatSocket = new ChatSocket()