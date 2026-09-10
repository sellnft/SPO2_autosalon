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
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
  errors.passwordConfirmation = ''
  errors.agreeToTerms = ''
  
  if (!form.name) {
    errors.name = 'Имя обязательно'
  } else if (form.name.length < 2) {
    errors.name = 'Имя минимум 2 символа'
  }
  
  if (!form.email) {
    errors.email = 'Email обязателен'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email'
  }
  
  if (!form.phone) {
    errors.phone = 'Телефон обязателен'
  } else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
    errors.phone = 'Некорректный телефон'
  }
  
  if (!form.password) {
    errors.password = 'Пароль обязателен'
  } else if (form.password.length < 6) {
    errors.password = 'Пароль минимум 6 символов'
  }
  
  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Пароли не совпадают'
  }
  
  if (!form.agreeToTerms) {
    errors.agreeToTerms = 'Необходимо согласиться с условиями'
  }
  
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
    
    // Переходим на страницу верификации email
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
  <div class="auth-page">
    <div class="auth-page__header">
      <h1 class="auth-page__title">Регистрация</h1>
      <p class="auth-page__subtitle">Создайте аккаунт за 30 секунд</p>
    </div>
    
    <form class="auth-form" @submit.prevent="handleSubmit">
      <div v-if="error" class="auth-form__error">
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
      
      <p class="auth-form__footer">
        Уже есть аккаунт?
        <RouterLink to="/login" class="auth-form__link">
          Войти
        </RouterLink>
      </p>
    </form>
  </div>
</template>

<style scoped>
/* Наследует стили от LoginPage */
.auth-page {
  width: 100%;
}

.auth-page__header {
  margin-bottom: 32px;
  text-align: center;
}

.auth-page__title {
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.auth-page__subtitle {
  font-size: 14px;
  color: #6B7280;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-form__error {
  padding: 12px;
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
  text-align: center;
  font-size: 14px;
  color: #6B7280;
}

.auth-form__terms {
  font-size: 13px;
  color: #6B7280;
}
</style>