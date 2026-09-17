<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()

const loading = ref(false)
const sent = ref(false)
const error = ref('')
const cooldown = ref(0)

let cooldownTimer = null

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const maskedEmail = computed(() => {
  if (!form.email) return ''
  const [local, domain] = form.email.split('@')
  if (!domain) return form.email
  const maskedLocal = local.length > 2
    ? local[0] + '•'.repeat(Math.min(local.length - 1, 4)) + local.slice(-1)
    : local[0] + '•'
  return `${maskedLocal}@${domain}`
})

const emailProvider = computed(() => {
  const domain = (form.email.split('@')[1] || '').toLowerCase()
  if (domain.includes('gmail')) return { id: 'gmail', label: 'Открыть Gmail', url: 'https://mail.google.com' }
  if (domain.includes('yandex') || domain.includes('ya.ru')) return { id: 'yandex', label: 'Открыть Яндекс.Почту', url: 'https://mail.yandex.ru' }
  if (domain.includes('mail.ru') || domain.includes('bk.ru') || domain.includes('inbox.ru')) return { id: 'mail', label: 'Открыть Mail.ru', url: 'https://mail.ru' }
  return null
})

function validate() {
  errors.email = ''

  if (!form.email) errors.email = 'Email обязателен'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный email'

  return !errors.email
}

function startCooldown(seconds = 60) {
  cooldown.value = seconds
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

async function handleSubmit() {
  if (!validate()) return
  if (cooldown.value > 0) return

  loading.value = true
  error.value = ''

  try {
    await new Promise(r => setTimeout(r, 800))
    sent.value = true
    startCooldown(60)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function resend() {
  if (cooldown.value > 0 || loading.value) return
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    startCooldown(60)
  } finally {
    loading.value = false
  }
}

function goToSupport() {
  window.location.href = '/feedback'
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<template>
  <div class="cv-forgot">
    <Transition name="cv-forgot-fade" mode="out-in">
      <div v-if="!sent" key="form" class="cv-forgot__form">
        <div class="cv-forgot__icon-wrap">
          <div class="cv-forgot__icon">
            <span class="cv-forgot__icon-inner">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </span>
            <span class="cv-forgot__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-forgot__header">
          <h1 class="cv-forgot__title">Восстановление пароля</h1>
          <p class="cv-forgot__subtitle">
            Введите email, и мы отправим ссылку для сброса пароля
          </p>
        </header>

        <form class="cv-forgot__body" @submit.prevent="handleSubmit">
          <div v-if="error" class="cv-forgot__alert">
            <span class="cv-forgot__alert-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v5M12 17h.01"/>
              </svg>
            </span>
            {{ error }}
          </div>

          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="example@email.com"
            autocomplete="email"
            :error="errors.email"
            required
          />

          <BaseButton type="submit" block size="lg" :loading="loading">
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
            Отправить ссылку
          </BaseButton>
        </form>

        <footer class="cv-forgot__footer">
          <RouterLink to="/login" class="cv-forgot__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Вернуться ко входу
          </RouterLink>

          <button
            type="button"
            class="cv-forgot__help"
            @click="goToSupport"
          >
            Не помните email? Обратитесь в поддержку
          </button>
        </footer>
      </div>

      <div v-else key="success" class="cv-forgot__success">
        <div class="cv-forgot__icon-wrap">
          <div class="cv-forgot__icon cv-forgot__icon--success">
            <span class="cv-forgot__icon-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            <span class="cv-forgot__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-forgot__header">
          <h1 class="cv-forgot__title">Письмо отправлено!</h1>
          <p class="cv-forgot__subtitle">
            Отправили ссылку для восстановления на
            <strong class="cv-forgot__email">{{ maskedEmail }}</strong>
          </p>
        </header>

        <div v-if="emailProvider" class="cv-forgot__providers">
          <a
            :href="emailProvider.url"
            target="_blank"
            rel="noopener noreferrer"
            class="cv-forgot__provider"
          >
            <span class="cv-forgot__provider-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </span>
            <span class="cv-forgot__provider-label">{{ emailProvider.label }}</span>
            <span class="cv-forgot__provider-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </a>
        </div>

        <div class="cv-forgot__tips">
          <p class="cv-forgot__tips-title">Не пришло письмо?</p>
          <ul class="cv-forgot__tips-list">
            <li class="cv-forgot__tip">
              <span class="cv-forgot__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Проверьте папку «Спам» или «Промоакции»
            </li>
            <li class="cv-forgot__tip">
              <span class="cv-forgot__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Подождите 2–3 минуты — письмо может идти с задержкой
            </li>
            <li class="cv-forgot__tip">
              <span class="cv-forgot__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Ссылка действительна 30 минут
            </li>
          </ul>
        </div>

        <button
          type="button"
          class="cv-forgot__resend"
          :disabled="cooldown > 0 || loading"
          @click="resend"
        >
          <template v-if="cooldown > 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            Отправить ещё раз через {{ cooldown }} сек
          </template>
          <template v-else>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            Отправить ещё раз
          </template>
        </button>

        <footer class="cv-forgot__footer">
          <RouterLink to="/login" class="cv-forgot__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Вернуться ко входу
          </RouterLink>
        </footer>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-forgot {
  display: flex;
  flex-direction: column;
}

.cv-forgot__form,
.cv-forgot__success {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-forgot__icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.cv-forgot__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
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
  animation: cvForgotFloat 4s ease-in-out infinite;
}

.cv-forgot__icon--success {
  color: #B8CEA8;
  border-color: rgba(122, 154, 106, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(122, 154, 106, 0.08) inset,
    0 1px 0 rgba(184, 206, 168, 0.15) inset,
    0 0 60px rgba(122, 154, 106, 0.2);
}

@keyframes cvForgotFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-forgot__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 50%, transparent);
  opacity: 0.3;
}

.cv-forgot__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-forgot__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.18) 50%,
    transparent 70%
  );
  animation: cvForgotShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cvForgotShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-forgot__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.cv-forgot__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-forgot__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.65);
}

.cv-forgot__email {
  color: #E8D5A0;
  font-weight: 800;
  letter-spacing: 0.1px;
}

.cv-forgot__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cv-forgot__alert {
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

.cv-forgot__alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
  margin-top: 1px;
}

.cv-forgot__footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-forgot__back {
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

.cv-forgot__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateX(-2px);
}

.cv-forgot__help {
  padding: 4px 4px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
  text-align: center;
}

.cv-forgot__help:hover {
  color: #E8D5A0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-forgot__providers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-forgot__provider {
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

.cv-forgot__provider:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.cv-forgot__provider-icon {
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

.cv-forgot__provider-label {
  flex: 1;
  min-width: 0;
}

.cv-forgot__provider-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-forgot__provider:hover .cv-forgot__provider-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
}

.cv-forgot__tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-forgot__tips-title {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-forgot__tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-forgot__tip {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.7);
}

.cv-forgot__tip-icon {
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

.cv-forgot__resend {
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

.cv-forgot__resend:hover:not(:disabled) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-forgot__resend:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cv-forgot__resend:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  color: rgba(200, 190, 175, 0.5);
}

.cv-forgot__resend svg {
  flex-shrink: 0;
}

.cv-forgot-fade-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-forgot-fade-leave-active {
  transition: all 0.2s ease;
}

.cv-forgot-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-forgot-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .cv-forgot__title {
    font-size: 19px;
  }

  .cv-forgot__icon {
    width: 68px;
    height: 68px;
    border-radius: 18px;
  }

  .cv-forgot__icon-inner svg {
    width: 24px;
    height: 24px;
  }

  .cv-forgot__resend {
    font-size: 12px;
    padding: 10px 14px;
  }

  .cv-forgot__tip {
    font-size: 12px;
  }
}
</style>