<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const notificationsStore = useNotificationsStore()

const iconType = computed(() => {
  const map = {
    chat: '💬',
    price: '💰',
    status: '✅',
    sold: '🎉',
    support: '📞',
    security: '🔒',
    system: '⚙️'
  }
  return map[props.notification.type] || '📢'
})

async function handleClick() {
  if (!props.notification.read) {
    await notificationsStore.markAsRead(props.notification.id)
  }

  if (props.notification.link) {
    router.push(props.notification.link)
  }
}
</script>

<template>
  <button
    :class="['cv-notif-item', { 'cv-notif-item--unread': !notification.read }]"
    @click="handleClick"
  >
    <div class="cv-notif-item__icon" :data-type="notification.type">
      <span class="cv-notif-item__emoji">{{ iconType }}</span>
    </div>

    <div class="cv-notif-item__content">
      <div class="cv-notif-item__header">
        <p class="cv-notif-item__title">{{ notification.title }}</p>
        <span v-if="!notification.read" class="cv-notif-item__dot" aria-hidden="true"></span>
      </div>

      <p class="cv-notif-item__message">{{ notification.message }}</p>

      <p class="cv-notif-item__time">
        <span class="cv-notif-item__time-icon" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="4.5"/>
            <path d="M6 3.5V6l1.7 1"/>
          </svg>
        </span>
        {{ formatDate(notification.createdAt, 'relative') }}
      </p>
    </div>

    <span class="cv-notif-item__arrow" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 4l4 4-4 4"/>
      </svg>
    </span>
  </button>
</template>

<style scoped>
.cv-notif-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(201, 169, 97, 0.08);
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition: all 0.25s ease;
  overflow: hidden;
}

.cv-notif-item:last-child {
  border-bottom: none;
}

.cv-notif-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.06), rgba(201, 169, 97, 0.02));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-notif-item:hover::before {
  opacity: 1;
}

.cv-notif-item--unread {
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
}

.cv-notif-item--unread::after {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.6);
}

.cv-notif-item--unread:hover {
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
}

.cv-notif-item:active {
  transform: scale(0.995);
}

.cv-notif-item__icon {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
}

.cv-notif-item__emoji {
  font-size: 19px;
  line-height: 1;
  filter: saturate(0.9);
}

.cv-notif-item:hover .cv-notif-item__icon {
  border-color: rgba(201, 169, 97, 0.28);
  background: rgba(201, 169, 97, 0.08);
  transform: scale(1.03);
}

.cv-notif-item__icon[data-type="chat"] {
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.28);
}

.cv-notif-item__icon[data-type="price"] {
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.28);
}

.cv-notif-item__icon[data-type="status"],
.cv-notif-item__icon[data-type="sold"] {
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.3);
}

.cv-notif-item__icon[data-type="security"] {
  background: rgba(184, 119, 85, 0.12);
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-notif-item__icon[data-type="support"] {
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.26);
}

.cv-notif-item__icon[data-type="system"] {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-notif-item__content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.cv-notif-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.cv-notif-item__title {
  margin: 0;
  font-size: 14px;
  font-weight: 650;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.9);
  transition: color 0.2s ease;
}

.cv-notif-item--unread .cv-notif-item__title {
  color: #F5E6BC;
}

.cv-notif-item:hover .cv-notif-item__title {
  color: #F5E6BC;
}

.cv-notif-item__dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.15),
    0 0 10px rgba(201, 169, 97, 0.7);
  animation: cvNotifPulse 2.2s ease-in-out infinite;
}

@keyframes cvNotifPulse {
  0%, 100% {
    box-shadow:
      0 0 0 3px rgba(201, 169, 97, 0.15),
      0 0 10px rgba(201, 169, 97, 0.7);
  }
  50% {
    box-shadow:
      0 0 0 5px rgba(201, 169, 97, 0.08),
      0 0 16px rgba(201, 169, 97, 0.9);
  }
}

.cv-notif-item__message {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
  letter-spacing: 0.05px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cv-notif-item__time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.4);
  letter-spacing: 0.2px;
}

.cv-notif-item__time-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
}

.cv-notif-item__arrow {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  color: rgba(200, 190, 175, 0.3);
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0.6;
}

.cv-notif-item:hover .cv-notif-item__arrow {
  color: #E8D5A0;
  transform: translateX(3px);
  opacity: 1;
}

@media (max-width: 640px) {
  .cv-notif-item {
    padding: 14px 16px;
    gap: 12px;
  }

  .cv-notif-item__icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .cv-notif-item__emoji {
    font-size: 17px;
  }

  .cv-notif-item__title {
    font-size: 13.5px;
  }

  .cv-notif-item__message {
    font-size: 12.5px;
  }

  .cv-notif-item__arrow {
    display: none;
  }
}
</style>