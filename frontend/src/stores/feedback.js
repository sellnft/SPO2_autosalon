import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { feedbackApi } from '@/services/api/feedbackApi'

export const useFeedbackStore = defineStore('feedback', () => {
  const feedback = ref([])
  const currentFeedback = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const unreadCount = computed(() => 
    feedback.value.reduce((sum, f) => {
      const unread = f.messages.filter(m => 
        m.authorType === 'admin' && !m.read
      ).length
      return sum + unread
    }, 0)
  )

  const openCount = computed(() => 
    feedback.value.filter(f => 
      ['open', 'in_progress', 'waiting_user'].includes(f.status)
    ).length
  )

  async function fetchFeedback() {
    loading.value = true
    error.value = null
    try {
      feedback.value = await feedbackApi.getFeedback()
      return feedback.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchFeedbackById(id) {
    loading.value = true
    error.value = null
    try {
      currentFeedback.value = await feedbackApi.getFeedbackById(id)
      
      // Помечаем сообщения админа как прочитанные
      if (currentFeedback.value) {
        currentFeedback.value.messages.forEach(m => {
          if (m.authorType === 'admin') m.read = true
        })
        
        // Обновляем и в списке
        const item = feedback.value.find(f => f.id === Number(id))
        if (item) {
          item.messages.forEach(m => {
            if (m.authorType === 'admin') m.read = true
          })
        }
      }
      
      return currentFeedback.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createFeedback(data) {
    loading.value = true
    try {
      const newFeedback = await feedbackApi.createFeedback(data)
      feedback.value.unshift(newFeedback)
      return newFeedback
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(feedbackId, content) {
    try {
      const message = await feedbackApi.sendMessage(feedbackId, content)
      
      // Обновляем локально
      const item = feedback.value.find(f => f.id === Number(feedbackId))
      if (item) {
        item.messages.push(message)
        item.updatedAt = message.createdAt
      }
      
      if (currentFeedback.value?.id === Number(feedbackId)) {
        currentFeedback.value.messages.push(message)
      }
      
      return message
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    feedback,
    currentFeedback,
    loading,
    error,
    unreadCount,
    openCount,
    fetchFeedback,
    fetchFeedbackById,
    createFeedback,
    sendMessage
  }
})