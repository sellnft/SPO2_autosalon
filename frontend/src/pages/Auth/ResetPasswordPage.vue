<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  password: '',
  passwordConfirmation: ''
})

const errors = reactive({
  password: '',
  passwordConfirmation: ''
})

function validate() {
  errors.password = ''
  errors.passwordConfirmation = ''
  
  if (!form.password) {
    errors.password = 'Пароль обязателен'
  } else if (form.password.length < 6) {
    errors.password = 'Пароль минимум 6 символов'
  }
  
  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Пароли не совпадают'
  }
  
  return !errors.password && !errors.passwordConfirmation
}

async function handleSubmit() {
  if (!validate()) return
  
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/login')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__header">
      <h1 class="auth-page__title">Новый пароль</h1>
      <p class="auth-page__subtitle">Придумайте новый пароль</p>
    </div>
    
    <form class="auth-form" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.password"
        label="Новый пароль"
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
      
      <BaseButton type="submit" block size="lg" :loading="loading">
        Сохранить пароль
      </BaseButton>
    </form>
  </div>
</template>