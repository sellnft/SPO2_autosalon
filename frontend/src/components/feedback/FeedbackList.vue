<script setup>
import { ref, computed, onMounted } from 'vue'
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

onMounted(() => {
  if (!feedbackStore.feedback.length) {
    feedbackStore.fetchFeedback()
  }
})
</script>

<template>
  <div class="cv-fblist">
    <div class="cv-fblist__filters-wrap">
      <div class="cv-fblist__filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="[
            'cv-fblist__filter',
            { 'cv-fblist__filter--active': activeFilter === filter.value }
          ]"
          @click="activeFilter = filter.value"
        >
          <span class="cv-fblist__filter-label">{{ filter.label }}</span>
          <span class="cv-fblist__filter-count">
            {{ getFilterCount(filter.value) }}
          </span>
        </button>
      </div>
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

    <div v-else class="cv-fblist__items">
      <FeedbackItem
        v-for="feedback in filteredFeedback"
        :key="feedback.id"
        :feedback="feedback"
      />
    </div>
  </div>
</template>

<style scoped>
.cv-fblist {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-fblist__filters-wrap {
  position: relative;
  margin: 0 -4px;
}

.cv-fblist__filters-wrap::after {
  content: '';
  position: absolute;
  top: 0;
  right: -4px;
  bottom: 4px;
  width: 40px;
  background: linear-gradient(90deg, transparent, #0A0A0C 90%);
  pointer-events: none;
  border-radius: 0 999px 999px 0;
  opacity: 0.9;
}

.cv-fblist__filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 4px 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cv-fblist__filters::-webkit-scrollbar {
  display: none;
}

.cv-fblist__filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px 9px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.6);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-fblist__filter::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-fblist__filter:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.3);
  transform: translateY(-1px);
}

.cv-fblist__filter:hover::before {
  opacity: 1;
}

.cv-fblist__filter--active {
  color: #F5E6BC;
  border-color: rgba(201, 169, 97, 0.55);
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.55), rgba(20, 16, 10, 0.65)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 6px 20px rgba(201, 169, 97, 0.18),
    0 1px 0 rgba(232, 213, 160, 0.1) inset;
  transform: translateY(-1px);
}

.cv-fblist__filter--active::before {
  opacity: 1;
}

.cv-fblist__filter-label {
  position: relative;
  z-index: 1;
}

.cv-fblist__filter-count {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  transition: all 0.25s ease;
}

.cv-fblist__filter--active .cv-fblist__filter-count {
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: transparent;
  box-shadow:
    0 2px 8px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-fblist__items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@media (max-width: 640px) {
  .cv-fblist {
    gap: 18px;
  }

  .cv-fblist__filter {
    padding: 8px 12px 8px 14px;
    font-size: 12.5px;
    gap: 6px;
  }

  .cv-fblist__filter-count {
    min-width: 20px;
    height: 18px;
    font-size: 10.5px;
    padding: 0 6px;
  }

  .cv-fblist__items {
    gap: 10px;
  }
}
</style>