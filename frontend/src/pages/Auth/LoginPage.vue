<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const showDemo = ref(false)
const capsLockOn = ref(false)

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const hasSocial = true

const socials = [
  { id: 'vk', label: 'VK', color: '#0077FF' },
  { id: 'telegram', label: 'Telegram', color: '#229ED9' },
  { id: 'google', label: 'Google', color: '#EA4335' }
]

function validate() {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email обязателен'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email'
  }

  if (!form.password) {
    errors.password = 'Пароль обязателен'
  } else if (form.password.length < 6) {
    errors.password = 'Пароль минимум 6 символов'
  }

  return !errors.email && !errors.password
}

function checkCapsLock(event) {
  if (event.getModifierState) {
    capsLockOn.value = event.getModifierState('CapsLock')
  }
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  error.value = ''

  try {
    const response = await authStore.login({
      email: form.email,
      password: form.password
    })

    if (response?.requires2FA) {
      router.push({
        name: '2fa',
        query: { redirect: route.query.redirect }
      })
    } else {
      router.push(route.query.redirect || '/')
    }
  } catch (err) {
    error.value = err.message || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}

function handleSocialLogin(providerId) {
  // TODO: реальная OAuth-авторизация
  console.log('Login via', providerId)
}

function fillDemo(role) {
  if (role === 'user') {
    form.email = 'alexey@example.com'
    form.password = 'password123'
  } else if (role === 'admin') {
    form.email = 'admin@example.com'
    form.password = 'password123'
  }
}
</script>

<template>
  <div class="cv-login">
    <div class="cv-login__icon-wrap">
      <div class="cv-login__icon">
        <span class="cv-login__icon-inner">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="15" r="4"/>
            <path d="M10.85 12.15L19 4"/>
            <path d="M18 5l2 2M15 8l2 2"/>
          </svg>
        </span>
        <span class="cv-login__icon-shine" aria-hidden="true"></span>
      </div>
    </div>

    <header class="cv-login__header">
      <h1 class="cv-login__title">С возвращением!</h1>
      <p class="cv-login__subtitle">
        Войдите, чтобы продолжить работу с CarVibe
      </p>
    </header>

    <form class="cv-login__body" @submit.prevent="handleSubmit">
      <div v-if="error" class="cv-login__alert" role="alert">
        <span class="cv-login__alert-icon" aria-hidden="true">
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
        clearable
        required
      />

      <div class="cv-login__field">
        <BaseInput
          v-model="form.password"
          label="Пароль"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Введите пароль"
          autocomplete="current-password"
          :error="errors.password"
          required
          @keydown="checkCapsLock"
          @keyup="checkCapsLock"
        >
          <template #suffix>
            <button
              type="button"
              class="cv-login__eye"
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

        <p v-if="capsLockOn" class="cv-login__caps">
          <span class="cv-login__caps-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l7 7h-4v5H9V9H5z"/>
              <path d="M9 17h6v3H9z"/>
            </svg>
          </span>
          Caps Lock включён
        </p>
      </div>

      <div class="cv-login__row">
        <BaseCheckbox v-model="rememberMe" label="Запомнить меня" />

        <RouterLink to="/forgot-password" class="cv-login__link">
          Забыли пароль?
        </RouterLink>
      </div>

      <BaseButton type="submit" block size="lg" :loading="loading">
        <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <path d="M10 17l5-5-5-5"/>
          <path d="M15 12H3"/>
        </svg>
        Войти
      </BaseButton>
    </form>

    <div v-if="hasSocial" class="cv-login__social">
      <div class="cv-login__social-sep">
        <span>или войдите через</span>
      </div>

      <div class="cv-login__social-buttons">
        <button
          v-for="provider in socials"
          :key="provider.id"
          type="button"
          class="cv-login__social-btn"
          :aria-label="`Войти через ${provider.label}`"
          :title="provider.label"
          @click="handleSocialLogin(provider.id)"
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

    <p class="cv-login__footer">
      Нет аккаунта?
      <RouterLink to="/register" class="cv-login__link cv-login__link--accent">
        Зарегистрироваться
      </RouterLink>
    </p>

    <div class="cv-login__demo">
      <button
        type="button"
        class="cv-login__demo-toggle"
        :aria-expanded="showDemo"
        @click="showDemo = !showDemo"
      >
        <span class="cv-login__demo-toggle-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
          </svg>
        </span>
        <span class="cv-login__demo-toggle-text">Demo-доступ для тестирования</span>
        <span
          class="cv-login__demo-toggle-chevron"
          :style="{ transform: showDemo ? 'rotate(180deg)' : 'rotate(0deg)' }"
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      <Transition name="cv-login-demo">
        <div v-if="showDemo" class="cv-login__demo-body">
          <div class="cv-login__demo-buttons">
            <button
              type="button"
              class="cv-login__demo-btn"
              @click="fillDemo('user')"
            >
              <span class="cv-login__demo-btn-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
              </span>
              Пользователь
            </button>

            <button
              type="button"
              class="cv-login__demo-btn"
              @click="fillDemo('admin')"
            >
              <span class="cv-login__demo-btn-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                </svg>
              </span>
              Администратор
            </button>
          </div>

          <p class="cv-login__demo-hint">
            Заполнит форму тестовыми данными для быстрого входа
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.cv-login {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-login__icon-wrap {
  display: flex;
  justify-content: center;
}

.cv-login__icon {
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
  animation: cvLoginFloat 4s ease-in-out infinite;
}

@keyframes cvLoginFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-login__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.3) 50%, transparent);
}

.cv-login__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-login__icon-shine {
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
  animation: cvLoginShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cvLoginShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-login__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.cv-login__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-login__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.65);
}

.cv-login__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-login__alert {
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

.cv-login__alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
  margin-top: 1px;
}

.cv-login__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-login__eye {
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

.cv-login__eye:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
}

.cv-login__caps {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding-left: 4px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #F0C080;
}

.cv-login__caps-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #F0C080;
  flex-shrink: 0;
}

.cv-login__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.cv-login__link {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #E8D5A0;
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;
}

.cv-login__link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-login__link--accent {
  font-weight: 800;
}

.cv-login__social {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-login__social-sep {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
}

.cv-login__social-sep::before,
.cv-login__social-sep::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.2), transparent);
}

.cv-login__social-sep span {
  padding: 0 14px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
  white-space: nowrap;
}

.cv-login__social-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cv-login__social-btn {
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

.cv-login__social-btn:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.cv-login__social-btn:active {
  transform: translateY(0) scale(0.96);
}

.cv-login__footer {
  margin: 0;
  padding-top: 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-login__demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  margin-top: 6px;
  border-top: 1px dashed rgba(201, 169, 97, 0.2);
}

.cv-login__demo-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  align-self: center;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(200, 190, 175, 0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.cv-login__demo-toggle:hover {
  color: #E8D5A0;
}

.cv-login__demo-toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
}

.cv-login__demo-toggle-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.cv-login__demo-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-login__demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cv-login__demo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-login__demo-btn:hover {
  color: #F5E6BC;
  background: rgba(201, 169, 97, 0.16);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-login__demo-btn:active {
  transform: translateY(0) scale(0.97);
}

.cv-login__demo-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-login__demo-hint {
  margin: 0;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  text-align: center;
  color: rgba(200, 190, 175, 0.5);
}

.cv-login-demo-enter-active,
.cv-login-demo-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-login-demo-enter-from,
.cv-login-demo-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}

.cv-login-demo-enter-to,
.cv-login-demo-leave-from {
  opacity: 1;
  max-height: 200px;
}

@media (max-width: 480px) {
  .cv-login__title {
    font-size: 20px;
  }

  .cv-login__icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-login__icon-inner svg {
    width: 26px;
    height: 26px;
  }

  .cv-login__social-buttons {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .cv-login__social-btn {
    height: 44px;
  }

  .cv-login__demo-buttons {
    grid-template-columns: 1fr;
  }
}
</style>