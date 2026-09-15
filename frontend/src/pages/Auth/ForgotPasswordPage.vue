<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()

const loading = ref(false)
const sent = ref(false)
const error = ref('')

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

function validate() {
  errors.email = ''

  if (!form.email) errors.email = 'Email обязателен'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный email'

  return !errors.email
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  error.value = ''

  try {
    await new Promise(r => setTimeout(r, 800))
    sent.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <div v-if="!sent">
      <div class="auth-form__header">
        <h1 class="auth-form__title">Восстановление пароля</h1>
        <p class="auth-form__subtitle">
          Введите email, и мы отправим ссылку для восстановления
        </p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-if="error" class="auth-form__error">{{ error }}</div>

        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="example@email.com"
          :error="errors.email"
          required
        />

        <BaseButton type="submit" block size="lg" :loading="loading">
          Отправить ссылку
        </BaseButton>

        <p class="auth-form__footer">
          <RouterLink to="/login" class="auth-form__link">
            ← Вернуться ко входу
          </RouterLink>
        </p>
      </form>
    </div>

    <div v-else class="auth-form__success">
      <div class="auth-form__success-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M4 8h24v16H4z" stroke="currentColor" stroke-width="2"/>
          <path d="M4 12l12 8 12-8" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h1 class="auth-form__title">Письмо отправлено</h1>
      <p class="auth-form__subtitle">
        Проверьте почту {{ form.email }} для восстановления пароля
      </p>
      <RouterLink to="/login" class="auth-form__link">
        ← Вернуться ко входу
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.auth-form__header {
  margin-bottom: 32px;
  text-align: center;
}

.auth-form__title {
  margin-bottom: 8px;
  font-size: 24px;
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

.auth-form__link {
  font-size: 14px;
  color: #0A84FF;
  transition: color 0.2s;
}

.auth-form__link:hover {
  color: #0066CC;
  text-decoration: underline;
}

.auth-form__footer {
  margin-top: 20px;
  text-align: center;
}

.auth-form__success {
  text-align: center;
}

.auth-form__success-icon {
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

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>