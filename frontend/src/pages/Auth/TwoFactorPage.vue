<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  code: ''
})

const canSubmit = computed(() => form.code.length === 6)

async function handleSubmit() {
  if (!canSubmit.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.verify2FA(form.code)
    toastStore.success('Добро пожаловать!')
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = err.message || 'Неверный код'
  } finally {
    loading.value = false
  }
}

function autoFormatCode(event) {
  form.code = event.target.value.replace(/\D/g, '').slice(0, 6)
}
</script>

<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <div class="auth-form__icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4l12 6v8c0 5-4 9-12 10C8 27 4 23 4 18v-8l12-6z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16l3 3 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="auth-form__title">Двухфакторная аутентификация</h1>
      <p class="auth-form__subtitle">
        Введите 6-значный код из приложения-аутентификатора
      </p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="auth-form__error">{{ error }}</div>

      <div class="auth-form__code-wrapper">
        <input
          :value="form.code"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          placeholder="000000"
          class="auth-form__code-input"
          autofocus
          @input="autoFormatCode"
        />
      </div>

      <BaseButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="!canSubmit"
      >
        Подтвердить
      </BaseButton>

      <p class="auth-form__hint">
        Демо-код: <strong>123456</strong>
      </p>

      <p class="auth-form__footer">
        <RouterLink to="/login" class="auth-form__link">
          ← Вернуться ко входу
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
.auth-form__header {
  margin-bottom: 32px;
  text-align: center;
}

.auth-form__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: #0A84FF;
  background: #F0F7FF;
  border-radius: 50%;
}

.auth-form__title {
  margin-bottom: 8px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.auth-form__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.auth-form__error {
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #991b1b;
  background: #FEE2E2;
  border-radius: 8px;
}

.auth-form__code-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.auth-form__code-input {
  width: 240px;
  padding: 16px;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 12px;
  color: #111827;
  background: white;
  border: 2px solid #D1D5DB;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s;
}

.auth-form__code-input:focus {
  border-color: #0A84FF;
  box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
}

.auth-form__hint {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #9CA3AF;
}

.auth-form__footer {
  margin-top: 16px;
  text-align: center;
}

.auth-form__link {
  font-size: 13px;
  color: #0A84FF;
  transition: color 0.2s;
}

.auth-form__link:hover {
  color: #0066CC;
  text-decoration: underline;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>