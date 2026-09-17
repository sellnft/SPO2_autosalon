<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const email = ref(route.query.email || authStore.user?.email || '')
const loading = ref(false)
const verified = ref(false)
const error = ref('')
const resendTimer = ref(60)
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref([])

let timer = null

const fullCode = computed(() => code.value.join(''))
const canVerify = computed(() => fullCode.value.length === 6 && !code.value.includes(''))

const maskedEmail = computed(() => {
  if (!email.value) return ''
  const [local, domain] = email.value.split('@')
  if (!domain) return email.value
  const maskedLocal = local.length > 2
    ? local[0] + '•'.repeat(Math.min(local.length - 1, 4)) + local.slice(-1)
    : local[0] + '•'
  return `${maskedLocal}@${domain}`
})

const emailProvider = computed(() => {
  const domain = (email.value.split('@')[1] || '').toLowerCase()
  if (domain.includes('gmail')) return { id: 'gmail', label: 'Открыть Gmail', url: 'https://mail.google.com' }
  if (domain.includes('yandex') || domain.includes('ya.ru')) return { id: 'yandex', label: 'Открыть Яндекс.Почту', url: 'https://mail.yandex.ru' }
  if (domain.includes('mail.ru') || domain.includes('bk.ru') || domain.includes('inbox.ru')) return { id: 'mail', label: 'Открыть Mail.ru', url: 'https://mail.ru' }
  return null
})

function focusInput(index) {
  nextTick(() => {
    inputRefs.value[index]?.focus()
  })
}

function handleInput(event, index) {
  const value = event.target.value.replace(/\D/g, '')
  const digit = value.slice(-1)

  code.value[index] = digit

  if (digit && index < 5) {
    focusInput(index + 1)
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
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusInput(index - 1)
  }

  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    focusInput(index + 1)
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  if (!pasted) return

  for (let i = 0; i < 6; i++) {
    code.value[i] = pasted[i] || ''
  }

  focusInput(Math.min(pasted.length, 5))

  if (pasted.length === 6) {
    handleVerify()
  }
}

async function handleVerify() {
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    await new Promise(r => setTimeout(r, 800))
    verified.value = true
    toastStore.success('Email подтверждён')

    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (err) {
    error.value = err.message || 'Не удалось подтвердить email'
  } finally {
    loading.value = false
  }
}

async function resendEmail() {
  if (resendTimer.value > 0) return

  try {
    await new Promise(r => setTimeout(r, 400))
    toastStore.success('Письмо отправлено повторно')

    resendTimer.value = 60
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      resendTimer.value--
      if (resendTimer.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (err) {
    toastStore.error('Не удалось отправить письмо')
  }
}

function changeEmail() {
  router.push({ name: 'register' })
}

function startResendTimer() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

onMounted(() => {
  startResendTimer()
  focusInput(0)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="cv-verify">
    <Transition name="cv-verify" mode="out-in">
      <div v-if="!verified" key="waiting" class="cv-verify__waiting">
        <div class="cv-verify__icon-wrap">
          <div class="cv-verify__icon">
            <span class="cv-verify__icon-inner">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </span>
            <span class="cv-verify__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-verify__header">
          <h1 class="cv-verify__title">Подтвердите email</h1>
          <p class="cv-verify__subtitle">
            Мы отправили письмо со ссылкой на
            <strong class="cv-verify__email">{{ maskedEmail }}</strong>
          </p>
          <p class="cv-verify__deadline">
            Ссылка действует <strong>24 часа</strong>
          </p>
        </header>

        <div v-if="emailProvider" class="cv-verify__provider">
          <a
            :href="emailProvider.url"
            target="_blank"
            rel="noopener noreferrer"
            class="cv-verify__provider-link"
          >
            <span class="cv-verify__provider-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </span>
            <span class="cv-verify__provider-label">{{ emailProvider.label }}</span>
            <span class="cv-verify__provider-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </a>
        </div>

        <div class="cv-verify__divider">
          <span>Или введите код из письма</span>
        </div>

        <div v-if="error" class="cv-verify__alert" role="alert">
          <span class="cv-verify__alert-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
          </span>
          {{ error }}
        </div>

        <div class="cv-verify__cells" @paste="handlePaste">
          <input
            v-for="(digit, index) in code"
            :key="index"
            :ref="el => { if (el) inputRefs[index] = el }"
            :value="digit"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="cv-verify__cell"
            :class="{ 'cv-verify__cell--filled': digit }"
            @input="handleInput($event, index)"
            @keydown="handleKeydown($event, index)"
          />
        </div>

        <BaseButton
          size="lg"
          block
          :loading="loading"
          :disabled="!canVerify"
          @click="handleVerify"
        >
          <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          Подтвердить email
        </BaseButton>

        <div class="cv-verify__tips">
          <p class="cv-verify__tips-title">Не пришло письмо?</p>
          <ul class="cv-verify__tips-list">
            <li class="cv-verify__tip">
              <span class="cv-verify__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Проверьте папку «Спам» или «Промоакции»
            </li>
            <li class="cv-verify__tip">
              <span class="cv-verify__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Подождите 2–3 минуты — письмо может идти с задержкой
            </li>
            <li class="cv-verify__tip">
              <span class="cv-verify__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Проверьте, что email указан верно
            </li>
          </ul>
        </div>

        <div class="cv-verify__footer">
          <button
            type="button"
            class="cv-verify__resend"
            :disabled="resendTimer > 0"
            @click="resendEmail"
          >
            <span class="cv-verify__resend-icon" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </span>
            {{ resendTimer > 0
              ? `Отправить повторно через ${resendTimer} сек`
              : 'Отправить письмо ещё раз' }}
          </button>

          <button
            type="button"
            class="cv-verify__change"
            @click="changeEmail"
          >
            Изменить email
          </button>
        </div>
      </div>

      <div v-else key="success" class="cv-verify__success">
        <div class="cv-verify__icon-wrap">
          <div class="cv-verify__icon cv-verify__icon--success">
            <span class="cv-verify__icon-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            <span class="cv-verify__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-verify__header">
          <h1 class="cv-verify__title">Email подтверждён!</h1>
          <p class="cv-verify__subtitle">
            Спасибо! Теперь вы можете пользоваться всеми функциями CarVibe.
          </p>
        </header>

        <div class="cv-verify__redirect">
          <div class="cv-verify__redirect-bar">
            <span class="cv-verify__redirect-fill"></span>
          </div>
          <span class="cv-verify__redirect-text">
            Перенаправляем на главную через 3 секунды...
          </span>
        </div>

        <BaseButton size="lg" block @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
          </svg>
          На главную сейчас
        </BaseButton>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-verify {
  display: flex;
  flex-direction: column;
}

.cv-verify__waiting,
.cv-verify__success {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cv-verify__icon-wrap {
  display: flex;
  justify-content: center;
}

.cv-verify__icon {
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
  animation: cvVerifyFloat 4s ease-in-out infinite;
}

.cv-verify__icon--success {
  color: #B8CEA8;
  border-color: rgba(122, 154, 106, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(122, 154, 106, 0.08) inset,
    0 1px 0 rgba(184, 206, 168, 0.15) inset,
    0 0 60px rgba(122, 154, 106, 0.2);
}

@keyframes cvVerifyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-verify__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 50%, transparent);
  opacity: 0.3;
}

.cv-verify__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-verify__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 245, 214, 0.18) 50%, transparent 70%);
  animation: cvVerifyShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cvVerifyShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-verify__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.cv-verify__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-verify__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.65);
}

.cv-verify__email {
  color: #E8D5A0;
  font-weight: 800;
  letter-spacing: 0.1px;
}

.cv-verify__deadline {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-verify__deadline strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-verify__provider {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-verify__provider-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 11px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.9);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.18);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-verify__provider-link:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cv-verify__provider-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-verify__provider-label {
  flex: 1;
  min-width: 0;
}

.cv-verify__provider-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-verify__provider-link:hover .cv-verify__provider-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
}

.cv-verify__divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
}

.cv-verify__divider::before,
.cv-verify__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.16), transparent);
}

.cv-verify__divider span {
  padding: 0 14px;
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.45);
  white-space: nowrap;
}

.cv-verify__alert {
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

.cv-verify__alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
  margin-top: 1px;
}

.cv-verify__cells {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.cv-verify__cell {
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  font-family: inherit;
  font-size: 22px;
  font-weight: 800;
  text-align: center;
  color: rgba(245, 240, 230, 0.98);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.22);
  border-radius: 12px;
  outline: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  caret-color: #E8D5A0;
}

.cv-verify__cell:focus {
  border-color: rgba(201, 169, 97, 0.65);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 24px rgba(201, 169, 97, 0.15);
  transform: translateY(-2px);
}

.cv-verify__cell--filled {
  border-color: rgba(232, 213, 160, 0.5);
  color: #F5E6BC;
}

.cv-verify__tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-verify__tips-title {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-verify__tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-verify__tip {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.7);
}

.cv-verify__tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  box-shadow: 0 2px 6px rgba(122, 154, 106, 0.3);
  margin-top: 2px;
}

.cv-verify__footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-verify__resend {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-verify__resend:hover:not(:disabled) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-verify__resend:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cv-verify__resend:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  color: rgba(200, 190, 175, 0.5);
}

.cv-verify__resend-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-verify__change {
  padding: 6px 4px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  text-align: center;
}

.cv-verify__change:hover {
  color: #E8D5A0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-verify__redirect {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 0;
}

.cv-verify__redirect-bar {
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.cv-verify__redirect-fill {
  display: block;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #7A9A6A, #B8CEA8);
  border-radius: 3px;
  animation: cvVerifyProgress 3s linear forwards;
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.5);
}

@keyframes cvVerifyProgress {
  from { width: 0%; }
  to { width: 100%; }
}

.cv-verify__redirect-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-verify-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-verify-leave-active {
  transition: all 0.2s ease;
}

.cv-verify-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-verify-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .cv-verify__title {
    font-size: 19px;
  }

  .cv-verify__icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-verify__icon-inner svg {
    width: 26px;
    height: 26px;
  }

  .cv-verify__cells {
    gap: 6px;
  }

  .cv-verify__cell {
    font-size: 18px;
  }

  .cv-verify__resend {
    font-size: 12px;
    padding: 10px 14px;
  }

  .cv-verify__tip {
    font-size: 12px;
  }
}
</style>