<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref('')

const form = reactive({
  code: ''
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  
  try {
    // Mock проверка кода
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (form.code === '123456') {
      router.push(route.query.redirect || '/')
    } else {
      error.value = 'Неверный код'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-page__header">
      <h1 class="auth-page__title">Двухфакторная аутентификация</h1>
      <p class="auth-page__subtitle">
        Введите 6-значный код из приложения
      </p>
    </div>
    
    <form class="auth-form" @submit.prevent="handleSubmit">
      <div v-if="error" class="auth-form__error">
        {{ error }}
      </div>
      
      <BaseInput
        v-model="form.code"
        label="Код"
        placeholder="123456"
        maxlength="6"
        class="auth-form__code"
        required
      />
      
      <BaseButton type="submit" block size="lg" :loading="loading">
        Подтвердить
      </BaseButton>
      
      <p class="auth-form__hint">
        Демо код: 123456
      </p>
    </form>
  </div>
</template>