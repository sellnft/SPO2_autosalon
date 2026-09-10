// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockFeedback } from '@/mock/feedback'

export const feedbackApi = {
  async getFeedback() {
    if (config.api.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockFeedback
    }
    // const { data } = await axiosInstance.get('/feedback')
    // return data
  },
  
  async getFeedbackById(id) {
    if (config.api.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockFeedback.find(f => f.id === Number(id)) || null
    }
    // const { data } = await axiosInstance.get(`/feedback/${id}`)
    // return data
  },
  
  async createFeedback(data) {
    if (config.api.useMock) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const feedback = {
        id: mockFeedback.length + 1,
        userId: 4,
        userName: 'Вы',
        subject: data.subject,
        category: data.category,
        priority: data.priority || 'normal',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: Date.now(),
            feedbackId: mockFeedback.length + 1,
            authorId: 4,
            authorName: 'Вы',
            authorType: 'user',
            content: data.message,
            createdAt: new Date().toISOString(),
            read: true
          }
        ]
      }
      
      mockFeedback.push(feedback)
      return feedback
    }
    // const { data } = await axiosInstance.post('/feedback', data)
    // return data
  },
  
  async sendMessage(feedbackId, content) {
    if (config.api.useMock) {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const feedback = mockFeedback.find(f => f.id === Number(feedbackId))
      if (!feedback) throw new Error('Обращение не найдено')
      
      const message = {
        id: Date.now(),
        feedbackId: Number(feedbackId),
        authorId: 4,
        authorName: 'Вы',
        authorType: 'user',
        content,
        createdAt: new Date().toISOString(),
        read: false
      }
      
      feedback.messages.push(message)
      feedback.updatedAt = new Date().toISOString()
      feedback.status = 'open' // возвращаем в работу
      
      // Имитация ответа поддержки через 3 секунды
      setTimeout(() => {
        const reply = {
          id: Date.now() + 1,
          feedbackId: Number(feedbackId),
          authorId: 100,
          authorName: 'Служба поддержки',
          authorType: 'admin',
          content: 'Спасибо за сообщение! Мы рассмотрим его в ближайшее время.',
          createdAt: new Date().toISOString(),
          read: false
        }
        feedback.messages.push(reply)
        feedback.updatedAt = new Date().toISOString()
        feedback.status = 'in_progress'
      }, 3000)
      
      return message
    }
    // const { data } = await axiosInstance.post(`/feedback/${feedbackId}/messages`, { content })
    // return data
  }
}