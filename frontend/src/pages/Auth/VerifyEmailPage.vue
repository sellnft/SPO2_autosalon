<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const email = ref(route.query.email || '')
const loading = ref(false)
const verified = ref(false)
const error = ref('')
const resendTimer = ref(0)

let timer = null

async function handleVerify() {
  loading.value = true
  error.value = ''

  try {
    // В mock — имитация перехода по ссылке из письма
    await new Promise(r => setTimeout(r, 1000))
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

async function resendEmail() {
  if (resendTimer.value > 0) return

  try {
    await new Promise(r => setTimeout(r, 300))
    toastStore.success('Письмо отправлено повторно')

    resendTimer.value = 60
    timer = setInterval(() => {
      resendTimer.value--
      if (resendTimer.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    toastStore.error('Ошибка отправки')
  }
}

onMounted(() => {
  if (timer) clearInterval(timer)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
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

      <p class="verify-page__hint">
        Перейдите по ссылке в письме или нажмите кнопку ниже (демо-режим)
      </p>

      <div v-if="error" class="verify-page__error">{{ error }}</div>

      <BaseButton :loading="loading" size="lg" @click="handleVerify">
        Я подтвердил email
      </BaseButton>

      <button
        class="verify-page__resend"
        :disabled="resendTimer > 0"
        @click="resendEmail"
      >
        {{ resendTimer > 0
          ? `Отправить повторно через ${resendTimer}с`
          : 'Отправить письмо ещё раз' }}
      </button>
    </div>

    <div v-else class="verify-page__success">
      <div class="verify-page__success-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 16l7 7 13-14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
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
  margin-bottom: 12px;
  font-size: 14px;
  color: #6B7280;
}

.verify-page__hint {
  margin-bottom: 24px;
  font-size: 13px;
  color: #9CA3AF;
}

.verify-page__error {
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #991b1b;
  background: #FEE2E2;
  border-radius: 8px;
}

.verify-page__resend {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  font-size: 14px;
  color: #0A84FF;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.verify-page__resend:hover:not(:disabled) {
  color: #0066CC;
  text-decoration: underline;
}

.verify-page__resend:disabled {
  color: #9CA3AF;
  cursor: not-allowed;
}

.verify-page__success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 24px;
  color: #10B981;
  background: #D1FAE5;
  border-radius: 50%;
}
</style>