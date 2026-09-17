<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import ChatList from '@/components/chat/ChatList.vue'
import ChatWindow from '@/components/chat/ChatWindow.vue'
import ChatEmptyState from '@/components/chat/ChatEmptyState.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const wsStatus = ref('connecting')

const isMobileView = computed(() => chatStore.currentChatId !== null)

const totalChats = computed(() => chatStore.chats?.length || 0)
const totalUnread = computed(() => chatStore.totalUnread || 0)

const chatCountText = computed(() => {
  const n = totalChats.value
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'диалог'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'диалога'
  return 'диалогов'
})

const unreadCountText = computed(() => {
  const n = totalUnread.value
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'непрочитанное'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'непрочитанных'
  return 'непрочитанных'
})

const wsStatusInfo = computed(() => {
  const map = {
    connecting: { label: 'Подключение...', state: 'connecting' },
    connected: { label: 'Подключено', state: 'ok' },
    disconnected: { label: 'Нет соединения', state: 'error' }
  }
  return map[wsStatus.value] || map.disconnected
})

async function loadChats() {
  try {
    await chatStore.fetchChats()
    if (route.params.id) {
      await chatStore.selectChat(route.params.id)
    }
  } catch (err) {
    // silent
  }
}

function handleSelectChat(chatId) {
  router.replace({ name: 'chat-detail', params: { id: chatId } })
}

function goToNotificationSettings() {
  router.push('/profile/notifications')
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    chatStore.selectChat(newId)
  } else {
    chatStore.currentChatId = null
  }
})

watch(() => chatStore.currentChatId, (id) => {
  if (id && route.params.id !== String(id)) {
    router.replace({ name: 'chat-detail', params: { id } })
  } else if (!id && route.params.id) {
    router.replace({ name: 'chat' })
  }
})

let wsCheckInterval = null

onMounted(() => {
  chatStore.connectWebSocket()
  loadChats()

  wsStatus.value = 'connecting'

  setTimeout(() => {
    if (chatStore.isConnected !== false) {
      wsStatus.value = 'connected'
    } else {
      wsStatus.value = 'disconnected'
    }
  }, 800)

  wsCheckInterval = setInterval(() => {
    wsStatus.value = chatStore.isConnected === false ? 'disconnected' : 'connected'
  }, 5000)
})

onUnmounted(() => {
  chatStore.disconnectWebSocket()
  if (wsCheckInterval) clearInterval(wsCheckInterval)
})
</script>

<template>
  <div class="cv-chatp">
    <div class="cv-chatp__bg" aria-hidden="true">
      <div class="cv-chatp__bg-orb cv-chatp__bg-orb--1"></div>
      <div class="cv-chatp__bg-orb cv-chatp__bg-orb--2"></div>
      <div class="cv-chatp__bg-carbon"></div>
    </div>

    <div class="cv-chatp__container">
      <div class="cv-chatp__breadcrumbs">
        <Breadcrumbs />
      </div>

      <header class="cv-chatp__header">
        <div class="cv-chatp__header-left">
          <span class="cv-chatp__eyebrow">
            <span class="cv-chatp__eyebrow-dot" aria-hidden="true"></span>
            Сообщения
          </span>
          <h1 class="cv-chatp__title">Чаты</h1>
          <p v-if="totalChats" class="cv-chatp__subtitle">
            У вас <strong>{{ totalChats }} {{ chatCountText }}</strong>
            <template v-if="totalUnread">
              · <strong class="cv-chatp__subtitle-accent">{{ totalUnread }} {{ unreadCountText }}</strong>
            </template>
          </p>
          <p v-else class="cv-chatp__subtitle">
            Здесь появятся ваши диалоги с продавцами и покупателями
          </p>
        </div>

        <div class="cv-chatp__header-actions">
          <span class="cv-chatp__ws" :data-state="wsStatusInfo.state">
            <span class="cv-chatp__ws-dot" aria-hidden="true"></span>
            <span class="cv-chatp__ws-label">{{ wsStatusInfo.label }}</span>
          </span>

          <button
            type="button"
            class="cv-chatp__settings"
            aria-label="Настройки уведомлений"
            title="Настройки уведомлений"
            @click="goToNotificationSettings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
            </svg>
          </button>
        </div>
      </header>

      <div class="cv-chatp__card">
        <div class="cv-chatp__card-glow" aria-hidden="true"></div>

        <aside
          :class="[
            'cv-chatp__list',
            { 'cv-chatp__list--hidden-mobile': isMobileView }
          ]"
        >
          <ChatList @select="handleSelectChat" />
        </aside>

        <main
          :class="[
            'cv-chatp__window',
            { 'cv-chatp__window--hidden-mobile': !isMobileView && !chatStore.currentChatId }
          ]"
        >
          <ChatWindow v-if="chatStore.currentChat" />
          <ChatEmptyState v-else type="no-selection" />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv-chatp {
  position: relative;
  padding: 20px 0;
  min-height: calc(100vh - 80px);
  isolation: isolate;
}

.cv-chatp__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-chatp__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.4;
}

.cv-chatp__bg-orb--1 {
  top: -15%;
  left: -5%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvChatpOrb 22s ease-in-out infinite;
}

.cv-chatp__bg-orb--2 {
  bottom: -20%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.2), transparent 70%);
  animation: cvChatpOrb 26s ease-in-out infinite reverse;
}

@keyframes cvChatpOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-chatp__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
}

.cv-chatp__container {
  position: relative;
  z-index: 1;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 120px);
}

.cv-chatp__breadcrumbs {
  flex-shrink: 0;
}

.cv-chatp__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.cv-chatp__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.cv-chatp__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-chatp__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvChatpDot 2.2s ease-in-out infinite;
}

@keyframes cvChatpDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-chatp__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-chatp__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.6);
}

.cv-chatp__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-chatp__subtitle-accent {
  color: #E8A88A !important;
}

.cv-chatp__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.cv-chatp__ws {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  border: 1px solid;
}

.cv-chatp__ws[data-state="ok"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.1);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-chatp__ws[data-state="connecting"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-chatp__ws[data-state="error"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.12);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-chatp__ws-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
  animation: cvChatpDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

.cv-chatp__ws-label {
  white-space: nowrap;
}

.cv-chatp__settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.22s ease;
  flex-shrink: 0;
}

.cv-chatp__settings:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cv-chatp__settings:active {
  transform: translateY(0) scale(0.94);
}

.cv-chatp__card {
  position: relative;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 380px 1fr;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4) 0%, rgba(15, 13, 10, 0.5) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 80px rgba(201, 169, 97, 0.08);
}

.cv-chatp__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.28) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}

.cv-chatp__card-glow {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.18), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}

.cv-chatp__list {
  position: relative;
  z-index: 1;
  min-width: 0;
  border-right: 1px solid rgba(201, 169, 97, 0.12);
  overflow: hidden;
}

.cv-chatp__window {
  position: relative;
  z-index: 1;
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 1280px) {
  .cv-chatp__container { padding: 0 32px; }
  .cv-chatp__card { grid-template-columns: 340px 1fr; }
}

@media (max-width: 1024px) {
  .cv-chatp__container {
    padding: 0 24px;
    height: calc(100vh - 100px);
    gap: 16px;
  }

  .cv-chatp__title { font-size: 26px; letter-spacing: -0.4px; }
  .cv-chatp__card { grid-template-columns: 300px 1fr; }
}

@media (max-width: 768px) {
  .cv-chatp {
    padding: 0;
    min-height: calc(100vh - 60px - 56px - env(safe-area-inset-bottom, 0px));
  }

  .cv-chatp__bg {
    display: none;
  }

  .cv-chatp__container {
    padding: 0;
    gap: 0;
    height: calc(100vh - 60px - 56px - env(safe-area-inset-bottom, 0px));
  }

  .cv-chatp__breadcrumbs {
    display: none;
  }

  .cv-chatp__header {
    padding: 12px 16px;
    background: rgba(10, 10, 12, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(201, 169, 97, 0.14);
    flex-shrink: 0;
  }

  .cv-chatp__header-left {
    flex: 1;
  }

  .cv-chatp__eyebrow {
    font-size: 9.5px;
    letter-spacing: 1px;
  }

  .cv-chatp__title {
    font-size: 20px;
    letter-spacing: -0.3px;
  }

  .cv-chatp__subtitle {
    font-size: 12px;
  }

  .cv-chatp__header-actions {
    gap: 8px;
  }

  .cv-chatp__ws {
    padding: 6px 10px;
    font-size: 10.5px;
  }

  .cv-chatp__ws-label {
    display: none;
  }

  .cv-chatp__settings {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .cv-chatp__card {
    grid-template-columns: 1fr;
    border-radius: 0;
    border: none;
    border-top: 1px solid rgba(201, 169, 97, 0.14);
    box-shadow: none;
  }

  .cv-chatp__card::before {
    display: none;
  }

  .cv-chatp__card-glow {
    display: none;
  }

  .cv-chatp__list {
    border-right: none;
  }

  .cv-chatp__list--hidden-mobile {
    display: none;
  }

  .cv-chatp__window--hidden-mobile {
    display: none;
  }
}
</style>