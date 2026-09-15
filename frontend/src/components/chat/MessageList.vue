<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import MessageItem from './MessageItem.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

const chatStore = useChatStore()
const authStore = useAuthStore()
const messagesContainer = ref(null)

const currentUserId = computed(() => authStore.user?.id || null)

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

watch(
  () => chatStore.currentMessages.length,
  () => scrollToBottom(true)
)

watch(
  () => chatStore.currentChatId,
  () => scrollToBottom()
)

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div ref="messagesContainer" class="cv-msglist">
    <div class="cv-msglist__carbon" aria-hidden="true"></div>

    <BaseLoader
      v-if="chatStore.loading && !chatStore.currentMessages.length"
      text="Загрузка сообщений..."
    />

    <div v-else-if="!chatStore.currentMessages.length" class="cv-msglist__empty">
      <div class="cv-msglist__empty-icon" aria-hidden="true">
        <span class="cv-msglist__empty-emoji">💬</span>
      </div>
      <p class="cv-msglist__empty-title">Начните переписку</p>
      <p class="cv-msglist__empty-text">
        Отправьте первое сообщение, чтобы начать общение
      </p>
    </div>

    <div v-else class="cv-msglist__messages">
      <MessageItem
        v-for="message in chatStore.currentMessages"
        :key="message.id"
        :message="message"
        :own="message.senderId === currentUserId"
      />
    </div>
  </div>
</template>

<style scoped>
.cv-msglist {
  position: relative;
  flex: 1;
  overflow-y: auto;
  padding: 22px 20px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.25) 0%, rgba(15, 13, 10, 0.35) 100%),
    linear-gradient(180deg, #12121A 0%, #0E0E14 100%);
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.3) transparent;
  isolation: isolate;
}

.cv-msglist::-webkit-scrollbar {
  width: 8px;
}

.cv-msglist::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

.cv-msglist::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}

.cv-msglist::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-msglist__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.01) 0px,
      rgba(255, 255, 255, 0.01) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.01) 0px,
      rgba(255, 255, 255, 0.01) 1px,
      transparent 1px,
      transparent 4px
    );
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
}

.cv-msglist__empty {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  padding: 40px 24px;
  text-align: center;
}

.cv-msglist__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  margin-bottom: 8px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.1);
  animation: cvMsglistFloat 4s ease-in-out infinite;
}

@keyframes cvMsglistFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-msglist__empty-emoji {
  font-size: 34px;
  line-height: 1;
  filter: saturate(0.85) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.cv-msglist__empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.9);
}

.cv-msglist__empty-text {
  margin: 0;
  max-width: 300px;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.5);
}

.cv-msglist__messages {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 640px) {
  .cv-msglist {
    padding: 16px 14px;
  }

  .cv-msglist__empty-icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-msglist__empty-emoji {
    font-size: 28px;
  }

  .cv-msglist__empty-title {
    font-size: 15px;
  }

  .cv-msglist__empty-text {
    font-size: 12.5px;
  }
}
</style>