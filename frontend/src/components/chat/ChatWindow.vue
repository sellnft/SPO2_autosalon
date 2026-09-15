<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

const chatStore = useChatStore()
const router = useRouter()

const chat = computed(() => chatStore.currentChat)

function goToAnnouncement() {
  if (chat.value?.announcementId) {
    router.push(`/announcements/${chat.value.announcementId}`)
  }
}
</script>

<template>
  <div v-if="chat" class="cv-cwin">
    <header class="cv-cwin__header">
      <button
        class="cv-cwin__back"
        aria-label="Назад"
        @click="chatStore.currentChatId = null"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5l-5 5 5 5"/>
        </svg>
      </button>

      <div class="cv-cwin__avatar">
        <span class="cv-cwin__avatar-inner">
          {{ (chat.sellerName || chat.buyerName)?.charAt(0)?.toUpperCase() }}
        </span>
        <span class="cv-cwin__status" aria-hidden="true"></span>
      </div>

      <div class="cv-cwin__info">
        <p class="cv-cwin__name">
          {{ chat.sellerName || chat.buyerName }}
        </p>
        <button class="cv-cwin__announcement" @click="goToAnnouncement">
          <span class="cv-cwin__announcement-dot" aria-hidden="true"></span>
          <span class="cv-cwin__announcement-text">{{ chat.announcementTitle }}</span>
        </button>
      </div>
    </header>

    <MessageList />
    <MessageInput />
  </div>

  <div v-else class="cv-cwin cv-cwin--empty">
    <div class="cv-cwin__empty-orb" aria-hidden="true"></div>

    <div class="cv-cwin__empty-content">
      <div class="cv-cwin__empty-icon">
        <span class="cv-cwin__empty-emoji">💬</span>
      </div>
      <h3 class="cv-cwin__empty-title">Выберите чат</h3>
      <p class="cv-cwin__empty-text">Начните общение, выбрав чат из списка</p>
    </div>
  </div>
</template>

<style scoped>
.cv-cwin {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #12121A 0%, #0E0E14 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
}

.cv-cwin--empty {
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.25) 0%, rgba(15, 13, 10, 0.35) 100%),
    linear-gradient(180deg, #0F0F14 0%, #0A0A0E 100%);
}

.cv-cwin__empty-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-cwin__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 40px 24px;
}

.cv-cwin__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: 6px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.1);
  animation: cvCwinFloat 4s ease-in-out infinite;
}

@keyframes cvCwinFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-cwin__empty-emoji {
  font-size: 40px;
  line-height: 1;
  filter: saturate(0.85) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.cv-cwin__empty-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.2px;
  color: rgba(245, 240, 230, 0.92);
}

.cv-cwin__empty-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.55);
  max-width: 300px;
}

.cv-cwin__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.05), transparent);
}

.cv-cwin__header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.28) 50%,
    transparent
  );
  pointer-events: none;
}

.cv-cwin__back {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.cv-cwin__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
  transform: translateX(-2px);
}

.cv-cwin__avatar {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
}

.cv-cwin__avatar-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 50%;
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 16px rgba(201, 169, 97, 0.3),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-cwin__status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  border: 2px solid #121215;
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.7);
  z-index: 2;
}

.cv-cwin__info {
  flex: 1;
  min-width: 0;
}

.cv-cwin__name {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-cwin__announcement {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 0;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(232, 213, 160, 0.75);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  overflow: hidden;
}

.cv-cwin__announcement-dot {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #C9A961;
  box-shadow: 0 0 6px rgba(201, 169, 97, 0.8);
}

.cv-cwin__announcement-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-cwin__announcement:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(232, 213, 160, 0.5);
}

@media (max-width: 768px) {
  .cv-cwin {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .cv-cwin__back {
    display: inline-flex;
  }

  .cv-cwin__header {
    padding: 12px 14px;
    gap: 10px;
  }

  .cv-cwin__avatar {
    width: 38px;
    height: 38px;
  }

  .cv-cwin__avatar-inner {
    font-size: 14px;
  }

  .cv-cwin__name {
    font-size: 14.5px;
  }

  .cv-cwin__announcement {
    font-size: 11.5px;
  }

  .cv-cwin__empty-icon {
    width: 84px;
    height: 84px;
    border-radius: 20px;
  }

  .cv-cwin__empty-emoji {
    font-size: 34px;
  }

  .cv-cwin__empty-title {
    font-size: 16.5px;
  }

  .cv-cwin__empty-text {
    font-size: 13px;
  }
}
</style>