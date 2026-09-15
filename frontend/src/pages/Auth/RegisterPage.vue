<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
  agreeToTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
  agreeToTerms: ''
})

function validate() {
  Object.keys(errors).forEach(key => (errors[key] = ''))

  if (!form.name) errors.name = 'Имя обязательно'
  else if (form.name.length < 2) errors.name = 'Имя минимум 2 символа'

  if (!form.email) errors.email = 'Email обязателен'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный email'

  if (!form.phone) errors.phone = 'Телефон обязателен'
  else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) errors.phone = 'Некорректный телефон'

  if (!form.password) errors.password = 'Пароль обязателен'
  else if (form.password.length < 6) errors.password = 'Пароль минимум 6 символов'

  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Пароли не совпадают'
  }

  if (!form.agreeToTerms) errors.agreeToTerms = 'Необходимо согласиться'

  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password
    })

    router.push({
      name: 'verify-email',
      query: { email: form.email }
    })
  } catch (err) {
    error.value = err.message || 'Ошибка регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h1 class="auth-form__title">Регистрация</h1>
      <p class="auth-form__subtitle">Создайте аккаунт за 30 секунд</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="auth-form__error" role="alert">
        {{ error }}
      </div>

      <BaseInput
        v-model="form.name"
        label="Имя"
        placeholder="Иван Петров"
        :error="errors.name"
        required
      />

      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="example@email.com"
        :error="errors.email"
        required
      />

      <BaseInput
        v-model="form.phone"
        label="Телефон"
        type="tel"
        placeholder="+7 (900) 123-45-67"
        :error="errors.phone"
        required
      />

      <BaseInput
        v-model="form.password"
        label="Пароль"
        type="password"
        placeholder="Минимум 6 символов"
        :error="errors.password"
        required
      />

      <BaseInput
        v-model="form.passwordConfirmation"
        label="Подтверждение пароля"
        type="password"
        placeholder="Повторите пароль"
        :error="errors.passwordConfirmation"
        required
      />

      <BaseCheckbox
        v-model="form.agreeToTerms"
        :error="errors.agreeToTerms"
      >
        <template #label>
          <span class="auth-form__terms">
            Я согласен с
            <a href="#" class="auth-form__link">условиями использования</a>
            и
            <a href="#" class="auth-form__link">политикой конфиденциальности</a>
          </span>
        </template>
      </BaseCheckbox>

      <BaseButton type="submit" block size="lg" :loading="loading">
        Зарегистрироваться
      </BaseButton>
    </form>

    <p class="auth-form__footer">
      Уже есть аккаунт?
      <RouterLink to="/login" class="auth-form__link">
        Войти
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

.auth-form__terms {
  font-size: 13px;
  color: #6B7280;
}

.auth-form__footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6B7280;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>