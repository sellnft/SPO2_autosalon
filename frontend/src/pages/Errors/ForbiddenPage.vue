<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const quickLinks = [
  { to: '/announcements', label: 'Каталог', icon: 'search' },
  { to: '/favourites', label: 'Избранное', icon: 'heart' },
  { to: '/feedback', label: 'Поддержка', icon: 'help' }
]

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function goToLogin() {
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
}
</script>

<template>
  <section class="cv-403">
    <div class="cv-403__bg" aria-hidden="true">
      <div class="cv-403__bg-orb cv-403__bg-orb--1"></div>
      <div class="cv-403__bg-orb cv-403__bg-orb--2"></div>
      <div class="cv-403__bg-grid"></div>
      <div class="cv-403__bg-carbon"></div>
    </div>

    <div class="cv-403__content">
      <div class="cv-403__icon-wrap">
        <div class="cv-403__icon">
          <span class="cv-403__icon-inner">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="10" width="16" height="11" rx="2"/>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              <circle cx="12" cy="15.5" r="1.2" fill="currentColor"/>
              <path d="M12 16.5V18"/>
            </svg>
          </span>
          <span class="cv-403__icon-shine" aria-hidden="true"></span>
        </div>
      </div>

      <div class="cv-403__code-wrap">
        <span class="cv-403__code">403</span>
      </div>

      <h1 class="cv-403__title">Доступ запрещён</h1>

      <p class="cv-403__text">
        У вас нет прав для просмотра этой страницы.
        <template v-if="!isAuthenticated">
          Возможно, вы не авторизованы — войдите с подходящим аккаунтом.
        </template>
        <template v-else>
          У вашего аккаунта недостаточно прав. Если это ошибка — напишите в поддержку.
        </template>
      </p>

      <div class="cv-403__actions">
        <BaseButton
          v-if="!isAuthenticated"
          size="lg"
          @click="goToLogin"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
          </svg>
          Войти другим аккаунтом
        </BaseButton>

        <BaseButton
          v-else
          variant="outline"
          size="lg"
          @click="goBack"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Вернуться назад
        </BaseButton>

        <BaseButton size="lg" variant="ghost" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
          </svg>
          На главную
        </BaseButton>
      </div>

      <div class="cv-403__quick">
        <span class="cv-403__quick-label">Куда ещё можно перейти</span>

        <div class="cv-403__quick-list">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="cv-403__quick-item"
          >
            <span class="cv-403__quick-icon" aria-hidden="true">
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
            <span class="cv-403__quick-text">{{ link.label }}</span>
            <span class="cv-403__quick-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </RouterLink>
        </div>
      </div>

      <p class="cv-403__help">
        Считаете, что это ошибка?
        <RouterLink to="/feedback" class="cv-403__help-link">
          Напишите в поддержку
        </RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.cv-403 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 80px;
  min-height: 70vh;
  overflow: hidden;
  isolation: isolate;
}

.cv-403__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-403__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.5;
}

.cv-403__bg-orb--1 {
  top: -20%;
  left: -10%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.32), transparent 70%);
  animation: cv403Orb 22s ease-in-out infinite;
}

.cv-403__bg-orb--2 {
  bottom: -30%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  animation: cv403Orb 26s ease-in-out infinite reverse;
}

@keyframes cv403Orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-403__bg-grid {
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

.cv-403__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
}

.cv-403__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 560px;
  text-align: center;
}

.cv-403__icon-wrap {
  margin-bottom: 8px;
}

.cv-403__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 108px;
  border-radius: 28px;
  color: #E8A88A;
  background:
    linear-gradient(180deg, rgba(40, 20, 14, 0.6) 0%, rgba(20, 12, 8, 0.75) 100%),
    linear-gradient(180deg, #1F1612 0%, #14100C 100%);
  border: 1px solid rgba(184, 119, 85, 0.4);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.08) inset,
    0 1px 0 rgba(232, 168, 138, 0.15) inset,
    0 0 80px rgba(184, 119, 85, 0.22);
  overflow: hidden;
  animation: cv403Float 4s ease-in-out infinite;
}

@keyframes cv403Float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cv403__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 168, 138, 0.3) 50%, transparent);
}

.cv-403__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5));
}

.cv-403__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 210, 190, 0.15) 50%,
    transparent 70%
  );
  animation: cv403Shine 5s ease-in-out infinite;
  animation-delay: 1.5s;
  pointer-events: none;
}

@keyframes cv403Shine {
  0%, 60%, 100% { left: -100%; }
  80% { left: 100%; }
}

.cv-403__code-wrap {
  display: inline-flex;
  align-items: baseline;
  margin-top: 4px;
}

.cv-403__code {
  font-size: 96px;
  font-weight: 800;
  letter-spacing: -4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #E8A88A 0%, #B87755 55%, #6B4225 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 4px 60px rgba(184, 119, 85, 0.35);
}

.cv-403__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-403__text {
  margin: 0;
  max-width: 480px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.65);
}

.cv-403__actions {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.cv-403__quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 32px;
  width: 100%;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-403__quick-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-403__quick-list {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-403__quick-item {
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

.cv-403__quick-item:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-403__quick-item:active {
  transform: translateY(0) scale(0.97);
}

.cv-403__quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-403__quick-text {
  white-space: nowrap;
}

.cv-403__quick-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
  opacity: 0.7;
}

.cv-403__quick-item:hover .cv-403__quick-arrow {
  color: #E8D5A0;
  transform: translateX(2px);
  opacity: 1;
}

.cv-403__help {
  margin: 12px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-403__help-link {
  color: #E8D5A0;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.cv-403__help-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .cv-403 {
    padding: 40px 20px 60px;
    min-height: 60vh;
  }

  .cv-403__icon {
    width: 88px;
    height: 88px;
    border-radius: 24px;
  }

  .cv-403__icon-inner svg {
    width: 30px;
    height: 30px;
  }

  .cv-403__code {
    font-size: 72px;
    letter-spacing: -3px;
  }

  .cv-403__title {
    font-size: 22px;
  }

  .cv-403__text {
    font-size: 13.5px;
  }

  .cv-403__actions {
    flex-direction: column;
    width: 100%;
  }

  .cv-403__actions > * {
    width: 100%;
  }

  .cv-403__quick-list {
    flex-direction: column;
    width: 100%;
  }

  .cv-403__quick-item {
    justify-content: center;
    width: 100%;
  }
}
</style>