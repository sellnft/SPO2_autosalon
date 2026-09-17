<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const searchQuery = ref('')

const popularLinks = [
  { to: '/announcements', label: 'Каталог', icon: 'search' },
  { to: '/announcements?sort=popular', label: 'Популярные', icon: 'star' },
  { to: '/favourites', label: 'Избранное', icon: 'heart' },
  { to: '/feedback', label: 'Поддержка', icon: 'help' }
]

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/announcements',
      query: { search: searchQuery.value.trim() }
    })
    searchQuery.value = ''
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <section class="cv-404">
    <div class="cv-404__bg" aria-hidden="true">
      <div class="cv-404__bg-orb cv-404__bg-orb--1"></div>
      <div class="cv-404__bg-orb cv-404__bg-orb--2"></div>
      <div class="cv-404__bg-grid"></div>
      <div class="cv-404__bg-carbon"></div>
    </div>

    <div class="cv-404__content">
      <div class="cv-404__icon-wrap">
        <div class="cv-404__icon">
          <span class="cv-404__icon-inner">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M15.5 8.5L13 13l-4.5 2.5L11 11z"/>
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
            </svg>
          </span>
          <span class="cv-404__icon-shine" aria-hidden="true"></span>
        </div>
      </div>

      <div class="cv-404__code-wrap">
        <span class="cv-404__code">404</span>
      </div>

      <h1 class="cv-404__title">Страница не найдена</h1>

      <p class="cv-404__text">
        Возможно, страница была удалена или вы перешли по неверной ссылке.
        Попробуйте найти нужное через поиск или перейдите в популярные разделы.
      </p>

      <form class="cv-404__search" @submit.prevent="handleSearch">
        <span class="cv-404__search-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M20 20l-3.5-3.5"/>
          </svg>
        </span>

        <input
          v-model="searchQuery"
          type="text"
          class="cv-404__search-input"
          placeholder="Поиск по каталогу — марка, модель, город..."
        />

        <BaseButton type="submit" size="sm" :disabled="!searchQuery.trim()">
          Найти
        </BaseButton>
      </form>

      <div class="cv-404__actions">
        <BaseButton size="lg" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10.5L12 3l9 7.5"/>
            <path d="M5 9.5V21h14V9.5"/>
          </svg>
          На главную
        </BaseButton>

        <BaseButton variant="outline" size="lg" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Назад
        </BaseButton>
      </div>

      <div class="cv-404__quick">
        <span class="cv-404__quick-label">Популярные разделы</span>

        <div class="cv-404__quick-list">
          <RouterLink
            v-for="link in popularLinks"
            :key="link.to"
            :to="link.to"
            class="cv-404__quick-item"
          >
            <span class="cv-404__quick-icon" aria-hidden="true">
              <svg v-if="link.icon === 'search'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
              <svg v-else-if="link.icon === 'star'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
              </svg>
              <svg v-else-if="link.icon === 'heart'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </span>
            <span class="cv-404__quick-text">{{ link.label }}</span>
            <span class="cv-404__quick-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </RouterLink>
        </div>
      </div>

      <p class="cv-404__help">
        Ссылка устарела или ведёт не туда?
        <RouterLink to="/feedback" class="cv-404__help-link">
          Сообщите нам
        </RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.cv-404 {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px 80px;
  min-height: 70vh;
  overflow: hidden;
  isolation: isolate;
}

.cv-404__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-404__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  opacity: 0.5;
}

.cv-404__bg-orb--1 {
  top: -20%;
  left: -10%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.3), transparent 70%);
  animation: cv404Orb 22s ease-in-out infinite;
}

.cv-404__bg-orb--2 {
  bottom: -30%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
  animation: cv404Orb 26s ease-in-out infinite reverse;
}

@keyframes cv404Orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-404__bg-grid {
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

.cv-404__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 25%, transparent 85%);
}

.cv-404__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 600px;
  text-align: center;
}

.cv-404__icon-wrap {
  margin-bottom: 8px;
}

.cv-404__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 108px;
  border-radius: 28px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.6) 0%, rgba(20, 16, 10, 0.75) 100%),
    linear-gradient(180deg, #1F1A12 0%, #14100C 100%);
  border: 1px solid rgba(201, 169, 97, 0.4);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.08) inset,
    0 1px 0 rgba(232, 213, 160, 0.15) inset,
    0 0 80px rgba(201, 169, 97, 0.22);
  overflow: hidden;
  animation: cv404Float 4s ease-in-out infinite;
}

@keyframes cv404Float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cv-404__icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.3) 50%, transparent);
}

.cv-404__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.5));
}

.cv-404__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.15) 50%,
    transparent 70%
  );
  animation: cv404Shine 5s ease-in-out infinite;
  animation-delay: 1.5s;
  pointer-events: none;
}

@keyframes cv404Shine {
  0%, 60%, 100% { left: -100%; }
  80% { left: 100%; }
}

.cv-404__code-wrap {
  display: inline-flex;
  align-items: baseline;
  margin-top: 4px;
}

.cv-404__code {
  font-size: 96px;
  font-weight: 800;
  letter-spacing: -4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 4px 60px rgba(201, 169, 97, 0.3);
}

.cv-404__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-404__text {
  margin: 0;
  max-width: 500px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.65);
}

.cv-404__search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 480px;
  margin-top: 8px;
  padding: 6px 6px 6px 14px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.22);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
  transition: all 0.25s ease;
}

.cv-404__search:focus-within {
  border-color: rgba(201, 169, 97, 0.55);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 40px rgba(201, 169, 97, 0.12);
}

.cv-404__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.cv-404__search:focus-within .cv-404__search-icon {
  color: #E8D5A0;
}

.cv-404__search-input {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.95);
  background: transparent;
  border: none;
  outline: none;
}

.cv-404__search-input::placeholder {
  color: rgba(200, 190, 175, 0.45);
}

.cv-404__actions {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.cv-404__quick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding-top: 32px;
  width: 100%;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-404__quick-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.7);
}

.cv-404__quick-list {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-404__quick-item {
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

.cv-404__quick-item:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-404__quick-item:active {
  transform: translateY(0) scale(0.97);
}

.cv-404__quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-404__quick-text {
  white-space: nowrap;
}

.cv-404__quick-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
  opacity: 0.7;
}

.cv-404__quick-item:hover .cv-404__quick-arrow {
  color: #E8D5A0;
  transform: translateX(2px);
  opacity: 1;
}

.cv-404__help {
  margin: 12px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-404__help-link {
  color: #E8D5A0;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.cv-404__help-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .cv-404 {
    padding: 40px 20px 60px;
    min-height: 60vh;
  }

  .cv-404__icon {
    width: 88px;
    height: 88px;
    border-radius: 24px;
  }

  .cv-404__icon-inner svg {
    width: 30px;
    height: 30px;
  }

  .cv-404__code {
    font-size: 72px;
    letter-spacing: -3px;
  }

  .cv-404__title {
    font-size: 22px;
  }

  .cv-404__text {
    font-size: 13.5px;
  }

  .cv-404__search {
    padding: 5px 5px 5px 12px;
  }

  .cv-404__search-input {
    font-size: 13px;
  }

  .cv-404__actions {
    flex-direction: column;
    width: 100%;
  }

  .cv-404__actions > * {
    width: 100%;
  }

  .cv-404__quick-list {
    flex-direction: column;
    width: 100%;
  }

  .cv-404__quick-item {
    justify-content: center;
    width: 100%;
  }
}
</style>