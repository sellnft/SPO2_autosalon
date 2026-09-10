<script setup>
import { ref, reactive } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

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
  
  if (!form.email) {
    errors.email = 'Email обязателен'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email'
  }
  
  return !errors.email
}

async function handleSubmit() {
  if (!validate()) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Mock отправка
    await new Promise(resolve => setTimeout(resolve, 1000))
    sent.value = true
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div v-if="!sent">
      <div class="auth-page__header">
        <h1 class="auth-page__title">Восстановление пароля</h1>
        <p class="auth-page__subtitle">
          Введите email, и мы отправим ссылку для восстановления
        </p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="example@email.com"
          :error="errors.email"
          required
        />
        
        <BaseButton type="submit" block size="lg" :loading="loading">
          Отправить
        </BaseButton>
        
        <p class="auth-form__footer">
          <RouterLink to="/login" class="auth-form__link">
            ← Вернуться ко входу
          </RouterLink>
        </p>
      </form>
    </div>
    
    <div v-else class="auth-page__success">
      <div class="auth-page__success-icon">✓</div>
      <h1 class="auth-page__title">Письмо отправлено</h1>
      <p class="auth-page__subtitle">
        Проверьте вашу почту для восстановления пароля
      </p>
    </div>
  </div>
</template>