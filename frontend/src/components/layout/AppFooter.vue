<script setup>
import AppLogo from './AppLogo.vue'

const currentYear = new Date().getFullYear()

const navigationLinks = [
  { label: 'Каталог', to: '/announcements' },
  { label: 'О нас', to: '/about' },
  { label: 'Поддержка', to: '/feedback' },
  { label: 'Правила', to: '/terms' }
]

const serviceLinks = [
  { label: 'Помощь', to: '/help' },
  { label: 'Безопасность', to: '/safety' },
  { label: 'Реклама', to: '/advertising' },
  { label: 'Контакты', to: '/contacts' }
]
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__container">
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
            <h4 class="app-footer__title">Сервис</h4>
            <ul class="app-footer__list">
              <li v-for="link in serviceLinks" :key="link.label">
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
        <div class="app-footer__legal">
          <RouterLink to="/privacy" class="app-footer__legal-link">
            Политика конфиденциальности
          </RouterLink>
          <RouterLink to="/terms" class="app-footer__legal-link">
            Условия использования
          </RouterLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #111827;
  color: #9CA3AF;
}

.app-footer__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 48px 20px 24px;
}

.app-footer__top {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 48px;
  margin-bottom: 48px;
}

.app-footer__description {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #6B7280;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid #374151;
}

.app-footer__copyright {
  font-size: 13px;
}

.app-footer__legal {
  display: flex;
  gap: 24px;
}

.app-footer__legal-link {
  font-size: 13px;
  color: #9CA3AF;
  transition: color 0.2s;
}

.app-footer__legal-link:hover {
  color: white;
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
  
  .app-footer__bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .app-footer__legal {
    flex-direction: column;
    gap: 8px;
  }
}
</style>