<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useFeedbackStore } from '@/stores/feedback'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const feedbackStore = useFeedbackStore()
const toastStore = useToastStore()

const reply = ref('')
const sending = ref(false)

const feedback = computed(() => 
  adminStore.feedback.find(f => f.id === Number(route.params.id))
)

const statuses = [
  { value: 'open', label: 'Открыто' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'waiting_user', label: 'Ждёт ответа' },
  { value: 'resolved', label: 'Решено' },
  { value: 'closed', label: 'Закрыто' }
]

async function updateStatus(status) {
  if (!feedback.value) return
  
  try {
    // TODO: При реальном backend - вызывать API
    feedback.value.status = status
    toastStore.success('Статус обновлён')
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

async function sendReply() {
  if (!reply.value.trim() || sending.value) return
  
  sending.value = true
  try {
    // TODO: При реальном backend - вызывать admin API для ответа
    feedback.value.messages.push({
      id: Date.now(),
      feedbackId: feedback.value.id,
      authorId: 100,
      authorName: 'Служба поддержки',
      authorType: 'admin',
      content: reply.value.trim(),
      createdAt: new Date().toISOString(),
      read: false
    })
    
    feedback.value.updatedAt = new Date().toISOString()
    feedback.value.status = 'waiting_user'
    reply.value = ''
    toastStore.success('Ответ отправлен')
  } catch (err) {
    toastStore.error('Ошибка отправки')
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  if (!adminStore.feedback.length) {
    await adminStore.fetchFeedback()
  }
})
</script>

<template>
  <div class="admin-feedback-details">
    <button class="admin-feedback-details__back" @click="router.push('/admin/feedback')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      К обращениям
    </button>
    
    <div v-if="!feedback" class="admin-feedback-details__loading">
      Загрузка...
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="admin-feedback-details__header">
        <div class="admin-feedback-details__header-top">
          <div>
            <div class="admin-feedback-details__meta">
              <span class="admin-feedback-details__id">#{{ feedback.id }}</span>
              <AdminStatusBadge :status="feedback.status" type="feedback" />
            </div>
            <h1 class="admin-feedback-details__title">{{ feedback.subject }}</h1>
            <p class="admin-feedback-details__info">
              {{ feedback.userName }} • {{ formatDate(feedback.createdAt, 'datetime') }}
            </p>
          </div>
        </div>
        
        <!-- Status Changer -->
        <div class="admin-feedback-details__status-changer">
          <span class="admin-feedback-details__status-label">Статус:</span>
          <button
            v-for="status in statuses"
            :key="status.value"
            :class="[
              'admin-feedback-details__status-btn',
              { 'admin-feedback-details__status-btn--active': feedback.status === status.value }
            ]"
            @click="updateStatus(status.value)"
          >
            {{ status.label }}
          </button>
        </div>
      </div>
      
      <!-- Messages -->
      <div class="admin-feedback-details__chat">
        <div class="admin-feedback-details__messages">
          <div
            v-for="message in feedback.messages"
            :key="message.id"
            :class="[
              'admin-feedback-details__message',
              `admin-feedback-details__message--${message.authorType}`
            ]"
          >
            <div class="admin-feedback-details__message-avatar">
              {{ message.authorType === 'admin' ? '🛡️' : '👤' }}
            </div>
            <div class="admin-feedback-details__message-body">
              <div class="admin-feedback-details__message-meta">
                <span class="admin-feedback-details__message-author">{{ message.authorName }}</span>
                <span class="admin-feedback-details__message-time">
                  {{ formatDate(message.createdAt, 'datetime') }}
                </span>
              </div>
              <div class="admin-feedback-details__message-bubble">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="feedback.status !== 'closed'" class="admin-feedback-details__reply">
          <textarea
            v-model="reply"
            class="admin-feedback-details__textarea"
            placeholder="Написать ответ..."
            rows="3"
            @keydown.ctrl.enter="sendReply"
          ></textarea>
          <div class="admin-feedback-details__reply-actions">
            <span class="admin-feedback-details__hint">Ctrl + Enter для отправки</span>
            <BaseButton :loading="sending" @click="sendReply">
              Отправить
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-feedback-details {
  max-width: 1000px;
}

.admin-feedback-details__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 12px;
  font-size: 13px;
  color: #9CA3AF;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-feedback-details__back:hover {
  color: #E5E7EB;
  background: #1A1A1D;
}

.admin-feedback-details__loading {
  padding: 60px 0;
  text-align: center;
  color: #6B7280;
}

.admin-feedback-details__header {
  padding: 24px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  margin-bottom: 24px;
}

.admin-feedback-details__header-top {
  margin-bottom: 20px;
}

.admin-feedback-details__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.admin-feedback-details__id {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

.admin-feedback-details__title {
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-feedback-details__info {
  font-size: 13px;
  color: #6B7280;
}

.admin-feedback-details__status-changer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid #26262A;
}

.admin-feedback-details__status-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  color: #6B7280;
  margin-right: 4px;
}

.admin-feedback-details__status-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #9CA3AF;
  background: #1A1A1D;
  border: 1px solid #26262A;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-feedback-details__status-btn:hover {
  color: #E5E7EB;
  border-color: #3A3A40;
}

.admin-feedback-details__status-btn--active {
  color: #0F0F10;
  background: #C8A96E;
  border-color: #C8A96E;
}

.admin-feedback-details__chat {
  padding: 24px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
}

.admin-feedback-details__messages {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 20px;
}

.admin-feedback-details__message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.admin-feedback-details__message--admin {
  align-self: flex-start;
}

.admin-feedback-details__message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.admin-feedback-details__message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  font-size: 16px;
  background: #1A1A1D;
  border-radius: 50%;
}

.admin-feedback-details__message-body {
  display: flex;
  flex-direction: column;
}

.admin-feedback-details__message--user .admin-feedback-details__message-body {
  align-items: flex-end;
}

.admin-feedback-details__message-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  padding: 0 4px;
}

.admin-feedback-details__message-author {
  font-size: 12px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-feedback-details__message-time {
  font-size: 11px;
  color: #6B7280;
}

.admin-feedback-details__message-bubble {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #E5E7EB;
  background: #1A1A1D;
  border-radius: 12px;
  white-space: pre-wrap;
}

.admin-feedback-details__message--user .admin-feedback-details__message-bubble {
  color: #0F0F10;
  background: #C8A96E;
}

.admin-feedback-details__reply {
  padding-top: 20px;
  border-top: 1px solid #26262A;
}

.admin-feedback-details__textarea {
  width: 100%;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: #E5E7EB;
  background: #1A1A1D;
  border: 1px solid #26262A;
  border-radius: 10px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;
}

.admin-feedback-details__textarea:focus {
  border-color: #C8A96E;
}

.admin-feedback-details__reply-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.admin-feedback-details__hint {
  font-size: 12px;
  color: #6B7280;
}

@media (max-width: 640px) {
  .admin-feedback-details__title {
    font-size: 18px;
  }

  .admin-feedback-details__message {
    max-width: 95%;
  }
}
</style>