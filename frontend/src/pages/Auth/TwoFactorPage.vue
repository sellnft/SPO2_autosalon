<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const error = ref('')
const rememberDevice = ref(false)
const code = ref(['', '', '', '', '', ''])
const inputs = ref([])
const activeIndex = ref(0)
const timeLeft = ref(30)
const resendCooldown = ref(0)

let timeTimer = null
let resendTimer = null

const fullCode = computed(() => code.value.join(''))
const canSubmit = computed(() => fullCode.value.length === 6 && !code.value.includes(''))

const timeDisplay = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const timeUrgent = computed(() => timeLeft.value <= 10)

function focusInput(index) {
  nextTick(() => {
    const el = inputs.value[index]
    if (el) {
      el.focus()
      el.select?.()
    }
  })
}

function handleInput(event, index) {
  const value = event.target.value.replace(/\D/g, '')
  const digit = value.slice(-1)

  code.value[index] = digit
  activeIndex.value = index

  if (digit && index < 5) {
    focusInput(index + 1)
  }

  if (fullCode.value.length === 6 && !code.value.includes('')) {
    handleSubmit()
  }
}

function handleKeydown(event, index) {
  if (event.key === 'Backspace') {
    if (!code.value[index] && index > 0) {
      event.preventDefault()
      code.value[index - 1] = ''
      focusInput(index - 1)
    } else {
      code.value[index] = ''
    }
    return
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusInput(index - 1)
  }

  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    focusInput(index + 1)
  }

  if (event.key === 'Delete') {
    code.value[index] = ''
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  if (!pasted) return

  for (let i = 0; i < 6; i++) {
    code.value[i] = pasted[i] || ''
  }

  const lastFilled = Math.min(pasted.length, 6) - 1
  focusInput(lastFilled < 5 ? lastFilled + 1 : 5)

  if (pasted.length === 6) {
    handleSubmit()
  }
}

async function handleSubmit() {
  if (!canSubmit.value || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await authStore.verify2FA(fullCode.value)
    toastStore.success('Добро пожаловать!')
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = err.message || 'Неверный код. Попробуйте ещё раз.'
    code.value = ['', '', '', '', '', '']
    focusInput(0)
  } finally {
    loading.value = false
  }
}

function resendCode() {
  if (resendCooldown.value > 0) return

  resendCooldown.value = 60
  timeLeft.value = 30
  startTimers()
  toastStore.success('Новый код отправлен')

  if (resendTimer) clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

function startTimers() {
  if (timeTimer) clearInterval(timeTimer)
  timeTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timeTimer)
      timeTimer = null
    }
  }, 1000)
}

function goToLogin() {
  router.push('/login')
}

onMounted(() => {
  focusInput(0)
  startTimers()
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (resendTimer) clearInterval(resendTimer)
})
</script>

<template>
  <div class="cv-2fa">
    <div class="cv-2fa__icon-wrap">
      <div class="cv-2fa__icon">
        <span class="cv-2fa__icon-inner">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </span>
        <span class="cv-2fa__icon-shine" aria-hidden="true"></span>
      </div>
    </div>

    <header class="cv-2fa__header">
      <h1 class="cv-2fa__title">Двухфакторная аутентификация</h1>
      <p class="cv-2fa__subtitle">
        Введите 6-значный код из приложения-аутентификатора
      </p>
    </header>

    <form class="cv-2fa__body" @submit.prevent="handleSubmit">
      <div v-if="error" class="cv-2fa__alert" role="alert">
        <span class="cv-2fa__alert-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 17h.01"/>
          </svg>
        </span>
        {{ error }}
      </div>

      <div class="cv-2fa__cells" @paste="handlePaste">
        <input
          v-for="(digit, index) in code"
          :key="index"
          :ref="el => { if (el) inputs[index] = el }"
          :value="digit"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="1"
          class="cv-2fa__cell"
          :class="{
            'cv-2fa__cell--filled': digit,
            'cv-2fa__cell--error': error
          }"
          @input="handleInput($event, index)"
          @keydown="handleKeydown($event, index)"
          @focus="activeIndex = index"
        />
      </div>

      <div class="cv-2fa__timer" :class="{ 'cv-2fa__timer--urgent': timeUrgent }">
        <span class="cv-2fa__timer-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
          </svg>
        </span>
        <span class="cv-2fa__timer-text">
          Код действует
          <strong>{{ timeDisplay }}</strong>
        </span>
      </div>

      <BaseCheckbox v-model="rememberDevice" label="Запомнить это устройство на 30 дней" />

      <BaseButton
        type="submit"
        block
        size="lg"
        :loading="loading"
        :disabled="!canSubmit"
      >
        <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8.5l5 5L20 2.5"/>
        </svg>
        Подтвердить
      </BaseButton>

      <div class="cv-2fa__resend">
        <span class="cv-2fa__resend-text">Не приходит код?</span>

        <button
          type="button"
          class="cv-2fa__resend-btn"
          :disabled="resendCooldown > 0"
          @click="resendCode"
        >
          <template v-if="resendCooldown > 0">
            Отправить заново через {{ resendCooldown }} сек
          </template>
          <template v-else>
            Отправить заново
          </template>
        </button>
      </div>

      <div class="cv-2fa__methods">
        <button type="button" class="cv-2fa__method">
          <span class="cv-2fa__method-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z"/>
            </svg>
          </span>
          Получить по SMS
        </button>

        <button type="button" class="cv-2fa__method">
          <span class="cv-2fa__method-icon" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="8" cy="15" r="4"/>
              <path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>
            </svg>
          </span>
          Использовать код восстановления
        </button>
      </div>
    </form>

    <footer class="cv-2fa__footer">
      <RouterLink to="/login" class="cv-2fa__back">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Вернуться ко входу
      </RouterLink>

      <p class="cv-2fa__demo">
        Демо-код: <strong>123456</strong>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.cv-2fa {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-2fa__icon-wrap {
  display: flex;
  justify-content: center;
}

.cv-2fa__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 22px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.6) 0%, rgba(20, 16, 10, 0.75) 100%),
    linear-gradient(180deg, #1F1A12 0%, #14100C 100%);
  border: 1px solid rgba(201, 169, 97, 0.35);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.12) inset,
    0 0 60px rgba(201, 169, 97, 0.15);
  overflow: hidden;
  animation: cv2FAFloat 4s ease-in-out infinite;
}

@keyframes cv2FAFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-2fa__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.3) 50%, transparent);
}

.cv-2fa__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-2fa__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 245, 214, 0.18) 50%, transparent 70%);
  animation: cv2FAShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cv2FAShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-2fa__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.cv-2fa__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-2fa__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.65);
}

.cv-2fa__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cv-2fa__alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.12), rgba(184, 119, 85, 0.03));
  border: 1px solid rgba(184, 119, 85, 0.35);
}

.cv-2fa__alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
  margin-top: 1px;
}

.cv-2fa__cells {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin: 4px 0 6px;
}

.cv-2fa__cell {
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  font-family: inherit;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-align: center;
  color: rgba(245, 240, 230, 0.98);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.22);
  border-radius: 14px;
  outline: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  caret-color: #E8D5A0;
}

.cv-2fa__cell:hover:not(:focus) {
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-2fa__cell:focus {
  border-color: rgba(201, 169, 97, 0.65);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 32px rgba(201, 169, 97, 0.15),
    0 1px 0 rgba(232, 213, 160, 0.08) inset;
  transform: translateY(-2px);
}

.cv-2fa__cell--filled {
  border-color: rgba(232, 213, 160, 0.5);
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.55) 0%, rgba(20, 16, 10, 0.7) 100%),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  color: #F5E6BC;
}

.cv-2fa__cell--error {
  border-color: rgba(184, 119, 85, 0.65);
  box-shadow:
    0 0 0 3px rgba(184, 119, 85, 0.12),
    0 0 24px rgba(184, 119, 85, 0.15);
}

.cv-2fa__timer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  align-self: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  transition: all 0.25s ease;
}

.cv-2fa__timer--urgent {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-2fa__timer-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.cv-2fa__timer--urgent .cv-2fa__timer-icon {
  color: #E8A88A;
}

.cv-2fa__timer-text strong {
  font-weight: 800;
  color: currentColor;
  font-variant-numeric: tabular-nums;
}

.cv-2fa__resend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.cv-2fa__resend-text {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-2fa__resend-btn {
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-2fa__resend-btn:hover:not(:disabled) {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-2fa__resend-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}

.cv-2fa__resend-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  color: rgba(200, 190, 175, 0.5);
}

.cv-2fa__methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-2fa__method {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: transparent;
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  text-align: center;
}

.cv-2fa__method:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-2fa__method-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}

.cv-2fa__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  margin-top: 4px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-2fa__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.7);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 10px;
  transition: all 0.22s ease;
}

.cv-2fa__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateX(-2px);
}

.cv-2fa__demo {
  margin: 0;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: rgba(200, 190, 175, 0.5);
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(201, 169, 97, 0.22);
  border-radius: 8px;
}

.cv-2fa__demo strong {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  color: #E8D5A0;
  font-weight: 800;
  letter-spacing: 0.5px;
}

@media (max-width: 480px) {
  .cv-2fa__title {
    font-size: 19px;
  }

  .cv-2fa__icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-2fa__icon-inner svg {
    width: 26px;
    height: 26px;
  }

  .cv-2fa__cells {
    gap: 6px;
  }

  .cv-2fa__cell {
    font-size: 22px;
    border-radius: 11px;
  }

  .cv-2fa__methods {
    grid-template-columns: 1fr;
  }
}
</style>