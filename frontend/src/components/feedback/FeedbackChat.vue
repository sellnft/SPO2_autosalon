<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  feedback: {
    type: Object,
    required: true
  }
})

const feedbackStore = useFeedbackStore()
const toastStore = useToastStore()

const text = ref('')
const sending = ref(false)
const messagesContainer = ref(null)

function scrollToBottom(smooth = false) {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  })
}

async function handleSend() {
  const content = text.value.trim()
  if (!content || sending.value) return
  
  sending.value = true
  text.value = ''
  
  try {
    await feedbackStore.sendMessage(props.feedback.id, content)
    scrollToBottom(true)
  } catch (err) {
    toastStore.error('Не удалось отправить сообщение')
    text.value = content
  } finally {
    sending.value = false
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function autoResize(event) {
  const el = event.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

watch(
  () => props.feedback.messages.length,
  () => scrollToBottom(true)
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="feedback-chat">
    <div ref="messagesContainer" class="feedback-chat__messages">
      <div
        v-for="message in feedback.messages"
        :key="message.id"
        :class="[
          'feedback-chat__message',
          `feedback-chat__message--${message.authorType}`
        ]"
      >
        <div class="feedback-chat__avatar">
          {{ message.authorType === 'admin' ? '🛡️' : '👤' }}
        </div>
        
        <div class="feedback-chat__content">
          <div class="feedback-chat__meta">
            <span class="feedback-chat__author">
              {{ message.authorName }}
            </span>
            <span class="feedback-chat__time">
              {{ formatDate(message.createdAt, 'datetime') }}
            </span>
          </div>
          
          <div class="feedback-chat__bubble">
            {{ message.content }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="feedback.status !== 'closed'" class="feedback-chat__input">
      <textarea
        v-model="text"
        class="feedback-chat__textarea"
        placeholder="Написать сообщение..."
        rows="1"
        :disabled="sending"
        @keydown="handleKeydown"
        @input="autoResize"
      ></textarea>
      
      <BaseButton
        :disabled="!text.trim()"
        :loading="sending"
        @click="handleSend"
      >
        Отправить
      </BaseButton>
    </div>
    
    <div v-else class="feedback-chat__closed">
      Обращение закрыто. Для продолжения создайте новое обращение.
    </div>
  </div>
</template>

<style scoped>
.feedback-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.feedback-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #FAFBFC;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 16px;
}

.feedback-chat__message {
  display: flex;
  gap: 12px;
  max-width: 85%;
}

.feedback-chat__message--admin {
  align-self: flex-start;
}

.feedback-chat__message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.feedback-chat__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feedback-chat__content {
  display: flex;
  flex-direction: column;
}

.feedback-chat__message--user .feedback-chat__content {
  align-items: flex-end;
}

.feedback-chat__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  padding: 0 4px;
}

.feedback-chat__author {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.feedback-chat__time {
  font-size: 11px;
  color: #9CA3AF;
}

.feedback-chat__bubble {
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: #111827;
  background: white;
  border-radius: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.feedback-chat__message--admin .feedback-chat__bubble {
  background: white;
  border-top-left-radius: 4px;
}

.feedback-chat__message--user .feedback-chat__bubble {
  color: white;
  background: #0A84FF;
  border-top-right-radius: 4px;
}

.feedback-chat__input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.feedback-chat__textarea {
  flex: 1;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  color: #111827;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  max-height: 120px;
  line-height: 1.5;
}

.feedback-chat__closed {
  padding: 16px;
  font-size: 13px;
  color: #6B7280;
  text-align: center;
  background: #F3F4F6;
  border-radius: 12px;
}

@media (max-width: 640px) {
  .feedback-chat__message {
    max-width: 95%;
  }
}
</style>