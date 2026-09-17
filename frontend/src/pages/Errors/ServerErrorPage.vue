<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const reloading = ref(false)
const countdown = ref(30)
const copiedId = ref(false)
const requestId = ref('')

const serviceStatus = ref('operational')

const statusInfo = computed(() => {
  const map = {
    operational: {
      label: 'Все системы в норме',
      hint: 'Сбой может быть временным',
      state: 'ok'
    },
    degraded: {
      label: 'Частичный сбой',
      hint: 'Работаем над восстановлением',
      state: 'warn'
    },
    outage: {
      label: 'Сервис недоступен',
      hint: 'Восстанавливаем работу',
      state: 'error'
    }
  }
  return map[serviceStatus.value] || map.operational
})

const popularLinks = [
  { to: '/announcements', label: 'Каталог', icon: 'search' },
  { to: '/favourites', label: 'Избранное', icon: 'heart' },
  { to: '/feedback', label: 'Поддержка', icon: 'help' }
]

let countdownTimer = null

function generateRequestId() {
  const chars = 'abcdef0123456789'
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function reload() {
  reloading.value = true
  setTimeout(() => {
    window.location.reload()
  }, 300)
}

async function copyRequestId() {
  try {
    await navigator.clipboard.writeText(requestId.value)
    copiedId.value = true
    setTimeout(() => (copiedId.value = false), 2000)
  } catch (err) {
    // silent
  }
}

function startCountdown() {
  countdown.value = 30
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      reload()
    }
  }, 1000)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  requestId.value = generateRequestId()
  startCountdown()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<template>
  <section class="cv-500">
    <div class="cv-500__bg" aria-hidden="true">
      <div class="cv-500__bg-orb cv-500__bg-orb--1"></div>
      <div class="cv-500__bg-orb cv-500__bg-orb--2"></div>
      <div class="cv-500__bg-grid"></div>
      <div class="cv-500__bg-carbon"></div>
    </div>

    <div class="cv-500__content">
      <div class="cv-500__icon-wrap">
        <div class="cv-500__icon">
          <span class="cv-500__icon-inner">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </span>
          <span class="cv-500__icon-shine" aria-hidden="true"></span>
        </div>
      </div>

      <div class="cv-500__code-wrap">
        <span class="cv-500__code">500</span>
      </div>

      <h1 class="cv-500__title">Ошибка сервера</h1>

      <p class="cv-500__text">
        Что-то пошло не так на нашей стороне.
        Мы уже работаем над исправлением — попробуйте обновить страницу через несколько секунд.
      </p>

      <div class="cv-500__status" :data-state="statusInfo.state">
        <span class="cv-500__status-dot" aria-hidden="true"></span>
        <div class="cv-500__status-content">
          <span class="cv-500__status-label">{{ statusInfo.label }}</span>
          <span class="cv-500__status-hint">{{ statusInfo.hint }}</span>
        </div>
      </div>

      <div class="cv-500__request">
        <span class="cv-500__request-label">ID запроса</span>

        <button
          type="button"
          class="cv-500__request-value"
          :class="{ 'cv-500__request-value--copied': copiedId }"
          @click="copyRequestId"
        >
          <span class="cv-500__request-id">{{ requestId }}</span>

          <span class="cv-500__request-icon" aria-hidden="true">
            <svg v-if="!copiedId" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
          </span>

          <span class="cv-500__request-hint">
            {{ copiedId ? 'Скопировано' : 'Нажмите, чтобы скопировать' }}
          </span>
        </button>
      </div>

      <div class="cv-500__actions">
        <BaseButton size="lg" :loading="reloading" @click="reload">
          <svg v-if="!reloading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8"/>
            <path d="M21 3v5h-5"/>
          </svg>
          Обновить страницу
        </BaseButton>

        <BaseButton variant="outline" size="lg" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
          </svg>
          На главную
        </BaseButton>
      </div>

      <p class="cv-500__retry">
        Автообновление через
        <strong>{{ countdown }} сек</strong>
      </p>

      <div class="cv-500__quick">
        <span class="cv-500__quick-label">Куда можно перейти</span>

        <div class="cv-500__quick-list">
          <RouterLink
            v-for="link in popularLinks"
            :key="link.to"
            :to="link.to"
            class="cv-500__quick-item"
          >
            <span class="cv-500__quick-icon" aria-hidden="true">
              <svg v-if="link.icon === 'search'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
              <svg v-else-if="link.icon === 'heart'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </span>
            <span class="cv-500__quick-text">{{ link.label }}</span>
            <span class="cv-500__quick-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </RouterLink>
        </div>
      </div>

      <p class="cv-500__help">
        Ошибка повторяется?
        <RouterLink to="/feedback" class="cv-500__help-link">
          Сообщите нам ID запроса
        </RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.cv-500 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 80px;
  min-height: 70vh;
  overflow: hidden;
  isolation: isolate;
}

.cv-500__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-500__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.5;
}

.cv-500__bg-orb--1 {
  top: -20%;
  left: -10%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.3), transparent 70%);
  animation: cv500Orb 22s ease-in-out infinite;
}

.cv-500__bg-orb--2 {
  bottom: -30%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.2), transparent 70%);
  animation: cv500Orb 26s ease-in-out infinite reverse;
}

@keyframes cv500Orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-500__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  opacity: 0.6;
}

.cv-500__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
}

.cv-500__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 620px;
  text-align: center;
}

.cv-500__icon-wrap {
  margin-bottom: 8px;
}

.cv-500__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 108px;
  border-radius: 28px;
  color: #F0C080;
  background:
    linear-gradient(180deg, rgba(40, 30, 15, 0.6) 0%, rgba(20, 15, 8, 0.75) 100%),
    linear-gradient(180deg, #1F1A12 0%, #14100C 100%);
  border: 1px solid rgba(217, 119, 6, 0.4);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(217, 119, 6, 0.08) inset,
    0 1px 0 rgba(240, 192, 128, 0.15) inset,
    0 0 80px rgba(217, 119, 6, 0.22);
  overflow: hidden;
  animation: cv500Float 4s ease-in-out infinite;
}

@keyframes cv500Float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cv-500__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(240, 192, 128, 0.3) 50%, transparent);
}

.cv-500__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5));
}

.cv-500__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(240, 192, 128, 0.15) 50%,
    transparent 70%
  );
  animation: cv500Shine 5s ease-in-out infinite;
  animation-delay: 1.5s;
  pointer-events: none;
}

@keyframes cv500Shine {
  0%, 60%, 100% { left: -100%; }
  80% { left: 100%; }
}

.cv-500__code-wrap {
  display: inline-flex;
  align-items: baseline;
  margin-top: 4px;
}

.cv-500__code {
  font-size: 96px;
  font-weight: 800;
  letter-spacing: -4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #F0C080 0%, #D97706 55%, #8B4513 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 4px 60px rgba(217, 119, 6, 0.3);
}

.cv-500__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-500__text {
  margin: 0;
  max-width: 500px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.65);
}

.cv-500__status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid;
  width: 100%;
  max-width: 420px;
  margin-top: 8px;
}

.cv-500__status[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.1), rgba(122, 154, 106, 0.02));
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-500__status[data-state="warn"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-500__status[data-state="error"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.1), rgba(184, 119, 85, 0.02));
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-500__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
  animation: cv500Dot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cv500Dot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-500__status-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  flex: 1;
}

.cv-500__status-label {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.05px;
}

.cv-500__status-hint {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  opacity: 0.85;
}

.cv-500__request {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 14px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  width: 100%;
  max-width: 420px;
}

.cv-500__request-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
  flex-shrink: 0;
}

.cv-500__request-value {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  flex: 1;
  font-family: inherit;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(201, 169, 97, 0.15);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  text-align: left;
}

.cv-500__request-value:hover {
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.35);
}

.cv-500__request-value--copied {
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.12), rgba(122, 154, 106, 0.03));
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-500__request-id {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #E8D5A0;
  flex: 1;
}

.cv-500__request-value--copied .cv-500__request-id {
  color: #B8CEA8;
}

.cv-500__request-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.cv-500__request-value--copied .cv-500__request-icon {
  color: #B8CEA8;
}

.cv-500__request-hint {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: rgba(200, 190, 175, 0.5);
  white-space: nowrap;
  transition: color 0.25s ease;
}

.cv-500__request-value--copied .cv-500__request-hint {
  color: #B8CEA8;
}

.cv-500__actions {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.cv-500__retry {
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-500__retry strong {
  color: #E8D5A0;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.cv-500__quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 28px;
  width: 100%;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-500__quick-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-500__quick-list {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-500__quick-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-500__quick-item:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-500__quick-item:active {
  transform: translateY(0) scale(0.97);
}

.cv-500__quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-500__quick-text {
  white-space: nowrap;
}

.cv-500__quick-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
  opacity: 0.7;
}

.cv-500__quick-item:hover .cv-500__quick-arrow {
  color: #E8D5A0;
  transform: translateX(2px);
  opacity: 1;
}

.cv-500__help {
  margin: 12px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-500__help-link {
  color: #E8D5A0;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.cv-500__help-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .cv-500 {
    padding: 40px 20px 60px;
    min-height: 60vh;
  }

  .cv-500__icon {
    width: 88px;
    height: 88px;
    border-radius: 24px;
  }

  .cv-500__icon-inner svg {
    width: 30px;
    height: 30px;
  }

  .cv-500__code {
    font-size: 72px;
    letter-spacing: -3px;
  }

  .cv-500__title {
    font-size: 22px;
  }

  .cv-500__text {
    font-size: 13.5px;
  }

  .cv-500__request {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    padding: 12px;
  }

  .cv-500__request-label {
    align-self: flex-start;
  }

  .cv-500__actions {
    flex-direction: column;
    width: 100%;
  }

  .cv-500__actions > * {
    width: 100%;
  }

  .cv-500__quick-list {
    flex-direction: column;
    width: 100%;
  }

  .cv-500__quick-item {
    justify-content: center;
    width: 100%;
  }
}
</style>