<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const router = useRouter()
const userStore = useUserStore()
const toastStore = useToastStore()

const loading = ref(true)
const revoking = ref({})
const showRevokeAllConfirm = ref(false)
const revokingAll = ref(false)

const sessions = computed(() => userStore.sessions || [])

const currentSession = computed(() =>
  sessions.value.find(s => s.current) || null
)

const otherSessions = computed(() =>
  sessions.value.filter(s => !s.current)
)

const sessionsCount = computed(() => sessions.value.length)

function getDeviceType(session) {
  const ua = (session.userAgent || session.device || '').toLowerCase()
  if (ua.includes('iphone') || ua.includes('android') && ua.includes('mobile')) return 'phone'
  if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet'
  if (ua.includes('mac') || ua.includes('windows') || ua.includes('linux')) return 'laptop'
  return 'desktop'
}

function getDeviceIcon(session) {
  const type = getDeviceType(session)
  const map = {
    phone: 'phone',
    tablet: 'tablet',
    laptop: 'laptop',
    desktop: 'desktop'
  }
  return map[type] || 'desktop'
}

function getDeviceLabel(session) {
  const type = getDeviceType(session)
  const map = {
    phone: 'Мобильное устройство',
    tablet: 'Планшет',
    laptop: 'Ноутбук',
    desktop: 'Компьютер'
  }
  return map[type] || 'Устройство'
}

function getBrowserFromUA(ua) {
  if (!ua) return ''
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edge')) return 'Edge'
  return 'Браузер'
}

function getOSFromUA(ua) {
  if (!ua) return ''
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('iOS')) return 'iOS'
  if (ua.includes('Android')) return 'Android'
  return ''
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'неизвестно'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'только что'
  if (minutes < 60) return `${minutes} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days < 7) return `${days} дн. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function getCountryFlag(country) {
  const flags = {
    'Россия': '🇷🇺',
    'Беларусь': '🇧🇾',
    'Казахстан': '🇰🇿',
    'Украина': '🇺🇦',
    'Германия': '🇩🇪',
    'США': '🇺🇸',
    'Франция': '🇫🇷',
    'Великобритания': '🇬🇧'
  }
  return flags[country] || '🌍'
}

function formatLocation(session) {
  const country = session.country || 'Россия'
  const city = session.location || session.city || 'Неизвестно'
  return { country, city, flag: getCountryFlag(country) }
}

async function revokeSession(id) {
  revoking.value = { ...revoking.value, [id]: true }
  try {
    await userStore.revokeSession(id)
    toastStore.success('Сессия завершена')
  } catch (err) {
    toastStore.error('Не удалось завершить сессию')
  } finally {
    revoking.value = { ...revoking.value, [id]: false }
  }
}

async function revokeAllSessions() {
  revokingAll.value = true
  try {
    await Promise.all(otherSessions.value.map(s => userStore.revokeSession(s.id)))
    toastStore.success('Все другие сессии завершены')
    showRevokeAllConfirm.value = false
  } catch (err) {
    toastStore.error('Не удалось завершить все сессии')
  } finally {
    revokingAll.value = false
  }
}

onMounted(async () => {
  try {
    await userStore.fetchSessions()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="cv-sess">
    <div class="cv-sess__container">
      <Breadcrumbs />

      <header class="cv-sess__header">
        <div class="cv-sess__header-left">
          <span class="cv-sess__eyebrow">
            <span class="cv-sess__eyebrow-dot" aria-hidden="true"></span>
            Безопасность
          </span>
          <h1 class="cv-sess__title">Активные сессии</h1>
          <p class="cv-sess__subtitle">
            Устройства, с которых выполнен вход в ваш аккаунт.
            <template v-if="sessionsCount">
              Всего <strong>{{ sessionsCount }}</strong>
              {{ sessionsCount === 1 ? 'устройство' : sessionsCount < 5 ? 'устройства' : 'устройств' }}.
            </template>
          </p>
        </div>

        <BaseButton
          v-if="otherSessions.length"
          variant="outline"
          size="lg"
          class="cv-sess__revoke-all"
          @click="showRevokeAllConfirm = true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12l4-4M4 12l4 4M4 12h12"/>
            <path d="M16 6h4v12h-4"/>
          </svg>
          Завершить все другие
        </BaseButton>
      </header>

      <BaseLoader v-if="loading" text="Загрузка сессий..." />

      <template v-else>
        <div v-if="!sessions.length" class="cv-sess__empty">
          <div class="cv-sess__empty-orb" aria-hidden="true"></div>

          <div class="cv-sess__empty-content">
            <span class="cv-sess__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="14" rx="2"/>
                <path d="M8 22h8M12 18v4"/>
              </svg>
            </span>

            <h3 class="cv-sess__empty-title">Нет активных сессий</h3>
            <p class="cv-sess__empty-text">
              Сейчас нет устройств, с которых выполнен вход в ваш аккаунт.
              Здесь появятся все устройства после входа.
            </p>
          </div>
        </div>

        <template v-else>
          <div v-if="otherSessions.length" class="cv-sess__notice">
            <span class="cv-sess__notice-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <path d="M12 9v4"/>
                <path d="M12 17h.01"/>
              </svg>
            </span>
            <div class="cv-sess__notice-content">
              <p class="cv-sess__notice-title">Не узнаёте какое-то устройство?</p>
              <p class="cv-sess__notice-text">
                Завершите сессию и смените пароль. Возможно, кто-то получил доступ к вашему аккаунту.
              </p>
            </div>
          </div>

          <div class="cv-sess__list">
            <article
              v-for="session in sessions"
              :key="session.id"
              class="cv-session"
              :class="{ 'cv-session--current': session.current }"
            >
              <div class="cv-session__glow" aria-hidden="true"></div>

              <div class="cv-session__device-icon" :data-type="getDeviceIcon(session)">
                <svg v-if="getDeviceIcon(session) === 'phone'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="6" y="2" width="12" height="20" rx="2"/>
                  <path d="M11 18h2"/>
                </svg>
                <svg v-else-if="getDeviceIcon(session) === 'tablet'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="2" width="18" height="20" rx="2"/>
                  <path d="M11 18h2"/>
                </svg>
                <svg v-else-if="getDeviceIcon(session) === 'laptop'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="12" rx="2"/>
                  <path d="M2 20h20"/>
                </svg>
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="4" width="20" height="14" rx="2"/>
                  <path d="M8 22h8M12 18v4"/>
                </svg>
              </div>

              <div class="cv-session__info">
                <div class="cv-session__head">
                  <h3 class="cv-session__device">
                    {{ session.device || getDeviceLabel(session) }}
                  </h3>

                  <span v-if="session.current" class="cv-session__badge cv-session__badge--current">
                    <span class="cv-session__badge-dot" aria-hidden="true"></span>
                    Текущая
                  </span>
                </div>

                <div class="cv-session__meta">
                  <span class="cv-session__meta-item">
                    <span class="cv-session__meta-icon" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3 2"/>
                      </svg>
                    </span>
                    Активна: {{ formatRelativeTime(session.lastActive) }}
                  </span>

                  <span class="cv-session__meta-dot" aria-hidden="true"></span>

                  <span class="cv-session__meta-item">
                    <span class="cv-session__flag" aria-hidden="true">
                      {{ formatLocation(session).flag }}
                    </span>
                    {{ formatLocation(session).city }}
                  </span>

                  <span class="cv-session__meta-dot" aria-hidden="true"></span>

                  <span class="cv-session__meta-item cv-session__meta-item--mono">
                    {{ session.ip }}
                  </span>
                </div>

                <div v-if="session.userAgent" class="cv-session__tech">
                  <span class="cv-session__tech-item">
                    {{ getBrowserFromUA(session.userAgent) }}
                  </span>
                  <span v-if="getOSFromUA(session.userAgent)" class="cv-session__tech-sep">·</span>
                  <span v-if="getOSFromUA(session.userAgent)" class="cv-session__tech-item">
                    {{ getOSFromUA(session.userAgent) }}
                  </span>
                </div>
              </div>

              <div v-if="!session.current" class="cv-session__actions">
                <BaseButton
                  variant="ghost"
                  size="sm"
                  :loading="revoking[session.id]"
                  @click="revokeSession(session.id)"
                >
                  <svg v-if="!revoking[session.id]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 6l12 12M18 6L6 18"/>
                  </svg>
                  Завершить
                </BaseButton>
              </div>
            </article>
          </div>
        </template>
      </template>
    </div>

    <ConfirmModal
      v-model="showRevokeAllConfirm"
      title="Завершить все другие сессии?"
      :message="`Будут завершены сессии на ${otherSessions.length} ${otherSessions.length === 1 ? 'устройстве' : 'устройствах'}. Текущая сессия останется активной.`"
      confirm-text="Завершить все"
      cancel-text="Отмена"
      variant="warning"
      icon="warning"
      :loading="revokingAll"
      @confirm="revokeAllSessions"
    />
  </div>
</template>

<style scoped>
.cv-sess {
  position: relative;
  padding: 20px 0 60px;
}

.cv-sess__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-sess__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cv-sess__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cv-sess__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-sess__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvSessDot 2.2s ease-in-out infinite;
}

@keyframes cvSessDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-sess__title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-sess__subtitle {
  margin: 0;
  max-width: 640px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-sess__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-sess__revoke-all {
  flex-shrink: 0;
}

.cv-sess__notice {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border: 1px solid rgba(217, 119, 6, 0.3);
  border-left: 3px solid rgba(217, 119, 6, 0.75);
}

.cv-sess__notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #F0C080;
  flex-shrink: 0;
  margin-top: 2px;
}

.cv-sess__notice-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-sess__notice-title {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #F0C080;
}

.cv-sess__notice-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(240, 192, 128, 0.85);
}

.cv-sess__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cv-session {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-session::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-session:hover {
  border-color: rgba(201, 169, 97, 0.32);
  transform: translateY(-1px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(201, 169, 97, 0.1);
}

.cv-session--current {
  border-color: rgba(232, 213, 160, 0.42);
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(201, 169, 97, 0.08),
    0 0 40px rgba(201, 169, 97, 0.15);
}

.cv-session__glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.15), transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.cv-session:hover .cv-session__glow {
  opacity: 1;
}

.cv-session--current .cv-session__glow {
  opacity: 1;
}

.cv-session__device-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  border: 1px solid;
}

.cv-session__device-icon[data-type="phone"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-session__device-icon[data-type="tablet"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.3);
}

.cv-session__device-icon[data-type="laptop"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.3);
}

.cv-session__device-icon[data-type="desktop"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.12);
  border-color: rgba(184, 119, 85, 0.32);
}

.cv-session--current .cv-session__device-icon {
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.25);
}

.cv-session__info {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-session__head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-session__device {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-session__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 999px;
  border: 1px solid;
}

.cv-session__badge--current {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-session__badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvSessBadgePulse 2.2s ease-in-out infinite;
}

@keyframes cvSessBadgePulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.cv-session__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-session__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.cv-session__meta-item--mono {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 11.5px;
  letter-spacing: 0.3px;
  color: rgba(220, 210, 195, 0.5);
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.cv-session__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-session__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
}

.cv-session__flag {
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
}

.cv-session__tech {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: rgba(201, 169, 97, 0.6);
}

.cv-session__tech-item {
  white-space: nowrap;
}

.cv-session__tech-sep {
  color: rgba(201, 169, 97, 0.35);
}

.cv-session__actions {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.cv-sess__empty {
  position: relative;
  padding: 72px 32px 64px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  text-align: center;
}

.cv-sess__empty-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.15), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  animation: cvSessEmptyOrb 4s ease-in-out infinite;
}

@keyframes cvSessEmptyOrb {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-sess__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.cv-sess__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 12px;
  border-radius: 24px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.15);
  animation: cvSessEmptyFloat 4s ease-in-out infinite;
}

@keyframes cvSessEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-sess__empty-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-sess__empty-text {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.6);
}

@media (max-width: 1024px) {
  .cv-sess__container { padding: 0 32px; }
  .cv-sess__title { font-size: 30px; letter-spacing: -0.6px; }
}

@media (max-width: 768px) {
  .cv-sess { padding: 12px 0 40px; }
  .cv-sess__container { padding: 0 20px; gap: 18px; }
  .cv-sess__header { gap: 16px; align-items: flex-start; }
  .cv-sess__header-left { width: 100%; }
  .cv-sess__title { font-size: 24px; letter-spacing: -0.4px; }
  .cv-sess__subtitle { font-size: 13.5px; }
  .cv-sess__revoke-all { width: 100%; }

  .cv-session { padding: 16px 16px; gap: 14px; flex-wrap: wrap; }
  .cv-session__device-icon { width: 46px; height: 46px; border-radius: 12px; }
  .cv-session__device { font-size: 14px; }
  .cv-session__meta { font-size: 12px; gap: 8px; }
  .cv-session__meta-item--mono { font-size: 11px; }
  .cv-session__actions { width: 100%; padding-top: 12px; margin-top: 4px; border-top: 1px solid rgba(201, 169, 97, 0.1); }
  .cv-session__actions :deep(.cv-btn) { width: 100%; }

  .cv-sess__notice { padding: 14px 16px; gap: 12px; }
  .cv-sess__notice-title { font-size: 12px; }
  .cv-sess__notice-text { font-size: 12.5px; }

  .cv-sess__empty { padding: 52px 20px 44px; border-radius: 1rem; }
  .cv-sess__empty-icon { width: 72px; height: 72px; border-radius: 20px; }
  .cv-sess__empty-title { font-size: 17px; }
  .cv-sess__empty-text { font-size: 13px; }
}
</style>