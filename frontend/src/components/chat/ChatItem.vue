<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  chat: {
    type: Object,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const initials = computed(() => {
  const name = props.chat.sellerName || props.chat.buyerName || '?'
  return name.charAt(0).toUpperCase()
})

const preview = computed(() => {
  if (!props.chat.lastMessage) return 'Нет сообщений'
  const text = props.chat.lastMessage
  return text.length > 50 ? text.substring(0, 50) + '...' : text
})
</script>

<template>
  <button
    :class="['cv-chat-item', { 'cv-chat-item--active': active }]"
    @click="emit('select', chat.id)"
  >
    <span class="cv-chat-item__accent" aria-hidden="true"></span>

    <div class="cv-chat-item__avatar">
      <span class="cv-chat-item__avatar-inner">{{ initials }}</span>
    </div>

    <div class="cv-chat-item__content">
      <div class="cv-chat-item__top">
        <span class="cv-chat-item__name">{{ chat.sellerName || chat.buyerName }}</span>
        <span class="cv-chat-item__time">
          {{ formatDate(chat.lastMessageAt, 'relative') }}
        </span>
      </div>

      <p class="cv-chat-item__announcement">
        {{ chat.announcementTitle }}
      </p>

      <div class="cv-chat-item__bottom">
        <p class="cv-chat-item__preview">{{ preview }}</p>
        <span v-if="chat.unreadCount" class="cv-chat-item__badge">
          {{ chat.unreadCount }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.cv-chat-item {
  position: relative;
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  font-family: inherit;
  color: inherit;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(201, 169, 97, 0.08);
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
  isolation: isolate;
}

.cv-chat-item:last-child {
  border-bottom: none;
}

.cv-chat-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.06), rgba(201, 169, 97, 0.02));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 0;
}

.cv-chat-item:hover::before {
  opacity: 1;
}

.cv-chat-item--active {
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.03));
}

.cv-chat-item--active::before {
  opacity: 0;
}

.cv-chat-item--active:hover::before {
  opacity: 0.6;
}

.cv-chat-item__accent {
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.6);
  opacity: 0;
  transform: scaleY(0.5);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.cv-chat-item--active .cv-chat-item__accent {
  opacity: 1;
  transform: scaleY(1);
}

.cv-chat-item:active {
  transform: scale(0.995);
}

.cv-chat-item__avatar {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.25),
    0 4px 16px rgba(201, 169, 97, 0.28),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-chat-item:hover .cv-chat-item__avatar {
  transform: scale(1.04);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.45),
    0 6px 20px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-chat-item__avatar-inner {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #1A1208;
  line-height: 1;
}

.cv-chat-item__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.cv-chat-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.cv-chat-item__name {
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.cv-chat-item:hover .cv-chat-item__name {
  color: #F5E6BC;
}

.cv-chat-item--active .cv-chat-item__name {
  color: #F5E6BC;
}

.cv-chat-item__time {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2px;
  color: rgba(200, 190, 175, 0.45);
}

.cv-chat-item__announcement {
  margin: 0 0 5px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(232, 213, 160, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-chat-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.cv-chat-item__preview {
  flex: 1;
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: rgba(220, 210, 195, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.cv-chat-item--active .cv-chat-item__preview {
  color: rgba(220, 210, 195, 0.65);
}

.cv-chat-item__badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
  animation: cvChatBadgePulse 2.5s ease-in-out infinite;
}

@keyframes cvChatBadgePulse {
  0%, 100% {
    box-shadow:
      0 0 0 1px rgba(201, 169, 97, 0.4),
      0 4px 12px rgba(201, 169, 97, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 3px rgba(201, 169, 97, 0.15),
      0 6px 18px rgba(201, 169, 97, 0.6);
  }
}

@media (max-width: 640px) {
  .cv-chat-item {
    padding: 12px 14px;
    gap: 10px;
  }

  .cv-chat-item__accent {
    top: 12px;
    bottom: 12px;
  }

  .cv-chat-item__avatar {
    width: 42px;
    height: 42px;
  }

  .cv-chat-item__avatar-inner {
    font-size: 15px;
  }

  .cv-chat-item__name {
    font-size: 13.5px;
  }

  .cv-chat-item__preview {
    font-size: 12px;
  }

  .cv-chat-item__badge {
    min-width: 20px;
    height: 20px;
    font-size: 10.5px;
    padding: 0 6px;
  }
}
</style>