<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { formatDate } from '@/utils/formatDate'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const reply = ref('')
const sending = ref(false)
const messagesRef = ref(null)

const feedback = computed(() =>
  adminStore.feedback.find(f => f.id === Number(route.params.id))
)

const statuses = [
  { value: 'open', label: 'Открыто', accent: 'accent' },
  { value: 'in_progress', label: 'В работе', accent: 'warning' },
  { value: 'waiting_user', label: 'Ждёт ответа', accent: 'info' },
  { value: 'resolved', label: 'Решено', accent: 'success' },
  { value: 'closed', label: 'Закрыто', accent: 'muted' }
]

async function updateStatus(status) {
  if (!feedback.value) return

  try {
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

    await nextTick()
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  } catch (err) {
    toastStore.error('Ошибка отправки')
  } finally {
    sending.value = false
  }
}

watch(
  () => feedback.value?.messages?.length,
  async () => {
    await nextTick()
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  }
)

onMounted(async () => {
  if (!adminStore.feedback.length) {
    await adminStore.fetchFeedback()
  }

  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
})
</script>

<template>
  <div class="cv-fd">
    <button class="cv-fd__back" @click="router.push('/admin/feedback')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      К обращениям
    </button>

    <!-- === SKELETON === -->
    <template v-if="!feedback">
      <div class="cv-fd__skeleton-header">
        <div class="cv-fd__skeleton cv-fd__skeleton--line cv-fd__skeleton--w30"></div>
        <div class="cv-fd__skeleton cv-fd__skeleton--line cv-fd__skeleton--w70 cv-fd__skeleton--tall"></div>
        <div class="cv-fd__skeleton cv-fd__skeleton--line cv-fd__skeleton--w40"></div>
      </div>
      <div class="cv-fd__skeleton-body">
        <div class="cv-fd__skeleton cv-fd__skeleton--msg"></div>
        <div class="cv-fd__skeleton cv-fd__skeleton--msg"></div>
        <div class="cv-fd__skeleton cv-fd__skeleton--msg cv-fd__skeleton--msg-short"></div>
      </div>
    </template>

    <template v-else>
      <!-- === HEADER === -->
      <header class="cv-fd__header">
        <div class="cv-fd__header-top">
          <div class="cv-fd__meta">
            <span class="cv-fd__id">#{{ feedback.id }}</span>
            <AdminStatusBadge :status="feedback.status" type="feedback" />
            <span
              v-if="feedback.status !== 'closed' && feedback.status !== 'resolved'"
              class="cv-fd__live"
            >
              <span class="cv-fd__live-dot" aria-hidden="true"></span>
              активное
            </span>
          </div>

          <h1 class="cv-fd__title">{{ feedback.subject }}</h1>

          <p class="cv-fd__info">
            <span class="cv-fd__info-author">{{ feedback.userName }}</span>
            <span class="cv-fd__info-sep" aria-hidden="true">·</span>
            <span class="cv-fd__info-date">{{ formatDate(feedback.createdAt, 'datetime') }}</span>
          </p>
        </div>

        <div class="cv-fd__status-changer">
          <span class="cv-fd__status-label">Статус</span>
          <div class="cv-fd__status-list">
            <button
              v-for="status in statuses"
              :key="status.value"
              type="button"
              class="cv-fd__status-btn"
              :class="{ 'cv-fd__status-btn--active': feedback.status === status.value }"
              :data-accent="status.accent"
              @click="updateStatus(status.value)"
            >
              <span class="cv-fd__status-dot" aria-hidden="true"></span>
              {{ status.label }}
            </button>
          </div>
        </div>
      </header>

      <!-- === CHAT === -->
      <section class="cv-fd__chat">
        <div ref="messagesRef" class="cv-fd__messages">
          <div
            v-for="message in feedback.messages"
            :key="message.id"
            class="cv-fd__message"
            :class="`cv-fd__message--${message.authorType}`"
          >
            <div class="cv-fd__message-avatar" aria-hidden="true">
              <svg v-if="message.authorType === 'admin'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>

            <div class="cv-fd__message-body">
              <div class="cv-fd__message-meta">
                <span class="cv-fd__message-author">{{ message.authorName }}</span>
                <span class="cv-fd__message-sep" aria-hidden="true">·</span>
                <span class="cv-fd__message-time">
                  {{ formatDate(message.createdAt, 'datetime') }}
                </span>
              </div>
              <div class="cv-fd__message-bubble">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="feedback.status !== 'closed'" class="cv-fd__reply">
          <div class="cv-fd__reply-field">
            <textarea
              v-model="reply"
              class="cv-fd__textarea"
              placeholder="Написать ответ..."
              rows="3"
              @keydown.ctrl.enter="sendReply"
            ></textarea>

            <div class="cv-fd__reply-actions">
              <span class="cv-fd__hint">
                <kbd class="cv-fd__kbd">Ctrl</kbd>
                <span class="cv-fd__hint-plus">+</span>
                <kbd class="cv-fd__kbd">Enter</kbd>
                <span class="cv-fd__hint-text">для отправки</span>
              </span>

              <BaseButton :loading="sending" :disabled="!reply.trim()" @click="sendReply">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                Отправить
              </BaseButton>
            </div>
          </div>
        </div>

        <div v-else class="cv-fd__closed">
          <span class="cv-fd__closed-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="16" height="11" rx="2"/>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
            </svg>
          </span>
          <span>Обращение закрыто. Возобновить переписку можно, изменив статус.</span>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.cv-fd {
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* === BACK BUTTON === */
.cv-fd__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 8px 14px 8px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-fd__back svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-fd__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateX(-2px);
}

.cv-fd__back:hover svg {
  transform: translateX(-2px);
}

/* === SKELETON === */
.cv-fd__skeleton-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border-radius: 1rem;
  background: linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-fd__skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 1rem;
  background: linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-fd__skeleton {
  position: relative;
  height: 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
}

.cv-fd__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.08) 50%,
    transparent 100%
  );
  animation: cvFdShimmer 1.8s ease-in-out infinite;
}

@keyframes cvFdShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-fd__skeleton--line { height: 14px; }
.cv-fd__skeleton--tall { height: 28px; }
.cv-fd__skeleton--w30 { width: 30%; }
.cv-fd__skeleton--w40 { width: 40%; }
.cv-fd__skeleton--w70 { width: 70%; }
.cv-fd__skeleton--msg { height: 60px; border-radius: 12px; }
.cv-fd__skeleton--msg-short { width: 60%; }

/* === HEADER === */
.cv-fd__header {
  position: relative;
  padding: 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-fd__header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-fd__header-top {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-fd__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.cv-fd__id {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 6px;
}

.cv-fd__live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(184, 206, 168, 0.95);
  background: rgba(122, 154, 106, 0.12);
  border: 1px solid rgba(122, 154, 106, 0.3);
  border-radius: 999px;
}

.cv-fd__live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #B8CEA8;
  box-shadow: 0 0 8px rgba(184, 206, 168, 0.9);
  animation: cvFdLive 1.8s ease-in-out infinite;
}

@keyframes cvFdLive {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.cv-fd__title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-fd__info {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-fd__info-author {
  color: rgba(232, 213, 160, 0.95);
  font-weight: 700;
}

.cv-fd__info-sep {
  color: rgba(200, 190, 175, 0.3);
}

.cv-fd__info-date {
  color: rgba(200, 190, 175, 0.55);
}

/* === STATUS CHANGER === */
.cv-fd__status-changer {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.cv-fd__status-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}

.cv-fd__status-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.cv-fd__status-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 13px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-fd__status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.cv-fd__status-btn[data-accent="accent"] .cv-fd__status-dot { background: #E8D5A0; }
.cv-fd__status-btn[data-accent="warning"] .cv-fd__status-dot { background: #F0C080; }
.cv-fd__status-btn[data-accent="info"] .cv-fd__status-dot { background: #B8D4E8; }
.cv-fd__status-btn[data-accent="success"] .cv-fd__status-dot { background: #B8CEA8; }
.cv-fd__status-btn[data-accent="muted"] .cv-fd__status-dot { background: rgba(200, 190, 175, 0.5); }

.cv-fd__status-btn:hover {
  color: rgba(232, 213, 160, 0.95);
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.3);
  transform: translateY(-1px);
}

.cv-fd__status-btn:hover .cv-fd__status-dot {
  opacity: 1;
  transform: scale(1.3);
}

.cv-fd__status-btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-fd__status-btn--active .cv-fd__status-dot {
  background: #1A1208 !important;
  opacity: 1;
  box-shadow: 0 0 6px rgba(26, 18, 8, 0.5);
}

/* === CHAT === */
.cv-fd__chat {
  position: relative;
  padding: 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-fd__chat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
}

.cv-fd__messages {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 8px;
  margin-bottom: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
}

.cv-fd__messages::-webkit-scrollbar {
  width: 6px;
}

.cv-fd__messages::-webkit-scrollbar-track {
  background: transparent;
}

.cv-fd__messages::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 999px;
}

.cv-fd__message {
  display: flex;
  gap: 12px;
  max-width: 82%;
}

.cv-fd__message--admin {
  align-self: flex-start;
}

.cv-fd__message--user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.cv-fd__message-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid;
}

.cv-fd__message--admin .cv-fd__message-avatar {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.35);
}

.cv-fd__message--user .cv-fd__message-avatar {
  color: #B8D4E8;
  background: rgba(106, 154, 194, 0.14);
  border-color: rgba(106, 154, 194, 0.35);
}

.cv-fd__message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-fd__message--user .cv-fd__message-body {
  align-items: flex-end;
}

.cv-fd__message-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 4px;
  font-size: 11.5px;
  letter-spacing: 0.05px;
}

.cv-fd__message-author {
  font-weight: 700;
  color: rgba(245, 240, 230, 0.9);
}

.cv-fd__message-sep {
  color: rgba(200, 190, 175, 0.3);
}

.cv-fd__message-time {
  font-weight: 500;
  color: rgba(200, 190, 175, 0.5);
}

.cv-fd__message-bubble {
  padding: 11px 15px;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: 0.05px;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 14px;
  border: 1px solid;
}

.cv-fd__message--admin .cv-fd__message-bubble {
  color: rgba(245, 240, 230, 0.92);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  border-top-left-radius: 4px;
}

.cv-fd__message--user .cv-fd__message-bubble {
  color: rgba(245, 240, 230, 0.95);
  background: linear-gradient(135deg, rgba(106, 154, 194, 0.18), rgba(106, 154, 194, 0.08));
  border-color: rgba(106, 154, 194, 0.3);
  border-top-right-radius: 4px;
}

/* === REPLY === */
.cv-fd__reply {
  padding-top: 20px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-fd__reply-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-fd__textarea {
  width: 100%;
  padding: 13px 15px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.92);
  background: rgba(0, 0, 0, 0.25);
  border: 1.5px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  outline: none;
  resize: vertical;
  min-height: 90px;
  transition: all 0.22s ease;
}

.cv-fd__textarea::placeholder {
  color: rgba(200, 190, 175, 0.4);
}

.cv-fd__textarea:hover {
  border-color: rgba(201, 169, 97, 0.25);
}

.cv-fd__textarea:focus {
  border-color: rgba(201, 169, 97, 0.6);
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.cv-fd__reply-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-fd__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.5);
}

.cv-fd__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: rgba(232, 213, 160, 0.85);
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 5px;
  box-shadow: 0 1px 0 rgba(255, 245, 214, 0.1) inset;
}

.cv-fd__hint-plus {
  color: rgba(200, 190, 175, 0.4);
  font-weight: 600;
}

.cv-fd__hint-text {
  margin-left: 2px;
}

/* === CLOSED === */
.cv-fd__closed {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.65);
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(201, 169, 97, 0.2);
}

.cv-fd__closed-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  color: rgba(232, 213, 160, 0.7);
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.25);
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .cv-fd__header {
    padding: 18px;
  }

  .cv-fd__title {
    font-size: 20px;
  }

  .cv-fd__chat {
    padding: 18px;
  }

  .cv-fd__message {
    max-width: 92%;
  }

  .cv-fd__message-avatar {
    width: 32px;
    height: 32px;
  }

  .cv-fd__status-btn {
    padding: 6px 11px;
    font-size: 11.5px;
  }

  .cv-fd__reply-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .cv-fd__hint {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .cv-fd__title {
    font-size: 18px;
  }

  .cv-fd__id {
    font-size: 10.5px;
    padding: 3px 8px;
  }
}
</style>