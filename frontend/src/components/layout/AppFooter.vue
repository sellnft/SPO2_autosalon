<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppLogo from './AppLogo.vue'

const currentYear = new Date().getFullYear()
const activeDocument = ref(null)
const showScrollTop = ref(false)

const navigationLinks = [
  { label: 'Каталог', to: '/announcements' },
  { label: 'Избранное', to: '/favourites' },
  { label: 'Чаты', to: '/chat' },
  { label: 'Поддержка', to: '/feedback' }
]

const socials = [
  { id: 'vk', label: 'VK', icon: 'VK', href: 'https://vk.com' },
  { id: 'tg', label: 'Telegram', icon: 'TG', href: 'https://t.me' },
  { id: 'yt', label: 'YouTube', icon: 'YT', href: 'https://youtube.com' },
  { id: 'dzen', label: 'Дзен', icon: 'ДЗ', href: 'https://dzen.ru' }
]

const legalDocuments = {
  terms: {
    title: 'Пользовательское соглашение',
    version: '2.1',
    updated: '15 января 2026',
    sections: [
      {
        heading: '1. Общие положения',
        text: `Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между ООО «CarVibe» (далее — «Платформа», «Мы») и любым лицом, использующим сервис CarVibe (далее — «Пользователь»).

Используя Платформу, вы подтверждаете, что ознакомились с условиями Соглашения и принимаете их в полном объёме.`
      },
      {
        heading: '2. Предмет соглашения',
        text: `Платформа предоставляет Пользователю доступ к функционалу размещения, поиска и просмотра объявлений о продаже автомобилей, а также к сопутствующим сервисам: чатам, избранному, подпискам, аналитике цен.`
      },
      {
        heading: '3. Права и обязанности Пользователя',
        text: `Пользователь обязуется:
— предоставлять достоверную информацию о транспортном средстве;
— не размещать объявления о продаже угнанных, залоговых или арестованных авто;
— не использовать Платформу для мошеннических действий;
— соблюдать законодательство РФ.`
      },
      {
        heading: '4. Ответственность',
        text: `Платформа не является стороной сделки купли-продажи и не несёт ответственности за качество, юридическую чистоту и фактическое состояние автомобиля. Все переговоры и сделки Пользователи совершают самостоятельно.`
      },
      {
        heading: '5. Изменение условий',
        text: `Мы вправе изменять условия Соглашения, уведомляя Пользователей за 7 дней до вступления изменений в силу через интерфейс Платформы.`
      }
    ]
  },
  privacy: {
    title: 'Политика конфиденциальности',
    version: '1.8',
    updated: '10 января 2026',
    sections: [
      {
        heading: '1. Какие данные мы собираем',
        text: `Мы обрабатываем: имя, email, телефон, город, данные об устройстве и IP, историю просмотров объявлений, файлы cookie. Данные обрабатываются в соответствии с ФЗ-152 «О персональных данных».`
      },
      {
        heading: '2. Цели обработки',
        text: `— предоставление доступа к функционалу Платформы;
— связь продавца и покупателя;
— аналитика и улучшение сервиса;
— защита от мошенничества.`
      },
      {
        heading: '3. Передача третьим лицам',
        text: `Мы не продаём персональные данные. Передача возможна только: правоохранительным органам по запросу, платёжным партнёрам для проведения операций, сервисам аналитики в обезличенном виде.`
      },
      {
        heading: '4. Права пользователя',
        text: `Вы вправе запросить копию своих данных, потребовать их удаления или исправления, отозвать согласие на обработку — через настройки профиля или по адресу privacy@carvibe.ru.`
      }
    ]
  },
  cookies: {
    title: 'Политика использования cookies',
    version: '1.2',
    updated: '5 января 2026',
    sections: [
      {
        heading: '1. Что такое cookies',
        text: `Cookies — небольшие текстовые файлы, сохраняемые в браузере. Они позволяют Платформе запоминать ваши предпочтения, авторизацию и улучшать работу сервиса.`
      },
      {
        heading: '2. Типы cookies',
        text: `— Обязательные (работа авторизации)
— Аналитические (Яндекс.Метрика, Google Analytics)
— Маркетинговые (ретаргетинг)
— Функциональные (язык, валюта, город)`
      },
      {
        heading: '3. Управление cookies',
        text: `Вы можете отключить cookies в настройках браузера, но это может нарушить работу Платформы.`
      }
    ]
  },
  offer: {
    title: 'Публичная оферта',
    version: '3.0',
    updated: '20 января 2026',
    sections: [
      {
        heading: '1. Предмет оферты',
        text: `Настоящая оферта определяет условия предоставления платных услуг Платформы: продвижение объявлений, подписки PRO, выделение в топ, проверка истории авто.`
      },
      {
        heading: '2. Стоимость и оплата',
        text: `Стоимость услуг указана в интерфейсе Платформы. Оплата производится через партнёрские платёжные сервисы. Услуга считается оказанной с момента активации.`
      },
      {
        heading: '3. Возврат средств',
        text: `Возврат возможен в течение 14 дней, если услуга не была активирована. Для возврата — заявка на support@carvibe.ru.`
      }
    ]
  },
  rules: {
    title: 'Правила размещения объявлений',
    version: '2.4',
    updated: '12 января 2026',
    sections: [
      {
        heading: '1. Что можно размещать',
        text: `Только легковые и коммерческие автомобили, мотоциклы, а также запчасти и услуги, связанные с автотематикой.`
      },
      {
        heading: '2. Что запрещено',
        text: `— Угнанные, залоговые, арестованные авто
— Дубликаты одного и того же авто
— Авто без документов
— Объявления с недостоверными фото
— Спам и реклама сторонних сервисов`
      },
      {
        heading: '3. Модерация',
        text: `Все объявления проходят автоматическую и ручную модерацию в течение 30 минут. При нарушении — объявление отклоняется, аккаунт может быть заблокирован.`
      }
    ]
  },
  disputes: {
    title: 'Политика возврата и разрешения споров',
    version: '1.5',
    updated: '8 января 2026',
    sections: [
      {
        heading: '1. Споры между пользователями',
        text: `Платформа не является стороной сделки, но предоставляет инструменты для разрешения споров: чат, службу поддержки, систему жалоб на объявления.`
      },
      {
        heading: '2. Жалобы на объявления',
        text: `Каждый пользователь может пожаловаться на подозрительное объявление. Мы рассматриваем жалобу в течение 24 часов.`
      },
      {
        heading: '3. Возврат за услуги Платформы',
        text: `Возврат средств за платные услуги — согласно разделу 3 Публичной оферты.`
      }
    ]
  }
}

const legalLinks = [
  { key: 'terms', label: 'Пользовательское соглашение' },
  { key: 'privacy', label: 'Конфиденциальность' },
  { key: 'cookies', label: 'Cookies' },
  { key: 'offer', label: 'Оферта' },
  { key: 'rules', label: 'Правила размещения' },
  { key: 'disputes', label: 'Споры' }
]

const activeDoc = computed(() =>
  activeDocument.value ? legalDocuments[activeDocument.value] : null
)

function openDocument(key) {
  activeDocument.value = key
  document.body.style.overflow = 'hidden'
}

function closeDocument() {
  activeDocument.value = null
  document.body.style.overflow = ''
}

function handleKeydown(e) {
  if (e.key === 'Escape' && activeDocument.value) closeDocument()
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  showScrollTop.value = window.scrollY > 400
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <footer class="cv-footer">
    <div class="cv-footer__glow cv-footer__glow--bronze" aria-hidden="true"></div>
    <div class="cv-footer__glow cv-footer__glow--copper" aria-hidden="true"></div>
    <div class="cv-footer__carbon" aria-hidden="true"></div>

    <div class="cv-footer__inner">
      <div class="cv-footer__row cv-footer__row--main">
        <RouterLink to="/" class="cv-footer__brand">
          <AppLogo />
        </RouterLink>

        <nav class="cv-footer__nav" aria-label="Основная навигация">
          <RouterLink
            v-for="link in navigationLinks"
            :key="link.label"
            :to="link.to"
            class="cv-footer__nav-link"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="cv-footer__divider" aria-hidden="true"></div>

      <div class="cv-footer__row cv-footer__row--middle">
        <div class="cv-footer__contacts">
          <a href="mailto:support@carvibe.ru" class="cv-footer__contact">
            <span class="cv-footer__contact-icon">✉</span>
            support@carvibe.ru
          </a>
          <a href="tel:+78001234567" class="cv-footer__contact">
            <span class="cv-footer__contact-icon">☎</span>
            8 (800) 123-45-67
          </a>
        </div>

        <div class="cv-footer__socials">
          <a
            v-for="s in socials"
            :key="s.id"
            :href="s.href"
            target="_blank"
            rel="noopener noreferrer"
            class="cv-footer__social"
            :aria-label="s.label"
            :title="s.label"
          >
            {{ s.icon }}
          </a>
        </div>
      </div>

      <div class="cv-footer__divider" aria-hidden="true"></div>

      <div class="cv-footer__row cv-footer__row--bottom">
        <span class="cv-footer__copyright">
          © {{ currentYear }} CarVibe. Все права защищены.
        </span>

        <nav class="cv-footer__legal" aria-label="Правовые документы">
          <button
            v-for="doc in legalLinks"
            :key="doc.key"
            type="button"
            class="cv-footer__legal-link"
            @click="openDocument(doc.key)"
          >
            {{ doc.label }}
          </button>
        </nav>
      </div>
    </div>

    <Transition name="cv-scroll-top">
      <button
        v-if="showScrollTop"
        class="cv-footer__scroll-top"
        @click="scrollToTop"
        aria-label="Наверх"
        title="Наверх"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </Transition>
  </footer>

  <Teleport to="body">
    <Transition name="cv-modal">
      <div
        v-if="activeDoc"
        class="cv-legal"
        @click.self="closeDocument"
        role="dialog"
        aria-modal="true"
      >
        <div class="cv-legal__window">
          <header class="cv-legal__header">
            <div class="cv-legal__title-block">
              <span class="cv-legal__badge">📄 Документ</span>
              <h2 class="cv-legal__title">{{ activeDoc.title }}</h2>
              <div class="cv-legal__meta">
                <span>Версия {{ activeDoc.version }}</span>
                <span class="cv-legal__dot">•</span>
                <span>Редакция от {{ activeDoc.updated }}</span>
              </div>
            </div>
            <button
              class="cv-legal__close"
              @click="closeDocument"
              aria-label="Закрыть"
            >×</button>
          </header>

          <div class="cv-legal__body">
            <section
              v-for="(section, i) in activeDoc.sections"
              :key="i"
              class="cv-legal__section"
            >
              <h3 class="cv-legal__section-title">{{ section.heading }}</h3>
              <p class="cv-legal__section-text">{{ section.text }}</p>
            </section>
          </div>

          <footer class="cv-legal__footer">
            <span class="cv-legal__footer-note">
              По вопросам: <a href="mailto:legal@carvibe.ru">legal@carvibe.ru</a>
            </span>
            <button class="cv-legal__btn" @click="closeDocument">Понятно</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cv-footer {
  --cv-bg: #0A0A0C;
  --cv-bg-2: #121215;
  --cv-border: rgba(201, 169, 97, 0.12);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.55);
  --cv-text-3: rgba(200, 190, 175, 0.35);
  --cv-bronze: #C9A961;
  --cv-bronze-light: #E8D5A0;
  --cv-bronze-dark: #8B6F3F;
  --cv-copper: #B87755;

  position: relative;
  margin-top: 96px;
  background: linear-gradient(180deg, var(--cv-bg-2) 0%, var(--cv-bg) 100%);
  border-top: 1px solid var(--cv-border);
  color: var(--cv-text);
  overflow: hidden;
  isolation: isolate;
}

.cv-footer__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}
.cv-footer__glow--bronze {
  top: -140px;
  left: -100px;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.35), transparent 70%);
}
.cv-footer__glow--copper {
  bottom: -160px;
  right: -100px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
}

.cv-footer__carbon {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
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
    ),
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.25) 0px,
      rgba(0, 0, 0, 0.25) 1px,
      transparent 1px,
      transparent 6px
    );
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
}

.cv-footer__inner {
  position: relative;
  z-index: 1;
  max-width: 1240px;
  margin: 0 auto;
  padding: 40px 28px 28px;
}

.cv-footer__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cv-footer__brand {
  display: flex;
  align-items: center;
  gap: 18px;
  text-decoration: none;
}

.cv-footer__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.cv-footer__nav-link {
  position: relative;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--cv-text-2);
  text-decoration: none;
  transition: all 0.2s ease;
}
.cv-footer__nav-link:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.06);
}
.cv-footer__nav-link.router-link-active {
  color: var(--cv-bronze-light);
}

.cv-footer__divider {
  height: 1px;
  margin: 24px 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.06) 20%,
    rgba(201, 169, 97, 0.28) 50%,
    rgba(201, 169, 97, 0.06) 80%,
    transparent
  );
}

.cv-footer__contacts {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.cv-footer__contact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--cv-text-2);
  text-decoration: none;
  transition: color 0.2s ease;
}
.cv-footer__contact:hover {
  color: var(--cv-bronze-light);
}
.cv-footer__contact-icon {
  font-size: 13px;
  opacity: 0.65;
  color: var(--cv-bronze);
}

.cv-footer__socials {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cv-footer__social {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--cv-text-2);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--cv-border-soft);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cv-footer__social:hover {
  color: #1A1208;
  background: linear-gradient(135deg, var(--cv-bronze-light), var(--cv-bronze));
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(201, 169, 97, 0.35);
}

.cv-footer__copyright {
  font-size: 12.5px;
  color: var(--cv-text-3);
  letter-spacing: 0.2px;
}

.cv-footer__legal {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.cv-footer__legal-link {
  padding: 6px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  font-family: inherit;
  color: var(--cv-text-3);
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
}
.cv-footer__legal-link:hover {
  color: var(--cv-bronze-light);
}
.cv-footer__legal-link::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cv-bronze-light), transparent);
  transform: translateX(-50%);
  transition: width 0.25s ease;
}
.cv-footer__legal-link:hover::after {
  width: calc(100% - 20px);
}

.cv-footer__scroll-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 900;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(201, 169, 97, 0.3);
  background: rgba(18, 18, 21, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--cv-bronze-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(201, 169, 97, 0.12);
  transition: all 0.25s ease;
}
.cv-footer__scroll-top:hover {
  background: linear-gradient(135deg, var(--cv-bronze-light), var(--cv-bronze));
  color: #1A1208;
  border-color: transparent;
  transform: translateY(-4px);
  box-shadow: 0 16px 44px rgba(201, 169, 97, 0.4);
}

.cv-scroll-top-enter-active,
.cv-scroll-top-leave-active {
  transition: all 0.25s ease;
}
.cv-scroll-top-enter-from,
.cv-scroll-top-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}

.cv-legal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(5, 5, 7, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.cv-legal__window {
  width: 100%;
  max-width: 760px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), transparent 30%),
    linear-gradient(180deg, #1A1A20 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 24px;
  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(201, 169, 97, 0.08) inset,
    0 0 120px rgba(201, 169, 97, 0.1);
  overflow: hidden;
}

.cv-legal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 30px 36px 24px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.16);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.08), transparent);
}

.cv-legal__badge {
  display: inline-block;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #F0DDA8;
  background: rgba(201, 169, 97, 0.14);
  border: 1px solid rgba(201, 169, 97, 0.4);
  margin-bottom: 14px;
}

.cv-legal__title {
  font-size: 26px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 10px;
  letter-spacing: -0.4px;
  line-height: 1.25;
  text-shadow: 0 1px 20px rgba(201, 169, 97, 0.15);
}

.cv-legal__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(240, 230, 210, 0.65);
  letter-spacing: 0.1px;
}

.cv-legal__dot {
  opacity: 0.5;
  color: #C9A961;
}

.cv-legal__close {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(201, 169, 97, 0.2);
  background: rgba(201, 169, 97, 0.06);
  color: rgba(240, 230, 210, 0.75);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.cv-legal__close:hover {
  background: rgba(184, 119, 85, 0.2);
  color: #F0DDA8;
  border-color: rgba(184, 119, 85, 0.5);
  transform: rotate(90deg);
}

.cv-legal__body {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px 36px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.35) transparent;
}
.cv-legal__body::-webkit-scrollbar { width: 8px; }
.cv-legal__body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.cv-legal__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #C9A961, #8B6F3F);
  border-radius: 4px;
}
.cv-legal__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #E8D5A0, #C9A961);
}

.cv-legal__section {
  margin-bottom: 32px;
  max-width: 62ch;
}
.cv-legal__section:last-child { margin-bottom: 0; }

.cv-legal__section-title {
  font-size: 16px;
  font-weight: 700;
  color: #E8D5A0;
  margin: 0 0 14px;
  letter-spacing: -0.15px;
  line-height: 1.4;
  padding-left: 14px;
  position: relative;
}
.cv-legal__section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #8B6F3F);
}

.cv-legal__section-text {
  font-size: 14.5px;
  line-height: 1.75;
  color: rgba(245, 240, 230, 0.92);
  margin: 0;
  white-space: pre-line;
  letter-spacing: 0.05px;
}

.cv-legal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 22px 40px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4), transparent);
}

.cv-legal__footer-note {
  font-size: 13px;
  font-weight: 500;
  color: rgba(240, 230, 210, 0.55);
}
.cv-legal__footer-note a {
  color: #E8D5A0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}
.cv-legal__footer-note a:hover {
  color: #FFFFFF;
  text-decoration: underline;
}

.cv-legal__btn {
  padding: 11px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  color: #1A1208;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: all 0.25s ease;
  box-shadow:
    0 4px 20px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.3) inset;
}
.cv-legal__btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 32px rgba(201, 169, 97, 0.55),
    0 1px 0 rgba(255, 255, 255, 0.4) inset;
}
.cv-legal__btn:active {
  transform: translateY(0);
}

.cv-modal-enter-active,
.cv-modal-leave-active {
  transition: opacity 0.25s ease;
}
.cv-modal-enter-active .cv-legal__window,
.cv-modal-leave-active .cv-legal__window {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}
.cv-modal-enter-from,
.cv-modal-leave-to {
  opacity: 0;
}
.cv-modal-enter-from .cv-legal__window,
.cv-modal-leave-to .cv-legal__window {
  transform: translateY(20px) scale(0.96);
  opacity: 0;
}

@media (max-width: 900px) {
  .cv-footer__row--middle {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .cv-footer__row--bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .cv-footer__legal {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .cv-footer { margin-top: 64px; }
  .cv-footer__inner { padding: 32px 20px 24px; }
  .cv-footer__row--main {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .cv-footer__nav { width: 100%; }
  .cv-footer__scroll-top {
    bottom: 20px;
    right: 20px;
    width: 42px;
    height: 42px;
  }
  .cv-legal { padding: 12px; }
  .cv-legal__header,
  .cv-legal__body,
  .cv-legal__footer {
    padding-left: 22px;
    padding-right: 22px;
  }
  .cv-legal__header { padding-top: 24px; padding-bottom: 20px; }
  .cv-legal__body { padding-top: 24px; padding-bottom: 26px; }
  .cv-legal__title { font-size: 21px; }
  .cv-legal__section-title { font-size: 15px; }
  .cv-legal__section-text { font-size: 14px; }
  .cv-legal__footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding-top: 18px;
    padding-bottom: 18px;
  }
  .cv-legal__btn { width: 100%; }
}
</style>