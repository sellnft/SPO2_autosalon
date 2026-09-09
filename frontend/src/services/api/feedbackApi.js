// TODO: При реальном backend - заменить mock на реальные запросы
import config from '@/config'
import { mockFeedback } from '@/mock/feedback'

export const feedbackApi = {
  async getFeedback() {
    if (config.api.useMock) {
      return mockFeedback
    }
    // const { data } = await axiosInstance.get('/feedback')
    // return data
  },
  
  async getFeedbackById(id) {
    if (config.api.useMock) {
      return mockFeedback.find(f => f.id === Number(id)) || null
    }
    // const { data } = await axiosInstance.get(`/feedback/${id}`)
    // return data
  },
  
  async createFeedback(data) {
    if (config.api.useMock) {
      const feedback = {
        id: mockFeedback.length + 1,
        ...data,
        status: 'new',
        createdAt: new Date().toISOString()
      }
      mockFeedback.push(feedback)
      return feedback
    }
    // const { data } = await axiosInstance.post('/feedback', data)
    // return data
  },
  
  async replyToFeedback(id, message) {
    if (config.api.useMock) {
      const feedback = mockFeedback.find(f => f.id === Number(id))
      if (feedback) {
        feedback.replies = feedback.replies || []
        feedback.replies.push({
          id: feedback.replies.length + 1,
          message,
          createdAt: new Date().toISOString(),
          fromAdmin: true
        })
        feedback.status = 'answered'
      }
      return feedback
    }
    // const { data } = await axiosInstance.post(`/feedback/${id}/reply`, { message })
    // return data
  }
}