<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeedbackStore } from '@/stores/feedback'
import FeedbackChat from '@/components/feedback/FeedbackChat.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import { formatDate } from '@/utils/formatDate'

const route = useRoute()
const router = useRouter()
const feedbackStore = useFeedbackStore()

const loading = ref(true)
const error = ref(null)

const feedback = computed(() => feedbackStore.currentFeedback)

const statusInfo = computed(() => {
  if (!feedback.value) return { label: '', color: '' }
  const map = {
    open: { label: 'Открыто', color: 'info' },
    in_progress: { label: 'В работе', color: 'warning' },
    waiting_user: { label: 'Ждёт вашего ответа', color: 'danger' },
    resolved: { label: 'Решено', color: 'success' },
    closed: { label: 'Закрыто', color: 'neutral' }
  }
  return map[feedback.value.status] || { label: feedback.value.status, color: 'neutral' }
})

const categoryLabel = computed(() => {
  if (!feedback.value) return ''
  const map = {
    technical: 'Техническая проблема',
    payment: 'Оплата и сделки',
    account: 'Аккаунт',
    moderation: 'Модерация',
    suggestion: 'Предложение',
    other: 'Другое'
  }
  return map[feedback.value.category] || 'Другое'
})

async function loadFeedback() {
  loading.value = true
  error.value = null
  try {
    await feedbackStore.fetchFeedbackById(route.params.id)
    if (!feedbackStore.currentFeedback) {
      router.push('/feedback')
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadFeedback)
</script>

<template>
  <div class="feedback-details-page">
    <div class="container">
      <Breadcrumbs />
      
      <BaseLoader v-if="loading" text="Загрузка обращения..." />
      
      <ErrorMessage
        v-else-if="error"
        :message="error"
        retry
        @retry="loadFeedback"
      />
      
      <template v-else-if="feedback">
        <!-- Header -->
        <div class="feedback-details__header">
          <div>
            <div class="feedback-details__meta">
              <span class="feedback-details__id">#{{ feedback.id }}</span>
              <span
                class="feedback-details__status"
                :data-color="statusInfo.color"
              >
                {{ statusInfo.label }}
              </span>
              <span class="feedback-details__category">{{ categoryLabel }}</span>
            </div>
            <h1 class="feedback-details__title">{{ feedback.subject }}</h1>
            <p class="feedback-details__dates">
              Создано: {{ formatDate(feedback.createdAt, 'datetime') }}
              • Обновлено: {{ formatDate(feedback.updatedAt, 'relative') }}
            </p>
          </div>
        </div>
        
        <!-- Chat -->
        <FeedbackChat :feedback="feedback" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.feedback-details-page {
  padding: 20px 0 40px;
  min-height: 100vh;
}

.feedback-details__header {
  padding: 24px;
  margin-bottom: 24px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.feedback-details__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.feedback-details__id {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

.feedback-details__status {
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.feedback-details__status[data-color="info"] {
  color: #1e40af;
  background: #DBEAFE;
}

.feedback-details__status[data-color="warning"] {
  color: #92400e;
  background: #FEF3C7;
}

.feedback-details__status[data-color="danger"] {
  color: #991b1b;
  background: #FEE2E2;
}

.feedback-details__status[data-color="success"] {
  color: #065f46;
  background: #D1FAE5;
}

.feedback-details__status[data-color="neutral"] {
  color: #374151;
  background: #F3F4F6;
}

.feedback-details__category {
  font-size: 13px;
  color: #6B7280;
}

.feedback-details__title {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.feedback-details__dates {
  font-size: 13px;
  color: #9CA3AF;
}

@media (max-width: 640px) {
  .feedback-details__meta {
    flex-wrap: wrap;
  }
  
  .feedback-details__title {
    font-size: 20px;
  }
}
</style>