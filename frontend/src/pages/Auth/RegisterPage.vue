<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

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

const passwordChecks = computed(() => [
  { key: 'length', label: '8+ символов', ok: form.password.length >= 8 },
  { key: 'letter', label: 'Буквы', ok: /[a-zA-Zа-яА-Я]/.test(form.password) },
  { key: 'digit', label: 'Цифры', ok: /\d/.test(form.password) }
])

const passwordStrength = computed(() => {
  const passed = passwordChecks.value.filter(c => c.ok).length
  if (!form.password) return { level: 'empty', score: 0, label: '' }
  if (passed === 0) return { level: 'weak', score: 20, label: 'Очень слабый' }
  if (passed === 1) return { level: 'weak', score: 40, label: 'Слабый' }
  if (passed === 2) return { level: 'medium', score: 70, label: 'Средний' }
  return { level: 'strong', score: 100, label: 'Сильный' }
})

const socials = [
  { id: 'vk', label: 'VK' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'google', label: 'Google' }
]

const phoneDisplay = computed({
  get: () => form.phone,
  set: (value) => {
    form.phone = formatPhone(value)
  }
})

function formatPhone(value) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  if (digits[0] === '8') return '+7' + digits.slice(1)
  if (digits[0] === '7') return '+' + digits
  if (digits[0] === '9') return '+7' + digits
  return '+' + digits
}

function validate() {
  Object.keys(errors).forEach(key => (errors[key] = ''))

  if (!form.name) errors.name = 'Имя обязательно'
  else if (form.name.trim().length < 2) errors.name = 'Минимум 2 символа'

  if (!form.email) errors.email = 'Email обязателен'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный email'

  if (!form.phone) errors.phone = 'Телефон обязателен'
  else if (!/^\+?[\d\s\-()]{10,}$/.test(form.phone)) errors.phone = 'Некорректный телефон'

  if (!form.password) errors.password = 'Пароль обязателен'
  else if (form.password.length < 8) errors.password = 'Минимум 8 символов'
  else if (passwordStrength.value.level === 'weak') errors.password = 'Пароль слишком слабый'

  if (form.password !== form.passwordConfirmation) {
    errors.passwordConfirmation = 'Пароли не совпадают'
  }

  if (!form.agreeToTerms) errors.agreeToTerms = 'Необходимо согласиться'

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

function handleSocialRegister(providerId) {
  console.log('Register via', providerId)
}
</script>

<template>
  <div class="cv-reg">
    <div class="cv-reg__icon-wrap">
      <div class="cv-reg__icon">
        <span class="cv-reg__icon-inner">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
            <path d="M19 3v6M22 6h-6"/>
          </svg>
        </span>
        <span class="cv-reg__icon-shine" aria-hidden="true"></span>
      </div>
    </div>

    <header class="cv-reg__header">
      <h1 class="cv-reg__title">Создайте аккаунт</h1>
      <p class="cv-reg__subtitle">
        Займёт 30 секунд — только email и пароль
      </p>
    </header>

    <div class="cv-reg__social">
      <div class="cv-reg__social-sep">
        <span>Быстрая регистрация через</span>
      </div>

      <div class="cv-reg__social-buttons">
        <button
          v-for="provider in socials"
          :key="provider.id"
          type="button"
          class="cv-reg__social-btn"
          :aria-label="`Регистрация через ${provider.label}`"
          :title="provider.label"
          @click="handleSocialRegister(provider.id)"
        >
          <svg v-if="provider.id === 'vk'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.16 17.5h1.68s.5-.05.76-.33c.24-.26.23-.74.23-.74s-.03-2.27 1.02-2.6c1.04-.34 2.37 2.2 3.78 3.17.71.5 1.25.39 1.25.39l2.53-.04s1.32-.08.7-1.12c-.05-.09-.37-.78-1.92-2.2-1.62-1.5-1.4-1.26.55-3.86 1.18-1.58 1.65-2.55 1.5-2.96-.14-.4-1.02-.29-1.02-.29l-2.85.02s-.21-.03-.37.06c-.16.09-.26.3-.26.3s-.45 1.2-1.05 2.22c-1.27 2.15-1.78 2.27-1.99 2.13-.48-.31-.36-1.25-.36-1.92 0-2.09.32-2.96-.62-3.19-.31-.07-.54-.12-1.34-.13-1.03-.01-1.9 0-2.39.24-.33.16-.58.51-.43.53.19.02.62.12.85.43.3.4.29 1.3.29 1.3s.17 2.46-.4 2.77c-.39.21-.93-.22-2.08-2.19-.79-1.37-1.39-2.88-1.39-2.88s-.11-.28-.32-.43c-.24-.18-.58-.24-.58-.24L2.9 8.94s-.42.01-.57.19c-.14.16-.01.49-.01.49s2.12 4.96 4.53 7.46c2.2 2.29 4.7 2.14 4.7 2.14z"/>
          </svg>
          <svg v-else-if="provider.id === 'telegram'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="cv-reg__divider">
      <span>Или заполните вручную</span>
    </div>

    <form class="cv-reg__body" @submit.prevent="handleSubmit">
      <div v-if="error" class="cv-reg__alert" role="alert">
        <span class="cv-reg__alert-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 17h.01"/>
          </svg>
        </span>
        {{ error }}
      </div>

      <BaseInput
        v-model="form.name"
        label="Имя и фамилия"
        placeholder="Иван Петров"
        autocomplete="name"
        :error="errors.name"
        clearable
        required
      />

      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="example@email.com"
        autocomplete="email"
        :error="errors.email"
        clearable
        required
      />

      <BaseInput
        v-model="phoneDisplay"
        label="Телефон"
        type="tel"
        placeholder="+7 (900) 123-45-67"
        autocomplete="tel"
        :error="errors.phone"
        clearable
        required
      />

      <div class="cv-reg__field">
        <BaseInput
          v-model="form.password"
          label="Пароль"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Минимум 8 символов"
          autocomplete="new-password"
          :error="errors.password"
          required
        >
          <template #suffix>
            <button
              type="button"
              class="cv-reg__eye"
              :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a17.5 17.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a17.5 17.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                <path d="M1 1l22 22"/>
              </svg>
            </button>
          </template>
        </BaseInput>

        <div v-if="form.password" class="cv-reg__strength" :data-level="passwordStrength.level">
          <div class="cv-reg__strength-bar">
            <span
              class="cv-reg__strength-fill"
              :style="{ width: `${passwordStrength.score}%` }"
            ></span>
          </div>
          <span class="cv-reg__strength-label">{{ passwordStrength.label }}</span>
        </div>

        <ul v-if="form.password" class="cv-reg__checks">
          <li
            v-for="check in passwordChecks"
            :key="check.key"
            class="cv-reg__check"
            :class="{ 'cv-reg__check--ok': check.ok }"
          >
            <span class="cv-reg__check-icon" aria-hidden="true">
              <svg v-if="check.ok" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
              <svg v-else width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </span>
            {{ check.label }}
          </li>
        </ul>
      </div>

      <BaseInput
        v-model="form.passwordConfirmation"
        label="Подтверждение пароля"
        :type="showPasswordConfirm ? 'text' : 'password'"
        placeholder="Повторите пароль"
        autocomplete="new-password"
        :error="errors.passwordConfirmation"
        required
      >
        <template #suffix>
          <button
            type="button"
            class="cv-reg__eye"
            :aria-label="showPasswordConfirm ? 'Скрыть пароль' : 'Показать пароль'"
            @click="showPasswordConfirm = !showPasswordConfirm"
          >
            <svg v-if="showPasswordConfirm" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a17.5 17.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a17.5 17.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
              <path d="M1 1l22 22"/>
            </svg>
          </button>
        </template>
      </BaseInput>

      <BaseCheckbox
        v-model="form.agreeToTerms"
        :error="errors.agreeToTerms"
      >
        <template #label>
          <span class="cv-reg__terms">
            Я согласен с
            <RouterLink to="/terms" class="cv-reg__terms-link">условиями</RouterLink>
            и
            <RouterLink to="/privacy" class="cv-reg__terms-link">политикой конфиденциальности</RouterLink>
          </span>
        </template>
      </BaseCheckbox>

      <BaseButton type="submit" block size="lg" :loading="loading">
        <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M20 8v6M23 11h-6"/>
        </svg>
        Создать аккаунт
      </BaseButton>
    </form>

    <p class="cv-reg__footer">
      Уже есть аккаунт?
      <RouterLink to="/login" class="cv-reg__link">
        Войти
      </RouterLink>
    </p>
  </div>
</template>

<style scoped>
.cv-reg {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-reg__icon-wrap {
  display: flex;
  justify-content: center;
}

.cv-reg__icon {
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
  animation: cvRegFloat 4s ease-in-out infinite;
}

@keyframes cvRegFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-reg__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.3) 50%, transparent);
}

.cv-reg__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-reg__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 245, 214, 0.18) 50%, transparent 70%);
  animation: cvRegShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cvRegShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-reg__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.cv-reg__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-reg__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.65);
}

.cv-reg__social {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-reg__social-sep {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.cv-reg__social-sep::before,
.cv-reg__social-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.2), transparent);
}

.cv-reg__social-sep span {
  padding: 0 14px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
  white-space: nowrap;
}

.cv-reg__social-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cv-reg__social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-reg__social-btn:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.cv-reg__social-btn:active {
  transform: translateY(0) scale(0.96);
}

.cv-reg__divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0;
}

.cv-reg__divider::before,
.cv-reg__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.16), transparent);
}

.cv-reg__divider span {
  padding: 0 14px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.45);
  white-space: nowrap;
}

.cv-reg__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-reg__alert {
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

.cv-reg__alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
  margin-top: 1px;
}

.cv-reg__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-reg__eye {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: rgba(220, 210, 195, 0.5);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-reg__eye:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
}

.cv-reg__strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-reg__strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.cv-reg__strength-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease, background 0.3s ease;
}

.cv-reg__strength[data-level="weak"] .cv-reg__strength-fill {
  background: linear-gradient(90deg, #6B4225, #B87755);
  box-shadow: 0 0 8px rgba(184, 119, 85, 0.6);
}

.cv-reg__strength[data-level="weak"] .cv-reg__strength-label {
  color: #E8A88A;
}

.cv-reg__strength[data-level="medium"] .cv-reg__strength-fill {
  background: linear-gradient(90deg, #8B4513, #D97706, #F0C080);
  box-shadow: 0 0 8px rgba(217, 119, 6, 0.6);
}

.cv-reg__strength[data-level="medium"] .cv-reg__strength-label {
  color: #F0C080;
}

.cv-reg__strength[data-level="strong"] .cv-reg__strength-fill {
  background: linear-gradient(90deg, #4A6B3F, #7A9A6A, #B8CEA8);
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.6);
}

.cv-reg__strength[data-level="strong"] .cv-reg__strength-label {
  color: #B8CEA8;
}

.cv-reg__strength-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.cv-reg__checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
}

.cv-reg__check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  transition: color 0.25s ease;
}

.cv-reg__check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  color: rgba(200, 190, 175, 0.4);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.25s ease;
}

.cv-reg__check--ok {
  color: #B8CEA8;
}

.cv-reg__check--ok .cv-reg__check-icon {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  border-color: rgba(184, 206, 168, 0.5);
  box-shadow: 0 2px 8px rgba(122, 154, 106, 0.35);
}

.cv-reg__terms {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.7);
}

.cv-reg__terms-link {
  color: #E8D5A0;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.cv-reg__terms-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-reg__footer {
  margin: 0;
  padding-top: 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-reg__link {
  color: #E8D5A0;
  font-weight: 800;
  text-decoration: none;
  transition: color 0.2s ease;
}

.cv-reg__link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 480px) {
  .cv-reg__title {
    font-size: 20px;
  }

  .cv-reg__icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-reg__icon-inner svg {
    width: 26px;
    height: 26px;
  }

  .cv-reg__social-buttons {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .cv-reg__social-btn {
    height: 44px;
  }
}
</style>