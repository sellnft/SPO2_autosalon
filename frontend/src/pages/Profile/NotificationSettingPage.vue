<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import { useToastStore } from '@/stores/toast'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const notificationsStore = useNotificationsStore()
const toastStore = useToastStore()

const saving = ref(false)

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
  }
})

const emailSettings = [
  { key: 'newMessage', title: 'Новые сообщения', description: 'Уведомления о новых сообщениях в чате' },
  { key: 'priceChange', title: 'Изменение цены', description: 'Уведомления об изменении цены в избранном' },
  { key: 'statusChange', title: 'Изменение статуса', description: 'Уведомления о статусе ваших объявлений' },
  { key: 'sold', title: 'Объявление продано', description: 'Уведомления когда ваше объявление продано' },
  { key: 'support', title: 'Ответ поддержки', description: 'Уведомления об ответах службы поддержки' },
  { key: 'security', title: 'Безопасность', description: 'Уведомления о входе и изменениях пароля' },
  { key: 'system', title: 'Системные', description: 'Обслуживание, обновления' },
  { key: 'newsletter', title: 'Новостная рассылка', description: 'Новости и акции платформы' }
]

async function handleSave() {
  saving.value = true
  try {
    await notificationsStore.updateNotificationSettings(settings)
    toastStore.success('Настройки сохранены')
  } catch (err) {
    toastStore.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="notification-settings-page">
    <div class="container">
      <Breadcrumbs />
      
      <h1 class="notification-settings-page__title">Настройки уведомлений</h1>
      
      <div class="notification-settings-page__sections">
        <!-- Email -->
        <section class="notification-settings-page__section">
          <h2 class="notification-settings-page__section-title">
            Email уведомления
          </h2>
          
          <div
            v-for="setting in emailSettings"
            :key="`email-${setting.key}`"
            class="notification-settings-page__item"
          >
            <div class="notification-settings-page__item-content">
              <p class="notification-settings-page__item-title">{{ setting.title }}</p>
              <p class="notification-settings-page__item-description">
                {{ setting.description }}
              </p>
            </div>
            <BaseSwitch v-model="settings.email[setting.key]" />
          </div>
        </section>
        
        <!-- Push -->
        <section class="notification-settings-page__section">
          <h2 class="notification-settings-page__section-title">
            Push уведомления
          </h2>
          
          <div
            v-for="setting in emailSettings"
            :key="`push-${setting.key}`"
            class="notification-settings-page__item"
          >
            <div class="notification-settings-page__item-content">
              <p class="notification-settings-page__item-title">{{ setting.title }}</p>
              <p class="notification-settings-page__item-description">
                {{ setting.description }}
              </p>
            </div>
            <BaseSwitch v-model="settings.push[setting.key]" />
          </div>
        </section>
        
        <div class="notification-settings-page__actions">
          <BaseButton :loading="saving" size="lg" @click="handleSave">
            Сохранить настройки
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-settings-page {
  padding: 20px 0 40px;
}

.notification-settings-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
}

.notification-settings-page__sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
}

.notification-settings-page__section {
  padding: 24px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.notification-settings-page__section-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.notification-settings-page__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}

.notification-settings-page__item:last-child {
  border-bottom: none;
}

.notification-settings-page__item-content {
  flex: 1;
}

.notification-settings-page__item-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.notification-settings-page__item-description {
  font-size: 13px;
  color: #6B7280;
}

.notification-settings-page__actions {
  display: flex;
  justify-content: flex-end;
}
</style>