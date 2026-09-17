<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const twoFAEnabled = ref(false)
const showDisableModal = ref(false)
const changingPassword = ref(false)
const successMessage = ref('')
const showNewPassword = ref(false)
const showCurrentPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordLastChangedAt = ref(null)
const sessionsCount = ref(3)
const activityLog = ref([
  { type: 'login', icon: 'check', title: 'Вход с iPhone', time: 'Сегодня, 14:32', city: 'Москва', state: 'ok' },
  { type: 'password', icon: 'key', title: 'Смена пароля', time: '3 дня назад', city: 'Москва', state: 'ok' },
  { type: 'login', icon: 'warning', title: 'Попытка входа', time: '12 дней назад', city: 'Киев', state: 'warn' }
])

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: ''
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: ''
})

const passwordChecks = computed(() => [
  { key: 'length', label: '8+ символов', ok: passwordForm.newPassword.length >= 8 },
  { key: 'upper', label: 'Заглавная буква', ok: /[A-ZА-Я]/.test(passwordForm.newPassword) },
  { key: 'lower', label: 'Строчная буква', ok: /[a-zа-я]/.test(passwordForm.newPassword) },
  { key: 'digit', label: 'Цифра', ok: /\d/.test(passwordForm.newPassword) },
  { key: 'special', label: 'Спецсимвол', ok: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(passwordForm.newPassword) }
])

const passwordStrength = computed(() => {
  const checks = passwordChecks.value.filter(c => c.ok).length
  if (!passwordForm.newPassword) return { score: 0, level: 'empty', label: 'Пароль не введён' }
  if (checks <= 2) return { score: 33, level: 'weak', label: 'Слабый пароль' }
  if (checks <= 3) return { score: 66, level: 'medium', label: 'Средний пароль' }
  if (checks === 4) return { score: 85, level: 'strong', label: 'Сильный пароль' }
  return { score: 100, level: 'excellent', label: 'Отличный пароль' }
})

const securityScore = computed(() => {
  let score = 0
  if (authStore.user?.emailVerified) score += 25
  if (authStore.user?.phone) score += 25
  if (twoFAEnabled.value) score += 30
  if (passwordLastChangedAt.value) {
    const days = (Date.now() - new Date(passwordLastChangedAt.value).getTime()) / 86400000
    if (days < 90) score += 20
    else if (days < 180) score += 10
  }
  return Math.min(100, score)
})

const securityState = computed(() => {
  const s = securityScore.value
  if (s >= 80) return 'ok'
  if (s >= 50) return 'accent'
  return 'warn'
})

const securityLabel = computed(() => {
  const s = securityScore.value
  if (s >= 80) return 'Отличный уровень защиты'
  if (s >= 50) return 'Хороший уровень защиты'
  return 'Рекомендуем усилить защиту'
})

const securityRecommendations = computed(() => {
  const recs = []
  if (!twoFAEnabled.value) recs.push('включить двухфакторную аутентификацию')
  if (!authStore.user?.phone) recs.push('привязать телефон')
  if (!passwordLastChangedAt.value) recs.push('сменить пароль')
  return recs
})

const passwordLastChangedText = computed(() => {
  if (!passwordLastChangedAt.value) return 'Пароль не менялся'
  const days = Math.floor((Date.now() - new Date(passwordLastChangedAt.value).getTime()) / 86400000)
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  if (days < 30) return `${days} дней назад`
  if (days < 365) return `${Math.floor(days / 30)} мес. назад`
  return `Более года назад`
})

function generatePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const special = '!@#$%^&*'
  const all = upper + lower + digits + special

  let password = ''
  password += upper[Math.floor(Math.random() * upper.length)]
  password += lower[Math.floor(Math.random() * lower.length)]
  password += digits[Math.floor(Math.random() * digits.length)]
  password += special[Math.floor(Math.random() * special.length)]

  for (let i = 4; i < 14; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  const arr = password.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  passwordForm.newPassword = arr.join('')
  passwordForm.passwordConfirmation = arr.join('')
  toastStore.success('Пароль сгенерирован')
}

function validatePasswordForm() {
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.passwordConfirmation = ''

  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Введите текущий пароль'
  }

  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'Введите новый пароль'
  } else if (passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = 'Минимум 8 символов'
  } else if (passwordStrength.value.level === 'weak') {
    passwordErrors.newPassword = 'Пароль слишком слабый'
  } else if (passwordForm.newPassword === passwordForm.currentPassword) {
    passwordErrors.newPassword = 'Новый пароль должен отличаться'
  }

  if (passwordForm.newPassword !== passwordForm.passwordConfirmation) {
    passwordErrors.passwordConfirmation = 'Пароли не совпадают'
  }

  return !Object.values(passwordErrors).some(Boolean)
}

async function handleChangePassword() {
  if (!validatePasswordForm()) return

  changingPassword.value = true
  successMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    successMessage.value = 'Пароль успешно изменён'
    passwordLastChangedAt.value = new Date().toISOString()
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.passwordConfirmation = ''
    showNewPassword.value = false
    showConfirmPassword.value = false

    toastStore.success('Пароль обновлён')

    setTimeout(() => (successMessage.value = ''), 4000)
  } catch (err) {
    toastStore.error(err.message || 'Не удалось изменить пароль')
  } finally {
    changingPassword.value = false
  }
}

function handleToggle2FA(value) {
  if (value) {
    router.push('/2fa/setup')
  } else {
    showDisableModal.value = true
  }
}

async function handleDisable2FA() {
  try {
    twoFAEnabled.value = false
    showDisableModal.value = false
    toastStore.success('Двухфакторная аутентификация отключена')
  } catch (err) {
    toastStore.error('Не удалось отключить 2FA')
  }
}

onMounted(() => {
  passwordLastChangedAt.value = authStore.user?.passwordChangedAt || null
})
</script>

<template>
  <div class="cv-sec">
    <div class="cv-sec__container">
      <Breadcrumbs />

      <header class="cv-sec__header">
        <div class="cv-sec__header-left">
          <span class="cv-sec__eyebrow">
            <span class="cv-sec__eyebrow-dot" aria-hidden="true"></span>
            Профиль · Безопасность
          </span>
          <h1 class="cv-sec__title">Безопасность</h1>
          <p class="cv-sec__subtitle">
            Защита аккаунта, пароль и контроль устройств с доступом
          </p>
        </div>
      </header>

      <section class="cv-sec__score" :data-state="securityState">
        <div class="cv-sec__score-orb" aria-hidden="true"></div>

        <div class="cv-sec__score-header">
          <span class="cv-sec__score-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </span>

          <div class="cv-sec__score-content">
            <span class="cv-sec__score-label">Уровень безопасности</span>
            <span class="cv-sec__score-title">
              <strong>{{ securityScore }}</strong>/100
              <span class="cv-sec__score-sep">·</span>
              {{ securityLabel }}
            </span>
          </div>
        </div>

        <div class="cv-sec__score-bar">
          <span
            class="cv-sec__score-fill"
            :style="{ width: `${securityScore}%` }"
          ></span>
        </div>

        <p v-if="securityRecommendations.length" class="cv-sec__score-recommendations">
          <span class="cv-sec__score-recommendations-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
          </span>
          Рекомендуем: {{ securityRecommendations.join(', ') }}
        </p>
      </section>

      <section class="cv-sec__card">
        <div class="cv-sec__card-glow" aria-hidden="true"></div>

        <header class="cv-sec__card-header">
          <div class="cv-sec__card-heading">
            <span class="cv-sec__card-icon" data-icon="shield" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
            </span>

            <div class="cv-sec__card-titles">
              <div class="cv-sec__card-title-row">
                <h2 class="cv-sec__card-title">Двухфакторная аутентификация</h2>
                <span
                  class="cv-sec__card-status"
                  :data-active="twoFAEnabled"
                >
                  {{ twoFAEnabled ? 'Включена' : 'Отключена' }}
                </span>
              </div>
              <p class="cv-sec__card-subtitle">
                Дополнительная защита аккаунта через приложение-аутентификатор или SMS
              </p>
            </div>
          </div>

          <BaseButton
            :variant="twoFAEnabled ? 'outline' : 'primary'"
            size="sm"
            @click="handleToggle2FA(!twoFAEnabled)"
          >
            {{ twoFAEnabled ? 'Отключить' : 'Настроить 2FA' }}
          </BaseButton>
        </header>

        <div class="cv-sec__card-body">
          <ul class="cv-sec__benefits">
            <li class="cv-sec__benefit">
              <span class="cv-sec__benefit-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Защита от кражи пароля
            </li>
            <li class="cv-sec__benefit">
              <span class="cv-sec__benefit-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Уведомления о входе
            </li>
            <li class="cv-sec__benefit">
              <span class="cv-sec__benefit-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              Резервные коды восстановления
            </li>
          </ul>
        </div>
      </section>

      <section class="cv-sec__card">
        <header class="cv-sec__card-header">
          <div class="cv-sec__card-heading">
            <span class="cv-sec__card-icon" data-icon="key" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="15" r="4"/>
                <path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>
              </svg>
            </span>

            <div class="cv-sec__card-titles">
              <div class="cv-sec__card-title-row">
                <h2 class="cv-sec__card-title">Пароль</h2>
                <span class="cv-sec__card-status" data-muted>
                  {{ passwordLastChangedText }}
                </span>
              </div>
              <p class="cv-sec__card-subtitle">
                Используйте надёжный пароль — минимум 8 символов с буквами, цифрами и спецсимволами
              </p>
            </div>
          </div>
        </header>

        <form class="cv-sec__form" @submit.prevent="handleChangePassword">
          <div v-if="successMessage" class="cv-sec__success">
            <span class="cv-sec__success-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            {{ successMessage }}
          </div>

          <div class="cv-sec__field">
            <BaseInput
              v-model="passwordForm.currentPassword"
              label="Текущий пароль"
              :type="showCurrentPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :error="passwordErrors.currentPassword"
              required
            >
              <template #suffix>
                <button
                  type="button"
                  class="cv-sec__eye"
                  :aria-label="showCurrentPassword ? 'Скрыть пароль' : 'Показать пароль'"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <svg v-if="showCurrentPassword" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
          </div>

          <div class="cv-sec__field">
            <div class="cv-sec__field-header">
              <label class="cv-sec__field-label">Новый пароль</label>
              <button
                type="button"
                class="cv-sec__generate"
                @click="generatePassword"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
                  <path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>
                </svg>
                Сгенерировать
              </button>
            </div>

            <BaseInput
              v-model="passwordForm.newPassword"
              type="text"
              :class="{ 'cv-sec__hidden-input': !showNewPassword }"
              autocomplete="new-password"
              :error="passwordErrors.newPassword"
              required
            >
              <template #suffix>
                <button
                  type="button"
                  class="cv-sec__eye"
                  :aria-label="showNewPassword ? 'Скрыть пароль' : 'Показать пароль'"
                  @click="showNewPassword = !showNewPassword"
                >
                  <svg v-if="showNewPassword" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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

            <div v-if="passwordForm.newPassword" class="cv-sec__strength" :data-level="passwordStrength.level">
              <div class="cv-sec__strength-bar">
                <span
                  class="cv-sec__strength-fill"
                  :style="{ width: `${passwordStrength.score}%` }"
                ></span>
              </div>
              <span class="cv-sec__strength-label">{{ passwordStrength.label }}</span>
            </div>

            <ul v-if="passwordForm.newPassword" class="cv-sec__checks">
              <li
                v-for="check in passwordChecks"
                :key="check.key"
                class="cv-sec__check"
                :class="{ 'cv-sec__check--ok': check.ok }"
              >
                <span class="cv-sec__check-icon" aria-hidden="true">
                  <svg v-if="check.ok" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 8.5l5 5L20 2.5"/>
                  </svg>
                  <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                  </svg>
                </span>
                {{ check.label }}
              </li>
            </ul>
          </div>

          <BaseInput
            v-model="passwordForm.passwordConfirmation"
            label="Подтверждение пароля"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            :error="passwordErrors.passwordConfirmation"
            required
          >
            <template #suffix>
              <button
                type="button"
                class="cv-sec__eye"
                :aria-label="showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg v-if="showConfirmPassword" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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

          <div class="cv-sec__form-actions">
            <BaseButton
              type="submit"
              :loading="changingPassword"
              :disabled="!passwordForm.newPassword || passwordStrength.level === 'weak'"
              size="lg"
            >
              <svg v-if="!changingPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              Сменить пароль
            </BaseButton>
          </div>
        </form>
      </section>

      <section class="cv-sec__card cv-sec__card--compact">
        <header class="cv-sec__card-header">
          <div class="cv-sec__card-heading">
            <span class="cv-sec__card-icon" data-icon="sessions" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="14" rx="2"/>
                <path d="M8 22h8M12 18v4"/>
              </svg>
            </span>

            <div class="cv-sec__card-titles">
              <div class="cv-sec__card-title-row">
                <h2 class="cv-sec__card-title">Активные сессии</h2>
                <span class="cv-sec__card-status" data-active>
                  {{ sessionsCount }} активных
                </span>
              </div>
              <p class="cv-sec__card-subtitle">
                Устройства, с которых выполнен вход в ваш аккаунт
              </p>
            </div>
          </div>

          <BaseButton variant="outline" size="sm" @click="router.push('/profile/sessions')">
            Управлять
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </BaseButton>
        </header>
      </section>

      <section class="cv-sec__card">
        <header class="cv-sec__card-header">
          <div class="cv-sec__card-heading">
            <span class="cv-sec__card-icon" data-icon="activity" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M7 15l4-4 3 3 6-6"/>
              </svg>
            </span>

            <div class="cv-sec__card-titles">
              <div class="cv-sec__card-title-row">
                <h2 class="cv-sec__card-title">Недавняя активность</h2>
              </div>
              <p class="cv-sec__card-subtitle">
                Последние события, связанные с безопасностью аккаунта
              </p>
            </div>
          </div>
        </header>

        <ul class="cv-sec__activity">
          <li
            v-for="(item, index) in activityLog"
            :key="index"
            class="cv-sec__activity-item"
            :data-state="item.state"
          >
            <span class="cv-sec__activity-icon" aria-hidden="true">
              <svg v-if="item.icon === 'check'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
              <svg v-else-if="item.icon === 'key'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="15" r="4"/>
                <path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </span>

            <div class="cv-sec__activity-content">
              <span class="cv-sec__activity-title">{{ item.title }}</span>
              <span class="cv-sec__activity-meta">
                {{ item.time }}
                <span class="cv-sec__activity-dot" aria-hidden="true"></span>
                {{ item.city }}
              </span>
            </div>
          </li>
        </ul>
      </section>

      <section class="cv-sec__danger">
        <div class="cv-sec__danger-content">
          <span class="cv-sec__danger-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </span>
          <span class="cv-sec__danger-text">
            Полное удаление аккаунта и всех данных
          </span>
        </div>

        <button
          type="button"
          class="cv-sec__danger-link"
          @click="router.push('/profile/edit')"
        >
          Перейти к удалению
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </button>
      </section>
    </div>

    <ConfirmModal
      v-model="showDisableModal"
      title="Отключить двухфакторную аутентификацию?"
      message="Это существенно снизит безопасность аккаунта. Если вы не уверены — оставьте 2FA включённой."
      confirm-text="Отключить"
      cancel-text="Оставить"
      variant="danger"
      icon="warning"
      @confirm="handleDisable2FA"
    />
  </div>
</template>

<style scoped>
.cv-sec {
  position: relative;
  padding: 20px 0 60px;
}

.cv-sec__container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-sec__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-sec__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-sec__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvSecDot 2.2s ease-in-out infinite;
}

@keyframes cvSecDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-sec__title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-sec__subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-sec__score {
  position: relative;
  padding: 24px 26px;
  border-radius: 1.25rem;
  border: 1px solid;
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-sec__score[data-state="ok"] {
  color: #B8CEA8;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-sec__score[data-state="accent"] {
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-sec__score[data-state="warn"] {
  color: #F0C080;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-sec__score::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 50%, transparent);
  opacity: 0.4;
}

.cv-sec__score-orb {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, currentColor, transparent 70%);
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
  z-index: 0;
}

.cv-sec__score-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.cv-sec__score-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  color: currentColor;
  background: color-mix(in srgb, currentColor 15%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
}

.cv-sec__score-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-sec__score-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.7;
}

.cv-sec__score-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-sec__score-title strong {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.cv-sec__score-sep {
  opacity: 0.5;
  margin: 0 4px;
}

.cv-sec__score-bar {
  position: relative;
  z-index: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.cv-sec__score-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: currentColor;
  transition: width 0.6s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 12px currentColor;
}

.cv-sec__score-recommendations {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  opacity: 0.9;
}

.cv-sec__score-recommendations-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cv-sec__card {
  position: relative;
  padding: 24px 26px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-sec__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
  z-index: 2;
}

.cv-sec__card-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 260px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-sec__card-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-sec__card-heading {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.cv-sec__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-sec__card-icon[data-icon="shield"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-sec__card-icon[data-icon="key"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-sec__card-icon[data-icon="sessions"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-sec__card-icon[data-icon="activity"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-sec__card-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-sec__card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-sec__card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.15px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}

.cv-sec__card-status {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 999px;
  border: 1px solid;
}

.cv-sec__card-status[data-active="true"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-sec__card-status[data-active="false"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.4);
}

.cv-sec__card-status[data-muted] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  text-transform: none;
  letter-spacing: 0.1px;
  font-size: 10.5px;
  font-weight: 700;
}

.cv-sec__card-subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

.cv-sec__card-body {
  position: relative;
  z-index: 1;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
}

.cv-sec__benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-sec__benefit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
}

.cv-sec__benefit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 6px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 2px 8px rgba(201, 169, 97, 0.35);
}

.cv-sec__form {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  margin-top: 20px;
}

.cv-sec__success {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.12), rgba(122, 154, 106, 0.03));
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-sec__success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #B8CEA8;
}

.cv-sec__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-sec__field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cv-sec__field-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-sec__generate {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-sec__generate:hover {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-sec__generate:active {
  transform: translateY(0) scale(0.96);
}

.cv-sec__eye {
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

.cv-sec__eye:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
}

.cv-sec__strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cv-sec__strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.cv-sec__strength-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease, background 0.3s ease;
}

.cv-sec__strength[data-level="weak"] .cv-sec__strength-fill {
  background: linear-gradient(90deg, #6B4225, #B87755);
  box-shadow: 0 0 8px rgba(184, 119, 85, 0.6);
}

.cv-sec__strength[data-level="weak"] .cv-sec__strength-label {
  color: #E8A88A;
}

.cv-sec__strength[data-level="medium"] .cv-sec__strength-fill {
  background: linear-gradient(90deg, #8B4513, #D97706, #F0C080);
  box-shadow: 0 0 8px rgba(217, 119, 6, 0.6);
}

.cv-sec__strength[data-level="medium"] .cv-sec__strength-label {
  color: #F0C080;
}

.cv-sec__strength[data-level="strong"] .cv-sec__strength-fill,
.cv-sec__strength[data-level="excellent"] .cv-sec__strength-fill {
  background: linear-gradient(90deg, #4A6B3F, #7A9A6A, #B8CEA8);
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.6);
}

.cv-sec__strength[data-level="strong"] .cv-sec__strength-label,
.cv-sec__strength[data-level="excellent"] .cv-sec__strength-label {
  color: #B8CEA8;
}

.cv-sec__strength-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.cv-sec__checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}

.cv-sec__check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  transition: color 0.25s ease;
}

.cv-sec__check-icon {
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

.cv-sec__check--ok {
  color: #B8CEA8;
}

.cv-sec__check--ok .cv-sec__check-icon {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  border-color: rgba(184, 206, 168, 0.5);
  box-shadow: 0 2px 8px rgba(122, 154, 106, 0.35);
}

.cv-sec__form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  padding-top: 8px;
}

.cv-sec__card--compact .cv-sec__card-header {
  align-items: center;
}

.cv-sec__activity {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.cv-sec__activity-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.22s ease;
}

.cv-sec__activity-item:hover {
  background: rgba(201, 169, 97, 0.05);
  border-color: rgba(201, 169, 97, 0.2);
}

.cv-sec__activity-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 9px;
  border: 1px solid;
}

.cv-sec__activity-item[data-state="ok"] .cv-sec__activity-icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.3);
}

.cv-sec__activity-item[data-state="warn"] .cv-sec__activity-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-sec__activity-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-sec__activity-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.05px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.92);
}

.cv-sec__activity-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-sec__activity-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
}

.cv-sec__danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.08), rgba(184, 119, 85, 0.02));
  border: 1px solid rgba(184, 119, 85, 0.22);
  border-left: 3px solid rgba(184, 119, 85, 0.6);
}

.cv-sec__danger-content {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.cv-sec__danger-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #E8A88A;
}

.cv-sec__danger-text {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(232, 168, 138, 0.9);
}

.cv-sec__danger-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8A88A;
  background: transparent;
  border: 1px solid rgba(184, 119, 85, 0.4);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-sec__danger-link:hover {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.5);
  border-color: rgba(232, 168, 138, 0.6);
  transform: translateY(-1px);
}

.cv-sec__danger-link svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-sec__danger-link:hover svg {
  transform: translateX(2px);
}

@media (max-width: 1024px) {
  .cv-sec__container { padding: 0 32px; }
  .cv-sec__title { font-size: 30px; letter-spacing: -0.6px; }
  .cv-sec__benefits { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cv-sec { padding: 12px 0 40px; }
  .cv-sec__container { padding: 0 20px; gap: 16px; }
  .cv-sec__title { font-size: 24px; letter-spacing: -0.4px; }
  .cv-sec__subtitle { font-size: 13.5px; }

  .cv-sec__score { padding: 18px 18px; border-radius: 1rem; gap: 12px; }
  .cv-sec__score-icon { width: 44px; height: 44px; border-radius: 12px; }
  .cv-sec__score-title { font-size: 14.5px; }
  .cv-sec__score-title strong { font-size: 18px; }
  .cv-sec__score-recommendations { font-size: 12px; }

  .cv-sec__card { padding: 18px 18px; border-radius: 1rem; }
  .cv-sec__card-header { flex-direction: column; align-items: stretch; gap: 14px; }
  .cv-sec__card-heading { gap: 12px; }
  .cv-sec__card-icon { width: 40px; height: 40px; border-radius: 11px; }
  .cv-sec__card-title { font-size: 14.5px; }
  .cv-sec__card-subtitle { font-size: 12px; }

  .cv-sec__card-header > :deep(.cv-btn) { width: 100%; }

  .cv-sec__form { max-width: 100%; }
  .cv-sec__form-actions > * { width: 100%; }

  .cv-sec__activity-item { padding: 10px 12px; gap: 12px; }
  .cv-sec__activity-title { font-size: 12.5px; }
  .cv-sec__activity-meta { font-size: 11px; }

  .cv-sec__danger { flex-direction: column; align-items: stretch; padding: 14px 16px; gap: 12px; }
  .cv-sec__danger-link { width: 100%; justify-content: center; }
}
</style>