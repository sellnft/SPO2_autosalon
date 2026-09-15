<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const toastStore = useToastStore()

const loading = ref(false)
const error = ref('')

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

  if (!form.password) errors.password = 'Пароль обязателен'
  else if (form.password.length < 6) errors.password = 'Минимум 6 символов'

  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Пароли не совпадают'
  }

  return !errors.password && !errors.passwordConfirmation
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  error.value = ''

  try {
    await new Promise(r => setTimeout(r, 800))
    toastStore.success('Пароль успешно изменён')
    router.push('/login')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-form">
    <div class="auth-form__header">
      <h1 class="auth-form__title">Новый пароль</h1>
      <p class="auth-form__subtitle">Придумайте новый пароль для входа</p>
    </div>

    <form @submit.prevent="handleSubmit">
      <div v-if="error" class="auth-form__error">{{ error }}</div>

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

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>