<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const rememberMe = ref(true)

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

function validate() {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email обязателен'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email'
  }

  if (!form.password) {
    errors.password = 'Пароль обязателен'
  } else if (form.password.length < 6) {
    errors.password = 'Пароль минимум 6 символов'
  }

  return !errors.email && !errors.password
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  error.value = ''

  try {
    const response = await authStore.login({
      email: form.email,
      password: form.password
    })

    if (response?.requires2FA) {
      router.push({
        name: '2fa',
        query: { redirect: route.query.redirect }
      })
    } else {
      router.push(route.query.redirect || '/')
    }
  } catch (err) {
    error.value = err.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}

function fillDemo(role) {
  if (role === 'user') {
    form.email = 'alexey@example.com'
    form.password = 'password123'
  } else if (role === 'admin') {
    form.email = 'admin@example.com'
    form.password = 'password123'
  }
}
</script>

<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h1 class="auth-form__title">Вход</h1>
      <p class="auth-form__subtitle">С возвращением в Auto Platform</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="auth-form__error" role="alert">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M10 6v5M10 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ error }}
      </div>

      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="example@email.com"
        :error="errors.email"
        autocomplete="email"
        required
      />

      <BaseInput
        v-model="form.password"
        label="Пароль"
        type="password"
        placeholder="Введите пароль"
        :error="errors.password"
        autocomplete="current-password"
        required
      />

      <div class="auth-form__row">
        <BaseCheckbox v-model="rememberMe" label="Запомнить меня" />
        <RouterLink to="/forgot-password" class="auth-form__link">
          Забыли пароль?
        </RouterLink>
      </div>

      <BaseButton type="submit" block size="lg" :loading="loading">
        Войти
      </BaseButton>
    </form>

    <div class="auth-form__demo">
      <p class="auth-form__demo-title">Демо-доступ</p>
      <div class="auth-form__demo-buttons">
        <button type="button" class="auth-form__demo-btn" @click="fillDemo('user')">
          Пользователь
        </button>
        <button type="button" class="auth-form__demo-btn" @click="fillDemo('admin')">
          Администратор
        </button>
      </div>
    </div>

    <p class="auth-form__footer">
      Нет аккаунта?
      <RouterLink to="/register" class="auth-form__link">
        Зарегистрироваться
      </RouterLink>
    </p>
  </div>
</template>

<style scoped>
.auth-form__header {
  margin-bottom: 32px;
  text-align: center;
}

.auth-form__title {
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.auth-form__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.auth-form__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #991b1b;
  background: #FEE2E2;
  border-radius: 8px;
}

.auth-form__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 20px;
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

.auth-form__demo {
  margin-top: 24px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
}

.auth-form__demo-title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6B7280;
}

.auth-form__demo-buttons {
  display: flex;
  gap: 8px;
}

.auth-form__demo-btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #0A84FF;
  background: white;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-form__demo-btn:hover {
  border-color: #0A84FF;
  background: #F0F7FF;
}

.auth-form__footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6B7280;
}
</style>