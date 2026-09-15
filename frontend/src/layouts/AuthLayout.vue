<script setup>
import { computed } from 'vue'
import AppLogo from '@/components/layout/AppLogo.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const currentYear = new Date().getFullYear()

const trustBadges = [
  { icon: 'shield', text: 'SSL-защита' },
  { icon: 'lock', text: '152-ФЗ' },
  { icon: 'check', text: 'Проверенные продавцы' }
]

const features = [
  'Более 50 000 проверенных объявлений',
  'Умный поиск и подбор автомобилей',
  'Прямая связь с продавцами без посредников'
]
</script>

<template>
  <div class="cv-auth">
    <div class="cv-auth__bg" aria-hidden="true">
      <div class="cv-auth__bg-orb cv-auth__bg-orb--1"></div>
      <div class="cv-auth__bg-orb cv-auth__bg-orb--2"></div>
      <div class="cv-auth__bg-orb cv-auth__bg-orb--3"></div>
      <div class="cv-auth__bg-grid"></div>
      <div class="cv-auth__bg-carbon"></div>
    </div>

    <div class="cv-auth__container">
      <div class="cv-auth__side">
        <RouterLink to="/" class="cv-auth__side-logo">
          <AppLogo size="lg" />
        </RouterLink>

        <div class="cv-auth__side-content">
          <span class="cv-auth__side-eyebrow">
            <span class="cv-auth__side-dot" aria-hidden="true"></span>
            Добро пожаловать
          </span>

          <h1 class="cv-auth__side-title">
            Покупайте и продавайте автомобили
            <span class="cv-auth__side-title-accent">уверенно</span>
          </h1>

          <p class="cv-auth__side-text">
            CarVibe — премиальная платформа для тех, кто ценит качество,
            честность и удобство.
          </p>

          <ul class="cv-auth__side-features">
            <li v-for="feature in features" :key="feature" class="cv-auth__side-feature">
              <span class="cv-auth__side-feature-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              <span class="cv-auth__side-feature-text">{{ feature }}</span>
            </li>
          </ul>

          <div class="cv-auth__side-badges">
            <span v-for="badge in trustBadges" :key="badge.text" class="cv-auth__side-badge">
              <span class="cv-auth__side-badge-icon" aria-hidden="true">
                <svg v-if="badge.icon === 'shield'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <svg v-else-if="badge.icon === 'lock'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="10" width="16" height="11" rx="2"/>
                  <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                </svg>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              {{ badge.text }}
            </span>
          </div>
        </div>

        <div class="cv-auth__side-quote">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 17h3l2-4V7H5v6h3zm9 0h3l2-4V7h-6v6h3z"/>
          </svg>
          <p class="cv-auth__side-quote-text">
            Продал свой BMW X5 за 3 дня. Удобно, быстро, без лишних звонков.
          </p>
          <span class="cv-auth__side-quote-author">
            — Максим, Москва
          </span>
        </div>
      </div>

      <div class="cv-auth__card">
        <div class="cv-auth__card-glow" aria-hidden="true"></div>
        <div class="cv-auth__card-carbon" aria-hidden="true"></div>

        <div class="cv-auth__card-inner">
          <router-view v-slot="{ Component }">
            <Transition name="cv-auth-page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </router-view>
        </div>

        <span class="cv-auth__card-accent" aria-hidden="true"></span>
      </div>

      <footer class="cv-auth__footer">
        <RouterLink to="/" class="cv-auth__back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          На главную
        </RouterLink>

        <p class="cv-auth__copyright">
          © {{ currentYear }} CarVibe
          <span class="cv-auth__copyright-dot" aria-hidden="true">•</span>
          <RouterLink to="/terms" class="cv-auth__copyright-link">Условия</RouterLink>
          <span class="cv-auth__copyright-dot" aria-hidden="true">•</span>
          <RouterLink to="/privacy" class="cv-auth__copyright-link">Конфиденциальность</RouterLink>
        </p>
      </footer>
    </div>

    <ToastContainer />
  </div>
</template>

<style scoped>
.cv-auth {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #0A0A0C;
  color: rgba(245, 240, 230, 0.9);
  isolation: isolate;
  overflow: hidden;
}

.cv-auth__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.cv-auth__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.55;
}

.cv-auth__bg-orb--1 {
  top: -15%;
  right: -5%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.3), transparent 70%);
  animation: cvAuthOrbFloat 18s ease-in-out infinite;
}

.cv-auth__bg-orb--2 {
  bottom: -20%;
  left: -10%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
  animation: cvAuthOrbFloat 22s ease-in-out infinite reverse;
}

.cv-auth__bg-orb--3 {
  top: 40%;
  left: 45%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.14), transparent 70%);
  animation: cvAuthOrbFloat 26s ease-in-out infinite;
  animation-delay: -6s;
}

@keyframes cvAuthOrbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(1.06); }
  66% { transform: translate(30px, -20px) scale(0.94); }
}

.cv-auth__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 80%);
  opacity: 0.6;
}

.cv-auth__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 90%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 90%);
}

.cv-auth__container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1080px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}

.cv-auth__side {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 8px 0;
  min-width: 0;
}

.cv-auth__side-logo {
  display: inline-flex;
  text-decoration: none;
  align-self: flex-start;
  transition: transform 0.25s ease, filter 0.25s ease;
  filter: drop-shadow(0 0 0 rgba(201, 169, 97, 0));
}

.cv-auth__side-logo:hover {
  transform: translateY(-1px);
  filter: drop-shadow(0 4px 20px rgba(201, 169, 97, 0.35));
}

.cv-auth__side-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cv-auth__side-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(232, 213, 160, 0.9);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.15), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.32);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cv-auth__side-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAuthDotPulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvAuthDotPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-auth__side-title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.95);
}

.cv-auth__side-title-accent {
  display: block;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 40px rgba(201, 169, 97, 0.25);
}

.cv-auth__side-text {
  margin: 0;
  max-width: 440px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.65);
}

.cv-auth__side-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
}

.cv-auth__side-feature {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.8);
}

.cv-auth__side-feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 7px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow: 0 4px 12px rgba(201, 169, 97, 0.35);
}

.cv-auth__side-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.cv-auth__side-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cv-auth__side-badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.85);
  flex-shrink: 0;
}

.cv-auth__side-quote {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-left: 3px solid rgba(201, 169, 97, 0.7);
}

.cv-auth__side-quote svg {
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
}

.cv-auth__side-quote-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  font-style: italic;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(245, 240, 230, 0.85);
}

.cv-auth__side-quote-author {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-auth__card {
  position: relative;
  padding: 40px 42px;
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 120px rgba(201, 169, 97, 0.1);
  overflow: hidden;
  isolation: isolate;
}

.cv-auth__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.35) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 3;
}

.cv-auth__card-glow {
  position: absolute;
  top: -120px;
  right: -100px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.75;
}

.cv-auth__card-carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    ),
    repeating-linear-gradient(
      -45deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 4px
    );
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
}

.cv-auth__card-inner {
  position: relative;
  z-index: 1;
}

.cv-auth__card-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 97, 0.05) 15%,
    rgba(201, 169, 97, 0.35) 50%,
    rgba(201, 169, 97, 0.05) 85%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 3;
}

.cv-auth-page-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-auth-page-leave-active {
  transition: all 0.2s ease;
}

.cv-auth-page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cv-auth-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.cv-auth__footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 24px;
  margin-top: 8px;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
  flex-wrap: wrap;
}

.cv-auth__back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-auth__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateX(-2px);
}

.cv-auth__back:active {
  transform: translateX(-2px) scale(0.97);
}

.cv-auth__copyright {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.15px;
  color: rgba(200, 190, 175, 0.5);
  flex-wrap: wrap;
}

.cv-auth__copyright-dot {
  color: rgba(201, 169, 97, 0.35);
  font-weight: 700;
}

.cv-auth__copyright-link {
  color: rgba(220, 210, 195, 0.65);
  text-decoration: none;
  transition: color 0.2s ease;
}

.cv-auth__copyright-link:hover {
  color: #E8D5A0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 1024px) {
  .cv-auth__container {
    grid-template-columns: 1fr;
    max-width: 520px;
    gap: 32px;
  }

  .cv-auth__side {
    gap: 20px;
    text-align: center;
    align-items: center;
  }

  .cv-auth__side-logo {
    align-self: center;
  }

  .cv-auth__side-content {
    align-items: center;
  }

  .cv-auth__side-title {
    font-size: 30px;
    letter-spacing: -0.7px;
  }

  .cv-auth__side-text {
    text-align: center;
  }

  .cv-auth__side-features {
    align-items: flex-start;
    max-width: 340px;
    margin: 0 auto;
  }

  .cv-auth__side-badges {
    justify-content: center;
  }

  .cv-auth__side-quote {
    text-align: left;
    max-width: 440px;
  }

  .cv-auth__footer {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .cv-auth {
    padding: 20px 14px;
    align-items: flex-start;
  }

  .cv-auth__container {
    gap: 24px;
  }

  .cv-auth__side-title {
    font-size: 24px;
    letter-spacing: -0.5px;
  }

  .cv-auth__side-text {
    font-size: 13.5px;
  }

  .cv-auth__side-features {
    gap: 10px;
  }

  .cv-auth__side-feature {
    font-size: 12.5px;
  }

  .cv-auth__side-badge {
    font-size: 10px;
    padding: 4px 9px;
  }

  .cv-auth__card {
    padding: 26px 20px;
    border-radius: 1.25rem;
  }

  .cv-auth__footer {
    padding-top: 18px;
  }

  .cv-auth__back {
    padding: 6px 12px;
    font-size: 12px;
  }

  .cv-auth__copyright {
    font-size: 10.5px;
    justify-content: center;
    text-align: center;
  }
}
</style>