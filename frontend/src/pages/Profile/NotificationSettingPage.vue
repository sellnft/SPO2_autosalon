<script setup>
import { reactive } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const notificationsStore = useNotificationsStore()
const saving = ref(false)

const settings = reactive({
  email: {
    newMessage: true,
    priceChange: true,
    announcementStatus: true,
    newsletter: false
  },
  push: {
    newMessage: true,
    priceChange: false,
    announcementStatus: true,
    newsletter: false
  }
})

async function handleSave() {
  saving.value = true
  try {
    await notificationsStore.updateNotificationSettings(settings)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="notification-settings-page">
    <div class="container">
      <h1 class="notification-settings-page__title">Настройки уведомлений</h1>
      
      <div class="notification-settings-page__sections">
        <section class="notification-settings-page__section">
          <h2 class="notification-settings-page__section-title">Email уведомления</h2>
          
          <div class="notification-settings-page__item">
            <div>
              <p class="notification-settings-page__item-title">Новые сообщения</p>
              <p class="notification-settings-page__item-description">
                Уведомлять о новых сообщениях в чате
              </p>
            </div>
            <BaseSwitch v-model="settings.email.newMessage" />
          </div>
          
          <div class="notification-settings-page__item">
            <div>
              <p class="notification-settings-page__item-title">Изменение цены</p>
              <p class="notification-settings-page__item-description">
                Уведомлять об изменении цены на избранные объявления
              </p>
            </div>
            <BaseSwitch v-model="settings.email.priceChange" />
          </div>
          
          <div class="notification-settings-page__item">
            <div>
              <p class="notification-settings-page__item-title">Статус объявления</p>
              <p class="notification-settings-page__item-description">
                Уведомлять о модерации объявлений
              </p>
            </div>
            <BaseSwitch v-model="settings.email.announcementStatus" />
          </div>
        </section>
        
        <section class="notification-settings-page__section">
          <h2 class="notification-settings-page__section-title">Push уведомления</h2>
          
          <div class="notification-settings-page__item">
            <div>
              <p class="notification-settings-page__item-title">Новые сообщения</p>
              <p class="notification-settings-page__item-description">
                Мгновенные push-уведомления о сообщениях
              </p>
            </div>
            <BaseSwitch v-model="settings.push.newMessage" />
          </div>
          
          <div class="notification-settings-page__item">
            <div>
              <p class="notification-settings-page__item-title">Изменение цены</p>
              <p class="notification-settings-page__item-description">
                Push-уведомления об изменении цены
              </p>
            </div>
            <BaseSwitch v-model="settings.push.priceChange" />
          </div>
        </section>
        
        <BaseButton :loading="saving" @click="handleSave">
          Сохранить настройки
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-settings-page {
  padding: 40px 0;
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
  max-width: 700px;
}

.notification-settings-page__section {
  padding: 24px;
  background: white;
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
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}

.notification-settings-page__item:last-child {
  border-bottom: none;
}

.notification-settings-page__item-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
}

.notification-settings-page__item-description {
  font-size: 13px;
  color: #6B7280;
}
</style>