<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'

const step = ref(1)
const secretCode = ref('JBSWY3DPEHPK3PXP')
const verificationCode = ref('')
const loading = ref(false)

async function handleVerify() {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  step.value = 3
  loading.value = false
}
</script>

<template>
  <div class="auth-page">
    <div v-if="step === 1" class="setup-2fa">
      <h1 class="auth-page__title">Настройка 2FA</h1>
      <p class="auth-page__subtitle">
        Двухфакторная аутентификация добавляет дополнительный уровень защиты
      </p>
      
      <BaseButton @click="step = 2">Начать настройку</BaseButton>
    </div>
    
    <div v-else-if="step === 2" class="setup-2fa">
      <h1 class="auth-page__title">Сканируйте QR-код</h1>
      
      <div class="setup-2fa__qr">
        <!-- Mock QR code -->
        <div class="setup-2fa__qr-placeholder">
          QR CODE
        </div>
      </div>
      
      <p class="setup-2fa__secret">
        Секретный ключ: <strong>{{ secretCode }}</strong>
      </p>
      
      <div class="setup-2fa__form">
        <input
          v-model="verificationCode"
          type="text"
          placeholder="Введите код"
          maxlength="6"
          class="setup-2fa__input"
        />
        <BaseButton :loading="loading" @click="handleVerify">
          Подтвердить
        </BaseButton>
      </div>
    </div>
    
    <div v-else class="setup-2fa__success">
      <div class="setup-2fa__success-icon">✓</div>
      <h1 class="auth-page__title">2FA включена!</h1>
      <p class="auth-page__subtitle">
        Ваш аккаунт теперь защищён
      </p>
      <BaseButton @click="$router.push('/profile/security')">
        Готово
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.setup-2fa {
  text-align: center;
}

.setup-2fa__qr {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.setup-2fa__qr-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 12px;
  color: #9CA3AF;
}

.setup-2fa__secret {
  margin-bottom: 24px;
  font-size: 14px;
  color: #6B7280;
}

.setup-2fa__form {
  display: flex;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.setup-2fa__input {
  flex: 1;
  padding: 12px;
  font-size: 20px;
  text-align: center;
  letter-spacing: 8px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  outline: none;
}

.setup-2fa__input:focus {
  border-color: #0A84FF;
}

.setup-2fa__success {
  text-align: center;
}

.setup-2fa__success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  font-size: 32px;
  color: #10B981;
  background: #D1FAE5;
  border-radius: 50%;
}
</style>