<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFeedbackStore } from '@/stores/feedback'
import FeedbackList from '@/components/feedback/FeedbackList.vue'
import FeedbackForm from '@/components/feedback/FeedbackForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const feedbackStore = useFeedbackStore()

const showCreateModal = ref(false)

function handleSuccess(feedback) {
  showCreateModal.value = false
  router.push(`/feedback/${feedback.id}`)
}

onMounted(() => {
  feedbackStore.fetchFeedback()
})
</script>

<template>
  <div class="feedback-page">
    <div class="container">
      <Breadcrumbs />
      
      <!-- Hero -->
      <div class="feedback-page__hero">
        <div>
          <h1 class="feedback-page__title">Служба поддержки</h1>
          <p class="feedback-page__subtitle">
            Поможем с любым вопросом — от технических проблем до предложений
          </p>
        </div>
        
        <BaseButton size="lg" @click="showCreateModal = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Создать обращение
        </BaseButton>
      </div>
      
      <!-- Stats -->
      <div class="feedback-page__stats">
        <div class="feedback-page__stat">
          <span class="feedback-page__stat-value">{{ feedbackStore.feedback.length }}</span>
          <span class="feedback-page__stat-label">Всего обращений</span>
        </div>
        <div class="feedback-page__stat">
          <span class="feedback-page__stat-value">{{ feedbackStore.openCount }}</span>
          <span class="feedback-page__stat-label">Активных</span>
        </div>
        <div class="feedback-page__stat">
          <span class="feedback-page__stat-value">{{ feedbackStore.unreadCount }}</span>
          <span class="feedback-page__stat-label">Непрочитанных</span>
        </div>
      </div>
      
      <!-- List -->
      <FeedbackList @create="showCreateModal = true" />
    </div>
    
    <!-- Create Modal -->
    <BaseModal
      v-model="showCreateModal"
      title="Новое обращение"
      size="lg"
    >
      <FeedbackForm
        @success="handleSuccess"
        @cancel="showCreateModal = false"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.feedback-page {
  padding: 20px 0 40px;
  min-height: 100vh;
}

.feedback-page__hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #F0F7FF 0%, #E0EFFF 100%);
  border-radius: 20px;
}

.feedback-page__title {
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.feedback-page__subtitle {
  font-size: 15px;
  color: #4B5563;
  max-width: 500px;
}

.feedback-page__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.feedback-page__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.feedback-page__stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #0A84FF;
  line-height: 1;
}

.feedback-page__stat-label {
  font-size: 13px;
  color: #6B7280;
}

@media (max-width: 768px) {
  .feedback-page__hero {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .feedback-page__title {
    font-size: 24px;
  }
  
  .feedback-page__stats {
    grid-template-columns: 1fr;
  }
}
</style>