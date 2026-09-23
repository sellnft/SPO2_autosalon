<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDate } from '@/utils/formatDate'

defineOptions({ name: 'NotificationsPage' })

const router = useRouter()
const toastStore = useToastStore()

const loading = ref(true)
const activeTab = ref('all')
const notifications = ref([])

const tabs = computed(() => [
  { key: 'all', label: 'Все', count: notifications.value.length },
  { key: 'unread', label: 'Непрочитанные', count: unreadCount.value }
])

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

const filteredNotifications = computed(() => {
  if (activeTab.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  }
  return notifications.value
})

const typeConfig = {
  message: { icon: 'chat', accent: 'info', label: 'Сообщение' },
  favorite: { icon: 'heart', accent: 'danger', label: 'Избранное' },
  status: { icon: 'check', accent: 'success', label: 'Статус' },
  system: { icon: 'info', accent: 'accent', label: 'Система' },
  price: { icon: 'chart', accent: 'warning', label: 'Цена' }
}

/* Демо-данные. В реальном проекте — из notifications-store */
const demoNotifications = [
  {
    id: 1,
    type: 'message',
    title: 'Новое сообщение',
    text: 'Анна К. написала вам по объявлению «BMW X5 2020»',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    link: '/chat'
  },
  {
    id: 2,
    type: 'favorite',
    title: 'Ваше объявление в избранном',
    text: 'Кто-то добавил «Toyota Camry 2019» в избранное',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    link: '/profile/announcements'
  },
  {
    id: 3,
    type: 'status',
    title: 'Объявление одобрено',
    text: 'Модерация одобрила ваше объявление «Audi Q7 2021»',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    link: '/profile/announcements'
  },
  {
    id: 4,
    type: 'system',
    title: 'Обновление платформы',
    text: 'Мы добавили проверку VIN в один клик — попробуйте',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    link: null
  }
]

async function loadNotifications() {
  loading.value = true
  try {
    // Здесь должен быть вызов API. Пока — демо-данные.
    await new Promise(r => setTimeout(r, 400))
    notifications.value = demoNotifications
  } finally {
    loading.value = false
  }
}

function markAsRead(n) {
  if (n.read) return
  n.read = true
}

function markAllAsRead() {
  notifications.value.forEach(n => { n.read = true })
  toastStore.success('Все уведомления прочитаны')
}

function handleClick(n) {
  markAsRead(n)
  if (n.link) router.push(n.link)
}

onMounted(loadNotifications)
</script>

<template>
  <div class="cv-nf">
    <header class="cv-nf__header">
      <div class="cv-nf__header-left">
        <span class="cv-nf__eyebrow">
          <span class="cv-nf__eyebrow-dot" aria-hidden="true"></span>
          Личный кабинет · Уведомления
        </span>
        <h1 class="cv-nf__title">Уведомления</h1>
        <p class="cv-nf__subtitle">
          <template v-if="unreadCount">
            <strong>{{ unreadCount }}</strong> непрочитанных
          </template>
          <template v-else>Всё прочитано</template>
        </p>
      </div>

      <div class="cv-nf__actions">
        <BaseButton
          v-if="unreadCount"
          variant="outline"
          @click="markAllAsRead"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          Прочитать все
        </BaseButton>

        <BaseButton variant="ghost" @click="router.push('/profile/notifications/settings')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
          </svg>
          Настройки
        </BaseButton>
      </div>
    </header>

    <!-- TABS -->
    <div class="cv-nf__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="cv-nf__tab"
        :class="{ 'cv-nf__tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span>{{ tab.label }}</span>
        <span class="cv-nf__tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- LIST -->
    <div v-if="loading" class="cv-nf__list">
      <div v-for="i in 4" :key="i" class="cv-nf__skeleton"></div>
    </div>

    <div v-else-if="!filteredNotifications.length" class="cv-nf__empty">
      <span class="cv-nf__empty-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </span>
      <p class="cv-nf__empty-title">
        {{ activeTab === 'unread' ? 'Нет непрочитанных уведомлений' : 'Уведомлений пока нет' }}
      </p>
      <p class="cv-nf__empty-hint">Здесь будут появляться важные события и сообщения</p>
    </div>

    <ul v-else class="cv-nf__list">
      <li
        v-for="n in filteredNotifications"
        :key="n.id"
        class="cv-nf__item"
        :class="{ 'cv-nf__item--unread': !n.read }"
        :data-accent="typeConfig[n.type]?.accent || 'accent'"
        @click="handleClick(n)"
      >
        <span class="cv-nf__icon" aria-hidden="true">
          <svg v-if="typeConfig[n.type]?.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
          </svg>
          <svg v-else-if="typeConfig[n.type]?.icon === 'heart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
          </svg>
          <svg v-else-if="typeConfig[n.type]?.icon === 'check'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          <svg v-else-if="typeConfig[n.type]?.icon === 'chart'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M7 15l4-4 3 3 6-6"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v.01M12 12v4"/>
          </svg>
        </span>

        <div class="cv-nf__body">
          <div class="cv-nf__title-row">
            <p class="cv-nf__item-title">{{ n.title }}</p>
            <span v-if="!n.read" class="cv-nf__dot" aria-hidden="true"></span>
          </div>
          <p class="cv-nf__item-text">{{ n.text }}</p>
          <p class="cv-nf__item-meta">{{ formatDate(n.createdAt, 'relative') }}</p>
        </div>

        <span class="cv-nf__arrow" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.cv-nf {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-nf__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-nf__header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-nf__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-nf__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvNfDot 2.2s ease-in-out infinite;
}

@keyframes cvNfDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-nf__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: rgba(245, 240, 230, 0.98);
}

.cv-nf__subtitle {
  margin: 0;
  font-size: 13.5px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-nf__subtitle strong { color: #E8D5A0; font-weight: 800; }

.cv-nf__actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
}

.cv-nf__tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  align-self: flex-start;
}

.cv-nf__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-nf__tab:hover:not(.cv-nf__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-nf__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 16px rgba(201, 169, 97, 0.4);
}

.cv-nf__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv-nf__tab--active .cv-nf__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-nf__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-nf__item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-nf__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: transparent;
  transition: background 0.25s ease;
}

.cv-nf__item--unread::before {
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
}

.cv-nf__item:hover {
  border-color: rgba(201, 169, 97, 0.38);
  transform: translateX(2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.cv-nf__item[data-accent="info"] .cv-nf__icon { color: #B8D4E8; background: rgba(106, 154, 194, 0.14); border-color: rgba(106, 154, 194, 0.32); }
.cv-nf__item[data-accent="danger"] .cv-nf__icon { color: #E8A88A; background: rgba(184, 119, 85, 0.14); border-color: rgba(184, 119, 85, 0.32); }
.cv-nf__item[data-accent="success"] .cv-nf__icon { color: #B8CEA8; background: rgba(122, 154, 106, 0.14); border-color: rgba(122, 154, 106, 0.32); }
.cv-nf__item[data-accent="warning"] .cv-nf__icon { color: #F0C080; background: rgba(217, 119, 6, 0.14); border-color: rgba(217, 119, 6, 0.32); }
.cv-nf__item[data-accent="accent"] .cv-nf__icon { color: #E8D5A0; background: rgba(201, 169, 97, 0.12); border-color: rgba(201, 169, 97, 0.32); }

.cv-nf__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 11px;
  border: 1px solid;
}

.cv-nf__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cv-nf__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cv-nf__item-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-nf__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.9);
  flex-shrink: 0;
}

.cv-nf__item-text {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.7);
}

.cv-nf__item-meta {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.45);
}

.cv-nf__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.4);
  flex-shrink: 0;
  transition: all 0.25s ease;
  align-self: center;
}

.cv-nf__item:hover .cv-nf__arrow {
  color: #E8D5A0;
  transform: translateX(2px);
}

.cv-nf__skeleton {
  height: 84px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}

.cv-nf__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.08) 50%, transparent);
  animation: cvNfShimmer 1.8s ease-in-out infinite;
}

@keyframes cvNfShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-nf__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 24px;
  text-align: center;
  border-radius: 16px;
  border: 1px dashed rgba(201, 169, 97, 0.16);
}

.cv-nf__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: rgba(201, 169, 97, 0.55);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.18);
  margin-bottom: 6px;
}

.cv-nf__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
}

.cv-nf__empty-hint {
  margin: 0;
  font-size: 12.5px;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 768px) {
  .cv-nf { padding: 24px 20px 60px; }
  .cv-nf__title { font-size: 24px; }
  .cv-nf__actions { width: 100%; }
  .cv-nf__actions > * { flex: 1; }
  .cv-nf__item { padding: 14px; }
}
</style>