<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { formatDate } from '@/utils/formatDate'

defineOptions({ name: 'SessionsPage' })

const router = useRouter()
const toastStore = useToastStore()

const loading = ref(true)
const sessions = ref([])
const showEndModal = ref(false)
const pendingSession = ref(null)

const currentSession = computed(() => sessions.value.find(s => s.current))
const otherSessions = computed(() => sessions.value.filter(s => !s.current))

function parseDevice(ua) {
  if (!ua) return { type: 'unknown', label: 'Неизвестное устройство' }
  const s = ua.toLowerCase()
  if (s.includes('iphone')) return { type: 'phone', label: 'iPhone' }
  if (s.includes('ipad')) return { type: 'tablet', label: 'iPad' }
  if (s.includes('android') && s.includes('mobile')) return { type: 'phone', label: 'Android-смартфон' }
  if (s.includes('android')) return { type: 'tablet', label: 'Android-планшет' }
  if (s.includes('mac')) return { type: 'desktop', label: 'Mac' }
  if (s.includes('windows')) return { type: 'desktop', label: 'Windows' }
  if (s.includes('linux')) return { type: 'desktop', label: 'Linux' }
  return { type: 'desktop', label: 'Компьютер' }
}

const demo = [
  {
    id: 1,
    current: true,
    deviceUa: navigator.userAgent,
    ip: '192.168.1.1',
    location: 'Москва, Россия',
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 2,
    current: false,
    deviceUa: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    ip: '10.0.0.15',
    location: 'Санкт-Петербург, Россия',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 3,
    current: false,
    deviceUa: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: '85.140.22.7',
    location: 'Казань, Россия',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  }
]

async function loadSessions() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 350))
    sessions.value = demo
  } finally {
    loading.value = false
  }
}

function askEnd(session) {
  pendingSession.value = session
  showEndModal.value = true
}

async function confirmEnd() {
  const s = pendingSession.value
  if (!s) return
  try {
    await new Promise(r => setTimeout(r, 300))
    sessions.value = sessions.value.filter(x => x.id !== s.id)
    toastStore.success('Сессия завершена')
  } catch (err) {
    toastStore.error('Не удалось завершить сессию')
  } finally {
    showEndModal.value = false
    pendingSession.value = null
  }
}

async function endAllOthers() {
  try {
    await new Promise(r => setTimeout(r, 300))
    sessions.value = sessions.value.filter(s => s.current)
    toastStore.success('Все остальные сессии завершены')
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

onMounted(loadSessions)
</script>

<template>
  <div class="cv-ss">
    <button class="cv-ss__back" type="button" @click="router.push('/profile/security')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      К безопасности
    </button>

    <header class="cv-ss__header">
      <div class="cv-ss__header-left">
        <span class="cv-ss__eyebrow">
          <span class="cv-ss__eyebrow-dot" aria-hidden="true"></span>
          Безопасность · Сессии
        </span>
        <h1 class="cv-ss__title">Активные сессии</h1>
        <p class="cv-ss__subtitle">
          Устройства, с которых выполнен вход в ваш аккаунт
        </p>
      </div>

      <BaseButton
        v-if="otherSessions.length"
        variant="danger"
        @click="endAllOthers"
      >
        Завершить все другие
      </BaseButton>
    </header>

    <div v-if="loading" class="cv-ss__list">
      <div v-for="i in 3" :key="i" class="cv-ss__skeleton"></div>
    </div>

    <template v-else>
      <!-- CURRENT -->
      <section v-if="currentSession" class="cv-ss__current">
        <span class="cv-ss__current-badge">
          <span class="cv-ss__current-dot" aria-hidden="true"></span>
          Текущая сессия
        </span>
        <div class="cv-ss__session cv-ss__session--current">
          <span class="cv-ss__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M8 21h8M12 17v4"/>
            </svg>
          </span>
          <div class="cv-ss__body">
            <p class="cv-ss__device">{{ parseDevice(currentSession.deviceUa).label }}</p>
            <p class="cv-ss__meta">
              <span>{{ currentSession.location }}</span>
              <span class="cv-ss__sep" aria-hidden="true">·</span>
              <span>{{ currentSession.ip }}</span>
            </p>
            <p class="cv-ss__meta cv-ss__meta--dim">
              Вход: {{ formatDate(currentSession.createdAt, 'datetime') }}
            </p>
          </div>
          <span class="cv-ss__status">
            <span class="cv-ss__status-dot" aria-hidden="true"></span>
            активна
          </span>
        </div>
      </section>

      <!-- OTHERS -->
      <section v-if="otherSessions.length" class="cv-ss__section">
        <header class="cv-ss__section-head">
          <h2 class="cv-ss__section-title">
            Другие устройства
            <span class="cv-ss__count">{{ otherSessions.length }}</span>
          </h2>
        </header>

        <ul class="cv-ss__list">
          <li
            v-for="s in otherSessions"
            :key="s.id"
            class="cv-ss__session"
          >
            <span class="cv-ss__icon" aria-hidden="true">
              <svg v-if="parseDevice(s.deviceUa).type === 'phone'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="2" width="12" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
              <svg v-else-if="parseDevice(s.deviceUa).type === 'tablet'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2"/>
                <path d="M12 18h.01"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </span>

            <div class="cv-ss__body">
              <p class="cv-ss__device">{{ parseDevice(s.deviceUa).label }}</p>
              <p class="cv-ss__meta">
                <span>{{ s.location }}</span>
                <span class="cv-ss__sep" aria-hidden="true">·</span>
                <span>{{ s.ip }}</span>
              </p>
              <p class="cv-ss__meta cv-ss__meta--dim">
                Активность: {{ formatDate(s.lastActiveAt, 'relative') }}
              </p>
            </div>

            <button
              type="button"
              class="cv-ss__end"
              @click="askEnd(s)"
            >
              Завершить
            </button>
          </li>
        </ul>
      </section>

      <div v-else class="cv-ss__empty">
        <p class="cv-ss__empty-title">Других активных сессий нет</p>
        <p class="cv-ss__empty-hint">Ваш аккаунт используется только с этого устройства</p>
      </div>
    </template>

    <ConfirmModal
      v-model="showEndModal"
      title="Завершить сессию?"
      :message="`Устройство ${pendingSession ? parseDevice(pendingSession.deviceUa).label : ''} будет отключено от аккаунта.`"
      confirm-text="Завершить"
      variant="danger"
      @confirm="confirmEnd"
    />
  </div>
</template>

<style scoped>
.cv-ss {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-ss__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 8px 14px 8px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-ss__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateX(-2px);
}

.cv-ss__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-ss__header-left { display: flex; flex-direction: column; gap: 6px; }

.cv-ss__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-ss__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvSsDot 2.2s ease-in-out infinite;
}

@keyframes cvSsDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-ss__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: rgba(245, 240, 230, 0.98);
}

.cv-ss__subtitle {
  margin: 0;
  font-size: 13.5px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-ss__current {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-ss__current-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 12px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border: 1px solid rgba(122, 154, 106, 0.32);
  border-radius: 999px;
}

.cv-ss__current-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #B8CEA8;
  box-shadow: 0 0 8px rgba(184, 206, 168, 0.9);
  animation: cvSsLive 1.8s ease-in-out infinite;
}

@keyframes cvSsLive {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.cv-ss__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-ss__session {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  transition: all 0.25s ease;
}

.cv-ss__session--current {
  border-color: rgba(122, 154, 106, 0.32);
  box-shadow:
    0 0 0 1px rgba(122, 154, 106, 0.08) inset,
    0 0 24px rgba(122, 154, 106, 0.08);
}

.cv-ss__session:not(.cv-ss__session--current):hover {
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-ss__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-ss__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-ss__device {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.95);
}

.cv-ss__meta {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.6);
  flex-wrap: wrap;
}

.cv-ss__meta--dim { color: rgba(200, 190, 175, 0.4); }

.cv-ss__sep { color: rgba(200, 190, 175, 0.3); }

.cv-ss__status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border: 1px solid rgba(122, 154, 106, 0.32);
  border-radius: 999px;
}

.cv-ss__status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #B8CEA8;
  box-shadow: 0 0 6px rgba(184, 206, 168, 0.9);
}

.cv-ss__end {
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border: 1px solid rgba(184, 119, 85, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  flex-shrink: 0;
}

.cv-ss__end:hover {
  color: #1A1208;
  background: linear-gradient(135deg, #F0C080, #B87755);
  border-color: rgba(232, 168, 138, 0.6);
}

.cv-ss__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-ss__section-head { display: flex; align-items: center; }

.cv-ss__section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 17px;
  font-weight: 750;
  color: rgba(245, 240, 230, 0.95);
}

.cv-ss__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 9px;
  font-size: 11.5px;
  font-weight: 800;
  border-radius: 999px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-ss__empty {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 40px 20px;
  text-align: center;
  border-radius: 16px;
  border: 1px dashed rgba(201, 169, 97, 0.16);
}

.cv-ss__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
}

.cv-ss__empty-hint {
  margin: 0;
  font-size: 12.5px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-ss__skeleton {
  height: 80px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}

.cv-ss__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.08) 50%, transparent);
  animation: cvSsShimmer 1.8s ease-in-out infinite;
}

@keyframes cvSsShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (max-width: 768px) {
  .cv-ss { padding: 24px 20px 60px; }
  .cv-ss__title { font-size: 24px; }
  .cv-ss__session { flex-wrap: wrap; }
  .cv-ss__end { width: 100%; }
}
</style>