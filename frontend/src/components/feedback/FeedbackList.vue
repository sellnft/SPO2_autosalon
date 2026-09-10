<script setup>
import { ref, computed } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import FeedbackItem from './FeedbackItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const emit = defineEmits(['create'])

const feedbackStore = useFeedbackStore()

const activeFilter = ref('all')

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'open', label: 'Открытые' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'waiting_user', label: 'Ждут ответа' },
  { value: 'resolved', label: 'Решённые' }
]

const filteredFeedback = computed(() => {
  if (activeFilter.value === 'all') return feedbackStore.feedback
  return feedbackStore.feedback.filter(f => f.status === activeFilter.value)
})

function getFilterCount(value) {
  if (value === 'all') return feedbackStore.feedback.length
  return feedbackStore.feedback.filter(f => f.status === value).length
}
</script>

<template>
  <div class="feedback-list">
    <div class="feedback-list__filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="[
          'feedback-list__filter',
          { 'feedback-list__filter--active': activeFilter === filter.value }
        ]"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
        <span class="feedback-list__filter-count">
          {{ getFilterCount(filter.value) }}
        </span>
      </button>
    </div>
    
    <BaseLoader
      v-if="feedbackStore.loading && !feedbackStore.feedback.length"
      text="Загрузка обращений..."
    />
    
    <ErrorMessage
      v-else-if="feedbackStore.error"
      :message="feedbackStore.error"
      retry
      @retry="feedbackStore.fetchFeedback()"
    />
    
    <EmptyState
      v-else-if="!filteredFeedback.length"
      icon="chat"
      :title="feedbackStore.feedback.length ? 'Нет обращений в этой категории' : 'У вас пока нет обращений'"
      description="Если у вас возникли проблемы или вопросы — создайте обращение"
    >
      <BaseButton @click="emit('create')">
        Создать обращение
      </BaseButton>
    </EmptyState>
    
    <div v-else class="feedback-list__items">
      <FeedbackItem
        v-for="feedback in filteredFeedback"
        :key="feedback.id"
        :feedback="feedback"
      />
    </div>
  </div>
</template>

<style scoped>
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feedback-list__filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.feedback-list__filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.feedback-list__filter:hover {
  border-color: #9CA3AF;
}

.feedback-list__filter--active {
  color: #0A84FF;
  background: #F0F7FF;
  border-color: #0A84FF;
}

.feedback-list__filter-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  background: #F3F4F6;
  border-radius: 100px;
}

.feedback-list__filter--active .feedback-list__filter-count {
  color: white;
  background: #0A84FF;
}

.feedback-list__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>