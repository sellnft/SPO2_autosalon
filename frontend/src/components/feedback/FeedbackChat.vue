<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useAuthStore } from '@/stores/auth'
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
const authStore = useAuthStore()
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
  () => props.feedback.messages?.length,
  () => scrollToBottom(true)
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="cv-chat">
    <div ref="messagesContainer" class="cv-chat__messages">
      <div
        v-for="message in feedback.messages"
        :key="message.id"
        :class="[
          'cv-chat__message',
          `cv-chat__message--${message.authorType}`
        ]"
      >
        <div class="cv-chat__avatar">
          <span class="cv-chat__avatar-emoji">
            {{ message.authorType === 'admin' ? '🛡️' : '👤' }}
          </span>
        </div>

        <div class="cv-chat__content">
          <div class="cv-chat__meta">
            <span class="cv-chat__author">
              {{ message.authorName }}
            </span>
            <span class="cv-chat__time">
              {{ formatDate(message.createdAt, 'datetime') }}
            </span>
          </div>

          <div class="cv-chat__bubble">
            {{ message.content }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="feedback.status !== 'closed'" class="cv-chat__input">
      <textarea
        v-model="text"
        class="cv-chat__textarea"
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

    <div v-else class="cv-chat__closed">
      <span class="cv-chat__closed-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </span>
      Обращение закрыто. Для продолжения создайте новое обращение.
    </div>
  </div>
</template>

<style scoped>
.cv-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
}

.cv-chat__messages {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 24px 22px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.25) 0%, rgba(15, 13, 10, 0.35) 100%),
    linear-gradient(180deg, #12121A 0%, #0E0E14 100%);
  border: 1px solid rgba(201, 169, 97, 0.1);
  border-radius: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-bottom: 14px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-chat__messages::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.2) 50%,
    transparent
  );
  pointer-events: none;
}

.cv-chat__messages::-webkit-scrollbar {
  width: 8px;
}

.cv-chat__messages::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-chat__messages::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-chat__message {
  display: flex;
  gap: 12px;
  max-width: 78%;
  animation: cvChatMsg 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

@keyframes cvChatMsg {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cv-chat__message--admin {
  align-self: flex-start;
}

.cv-chat__message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.cv-chat__avatar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
}

.cv-chat__avatar-emoji {
  font-size: 17px;
  line-height: 1;
}

.cv-chat__message--admin .cv-chat__avatar {
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.28);
  box-shadow: 0 0 16px rgba(201, 169, 97, 0.12);
}

.cv-chat__message--user .cv-chat__avatar {
  background: rgba(184, 119, 85, 0.12);
  border-color: rgba(184, 119, 85, 0.3);
  box-shadow: 0 0 16px rgba(184, 119, 85, 0.12);
}

.cv-chat__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cv-chat__message--user .cv-chat__content {
  align-items: flex-end;
}

.cv-chat__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  padding: 0 4px;
}

.cv-chat__author {
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(245, 240, 230, 0.85);
}

.cv-chat__message--admin .cv-chat__author {
  color: #E8D5A0;
}

.cv-chat__message--user .cv-chat__author {
  color: #E8A88A;
}

.cv-chat__time {
  font-size: 11px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.4);
  letter-spacing: 0.2px;
}

.cv-chat__bubble {
  position: relative;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.55;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(232, 213, 160, 0.05) inset;
}

.cv-chat__message--admin .cv-chat__bubble {
  border-top-left-radius: 4px;
  border-color: rgba(201, 169, 97, 0.2);
}

.cv-chat__message--user .cv-chat__bubble {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.4);
  border-top-right-radius: 4px;
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.28),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  font-weight: 500;
}

.cv-chat__input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  padding: 12px 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 1rem;
  transition: all 0.25s ease;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-chat__input:focus-within {
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 40px rgba(201, 169, 97, 0.08);
}

.cv-chat__textarea {
  flex: 1;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(245, 240, 230, 0.92);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  max-height: 120px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-chat__textarea::placeholder {
  color: rgba(200, 190, 175, 0.4);
}

.cv-chat__textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cv-chat__closed {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(220, 210, 195, 0.55);
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.12);
  border-radius: 1rem;
  letter-spacing: 0.1px;
}

.cv-chat__closed-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .cv-chat__message {
    max-width: 92%;
  }

  .cv-chat__messages {
    padding: 18px 14px;
    gap: 18px;
    border-radius: 1rem;
  }

  .cv-chat__avatar {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .cv-chat__avatar-emoji {
    font-size: 15px;
  }

  .cv-chat__bubble {
    padding: 10px 14px;
    font-size: 13.5px;
  }

  .cv-chat__input {
    padding: 10px 12px;
  }

  .cv-chat__closed {
    font-size: 12.5px;
    padding: 14px 16px;
  }
}
</style>