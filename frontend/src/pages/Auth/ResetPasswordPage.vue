<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const sent = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const tokenValid = ref(true)

const token = computed(() => route.query.token || route.params.token || '')

const form = reactive({
  password: '',
  passwordConfirmation: ''
})

const errors = reactive({
  password: '',
  passwordConfirmation: ''
})

const passwordChecks = computed(() => [
  { key: 'length', label: '8+ символов', ok: form.password.length >= 8 },
  { key: 'case', label: 'Заглавные и строчные', ok: /[a-z]/.test(form.password) && /[A-ZА-Я]/.test(form.password) },
  { key: 'digit', label: 'Цифры', ok: /\d/.test(form.password) },
  { key: 'special', label: 'Спецсимволы', ok: /[^A-Za-zА-Яа-я0-9]/.test(form.password) }
])

const passwordStrength = computed(() => {
  const passed = passwordChecks.value.filter(c => c.ok).length
  if (!form.password) return { level: 'empty', score: 0, label: '' }
  if (passed <= 1) return { level: 'weak', score: 25, label: 'Слабый' }
  if (passed === 2) return { level: 'medium', score: 50, label: 'Средний' }
  if (passed === 3) return { level: 'good', score: 80, label: 'Хороший' }
  return { level: 'strong', score: 100, label: 'Отличный' }
})

function validate() {
  errors.password = ''
  errors.passwordConfirmation = ''

  if (!form.password) errors.password = 'Пароль обязателен'
  else if (form.password.length < 8) errors.password = 'Минимум 8 символов'
  else if (passwordStrength.value.level === 'weak') errors.password = 'Пароль слишком слабый'

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
    if (!token.value) {
      throw new Error('Ссылка для сброса пароля недействительна')
    }

    await new Promise(r => setTimeout(r, 800))

    sent.value = true
    toastStore.success('Пароль успешно изменён')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}

function goToSupport() {
  router.push('/feedback')
}

onMounted(() => {
  if (!token.value) {
    tokenValid.value = false
    error.value = 'Ссылка для сброса пароля недействительна или истекла'
  }
})
</script>

<template>
  <div class="cv-reset">
    <Transition name="cv-reset-fade" mode="out-in">
      <div v-if="!sent && tokenValid" key="form" class="cv-reset__form">
        <div class="cv-reset__icon-wrap">
          <div class="cv-reset__icon">
            <span class="cv-reset__icon-inner">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </span>
            <span class="cv-reset__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-reset__header">
          <h1 class="cv-reset__title">Новый пароль</h1>
          <p class="cv-reset__subtitle">
            Придумайте надёжный пароль для входа.
            Ссылка действительна 30 минут.
          </p>
        </header>

        <form class="cv-reset__body" @submit.prevent="handleSubmit">
          <div v-if="error" class="cv-reset__alert" role="alert">
            <span class="cv-reset__alert-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v5M12 17h.01"/>
              </svg>
            </span>
            {{ error }}
          </div>

          <div class="cv-reset__field">
            <BaseInput
              v-model="form.password"
              label="Новый пароль"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Минимум 8 символов"
              autocomplete="new-password"
              :error="errors.password"
              required
            >
              <template #suffix>
                <button
                  type="button"
                  class="cv-reset__eye"
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

            <div v-if="form.password" class="cv-reset__strength" :data-level="passwordStrength.level">
              <div class="cv-reset__strength-bar">
                <span
                  class="cv-reset__strength-fill"
                  :style="{ width: `${passwordStrength.score}%` }"
                ></span>
              </div>
              <span class="cv-reset__strength-label">{{ passwordStrength.label }}</span>
            </div>

            <ul v-if="form.password" class="cv-reset__checks">
              <li
                v-for="check in passwordChecks"
                :key="check.key"
                class="cv-reset__check"
                :class="{ 'cv-reset__check--ok': check.ok }"
              >
                <span class="cv-reset__check-icon" aria-hidden="true">
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
                class="cv-reset__eye"
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

          <BaseButton type="submit" block size="lg" :loading="loading">
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            Сохранить пароль
          </BaseButton>
        </form>

        <footer class="cv-reset__footer">
          <RouterLink to="/login" class="cv-reset__back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Вернуться ко входу
          </RouterLink>
        </footer>
      </div>

      <div v-else-if="sent" key="success" class="cv-reset__success">
        <div class="cv-reset__icon-wrap">
          <div class="cv-reset__icon cv-reset__icon--success">
            <span class="cv-reset__icon-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            <span class="cv-reset__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-reset__header">
          <h1 class="cv-reset__title">Пароль изменён!</h1>
          <p class="cv-reset__subtitle">
            Теперь войдите с новым паролем. Старые сессии на других устройствах завершены.
          </p>
        </header>

        <div class="cv-reset__actions">
          <BaseButton size="lg" block @click="goToLogin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <path d="M10 17l5-5-5-5"/>
              <path d="M15 12H3"/>
            </svg>
            Войти с новым паролем
          </BaseButton>

          <RouterLink to="/" class="cv-reset__home">
            Или вернуться на главную
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </RouterLink>
        </div>
      </div>

      <div v-else key="invalid" class="cv-reset__invalid">
        <div class="cv-reset__icon-wrap">
          <div class="cv-reset__icon cv-reset__icon--invalid">
            <span class="cv-reset__icon-inner">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </span>
          </div>
        </div>

        <header class="cv-reset__header">
          <h1 class="cv-reset__title">Ссылка недействительна</h1>
          <p class="cv-reset__subtitle">
            Ссылка для сброса пароля истекла или была использована.
            Запросите новую или обратитесь в поддержку.
          </p>
        </header>

        <div class="cv-reset__actions">
          <BaseButton size="lg" block @click="router.push('/forgot-password')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
              <path d="M21 3v5h-5"/>
            </svg>
            Запросить новую ссылку
          </BaseButton>

          <button
            type="button"
            class="cv-reset__help"
            @click="goToSupport"
          >
            Или напишите в поддержку
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-reset {
  display: flex;
  flex-direction: column;
}

.cv-reset__form,
.cv-reset__success,
.cv-reset__invalid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-reset__icon-wrap {
  display: flex;
  justify-content: center;
}

.cv-reset__icon {
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
  animation: cvResetFloat 4s ease-in-out infinite;
}

.cv-reset__icon--success {
  color: #B8CEA8;
  border-color: rgba(122, 154, 106, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(122, 154, 106, 0.08) inset,
    0 1px 0 rgba(184, 206, 168, 0.15) inset,
    0 0 60px rgba(122, 154, 106, 0.2);
}

.cv-reset__icon--invalid {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.08) inset,
    0 1px 0 rgba(232, 168, 138, 0.15) inset,
    0 0 60px rgba(184, 119, 85, 0.2);
}

@keyframes cvResetFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-reset__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 50%, transparent);
  opacity: 0.3;
}

.cv-reset__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-reset__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 245, 214, 0.18) 50%, transparent 70%);
  animation: cvResetShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cvResetShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-reset__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.cv-reset__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-reset__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.65);
}

.cv-reset__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-reset__alert {
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

.cv-reset__alert-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
  margin-top: 1px;
}

.cv-reset__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-reset__eye {
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

.cv-reset__eye:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
}

.cv-reset__strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-reset__strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.cv-reset__strength-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease, background 0.3s ease;
}

.cv-reset__strength[data-level="weak"] .cv-reset__strength-fill {
  background: linear-gradient(90deg, #6B4225, #B87755);
  box-shadow: 0 0 8px rgba(184, 119, 85, 0.6);
}

.cv-reset__strength[data-level="weak"] .cv-reset__strength-label {
  color: #E8A88A;
}

.cv-reset__strength[data-level="medium"] .cv-reset__strength-fill {
  background: linear-gradient(90deg, #8B4513, #D97706, #F0C080);
  box-shadow: 0 0 8px rgba(217, 119, 6, 0.6);
}

.cv-reset__strength[data-level="medium"] .cv-reset__strength-label {
  color: #F0C080;
}

.cv-reset__strength[data-level="good"] .cv-reset__strength-fill,
.cv-reset__strength[data-level="strong"] .cv-reset__strength-fill {
  background: linear-gradient(90deg, #4A6B3F, #7A9A6A, #B8CEA8);
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.6);
}

.cv-reset__strength[data-level="good"] .cv-reset__strength-label,
.cv-reset__strength[data-level="strong"] .cv-reset__strength-label {
  color: #B8CEA8;
}

.cv-reset__strength-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.cv-reset__checks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
}

.cv-reset__check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  transition: color 0.25s ease;
}

.cv-reset__check-icon {
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

.cv-reset__check--ok {
  color: #B8CEA8;
}

.cv-reset__check--ok .cv-reset__check-icon {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  border-color: rgba(184, 206, 168, 0.5);
  box-shadow: 0 2px 8px rgba(122, 154, 106, 0.35);
}

.cv-reset__footer {
  display: flex;
  justify-content: center;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-reset__back {
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

.cv-reset__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateX(-2px);
}

.cv-reset__actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: stretch;
}

.cv-reset__home,
.cv-reset__help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.7);
  text-decoration: none;
  background: transparent;
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-reset__home:hover,
.cv-reset__help:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-reset__home svg,
.cv-reset__help svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-reset__home:hover svg,
.cv-reset__help:hover svg {
  transform: translateX(3px);
}

.cv-reset-fade-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-reset-fade-leave-active {
  transition: all 0.2s ease;
}

.cv-reset-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-reset-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .cv-reset__title {
    font-size: 19px;
  }

  .cv-reset__icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-reset__icon-inner svg {
    width: 24px;
    height: 24px;
  }
}
</style>