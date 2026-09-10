<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const email = ref(route.query.email || '')
const loading = ref(false)
const verified = ref(false)
const error = ref('')

async function handleVerify() {
  loading.value = true
  error.value = ''
  
  try {
    // Mock верификация
    await new Promise(resolve => setTimeout(resolve, 1000))
    verified.value = true
    
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="verify-page">
    <div v-if="!verified" class="verify-page__content">
      <div class="verify-page__icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M8 12h32v24H8z" stroke="currentColor" stroke-width="2"/>
          <path d="M8 16l16 12 16-12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      
      <h1 class="verify-page__title">Подтвердите email</h1>
      
      <p class="verify-page__text">
        Мы отправили письмо на <strong>{{ email }}</strong>
      </p>
      
      <BaseButton :loading="loading" @click="handleVerify">
        Я подтвердил email
      </BaseButton>
      
      <button class="verify-page__resend">
        Отправить письмо ещё раз
      </button>
    </div>
    
    <div v-else class="verify-page__success">
      <div class="verify-page__success-icon">✓</div>
      <h1 class="verify-page__title">Email подтверждён!</h1>
      <p class="verify-page__text">Перенаправляем на главную...</p>
    </div>
  </div>
</template>

<style scoped>
.verify-page {
  width: 100%;
  text-align: center;
}

.verify-page__icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  color: #0A84FF;
}

.verify-page__title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.verify-page__text {
  margin-bottom: 24px;
  font-size: 14px;
  color: #6B7280;
}

.verify-page__resend {
  margin-top: 16px;
  font-size: 14px;
  color: #0A84FF;
  transition: color 0.2s;
}

.verify-page__resend:hover {
  color: #0066CC;
  text-decoration: underline;
}

.verify-page__success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  font-size: 32px;
  color: #10B981;
  background: #D1FAE5;
  border-radius: 50%;
}
</style>