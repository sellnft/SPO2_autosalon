<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/services/api/usersApi'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const twoFAEnabled = ref(false)
const showDisableModal = ref(false)
const changingPassword = ref(false)
const successMessage = ref('')

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: ''
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: ''
})

function validatePasswordForm() {
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.passwordConfirmation = ''

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Текущий пароль обязателен'
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'Новый пароль обязателен'
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = 'Пароль минимум 6 символов'
  }

  if (passwordForm.newPassword !== passwordForm.passwordConfirmation) {
    passwordErrors.passwordConfirmation = 'Пароли не совпадают'
  }

  return !Object.values(passwordErrors).some(Boolean)
}

async function handleChangePassword() {
  if (!validatePasswordForm()) return

  changingPassword.value = true
  successMessage.value = ''

  try {
    await usersApi.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    successMessage.value = 'Пароль успешно изменён'
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.passwordConfirmation = ''

    setTimeout(() => (successMessage.value = ''), 3000)
  } catch (err) {
    toastStore.error(err.message || 'Не удалось изменить пароль')
  } finally {
    changingPassword.value = false
  }
}

function handleToggle2FA(value) {
  if (value) {
    router.push('/2fa/setup')
  } else {
    showDisableModal.value = true
  }
}

async function handleDisable2FA() {
  try {
    // TODO: При реальном backend - authApi.disable2FA(password)
    twoFAEnabled.value = false
    showDisableModal.value = false
    toastStore.success('2FA отключена')
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

onMounted(() => {
  // Проверка статуса 2FA — в mock нет, ставим false
  twoFAEnabled.value = false
})
</script>

<template>
  <div class="security-page">
    <div class="container">
      <Breadcrumbs />

      <h1 class="security-page__title">Безопасность</h1>

      <!-- 2FA -->
      <section class="security-page__section">
        <div class="security-page__section-header">
          <div>
            <h2 class="security-page__section-title">Двухфакторная аутентификация</h2>
            <p class="security-page__section-description">
              Дополнительный уровень защиты вашего аккаунта
            </p>
          </div>
          <BaseSwitch
            :model-value="twoFAEnabled"
            @update:model-value="handleToggle2FA"
          />
        </div>
      </section>

      <!-- Change password -->
      <section class="security-page__section">
        <h2 class="security-page__section-title">Смена пароля</h2>

        <form class="security-page__form" @submit.prevent="handleChangePassword">
          <div v-if="successMessage" class="security-page__success">
            {{ successMessage }}
          </div>

          <BaseInput
            v-model="passwordForm.currentPassword"
            label="Текущий пароль"
            type="password"
            autocomplete="current-password"
            :error="passwordErrors.currentPassword"
            required
          />

          <BaseInput
            v-model="passwordForm.newPassword"
            label="Новый пароль"
            type="password"
            autocomplete="new-password"
            :error="passwordErrors.newPassword"
            required
          />

          <BaseInput
            v-model="passwordForm.passwordConfirmation"
            label="Подтверждение нового пароля"
            type="password"
            autocomplete="new-password"
            :error="passwordErrors.passwordConfirmation"
            required
          />

          <BaseButton type="submit" :loading="changingPassword">
            Сменить пароль
          </BaseButton>
        </form>
      </section>

      <!-- Sessions -->
      <section class="security-page__section">
        <div class="security-page__section-header">
          <div>
            <h2 class="security-page__section-title">Активные сессии</h2>
            <p class="security-page__section-description">
              Устройства, с которых выполнен вход в аккаунт
            </p>
          </div>
          <BaseButton variant="outline" @click="router.push('/profile/sessions')">
            Управлять
          </BaseButton>
        </div>
      </section>
    </div>

    <ConfirmModal
      v-model="showDisableModal"
      title="Отключить 2FA?"
      message="Это снизит безопасность вашего аккаунта. Вы уверены?"
      confirm-text="Отключить"
      variant="danger"
      @confirm="handleDisable2FA"
    />
  </div>
</template>

<style scoped>
.security-page {
  padding: 20px 0 40px;
}

.security-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.security-page__section {
  padding: 24px;
  margin-bottom: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.security-page__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.security-page__section-title {
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.security-page__section-description {
  font-size: 13px;
  color: #6B7280;
}

.security-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  margin-top: 20px;
}

.security-page__success {
  padding: 12px;
  font-size: 14px;
  color: #065f46;
  background: #D1FAE5;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .security-page__title {
    font-size: 24px;
  }

  .security-page__section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>