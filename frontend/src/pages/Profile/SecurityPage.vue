<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const router = useRouter()
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    successMessage.value = 'Пароль успешно изменён'
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.passwordConfirmation = ''
  } finally {
    changingPassword.value = false
  }
}

async function handleDisable2FA() {
  twoFAEnabled.value = false
  showDisableModal.value = false
}
</script>

<template>
  <div class="security-page">
    <div class="container">
      <h1 class="security-page__title">Безопасность</h1>
      
      <!-- 2FA Section -->
      <section class="security-page__section">
        <h2 class="security-page__section-title">Двухфакторная аутентификация</h2>
        
        <div class="security-page__item">
          <div>
            <p class="security-page__item-title">2FA</p>
            <p class="security-page__item-description">
              {{ twoFAEnabled ? 'Включена' : 'Выключена' }}
            </p>
          </div>
          
          <BaseSwitch v-model="twoFAEnabled" @change="(val) => val ? router.push('/2fa/setup') : showDisableModal = true" />
        </div>
      </section>
      
      <!-- Change Password -->
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
            :error="passwordErrors.currentPassword"
            required
          />
          
          <BaseInput
            v-model="passwordForm.newPassword"
            label="Новый пароль"
            type="password"
            :error="passwordErrors.newPassword"
            required
          />
          
          <BaseInput
            v-model="passwordForm.passwordConfirmation"
            label="Подтверждение нового пароля"
            type="password"
            :error="passwordErrors.passwordConfirmation"
            required
          />
          
          <BaseButton type="submit" :loading="changingPassword">
            Сменить пароль
          </BaseButton>
        </form>
      </section>
      
      <!-- Recovery Codes -->
      <section class="security-page__section">
        <h2 class="security-page__section-title">Коды восстановления</h2>
        
        <p class="security-page__text">
          Сохраните эти коды в безопасном месте. Они помогут восстановить доступ к аккаунту.
        </p>
        
        <div class="security-page__codes">
          <code v-for="i in 8" :key="i" class="security-page__code">
            {{ Math.random().toString(36).substring(2, 10).toUpperCase() }}
          </code>
        </div>
      </section>
    </div>
    
    <!-- Disable 2FA Modal -->
    <ConfirmModal
      v-model="showDisableModal"
      title="Отключить 2FA"
      message="Вы уверены, что хотите отключить двухфакторную аутентификацию? Это снизит безопасность вашего аккаунта."
      confirm-text="Отключить"
      @confirm="handleDisable2FA"
    />
  </div>
</template>

<style scoped>
.security-page {
  padding: 40px 0;
}

.security-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
}

.security-page__section {
  padding: 24px;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
}

.security-page__section-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.security-page__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.security-page__item-title {
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
}

.security-page__item-description {
  font-size: 13px;
  color: #6B7280;
}

.security-page__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

.security-page__success {
  padding: 12px;
  font-size: 14px;
  color: #065f46;
  background: #D1FAE5;
  border-radius: 8px;
}

.security-page__text {
  margin-bottom: 16px;
  font-size: 14px;
  color: #6B7280;
}

.security-page__codes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.security-page__code {
  padding: 12px;
  font-family: monospace;
  font-size: 14px;
  text-align: center;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .security-page__codes {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>