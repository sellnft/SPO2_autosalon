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
    :class="['chat-item', { 'chat-item--active': active }]"
    @click="emit('select', chat.id)"
  >
    <div class="chat-item__avatar">
      {{ initials }}
    </div>
    
    <div class="chat-item__content">
      <div class="chat-item__top">
        <span class="chat-item__name">{{ chat.sellerName || chat.buyerName }}</span>
        <span class="chat-item__time">
          {{ formatDate(chat.lastMessageAt, 'relative') }}
        </span>
      </div>
      
      <p class="chat-item__announcement">
        {{ chat.announcementTitle }}
      </p>
      
      <div class="chat-item__bottom">
        <p class="chat-item__preview">{{ preview }}</p>
        <span v-if="chat.unreadCount" class="chat-item__badge">
          {{ chat.unreadCount }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.chat-item {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  background: white;
  border: none;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;
  transition: background 0.15s;
}

.chat-item:hover {
  background: #F9FAFB;
}

.chat-item--active {
  background: #F0F7FF;
}

.chat-item--active:hover {
  background: #E0EFFF;
}

.chat-item__avatar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 50%;
}

.chat-item__content {
  flex: 1;
  min-width: 0;
}

.chat-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 2px;
}

.chat-item__name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item__time {
  flex-shrink: 0;
  font-size: 11px;
  color: #9CA3AF;
}

.chat-item__announcement {
  margin-bottom: 4px;
  font-size: 12px;
  color: #0A84FF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.chat-item__preview {
  flex: 1;
  font-size: 13px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item__badge {
  flex-shrink: 0;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: #0A84FF;
  border-radius: 10px;
}
</style>