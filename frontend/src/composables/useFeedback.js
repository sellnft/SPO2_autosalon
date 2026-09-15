import { computed } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

export function useFeedback() {
  const store = useFeedbackStore()
  const toastStore = useToastStore()
  const router = useRouter()

  const feedback = computed(() => store.feedback)
  const currentFeedback = computed(() => store.currentFeedback)
  const unreadCount = computed(() => store.unreadCount)
  const openCount = computed(() => store.openCount)
  const loading = computed(() => store.loading)

  async function fetchFeedback() {
    try {
      return await store.fetchFeedback()
    } catch (err) {
      toastStore.error('Не удалось загрузить обращения')
      throw err
    }
  }

  async function fetchFeedbackById(id) {
    try {
      return await store.fetchFeedbackById(id)
    } catch (err) {
      toastStore.error('Не удалось загрузить обращение')
      throw err
    }
  }

  async function createFeedback(data) {
    try {
      const fb = await store.createFeedback(data)
      toastStore.success('Обращение создано')
      router.push(`/feedback/${fb.id}`)
      return fb
    } catch (err) {
      toastStore.error('Не удалось создать обращение')
      throw err
    }
  }

  async function sendMessage(feedbackId, content) {
    try {
      return await store.sendMessage(feedbackId, content)
    } catch (err) {
      toastStore.error('Не удалось отправить сообщение')
      throw err
    }
  }

  return {
    feedback,
    currentFeedback,
    unreadCount,
    openCount,
    loading,
    fetchFeedback,
    fetchFeedbackById,
    createFeedback,
    sendMessage
  }
}