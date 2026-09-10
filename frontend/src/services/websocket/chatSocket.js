// TODO: При реальном backend - заменить на реальное WebSocket подключение
import config from '@/config'

class ChatSocket {
  constructor() {
    this.socket = null
    this.messageHandlers = []
    this.connected = false
  }
  
  connect() {
    if (this.connected) return
    
    if (config.api.useMock) {
      console.log('[Mock WS] Connected')
      this.connected = true
      return
    }
    
    // TODO: При реальном backend
    // const token = tokenStorage.getAccessToken()
    // this.socket = new WebSocket(`${config.api.wsURL}/chat?token=${token}`)
    // this.socket.onopen = () => { this.connected = true }
    // this.socket.onmessage = (event) => {
    //   const message = JSON.parse(event.data)
    //   this.emitMessage(message)
    // }
    // this.socket.onclose = () => { this.connected = false }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
    this.connected = false
  }
  
  onMessage(handler) {
    if (!this.messageHandlers.includes(handler)) {
      this.messageHandlers.push(handler)
    }
  }
  
  offMessage(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler)
  }
  
  emitMessage(message) {
    this.messageHandlers.forEach(h => {
      try {
        h(message)
      } catch (err) {
        console.error('[WS] Handler error:', err)
      }
    })
  }
  
  sendMessage(chatId, content) {
    if (config.api.useMock) {
      const message = {
        id: Date.now(),
        chatId: Number(chatId),
        senderId: 1,
        content,
        createdAt: new Date().toISOString(),
        read: false,
        status: 'sent'
      }
      
      // Имитация ответа собеседника
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          chatId: Number(chatId),
          senderId: chatId === 1 ? 3 : 2,
          content: this.getAutoResponse(),
          createdAt: new Date().toISOString(),
          read: false,
          status: 'received'
        }
        this.emitMessage(response)
      }, 2000 + Math.random() * 2000)
      
      return message
    }
    // this.socket.send(JSON.stringify({ chatId, content }))
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
}

export const chatSocket = new ChatSocket()