<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api/authApi'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const step = ref(1)
const loading = ref(false)
const setupData = ref(null)
const verificationCode = ref('')
const recoveryCodes = ref([])

const canVerify = computed(() => verificationCode.value.length === 6)

async function startSetup() {
  loading.value = true
  try {
    setupData.value = await authApi.setup2FA(authStore.user.id)
    step.value = 2
  } catch (err) {
    toastStore.error('Не удалось начать настройку 2FA')
  } finally {
    loading.value = false
  }
}

async function verifyCode() {
  if (!canVerify.value) return

  loading.value = true
  try {
    const response = await authApi.enable2FA(authStore.user.id, verificationCode.value)
    recoveryCodes.value = response.recoveryCodes
    step.value = 3
    toastStore.success('2FA включена')
  } catch (err) {
    toastStore.error(err.message || 'Неверный код')
  } finally {
    loading.value = false
  }
}

async function finish() {
  router.push('/profile/security')
}

function formatInput(event) {
  verificationCode.value = event.target.value.replace(/\D/g, '').slice(0, 6)
}

onMounted(() => {
  // Ничего не делаем — пользователь сам начнёт
})
</script>

<template>
  <div class="setup-2fa">
    <!-- Step 1: Intro -->
    <div v-if="step === 1" class="setup-2fa__step">
      <div class="setup-2fa__icon">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <path d="M16 4l12 6v8c0 5-4 9-12 10C8 27 4 23 4 18v-8l12-6z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 class="setup-2fa__title">Двухфакторная аутентификация</h1>

      <p class="setup-2fa__description">
        Добавьте дополнительный уровень защиты. Для входа потребуется
        код из приложения-аутентификатора.
      </p>

      <div class="setup-2fa__info">
        <p>Вам понадобится одно из приложений:</p>
        <ul>
          <li>Google Authenticator</li>
          <li>Authy</li>
          <li>1Password</li>
          <li>Microsoft Authenticator</li>
        </ul>
      </div>

      <BaseButton size="lg" :loading="loading" @click="startSetup">
        Начать настройку
      </BaseButton>
    </div>

    <!-- Step 2: QR + verify -->
    <div v-else-if="step === 2" class="setup-2fa__step">
      <h1 class="setup-2fa__title">Сканируйте QR-код</h1>
      <p class="setup-2fa__description">
        Откройте приложение-аутентификатор и отсканируйте код
      </p>

      <div class="setup-2fa__qr">
        <img
          v-if="setupData?.qrCode"
          :src="setupData.qrCode"
          alt="QR-код для 2FA"
        />
      </div>

      <div class="setup-2fa__secret">
        <p class="setup-2fa__secret-label">
          Или введите код вручную:
        </p>
        <code class="setup-2fa__secret-value">{{ setupData?.secret }}</code>
        <button
          type="button"
          class="setup-2fa__copy"
          @click="navigator.clipboard.writeText(setupData?.secret || '')"
        >
          Копировать
        </button>
      </div>

      <div class="setup-2fa__verify">
        <p class="setup-2fa__verify-label">
          Введите 6-значный код из приложения:
        </p>
        <input
          :value="verificationCode"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="000000"
          class="setup-2fa__input"
          autofocus
          @input="formatInput"
        />
      </div>

      <BaseButton
        size="lg"
        :loading="loading"
        :disabled="!canVerify"
        @click="verifyCode"
      >
        Подтвердить
      </BaseButton>
    </div>

    <!-- Step 3: Recovery codes -->
    <div v-else class="setup-2fa__step">
      <div class="setup-2fa__success-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 16l7 7 13-14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 class="setup-2fa__title">2FA включена!</h1>
      <p class="setup-2fa__description">
        Сохраните резервные коды в безопасном месте.
        Каждый код можно использовать один раз.
      </p>

      <div class="setup-2fa__codes">
        <div
          v-for="code in recoveryCodes"
          :key="code"
          class="setup-2fa__code"
        >
          {{ code }}
        </div>
      </div>

      <div class="setup-2fa__actions">
        <BaseButton
          variant="outline"
          @click="navigator.clipboard.writeText(recoveryCodes.join('\n'))"
        >
          Скопировать все
        </BaseButton>
        <BaseButton size="lg" @click="finish">
          Готово
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-2fa {
  width: 100%;
}

.setup-2fa__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.setup-2fa__icon,
.setup-2fa__success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 8px;
  color: #0A84FF;
  background: #F0F7FF;
  border-radius: 50%;
}

.setup-2fa__success-icon {
  color: #10B981;
  background: #D1FAE5;
}

.setup-2fa__title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.setup-2fa__description {
  max-width: 400px;
  font-size: 14px;
  line-height: 1.6;
  color: #6B7280;
}

.setup-2fa__info {
  width: 100%;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
  text-align: left;
}

.setup-2fa__info p {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.setup-2fa__info ul {
  padding-left: 20px;
  list-style: disc;
  font-size: 13px;
  color: #6B7280;
}

.setup-2fa__info li {
  margin-bottom: 4px;
}

.setup-2fa__qr {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.setup-2fa__qr img {
  width: 200px;
  height: 200px;
}

.setup-2fa__secret {
  width: 100%;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setup-2fa__secret-label {
  font-size: 12px;
  color: #6B7280;
}

.setup-2fa__secret-value {
  padding: 8px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #111827;
  background: white;
  border-radius: 6px;
  word-break: break-all;
}

.setup-2fa__copy {
  padding: 6px 12px;
  font-size: 12px;
  color: #0A84FF;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  cursor: pointer;
  align-self: flex-start;
}

.setup-2fa__verify {
  width: 100%;
}

.setup-2fa__verify-label {
  margin-bottom: 8px;
  font-size: 13px;
  color: #374151;
}

.setup-2fa__input {
  width: 100%;
  padding: 14px;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 8px;
  color: #111827;
  background: white;
  border: 2px solid #D1D5DB;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
}

.setup-2fa__input:focus {
  border-color: #0A84FF;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
}

.setup-2fa__codes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
}

.setup-2fa__code {
  padding: 10px;
  font-family: monospace;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #111827;
  background: white;
  border-radius: 6px;
}

.setup-2fa__actions {
  display: flex;
  gap: 12px;
  width: 100%;
}
</style>