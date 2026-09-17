<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeedbackStore } from '@/stores/feedback'
import { useToastStore } from '@/stores/toast'
import FeedbackChat from '@/components/feedback/FeedbackChat.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const feedbackStore = useFeedbackStore()
const toastStore = useToastStore()

const loading = ref(true)
const error = ref(null)
const showCloseConfirm = ref(false)
const closing = ref(false)
const rating = ref(0)
const ratingSubmitted = ref(false)

const feedback = computed(() => feedbackStore.currentFeedback)

const statusConfig = {
  open: { label: 'Открыто', color: 'info', icon: 'chat' },
  in_progress: { label: 'В работе', color: 'warning', icon: 'clock' },
  waiting_user: { label: 'Ждёт вашего ответа', color: 'danger', icon: 'user-wait' },
  resolved: { label: 'Решено', color: 'success', icon: 'check' },
  closed: { label: 'Закрыто', color: 'neutral', icon: 'lock' }
}

const priorityConfig = {
  low: { label: 'Низкий', color: 'neutral' },
  normal: { label: 'Обычный', color: 'info' },
  high: { label: 'Высокий', color: 'warning' },
  critical: { label: 'Критический', color: 'danger' }
}

const categoryConfig = {
  technical: { label: 'Техническая проблема', icon: 'wrench' },
  payment: { label: 'Оплата и сделки', icon: 'money' },
  account: { label: 'Аккаунт', icon: 'user' },
  moderation: { label: 'Модерация', icon: 'shield' },
  suggestion: { label: 'Предложение', icon: 'star' },
  other: { label: 'Другое', icon: 'info' }
}

const statusInfo = computed(() => {
  if (!feedback.value) return { label: '', color: 'neutral', icon: 'info' }
  return statusConfig[feedback.value.status] || { label: feedback.value.status, color: 'neutral', icon: 'info' }
})

const priorityInfo = computed(() => {
  if (!feedback.value) return null
  return priorityConfig[feedback.value.priority] || null
})

const categoryInfo = computed(() => {
  if (!feedback.value) return null
  return categoryConfig[feedback.value.category] || categoryConfig.other
})

const timeline = computed(() => {
  if (!feedback.value) return []
  const items = []
  const f = feedback.value

  if (f.createdAt) {
    items.push({
      state: 'done',
      icon: 'create',
      title: 'Обращение создано',
      time: f.createdAt,
      author: 'Вы'
    })
  }

  if (f.takenAt) {
    items.push({
      state: 'done',
      icon: 'in-progress',
      title: 'Взято в работу',
      time: f.takenAt,
      author: f.assigneeName || 'Поддержка'
    })
  }

  if (f.resolvedAt) {
    items.push({
      state: 'done',
      icon: 'check',
      title: 'Обращение решено',
      time: f.resolvedAt,
      author: f.assigneeName || 'Поддержка'
    })
  }

  if (f.status === 'in_progress' || f.status === 'waiting_user') {
    items.push({
      state: 'active',
      icon: 'clock',
      title: f.status === 'waiting_user' ? 'Ждёт вашего ответа' : 'В работе',
      time: null,
      author: f.assigneeName || 'Поддержка'
    })
  }

  return items
})

const isResolved = computed(() => feedback.value?.status === 'resolved')
const isClosed = computed(() => feedback.value?.status === 'closed')
const canClose = computed(() => !isClosed.value)
const canRate = computed(() => isResolved.value && !ratingSubmitted.value)

const relatedItems = [
  { id: 1001, title: 'Не работает поиск по параметрам', category: 'Техническая проблема', icon: 'wrench' },
  { id: 1002, title: 'Проблема с оплатой через карту', category: 'Оплата и сделки', icon: 'money' },
  { id: 1003, title: 'Как изменить email в профиле', category: 'Аккаунт', icon: 'user' }
]

function formatFullDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  })
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'сейчас'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) return `${minutes} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days < 7) return `${days} дн. назад`
  return formatFullDate(dateStr)
}

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

async function handleClose() {
  closing.value = true
  try {
    await feedbackStore.closeFeedback?.(feedback.value.id)
    toastStore.success('Обращение закрыто')
    showCloseConfirm.value = false
    loadFeedback()
  } catch (err) {
    toastStore.error('Не удалось закрыть обращение')
  } finally {
    closing.value = false
  }
}

function submitRating() {
  if (!rating.value) {
    toastStore.error('Поставьте оценку')
    return
  }
  ratingSubmitted.value = true
  toastStore.success('Спасибо за отзыв!')
}

async function loadFeedbackById(id) {
  try {
    await feedbackStore.fetchFeedbackById(id)
  } catch (err) {
    toastStore.error('Не удалось загрузить обращение')
  }
}

onMounted(loadFeedback)
</script>

<template>
  <div class="cv-fbd">
    <div class="cv-fbd__container">
      <Breadcrumbs />

      <BaseLoader v-if="loading" text="Загрузка обращения..." />

      <ErrorMessage
        v-else-if="error"
        :message="error"
        retry
        @retry="loadFeedback"
      />

      <template v-else-if="feedback">
        <header class="cv-fbd__hero">
          <div class="cv-fbd__hero-glow" aria-hidden="true"></div>
          <div class="cv-fbd__hero-carbon" aria-hidden="true"></div>

          <div class="cv-fbd__hero-content">
            <div class="cv-fbd__hero-badges">
              <span class="cv-fbd__id">
                <span class="cv-fbd__id-label">Обращение</span>
                #{{ feedback.id }}
              </span>

              <span class="cv-fbd__status" :data-color="statusInfo.color">
                <span class="cv-fbd__status-dot" aria-hidden="true"></span>
                {{ statusInfo.label }}
              </span>

              <span v-if="categoryInfo" class="cv-fbd__category">
                <span class="cv-fbd__category-icon" aria-hidden="true">
                  <svg v-if="categoryInfo.icon === 'wrench'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"/>
                  </svg>
                  <svg v-else-if="categoryInfo.icon === 'money'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="12" rx="2"/>
                    <circle cx="12" cy="12" r="2.5"/>
                  </svg>
                  <svg v-else-if="categoryInfo.icon === 'user'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                  <svg v-else-if="categoryInfo.icon === 'shield'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                  </svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 8v5M12 17h.01"/>
                  </svg>
                </span>
                {{ categoryInfo.label }}
              </span>

              <span v-if="priorityInfo" class="cv-fbd__priority" :data-color="priorityInfo.color">
                <span class="cv-fbd__priority-icon" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <path d="M12 9v4M12 17h.01"/>
                  </svg>
                </span>
                Приоритет: {{ priorityInfo.label }}
              </span>
            </div>

            <h1 class="cv-fbd__title">{{ feedback.subject }}</h1>

            <div class="cv-fbd__meta">
              <span class="cv-fbd__meta-item">
                <span class="cv-fbd__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="14" rx="2"/>
                    <path d="M3 10h18M8 6V3M16 6V3"/>
                  </svg>
                </span>
                Создано {{ formatFullDate(feedback.createdAt) }}
              </span>

              <span class="cv-fbd__meta-dot" aria-hidden="true"></span>

              <span class="cv-fbd__meta-item">
                <span class="cv-fbd__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
                  </svg>
                </span>
                Обновлено {{ formatRelativeTime(feedback.updatedAt) }}
              </span>

              <span v-if="feedback.assigneeName" class="cv-fbd__meta-dot" aria-hidden="true"></span>

              <span v-if="feedback.assigneeName" class="cv-fbd__meta-item cv-fbd__meta-item--accent">
                <span class="cv-fbd__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </span>
                Ведёт: {{ feedback.assigneeName }}
              </span>
            </div>
          </div>

          <div v-if="canClose" class="cv-fbd__hero-actions">
            <BaseButton
              variant="outline"
              size="sm"
              @click="showCloseConfirm = true"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              Закрыть обращение
            </BaseButton>
          </div>
        </header>

        <section v-if="!isClosed" class="cv-fbd__sla" :data-color="statusInfo.color">
          <span class="cv-fbd__sla-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
          </span>
          <span class="cv-fbd__sla-text">
            <strong>Ожидаемый ответ:</strong> в течение
            <strong>{{ priorityInfo?.color === 'danger' ? '1 часа' : priorityInfo?.color === 'warning' ? '2 часов' : '24 часов' }}</strong>
            · Поддержка работает ежедневно с 9:00 до 21:00
          </span>
        </section>

        <section class="cv-fbd__timeline">
          <h2 class="cv-fbd__timeline-title">
            <span class="cv-fbd__timeline-title-dot" aria-hidden="true"></span>
            История обращения
          </h2>

          <ol class="cv-fbd__timeline-list">
            <li
              v-for="(item, index) in timeline"
              :key="index"
              class="cv-fbd__timeline-item"
              :data-state="item.state"
            >
              <span class="cv-fbd__timeline-marker" aria-hidden="true">
                <svg v-if="item.icon === 'create'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <svg v-else-if="item.icon === 'in-progress'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
                </svg>
                <svg v-else-if="item.icon === 'check'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
              </span>

              <div class="cv-fbd__timeline-content">
                <span class="cv-fbd__timeline-item-title">{{ item.title }}</span>
                <span class="cv-fbd__timeline-item-meta">
                  <template v-if="item.time">{{ formatFullDate(item.time) }}</template>
                  <template v-else>Сейчас</template>
                  <template v-if="item.author"> · {{ item.author }}</template>
                </span>
              </div>
            </li>
          </ol>
        </section>

        <section class="cv-fbd__chat">
          <FeedbackChat :feedback="feedback" />
        </section>

        <section v-if="canRate" class="cv-fbd__rating">
          <div class="cv-fbd__rating-glow" aria-hidden="true"></div>

          <span class="cv-fbd__rating-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
            </svg>
          </span>

          <h3 class="cv-fbd__rating-title">Обращение решено!</h3>
          <p class="cv-fbd__rating-subtitle">Оцените, насколько хорошо мы справились</p>

          <div class="cv-fbd__rating-stars">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              class="cv-fbd__rating-star"
              :class="{ 'cv-fbd__rating-star--active': i <= rating }"
              :aria-label="`${i} из 5`"
              @click="rating = i"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" :fill="i <= rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18.2 5.5 22l1.7-7.4-5.7-5L9 9z"/>
              </svg>
            </button>
          </div>

          <BaseButton
            :disabled="!rating"
            size="lg"
            @click="submitRating"
          >
            Отправить отзыв
          </BaseButton>
        </section>

        <section v-if="relatedItems.length" class="cv-fbd__related">
          <h2 class="cv-fbd__related-title">
            <span class="cv-fbd__related-title-dot" aria-hidden="true"></span>
            Похожие решённые обращения
          </h2>

          <div class="cv-fbd__related-list">
            <RouterLink
              v-for="item in relatedItems"
              :key="item.id"
              :to="`/feedback/${item.id}`"
              class="cv-fbd__related-item"
              @click.prevent="loadFeedbackById(item.id)"
            >
              <span class="cv-fbd__related-icon" aria-hidden="true">
                <svg v-if="item.icon === 'wrench'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"/>
                </svg>
                <svg v-else-if="item.icon === 'money'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="6" width="18" height="12" rx="2"/>
                  <circle cx="12" cy="12" r="2.5"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
              </span>

              <div class="cv-fbd__related-content">
                <span class="cv-fbd__related-item-title">{{ item.title }}</span>
                <span class="cv-fbd__related-item-category">{{ item.category }}</span>
              </div>

              <span class="cv-fbd__related-arrow" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
              </span>
            </RouterLink>
          </div>
        </section>
      </template>
    </div>

    <ConfirmModal
      v-model="showCloseConfirm"
      title="Закрыть обращение?"
      message="После закрытия вы не сможете продолжить переписку по этому обращению. Если проблема не решена — создайте новое."
      confirm-text="Закрыть"
      cancel-text="Отмена"
      variant="warning"
      icon="warning"
      :loading="closing"
      @confirm="handleClose"
    />
  </div>
</template>

<style scoped>
.cv-fbd {
  position: relative;
  padding: 20px 0 60px;
}

.cv-fbd__container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-fbd__hero {
  position: relative;
  padding: 28px 30px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 80px rgba(201, 169, 97, 0.1);
}

.cv-fbd__hero-glow {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.75;
  animation: cvFbdOrb 18s ease-in-out infinite;
}

@keyframes cvFbdOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.08); }
}

.cv-fbd__hero-carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
}

.cv-fbd__hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.32) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}

.cv-fbd__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cv-fbd__hero-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-fbd__id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-fbd__id-label {
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.65);
}

.cv-fbd__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border: 1px solid;
}

.cv-fbd__status[data-color="info"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-fbd__status[data-color="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.14);
  border-color: rgba(217, 119, 6, 0.4);
}

.cv-fbd__status[data-color="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.16);
  border-color: rgba(184, 119, 85, 0.44);
}

.cv-fbd__status[data-color="success"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-fbd__status[data-color="neutral"] {
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.cv-fbd__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvFbdDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvFbdDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-fbd__category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(245, 240, 230, 0.85);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv-fbd__category-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-fbd__priority {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  border: 1px solid;
}

.cv-fbd__priority[data-color="neutral"] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-fbd__priority[data-color="info"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-fbd__priority[data-color="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.35);
}

.cv-fbd__priority[data-color="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.42);
}

.cv-fbd__priority-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-fbd__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-fbd__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-fbd__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cv-fbd__meta-item--accent {
  color: #E8D5A0;
  font-weight: 650;
}

.cv-fbd__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-fbd__meta-item--accent .cv-fbd__meta-icon {
  color: #E8D5A0;
}

.cv-fbd__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
}

.cv-fbd__hero-actions {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.cv-fbd__sla {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
}

.cv-fbd__sla[data-color="info"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-fbd__sla[data-color="warning"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border-color: rgba(217, 119, 6, 0.3);
}

.cv-fbd__sla[data-color="danger"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.1), rgba(184, 119, 85, 0.02));
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-fbd__sla[data-color="success"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.1), rgba(122, 154, 106, 0.02));
  border-color: rgba(122, 154, 106, 0.3);
}

.cv-fbd__sla[data-color="neutral"] {
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-fbd__sla-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-fbd__sla-text {
  flex: 1;
  min-width: 0;
}

.cv-fbd__sla-text strong {
  font-weight: 800;
  color: currentColor;
}

.cv-fbd__timeline {
  position: relative;
  padding: 22px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-fbd__timeline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
}

.cv-fbd__timeline-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-fbd__timeline-title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-fbd__timeline-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  position: relative;
}

.cv-fbd__timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 10px 0 10px 0;
}

.cv-fbd__timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 40px;
  bottom: -4px;
  width: 1px;
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.3), rgba(201, 169, 97, 0.05));
}

.cv-fbd__timeline-marker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid;
  transition: all 0.3s ease;
}

.cv-fbd__timeline-item[data-state="done"] .cv-fbd__timeline-marker {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-fbd__timeline-item[data-state="active"] .cv-fbd__timeline-marker {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.15);
  border-color: rgba(217, 119, 6, 0.45);
  box-shadow: 0 0 20px rgba(217, 119, 6, 0.3);
  animation: cvFbdPulse 2.2s ease-in-out infinite;
}

@keyframes cvFbdPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(217, 119, 6, 0.3); }
  50% { box-shadow: 0 0 32px rgba(217, 119, 6, 0.55); }
}

.cv-fbd__timeline-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 6px;
}

.cv-fbd__timeline-item-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.92);
}

.cv-fbd__timeline-item-meta {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-fbd__chat {
  position: relative;
  isolation: isolate;
}

.cv-fbd__rating {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(201, 169, 97, 0.15);
  text-align: center;
}

.cv-fbd__rating-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-fbd__rating::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.4) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}

.cv-fbd__rating-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.32);
  box-shadow: 0 0 32px rgba(201, 169, 97, 0.2);
}

.cv-fbd__rating-title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-fbd__rating-subtitle {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
}

.cv-fbd__rating-stars {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 6px;
  margin: 8px 0;
}

.cv-fbd__rating-star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: rgba(200, 190, 175, 0.3);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 12px;
}

.cv-fbd__rating-star:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  transform: scale(1.1);
}

.cv-fbd__rating-star--active {
  color: #E8D5A0;
  filter: drop-shadow(0 0 12px rgba(201, 169, 97, 0.6));
}

.cv-fbd__related {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-fbd__related-title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-fbd__related-title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-fbd__related-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-fbd__related-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-fbd__related-item:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.cv-fbd__related-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.25);
}

.cv-fbd__related-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-fbd__related-item-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-fbd__related-item-category {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-fbd__related-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.4);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-fbd__related-item:hover .cv-fbd__related-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
}

@media (max-width: 1024px) {
  .cv-fbd__container { padding: 0 32px; }
}

@media (max-width: 768px) {
  .cv-fbd { padding: 12px 0 40px; }
  .cv-fbd__container { padding: 0 20px; gap: 16px; }

  .cv-fbd__hero { padding: 20px 20px; border-radius: 1rem; }
  .cv-fbd__title { font-size: 20px; letter-spacing: -0.3px; }

  .cv-fbd__hero-badges { gap: 6px; }
  .cv-fbd__id,
  .cv-fbd__status,
  .cv-fbd__category,
  .cv-fbd__priority { font-size: 10.5px; padding: 4px 10px; }

  .cv-fbd__meta { font-size: 11.5px; gap: 10px; }

  .cv-fbd__timeline { padding: 18px 18px; border-radius: 1rem; }
  .cv-fbd__timeline-marker { width: 28px; height: 28px; }
  .cv-fbd__timeline-item { gap: 12px; }
  .cv-fbd__timeline-item-title { font-size: 12.5px; }
  .cv-fbd__timeline-item-meta { font-size: 11px; }

  .cv-fbd__rating { padding: 24px 18px; }
  .cv-fbd__rating-icon { width: 48px; height: 48px; border-radius: 14px; }
  .cv-fbd__rating-title { font-size: 17px; }
  .cv-fbd__rating-star { width: 38px; height: 38px; }

  .cv-fbd__related-item { padding: 12px 14px; gap: 12px; }
  .cv-fbd__related-icon { width: 32px; height: 32px; border-radius: 9px; }
  .cv-fbd__related-item-title { font-size: 12.5px; }
}
</style>