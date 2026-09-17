<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useToastStore } from '@/stores/toast'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const notificationsStore = useNotificationsStore()
const toastStore = useToastStore()

const saving = ref(false)
const pushPermission = ref('default')
const isDirty = ref(false)
const testingPush = ref(false)

const settings = reactive({
  email: {
    newMessage: true,
    priceChange: true,
    statusChange: true,
    sold: true,
    support: true,
    security: true,
    system: false,
    newsletter: false
  },
  push: {
    newMessage: true,
    priceChange: false,
    statusChange: true,
    sold: false,
    support: true,
    security: true,
    system: false,
    newsletter: false
  },
  quietHours: {
    enabled: false,
    from: '22:00',
    to: '08:00'
  }
})

const notificationItems = [
  {
    key: 'newMessage',
    title: 'Новые сообщения',
    description: 'Уведомления о новых сообщениях в чате с продавцами и покупателями',
    icon: 'chat',
    priority: 'high'
  },
  {
    key: 'priceChange',
    title: 'Изменение цены',
    description: 'Уведомления об изменении цены в избранных и отслеживаемых объявлениях',
    icon: 'money',
    priority: 'high'
  },
  {
    key: 'statusChange',
    title: 'Изменение статуса',
    description: 'Уведомления об изменении статуса ваших объявлений (модерация, публикация)',
    icon: 'status',
    priority: 'high'
  },
  {
    key: 'sold',
    title: 'Объявление продано',
    description: 'Уведомления, когда ваше объявление отмечено как проданное',
    icon: 'sold',
    priority: 'normal'
  },
  {
    key: 'support',
    title: 'Ответ поддержки',
    description: 'Уведомления об ответах службы поддержки по вашим обращениям',
    icon: 'support',
    priority: 'high'
  },
  {
    key: 'security',
    title: 'Безопасность',
    description: 'Уведомления о входе с новых устройств, смене пароля, подозрительной активности',
    icon: 'shield',
    priority: 'critical'
  },
  {
    key: 'system',
    title: 'Системные',
    description: 'Уведомления об обслуживании платформы, обновлениях и технических работах',
    icon: 'settings',
    priority: 'normal'
  },
  {
    key: 'newsletter',
    title: 'Новости и акции',
    description: 'Новостная рассылка, специальные предложения и акции платформы',
    icon: 'star',
    priority: 'low'
  }
]

const emailActiveCount = computed(() =>
  Object.values(settings.email).filter(Boolean).length
)

const pushActiveCount = computed(() =>
  Object.values(settings.push).filter(Boolean).length
)

const emailTotalCount = computed(() => Object.keys(settings.email).length)
const pushTotalCount = computed(() => Object.keys(settings.push).length)

const pushSupported = computed(() =>
  typeof window !== 'undefined' &&
  'Notification' in window &&
  'serviceWorker' in navigator
)

const pushStatusText = computed(() => {
  if (!pushSupported.value) return 'Не поддерживается браузером'
  const map = {
    granted: 'Разрешены',
    denied: 'Заблокированы',
    default: 'Не запрошены'
  }
  return map[pushPermission.value] || 'Неизвестно'
})

const pushStatusState = computed(() => {
  if (!pushSupported.value) return 'unsupported'
  if (pushPermission.value === 'granted') return 'ok'
  if (pushPermission.value === 'denied') return 'denied'
  return 'default'
})

function toggleAll(channel, value) {
  Object.keys(settings[channel]).forEach(key => {
    settings[channel][key] = value
  })
  isDirty.value = true
}

async function requestPushPermission() {
  if (!pushSupported.value) {
    toastStore.error('Браузер не поддерживает push-уведомления')
    return
  }

  try {
    const permission = await Notification.requestPermission()
    pushPermission.value = permission

    if (permission === 'granted') {
      toastStore.success('Push-уведомления разрешены')
    } else if (permission === 'denied') {
      toastStore.error('Разрешение отклонено. Включите уведомления в настройках браузера')
    }
  } catch (err) {
    toastStore.error('Не удалось запросить разрешение')
  }
}

async function sendTestPush() {
  if (pushPermission.value !== 'granted') {
    await requestPushPermission()
    return
  }

  testingPush.value = true
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification('CarVibe', {
        body: 'Тестовое уведомление успешно доставлено!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-push'
      })
      toastStore.success('Тестовое уведомление отправлено')
    } else {
      toastStore.info('Service Worker недоступен')
    }
  } catch (err) {
    toastStore.error('Не удалось отправить тестовое уведомление')
  } finally {
    testingPush.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    await notificationsStore.updateNotificationSettings(settings)
    toastStore.success('Настройки сохранены')
    isDirty.value = false
  } catch (err) {
    toastStore.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

function handleReset() {
  window.location.reload()
}

onMounted(async () => {
  if (pushSupported.value) {
    pushPermission.value = Notification.permission
  }

  try {
    const remoteSettings = await notificationsStore.fetchNotificationSettings?.()
    if (remoteSettings) {
      Object.keys(settings.email).forEach(key => {
        if (remoteSettings.email?.[key] !== undefined) settings.email[key] = remoteSettings.email[key]
      })
      Object.keys(settings.push).forEach(key => {
        if (remoteSettings.push?.[key] !== undefined) settings.push[key] = remoteSettings.push[key]
      })
      if (remoteSettings.quietHours) {
        Object.assign(settings.quietHours, remoteSettings.quietHours)
      }
    }
  } catch (err) {
    // Фолбэк на дефолты
  }
})
</script>

<template>
  <div class="cv-nset">
    <div class="cv-nset__container">
      <Breadcrumbs />

      <header class="cv-nset__header">
        <div class="cv-nset__header-left">
          <span class="cv-nset__eyebrow">
            <span class="cv-nset__eyebrow-dot" aria-hidden="true"></span>
            Профиль · Уведомления
          </span>
          <h1 class="cv-nset__title">Настройки уведомлений</h1>
          <p class="cv-nset__subtitle">
            Управляйте тем, как и когда мы будем вас уведомлять о важных событиях
          </p>
        </div>
      </header>

      <section class="cv-nset__info">
        <div class="cv-nset__info-item">
          <span class="cv-nset__info-icon" data-channel="email" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="M3 7l9 6 9-6"/>
            </svg>
          </span>
          <div class="cv-nset__info-content">
            <span class="cv-nset__info-title">Email</span>
            <span class="cv-nset__info-text">На почту, когда удобно</span>
          </div>
        </div>

        <div class="cv-nset__info-item">
          <span class="cv-nset__info-icon" data-channel="push" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </span>
          <div class="cv-nset__info-content">
            <span class="cv-nset__info-title">Push</span>
            <span class="cv-nset__info-text">Мгновенно, в браузере</span>
          </div>
        </div>
      </section>

      <section class="cv-nset__card">
        <div class="cv-nset__card-glow" aria-hidden="true"></div>

        <header class="cv-nset__card-header">
          <div class="cv-nset__card-heading">
            <span class="cv-nset__card-icon" data-channel="email" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </span>
            <div class="cv-nset__card-titles">
              <h2 class="cv-nset__card-title">Email уведомления</h2>
              <span class="cv-nset__card-counter">
                <strong>{{ emailActiveCount }}</strong> из {{ emailTotalCount }} активны
              </span>
            </div>
          </div>

          <div class="cv-nset__card-actions">
            <button
              type="button"
              class="cv-nset__mini-btn"
              @click="toggleAll('email', true)"
            >
              Включить все
            </button>
            <button
              type="button"
              class="cv-nset__mini-btn cv-nset__mini-btn--muted"
              @click="toggleAll('email', false)"
            >
              Отключить все
            </button>
          </div>
        </header>

        <div class="cv-nset__list">
          <div
            v-for="item in notificationItems"
            :key="`email-${item.key}`"
            class="cv-nset__item"
            :data-priority="item.priority"
          >
            <span class="cv-nset__item-icon" aria-hidden="true">
              <svg v-if="item.icon === 'chat'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              </svg>
              <svg v-else-if="item.icon === 'money'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <circle cx="12" cy="12" r="2.5"/>
              </svg>
              <svg v-else-if="item.icon === 'status'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
              <svg v-else-if="item.icon === 'sold'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6l4-4h4l8 8-8 8-8-8z"/>
                <circle cx="8" cy="6" r="1"/>
              </svg>
              <svg v-else-if="item.icon === 'support'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
                <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
              </svg>
              <svg v-else-if="item.icon === 'shield'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <svg v-else-if="item.icon === 'settings'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
              </svg>
            </span>

            <div class="cv-nset__item-content">
              <div class="cv-nset__item-head">
                <span class="cv-nset__item-title">{{ item.title }}</span>
                <span v-if="item.priority === 'critical'" class="cv-nset__item-tag">
                  Важно
                </span>
              </div>
              <span class="cv-nset__item-description">{{ item.description }}</span>
            </div>

            <BaseSwitch
              v-model="settings.email[item.key]"
              @update:model-value="isDirty = true"
            />
          </div>
        </div>
      </section>

      <section class="cv-nset__card">
        <div class="cv-nset__card-glow cv-nset__card-glow--push" aria-hidden="true"></div>

        <header class="cv-nset__card-header">
          <div class="cv-nset__card-heading">
            <span class="cv-nset__card-icon" data-channel="push" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </span>
            <div class="cv-nset__card-titles">
              <h2 class="cv-nset__card-title">Push уведомления</h2>
              <span class="cv-nset__card-counter">
                <strong>{{ pushActiveCount }}</strong> из {{ pushTotalCount }} активны
              </span>
            </div>
          </div>

          <div class="cv-nset__card-actions">
            <button
              type="button"
              class="cv-nset__mini-btn"
              @click="toggleAll('push', true)"
            >
              Включить все
            </button>
            <button
              type="button"
              class="cv-nset__mini-btn cv-nset__mini-btn--muted"
              @click="toggleAll('push', false)"
            >
              Отключить все
            </button>
          </div>
        </header>

        <div class="cv-nset__push-status" :data-state="pushStatusState">
          <span class="cv-nset__push-status-icon" aria-hidden="true">
            <svg v-if="pushStatusState === 'ok'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            <svg v-else-if="pushStatusState === 'denied'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
            <svg v-else-if="pushStatusState === 'unsupported'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </span>

          <div class="cv-nset__push-status-content">
            <span class="cv-nset__push-status-title">
              Статус в браузере: {{ pushStatusText }}
            </span>
            <span v-if="pushStatusState === 'denied'" class="cv-nset__push-status-text">
              Чтобы получать push, разрешите уведомления в настройках браузера
            </span>
            <span v-else-if="pushStatusState === 'ok'" class="cv-nset__push-status-text">
              Push-уведомления будут приходить мгновенно
            </span>
            <span v-else-if="pushStatusState === 'unsupported'" class="cv-nset__push-status-text">
              Ваш браузер не поддерживает push-уведомления
            </span>
          </div>

          <BaseButton
            v-if="pushStatusState === 'default'"
            variant="outline"
            size="sm"
            @click="requestPushPermission"
          >
            Разрешить
          </BaseButton>

          <BaseButton
            v-else-if="pushStatusState === 'ok'"
            variant="outline"
            size="sm"
            :loading="testingPush"
            @click="sendTestPush"
          >
            <svg v-if="!testingPush" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12l5 5L20 7"/>
            </svg>
            Проверить
          </BaseButton>
        </div>

        <div class="cv-nset__list">
          <div
            v-for="item in notificationItems"
            :key="`push-${item.key}`"
            class="cv-nset__item"
            :data-priority="item.priority"
          >
            <span class="cv-nset__item-icon" aria-hidden="true">
              <svg v-if="item.icon === 'chat'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              </svg>
              <svg v-else-if="item.icon === 'money'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <circle cx="12" cy="12" r="2.5"/>
              </svg>
              <svg v-else-if="item.icon === 'status'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 2"/>
              </svg>
              <svg v-else-if="item.icon === 'sold'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6l4-4h4l8 8-8 8-8-8z"/>
                <circle cx="8" cy="6" r="1"/>
              </svg>
              <svg v-else-if="item.icon === 'support'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
                <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
              </svg>
              <svg v-else-if="item.icon === 'shield'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <svg v-else-if="item.icon === 'settings'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
              </svg>
            </span>

            <div class="cv-nset__item-content">
              <div class="cv-nset__item-head">
                <span class="cv-nset__item-title">{{ item.title }}</span>
                <span v-if="item.priority === 'critical'" class="cv-nset__item-tag">
                  Важно
                </span>
              </div>
              <span class="cv-nset__item-description">{{ item.description }}</span>
            </div>

            <BaseSwitch
              v-model="settings.push[item.key]"
              @update:model-value="isDirty = true"
            />
          </div>
        </div>
      </section>

      <section class="cv-nset__card">
        <header class="cv-nset__card-header">
          <div class="cv-nset__card-heading">
            <span class="cv-nset__card-icon" data-channel="quiet" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
              </svg>
            </span>
            <div class="cv-nset__card-titles">
              <h2 class="cv-nset__card-title">Тихие часы</h2>
              <span class="cv-nset__card-counter">
                Не беспокоить в заданное время
              </span>
            </div>
          </div>

          <BaseSwitch
            v-model="settings.quietHours.enabled"
            @update:model-value="isDirty = true"
          />
        </header>

        <div v-if="settings.quietHours.enabled" class="cv-nset__quiet">
          <div class="cv-nset__quiet-field">
            <label class="cv-nset__quiet-label">С</label>
            <input
              type="time"
              v-model="settings.quietHours.from"
              class="cv-nset__quiet-input"
              @change="isDirty = true"
            />
          </div>

          <span class="cv-nset__quiet-dash">—</span>

          <div class="cv-nset__quiet-field">
            <label class="cv-nset__quiet-label">До</label>
            <input
              type="time"
              v-model="settings.quietHours.to"
              class="cv-nset__quiet-input"
              @change="isDirty = true"
            />
          </div>

          <span class="cv-nset__quiet-hint">
            В это время push-уведомления не будут приходить
          </span>
        </div>
      </section>

      <footer class="cv-nset__footer">
        <span v-if="isDirty" class="cv-nset__dirty">
          <span class="cv-nset__dirty-dot" aria-hidden="true"></span>
          Есть несохранённые изменения
        </span>
        <span v-else class="cv-nset__saved">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          Все изменения сохранены
        </span>

        <div class="cv-nset__footer-actions">
          <BaseButton
            v-if="isDirty"
            variant="ghost"
            @click="handleReset"
          >
            Отмена
          </BaseButton>

          <BaseButton
            :loading="saving"
            :disabled="!isDirty"
            size="lg"
            @click="handleSave"
          >
            <svg v-if="!saving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            Сохранить настройки
          </BaseButton>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.cv-nset {
  position: relative;
  padding: 20px 0 80px;
}

.cv-nset__container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-nset__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-nset__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-nset__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvNsetDot 2.2s ease-in-out infinite;
}

@keyframes cvNsetDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-nset__title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-nset__subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-nset__info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.cv-nset__info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
}

.cv-nset__info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  border: 1px solid;
}

.cv-nset__info-icon[data-channel="email"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-nset__info-icon[data-channel="push"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.3);
}

.cv-nset__info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-nset__info-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-nset__info-text {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-nset__card {
  position: relative;
  padding: 24px 26px 20px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-nset__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
  z-index: 2;
}

.cv-nset__card-glow {
  position: absolute;
  top: -80px;
  right: -60px;
  width: 260px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.15), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-nset__card-glow--push {
  background: radial-gradient(circle, rgba(217, 119, 6, 0.15), transparent 70%);
}

.cv-nset__card-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
  margin-bottom: 6px;
}

.cv-nset__card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.cv-nset__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-nset__card-icon[data-channel="email"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.32);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-nset__card-icon[data-channel="push"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.14);
  border-color: rgba(217, 119, 6, 0.32);
  box-shadow: 0 0 24px rgba(217, 119, 6, 0.12);
}

.cv-nset__card-icon[data-channel="quiet"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.32);
  box-shadow: 0 0 24px rgba(122, 154, 106, 0.12);
}

.cv-nset__card-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-nset__card-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.95);
}

.cv-nset__card-counter {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-nset__card-counter strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-nset__card-actions {
  display: inline-flex;
  gap: 6px;
  flex-shrink: 0;
}

.cv-nset__mini-btn {
  padding: 6px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-nset__mini-btn:hover {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-nset__mini-btn:active {
  transform: translateY(0) scale(0.96);
}

.cv-nset__mini-btn--muted {
  color: rgba(220, 210, 195, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.cv-nset__mini-btn--muted:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-nset__push-status {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  border-radius: 11px;
  border: 1px solid;
}

.cv-nset__push-status[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.1), rgba(122, 154, 106, 0.02));
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-nset__push-status[data-state="default"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-nset__push-status[data-state="denied"],
.cv-nset__push-status[data-state="unsupported"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.1), rgba(184, 119, 85, 0.02));
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-nset__push-status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-nset__push-status-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cv-nset__push-status-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.cv-nset__push-status-text {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  opacity: 0.85;
}

.cv-nset__list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.cv-nset__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(201, 169, 97, 0.08);
  transition: all 0.25s ease;
}

.cv-nset__item:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.cv-nset__item:hover {
  padding-left: 6px;
}

.cv-nset__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: rgba(201, 169, 97, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.14);
  transition: all 0.25s ease;
}

.cv-nset__item:hover .cv-nset__item-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-nset__item[data-priority="critical"] .cv-nset__item-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.08);
  border-color: rgba(217, 119, 6, 0.25);
}

.cv-nset__item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-nset__item-head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-nset__item-title {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-nset__item-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #F0C080;
  background: rgba(217, 119, 6, 0.15);
  border: 1px solid rgba(217, 119, 6, 0.35);
  border-radius: 999px;
}

.cv-nset__item-description {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

.cv-nset__quiet {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  padding-top: 16px;
}

.cv-nset__quiet-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cv-nset__quiet-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-nset__quiet-input {
  padding: 9px 12px;
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.22);
  border-radius: 10px;
  outline: none;
  transition: all 0.22s ease;
  cursor: pointer;
}

.cv-nset__quiet-input:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-nset__quiet-input:focus {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 24px rgba(201, 169, 97, 0.12);
}

.cv-nset__quiet-dash {
  color: rgba(200, 190, 175, 0.4);
  font-size: 14px;
}

.cv-nset__quiet-hint {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  flex: 1;
  min-width: 200px;
}

.cv-nset__footer {
  position: sticky;
  bottom: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.85) 0%, rgba(15, 13, 10, 0.95) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 40px rgba(201, 169, 97, 0.1);
}

.cv-nset__footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.25) 50%, transparent);
  pointer-events: none;
}

.cv-nset__dirty,
.cv-nset__saved {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
}

.cv-nset__dirty {
  color: #F0C080;
}

.cv-nset__dirty-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvNsetDot 2.2s ease-in-out infinite;
}

.cv-nset__saved {
  color: #B8CEA8;
}

.cv-nset__footer-actions {
  display: inline-flex;
  gap: 10px;
  margin-left: auto;
}

@media (max-width: 1024px) {
  .cv-nset__container { padding: 0 32px; }
  .cv-nset__title { font-size: 30px; letter-spacing: -0.6px; }
}

@media (max-width: 768px) {
  .cv-nset { padding: 12px 0 60px; }
  .cv-nset__container { padding: 0 20px; gap: 18px; }
  .cv-nset__title { font-size: 24px; letter-spacing: -0.4px; }
  .cv-nset__subtitle { font-size: 13.5px; }

  .cv-nset__info { grid-template-columns: 1fr; gap: 8px; }

  .cv-nset__card { padding: 18px 18px 14px; border-radius: 1rem; }
  .cv-nset__card-header { gap: 12px; padding-bottom: 14px; }
  .cv-nset__card-heading { gap: 12px; }
  .cv-nset__card-icon { width: 38px; height: 38px; border-radius: 10px; }
  .cv-nset__card-title { font-size: 15px; }
  .cv-nset__card-counter { font-size: 11px; }

  .cv-nset__card-actions { width: 100%; }
  .cv-nset__mini-btn { flex: 1; justify-content: center; padding: 8px 10px; }

  .cv-nset__item { padding: 12px 0; gap: 12px; }
  .cv-nset__item:hover { padding-left: 0; }
  .cv-nset__item-icon { width: 32px; height: 32px; border-radius: 9px; }
  .cv-nset__item-title { font-size: 13px; }
  .cv-nset__item-description { font-size: 11.5px; }

  .cv-nset__quiet { flex-direction: column; align-items: flex-start; gap: 10px; }
  .cv-nset__quiet-field { width: 100%; }
  .cv-nset__quiet-input { flex: 1; }
  .cv-nset__quiet-dash { display: none; }
  .cv-nset__quiet-hint { min-width: 0; }

  .cv-nset__footer {
    flex-direction: column;
    align-items: stretch;
    padding: 14px 16px;
    gap: 12px;
    bottom: 12px;
  }
  .cv-nset__footer-actions { margin-left: 0; width: 100%; flex-direction: column-reverse; }
  .cv-nset__footer-actions > * { width: 100%; }
}
</style>