<script setup>
import AppLogo from './AppLogo.vue'

const currentYear = new Date().getFullYear()

const navigationLinks = [
  { label: 'Каталог', to: '/announcements' },
  { label: 'Избранное', to: '/favourites' },
  { label: 'Поддержка', to: '/feedback' },
  { label: 'Чаты', to: '/chat' }
]

const accountLinks = [
  { label: 'Профиль', to: '/profile' },
  { label: 'Мои объявления', to: '/profile/announcements' },
  { label: 'Настройки', to: '/profile/edit' },
  { label: 'Безопасность', to: '/profile/security' }
]
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="app-footer__top">
        <div class="app-footer__brand">
          <AppLogo />
          <p class="app-footer__description">
            Современная платформа для покупки и продажи автомобилей
          </p>
        </div>

        <div class="app-footer__columns">
          <div class="app-footer__column">
            <h4 class="app-footer__title">Навигация</h4>
            <ul class="app-footer__list">
              <li v-for="link in navigationLinks" :key="link.label">
                <RouterLink :to="link.to" class="app-footer__link">
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <div class="app-footer__column">
            <h4 class="app-footer__title">Аккаунт</h4>
            <ul class="app-footer__list">
              <li v-for="link in accountLinks" :key="link.label">
                <RouterLink :to="link.to" class="app-footer__link">
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <div class="app-footer__column">
            <h4 class="app-footer__title">Контакты</h4>
            <ul class="app-footer__list">
              <li>
                <a href="mailto:support@autoplatform.com" class="app-footer__link">
                  support@autoplatform.com
                </a>
              </li>
              <li>
                <a href="tel:+78001234567" class="app-footer__link">
                  8 (800) 123-45-67
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="app-footer__bottom">
        <p class="app-footer__copyright">
          © {{ currentYear }} Auto Platform. Все права защищены.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 80px;
  background: #111827;
  color: #9CA3AF;
}

.app-footer__top {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
  padding: 48px 0 32px;
}

.app-footer__description {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #6B7280;
  max-width: 320px;
}

.app-footer__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.app-footer__title {
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.app-footer__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-footer__link {
  font-size: 14px;
  color: #9CA3AF;
  transition: color 0.2s;
}

.app-footer__link:hover {
  color: white;
}

.app-footer__bottom {
  padding: 24px 0;
  border-top: 1px solid #374151;
}

.app-footer__copyright {
  font-size: 13px;
}

@media (max-width: 1024px) {
  .app-footer__top {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .app-footer__columns {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>