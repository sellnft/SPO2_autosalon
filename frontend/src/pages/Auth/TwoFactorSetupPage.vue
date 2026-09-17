<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

const step = ref(1)
const loading = ref(false)
const setupData = ref(null)
const verificationCode = ref(['', '', '', '', '', ''])
const recoveryCodes = ref([])
const codesCopied = ref(false)
const secretCopied = ref(false)
const codesSaved = ref(false)

const inputRefs = ref([])

const fullCode = computed(() => verificationCode.value.join(''))
const canVerify = computed(() => fullCode.value.length === 6 && !verificationCode.value.includes(''))

const benefits = [
  {
    icon: 'shield',
    title: 'Защита от кражи пароля',
    description: 'Даже если кто-то узнает пароль — без 2FA не войдёт'
  },
  {
    icon: 'bell',
    title: 'Уведомления о входе',
    description: 'Мгновенное оповещение при попытке входа'
  },
  {
    icon: 'key',
    title: 'Резервные коды',
    description: '10 кодов на случай потери доступа к телефону'
  }
]

let copyResetTimer = null

function startSetup() {
  loading.value = true
  setTimeout(() => {
    setupData.value = {
      qrCode: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjQiLz48cmVjdCB4PSIxMzAiIHk9IjEwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHJlY3QgeD0iMTAiIHk9IjEzMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iNCIvPjwvc3ZnPg==',
      secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP'
    }
    step.value = 2
    loading.value = false
    setTimeout(() => inputRefs.value[0]?.focus(), 100)
  }, 700)
}

function handleInput(event, index) {
  const value = event.target.value.replace(/\D/g, '')
  const digit = value.slice(-1)

  verificationCode.value[index] = digit

  if (digit && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

function handleKeydown(event, index) {
  if (event.key === 'Backspace') {
    if (!verificationCode.value[index] && index > 0) {
      event.preventDefault()
      verificationCode.value[index - 1] = ''
      inputRefs.value[index - 1]?.focus()
    } else {
      verificationCode.value[index] = ''
    }
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }

  if (event.key === 'ArrowRight' && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }
}

function handlePaste(event) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  if (!pasted) return

  for (let i = 0; i < 6; i++) {
    verificationCode.value[i] = pasted[i] || ''
  }

  inputRefs.value[Math.min(pasted.length, 5)]?.focus()
}

async function verifyCode() {
  if (!canVerify.value) return

  loading.value = true
  setTimeout(() => {
    recoveryCodes.value = [
      'ABCD-EF12', 'GHIJ-KL34', 'MNOP-QR56', 'STUV-WX78', 'YZ12-AB34',
      'CD56-EF78', 'GH90-IJ12', 'KL34-MN56', 'OP78-QR90', 'ST12-UV34'
    ]
    step.value = 3
    loading.value = false
    toastStore.success('2FA включена')
  }, 700)
}

async function copySecret() {
  try {
    await navigator.clipboard.writeText(setupData.value.secret)
    secretCopied.value = true
    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => (secretCopied.value = false), 2000)
  } catch (err) {
    toastStore.error('Не удалось скопировать')
  }
}

async function copyCodes() {
  try {
    await navigator.clipboard.writeText(recoveryCodes.value.join('\n'))
    codesCopied.value = true
    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => (codesCopied.value = false), 2000)
  } catch (err) {
    toastStore.error('Не удалось скопировать')
  }
}

function downloadCodes() {
  const text = `CarVibe — Резервные коды 2FA\nДата: ${new Date().toLocaleDateString('ru-RU')}\n\n${recoveryCodes.value.join('\n')}\n\nСохраните этот файл в надёжном месте.`
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'carvibe-2fa-recovery-codes.txt'
  link.click()
  URL.revokeObjectURL(url)
  toastStore.success('Файл скачан')
}

function finish() {
  if (!codesSaved.value) {
    toastStore.error('Подтвердите, что сохранили коды')
    return
  }
  router.push('/profile/security')
}

onUnmounted(() => {
  if (copyResetTimer) clearTimeout(copyResetTimer)
})
</script>

<template>
  <div class="cv-setup">
    <div class="cv-setup__progress">
      <span
        v-for="n in 3"
        :key="n"
        class="cv-setup__dot"
        :class="{
          'cv-setup__dot--active': n === step,
          'cv-setup__dot--done': n < step
        }"
      ></span>
    </div>

    <Transition name="cv-setup" mode="out-in">
      <div v-if="step === 1" key="step1" class="cv-setup__step">
        <div class="cv-setup__icon-wrap">
          <div class="cv-setup__icon">
            <span class="cv-setup__icon-inner">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </span>
            <span class="cv-setup__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-setup__header">
          <h1 class="cv-setup__title">Двухфакторная аутентификация</h1>
          <p class="cv-setup__subtitle">
            Добавьте дополнительный уровень защиты аккаунта.
            Для входа потребуется код из приложения-аутентификатора.
          </p>
        </header>

        <ul class="cv-setup__benefits">
          <li v-for="benefit in benefits" :key="benefit.title" class="cv-setup__benefit">
            <span class="cv-setup__benefit-icon" aria-hidden="true">
              <svg v-if="benefit.icon === 'shield'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <svg v-else-if="benefit.icon === 'bell'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="15" r="4"/>
                <path d="M10.85 12.15L19 4M18 5l2 2M15 8l2 2"/>
              </svg>
            </span>
            <div class="cv-setup__benefit-content">
              <span class="cv-setup__benefit-title">{{ benefit.title }}</span>
              <span class="cv-setup__benefit-description">{{ benefit.description }}</span>
            </div>
          </li>
        </ul>

        <div class="cv-setup__note">
          <span class="cv-setup__note-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </span>
          Подойдёт любое приложение: Google Authenticator, Authy, 1Password или Microsoft Authenticator
        </div>

        <BaseButton size="lg" block :loading="loading" @click="startSetup">
          Начать настройку
          <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </BaseButton>
      </div>

      <div v-else-if="step === 2" key="step2" class="cv-setup__step">
        <header class="cv-setup__header">
          <h1 class="cv-setup__title">Сканируйте QR-код</h1>
          <p class="cv-setup__subtitle">
            Откройте приложение-аутентификатор и отсканируйте код ниже
          </p>
        </header>

        <div class="cv-setup__qr-wrap">
          <div class="cv-setup__qr">
            <img
              v-if="setupData?.qrCode"
              :src="setupData.qrCode"
              alt="QR-код для 2FA"
            />
            <div class="cv-setup__qr-frame" aria-hidden="true"></div>
          </div>

          <div class="cv-setup__hint">
            <span class="cv-setup__hint-num">1</span>
            <span>Откройте приложение</span>
          </div>
          <div class="cv-setup__hint">
            <span class="cv-setup__hint-num">2</span>
            <span>Нажмите «+» и выберите «Сканировать QR»</span>
          </div>
          <div class="cv-setup__hint">
            <span class="cv-setup__hint-num">3</span>
            <span>Введите код ниже</span>
          </div>
        </div>

        <div class="cv-setup__secret">
          <span class="cv-setup__secret-label">Или введите ключ вручную:</span>
          <div class="cv-setup__secret-row">
            <code class="cv-setup__secret-value">{{ setupData?.secret }}</code>
            <button
              type="button"
              class="cv-setup__copy"
              :class="{ 'cv-setup__copy--done': secretCopied }"
              :aria-label="secretCopied ? 'Скопировано' : 'Скопировать ключ'"
              @click="copySecret"
            >
              <svg v-if="!secretCopied" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="cv-setup__verify">
          <p class="cv-setup__verify-label">Введите 6-значный код из приложения:</p>

          <div class="cv-setup__cells" @paste="handlePaste">
            <input
              v-for="(digit, index) in verificationCode"
              :key="index"
              :ref="el => { if (el) inputRefs[index] = el }"
              :value="digit"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="cv-setup__cell"
              :class="{ 'cv-setup__cell--filled': digit }"
              @input="handleInput($event, index)"
              @keydown="handleKeydown($event, index)"
            />
          </div>
        </div>

        <BaseButton
          size="lg"
          block
          :loading="loading"
          :disabled="!canVerify"
          @click="verifyCode"
        >
          Подтвердить
          <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
        </BaseButton>
      </div>

      <div v-else key="step3" class="cv-setup__step">
        <div class="cv-setup__icon-wrap">
          <div class="cv-setup__icon cv-setup__icon--success">
            <span class="cv-setup__icon-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            <span class="cv-setup__icon-shine" aria-hidden="true"></span>
          </div>
        </div>

        <header class="cv-setup__header">
          <h1 class="cv-setup__title">2FA успешно включена!</h1>
          <p class="cv-setup__subtitle">
            Сохраните резервные коды — они понадобятся, если потеряете доступ к телефону
          </p>
        </header>

        <div class="cv-setup__warning">
          <span class="cv-setup__warning-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </span>
          <span>Каждый код можно использовать <strong>только один раз</strong>. Без них при потере телефона вы не сможете войти.</span>
        </div>

        <div class="cv-setup__codes">
          <div
            v-for="code in recoveryCodes"
            :key="code"
            class="cv-setup__code"
          >
            {{ code }}
          </div>
        </div>

        <div class="cv-setup__actions">
          <button
            type="button"
            class="cv-setup__action"
            :class="{ 'cv-setup__action--done': codesCopied }"
            @click="copyCodes"
          >
            <span class="cv-setup__action-icon" aria-hidden="true">
              <svg v-if="!codesCopied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            {{ codesCopied ? 'Скопировано' : 'Скопировать все' }}
          </button>

          <button
            type="button"
            class="cv-setup__action"
            @click="downloadCodes"
          >
            <span class="cv-setup__action-icon" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
              </svg>
            </span>
            Скачать .txt
          </button>
        </div>

        <BaseCheckbox
          v-model="codesSaved"
          label="Я сохранил резервные коды в надёжном месте"
        />

        <BaseButton
          size="lg"
          block
          :disabled="!codesSaved"
          @click="finish"
        >
          Готово
        </BaseButton>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-setup {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-setup__progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 4px 0 8px;
}

.cv-setup__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(201, 169, 97, 0.2);
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-setup__dot--active {
  width: 32px;
  background: linear-gradient(90deg, #E8D5A0, #C9A961);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.6);
}

.cv-setup__dot--done {
  background: linear-gradient(135deg, #7A9A6A, #B8CEA8);
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.5);
}

.cv-setup__step {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 18px;
}

.cv-setup__icon-wrap {
  display: flex;
  justify-content: center;
}

.cv-setup__icon {
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
  animation: cvSetupFloat 4s ease-in-out infinite;
}

.cv-setup__icon--success {
  color: #B8CEA8;
  border-color: rgba(122, 154, 106, 0.4);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(122, 154, 106, 0.08) inset,
    0 1px 0 rgba(184, 206, 168, 0.15) inset,
    0 0 60px rgba(122, 154, 106, 0.2);
}

@keyframes cvSetupFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-setup__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, currentColor 50%, transparent);
  opacity: 0.3;
}

.cv-setup__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.cv-setup__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 245, 214, 0.18) 50%, transparent 70%);
  animation: cvSetupShine 4s ease-in-out infinite;
  animation-delay: 1.2s;
  pointer-events: none;
}

@keyframes cvSetupShine {
  0%, 70%, 100% { left: -100%; }
  85% { left: 100%; }
}

.cv-setup__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.cv-setup__title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.98);
}

.cv-setup__subtitle {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.65);
}

.cv-setup__benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-setup__benefit {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-setup__benefit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-setup__benefit-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-setup__benefit-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-setup__benefit-description {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

.cv-setup__note {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(201, 169, 97, 0.22);
}

.cv-setup__note-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
  margin-top: 2px;
}

.cv-setup__qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
}

.cv-setup__qr {
  position: relative;
  padding: 12px;
  border-radius: 14px;
  background: #FFFFFF;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 0 32px rgba(201, 169, 97, 0.15);
}

.cv-setup__qr img {
  width: 180px;
  height: 180px;
  display: block;
  border-radius: 8px;
}

.cv-setup__qr-frame {
  position: absolute;
  inset: -4px;
  border-radius: 16px;
  border: 2px solid rgba(201, 169, 97, 0.5);
  pointer-events: none;
}

.cv-setup__hint {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  text-align: left;
}

.cv-setup__hint-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  font-size: 10.5px;
  font-weight: 800;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 2px 8px rgba(201, 169, 97, 0.35);
}

.cv-setup__secret {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-setup__secret-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

.cv-setup__secret-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cv-setup__secret-value {
  flex: 1;
  min-width: 0;
  padding: 10px 12px;
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #E8D5A0;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 9px;
  word-break: break-all;
}

.cv-setup__copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-setup__copy:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-setup__copy--done {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.15);
  border-color: rgba(122, 154, 106, 0.45);
}

.cv-setup__verify {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-setup__verify-label {
  margin: 0;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
  text-align: center;
}

.cv-setup__cells {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.cv-setup__cell {
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

.cv-setup__cell:focus {
  border-color: rgba(201, 169, 97, 0.65);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 24px rgba(201, 169, 97, 0.15);
  transform: translateY(-2px);
}

.cv-setup__cell--filled {
  border-color: rgba(232, 213, 160, 0.5);
  color: #F5E6BC;
}

.cv-setup__warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 11px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border: 1px solid rgba(217, 119, 6, 0.32);
}

.cv-setup__warning-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #F0C080;
  margin-top: 2px;
}

.cv-setup__warning strong {
  font-weight: 800;
}

.cv-setup__codes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(201, 169, 97, 0.16);
}

.cv-setup__code {
  padding: 10px 12px;
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-align: center;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 8px;
}

.cv-setup__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cv-setup__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-setup__action:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-setup__action--done {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-setup__action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-setup-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-setup-leave-active {
  transition: all 0.2s ease;
}

.cv-setup-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-setup-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .cv-setup__title {
    font-size: 19px;
  }

  .cv-setup__icon {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .cv-setup__icon-inner svg {
    width: 26px;
    height: 26px;
  }

  .cv-setup__qr img {
    width: 150px;
    height: 150px;
  }

  .cv-setup__cells {
    gap: 6px;
  }

  .cv-setup__cell {
    font-size: 18px;
  }

  .cv-setup__actions {
    grid-template-columns: 1fr;
  }

  .cv-setup__codes {
    grid-template-columns: 1fr;
  }
}
</style>