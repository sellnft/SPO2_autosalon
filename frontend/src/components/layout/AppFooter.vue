<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppLogo from './AppLogo.vue'

/**
 * Подвал приложения.
 *
 * Scroll-to-top здесь НЕ реализуется — он живёт в cv-layout
 * (единственный fixed-элемент этого типа на странице).
 *
 * Правовые документы открываются в модалке поверх всего.
 * Модалка блокирует скролл body через счётчик — это защищает
 * от конфликта с MobileMenu в шапке, который тоже ставит
 * overflow: hidden.
 */

const currentYear = new Date().getFullYear()

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
        text: `Мы вправе изменять условия Соглашения, уведомляя Пользователей за 7 дней до вступления в силу через интерфейс Платформы.`
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

const activeDocument = ref(null)

const activeDoc = computed(() =>
  activeDocument.value ? legalDocuments[activeDocument.value] : null
)

/*
  Счётчик scroll-lock'ов: если MobileMenu и модалка одновременно
  открыты, overflow должен сбрасываться только когда закрылись оба.
*/
let scrollLockCount = 0
function lockBodyScroll() {
  scrollLockCount += 1
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }
}
function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0 && typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

let isBodyLocked = false
watch(activeDocument, (val) => {
  if (val && !isBodyLocked) {
    lockBodyScroll()
    isBodyLocked = true
  } else if (!val && isBodyLocked) {
    unlockBodyScroll()
    isBodyLocked = false
  }
})

function openDocument(key) {
  activeDocument.value = key
}

function closeDocument() {
  activeDocument.value = null
}

function handleKeydown(e) {
  if (e.key === 'Escape' && activeDocument.value) closeDocument()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (isBodyLocked) {
    unlockBodyScroll()
    isBodyLocked = false
  }
})
</script>

<template>
  <footer class="cv-footer">
    <div class="cv-footer__glow cv-footer__glow--bronze" aria-hidden="true"></div>
    <div class="cv-footer__glow cv-footer__glow--copper" aria-hidden="true"></div>
    <div class="cv-footer__carbon" aria-hidden="true"></div>

    <div class="cv-footer__inner">
      <!-- Группа 1: бренд + основная навигация -->
      <div class="cv-footer__row cv-footer__row--top">
        <RouterLink to="/" class="cv-footer__brand" aria-label="CarVibe — на главную">
          <AppLogo />
        </RouterLink>

        <nav class="cv-footer__nav" aria-label="Основная навигация">
          <RouterLink
            v-for="link in navigationLinks"
            :key="link.to"
            :to="link.to"
            class="cv-footer__nav-link"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="cv-footer__divider" aria-hidden="true"></div>

      <!-- Группа 2: контакты + соцсети -->
      <div class="cv-footer__row cv-footer__row--contacts">
        <ul class="cv-footer__contacts">
          <li>
            <a href="mailto:support@carvibe.ru" class="cv-footer__contact">
              <span class="cv-footer__contact-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              support@carvibe.ru
            </a>
          </li>
          <li>
            <a href="tel:+78001234567" class="cv-footer__contact">
              <span class="cv-footer__contact-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.6 12.6 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.6 12.6 0 0 0 2.8.7 2 2 0 0 1 1.7 2z" />
                </svg>
              </span>
              8 (800) 123-45-67
            </a>
          </li>
        </ul>

        <ul class="cv-footer__socials">
          <li v-for="s in socials" :key="s.id">
            <a
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              class="cv-footer__social"
              :aria-label="s.label"
              :title="s.label"
            >
              {{ s.icon }}
            </a>
          </li>
        </ul>
      </div>

      <div class="cv-footer__divider" aria-hidden="true"></div>

      <!-- Группа 3: правовые ссылки + копирайт -->
      <div class="cv-footer__row cv-footer__row--bottom">
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

        <span class="cv-footer__copyright">
          © {{ currentYear }} CarVibe. Все права защищены.
        </span>
      </div>
    </div>
  </footer>

  <Teleport to="body">
    <Transition name="cv-modal">
      <div
        v-if="activeDoc"
        class="cv-legal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-legal-title"
        @click.self="closeDocument"
      >
        <div class="cv-legal__window">
          <header class="cv-legal__header">
            <div class="cv-legal__title-block">
              <span class="cv-legal__badge">📄 Документ</span>
              <h2 id="cv-legal-title" class="cv-legal__title">
                {{ activeDoc.title }}
              </h2>
              <div class="cv-legal__meta">
                <span>Версия {{ activeDoc.version }}</span>
                <span class="cv-legal__dot" aria-hidden="true">•</span>
                <span>Редакция от {{ activeDoc.updated }}</span>
              </div>
            </div>
            <button
              type="button"
              class="cv-legal__close"
              aria-label="Закрыть"
              @click="closeDocument"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
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
            <button
              type="button"
              class="cv-legal__btn"
              @click="closeDocument"
            >
              Понятно
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ============================================================
   Подвал
   - Единые токены палитры и типографики
   - Все ссылки — один стиль состояний (hover/focus/active)
   - Mobile: три группы вертикально
   - Scroll-to-top здесь НЕТ — он в cv-layout
   ============================================================ */

.cv-footer {
  /* Layout-токены */
  --cv-footer-max-width: 1240px;
  --cv-footer-px: 28px;
  --cv-footer-pt: 44px;
  --cv-footer-pb: 28px;
  --cv-footer-mt: 96px;
  --cv-footer-gap: 24px;
  --cv-footer-gap-sm: 12px;

  /* Типографика — единый масштаб для всех ссылок и текста */
  --cv-footer-link-size: 13px;
  --cv-footer-link-weight: 500;
  --cv-footer-small-size: 12.5px;
  --cv-footer-nav-size: 13.5px;

  /* Палитра (совпадает с шапкой и layout-ами) */
  --cv-bg: #0a0a0c;
  --cv-bg-2: #121215;
  --cv-border: rgba(201, 169, 97, 0.12);
  --cv-border-soft: rgba(255, 255, 255, 0.06);
  --cv-text: rgba(245, 240, 230, 0.9);
  --cv-text-2: rgba(220, 210, 195, 0.65);
  --cv-text-3: rgba(200, 190, 175, 0.42);
  --cv-bronze: #c9a961;
  --cv-bronze-light: #e8d5a0;
  --cv-bronze-dark: #8b6f3f;
  --cv-copper: #b87755;
  --cv-focus: var(--cv-bronze-light);

  position: relative;
  margin-top: var(--cv-footer-mt);
  background: linear-gradient(180deg, var(--cv-bg-2) 0%, var(--cv-bg) 100%);
  border-top: 1px solid var(--cv-border);
  color: var(--cv-text);
  overflow: hidden;
  isolation: isolate;
}

/* --- Фон --- */
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
    );
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
}

/* --- Контейнер --- */
.cv-footer__inner {
  position: relative;
  z-index: 1;
  max-width: var(--cv-footer-max-width);
  margin: 0 auto;
  padding: var(--cv-footer-pt) var(--cv-footer-px) var(--cv-footer-pb);
}

/* --- Строки-группы --- */
.cv-footer__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--cv-footer-gap);
  flex-wrap: wrap;
  min-width: 0;
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

/* --- Бренд --- */
.cv-footer__brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border-radius: 10px;
  transition: transform 0.25s ease, filter 0.25s ease;
  filter: drop-shadow(0 0 0 rgba(201, 169, 97, 0));
}
.cv-footer__brand:hover {
  transform: translateY(-1px);
  filter: drop-shadow(0 4px 20px rgba(201, 169, 97, 0.35));
}

/* --- Основная навигация --- */
.cv-footer__nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}
.cv-footer__nav-link {
  position: relative;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: var(--cv-footer-nav-size);
  font-weight: var(--cv-footer-link-weight);
  color: var(--cv-text-2);
  text-decoration: none;
  transition: color 0.2s ease, background 0.2s ease;
}
.cv-footer__nav-link:hover {
  color: var(--cv-bronze-light);
  background: rgba(201, 169, 97, 0.06);
}
.cv-footer__nav-link.router-link-active {
  color: var(--cv-bronze-light);
}

/* --- Контакты --- */
.cv-footer__contacts {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.cv-footer__contact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--cv-footer-link-size);
  font-weight: var(--cv-footer-link-weight);
  color: var(--cv-text-2);
  text-decoration: none;
  border-radius: 6px;
  transition: color 0.2s ease;
}
.cv-footer__contact:hover {
  color: var(--cv-bronze-light);
}
.cv-footer__contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--cv-bronze);
  opacity: 0.85;
  flex-shrink: 0;
}

/* --- Соцсети --- */
.cv-footer__socials {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
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
  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.25s ease;
}
.cv-footer__social:hover {
  color: #1a1208;
  background: linear-gradient(135deg, var(--cv-bronze-light), var(--cv-bronze));
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(201, 169, 97, 0.35);
}

/* --- Правовые ссылки --- */
.cv-footer__legal {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
}
.cv-footer__legal-link {
  position: relative;
  padding: 6px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: var(--cv-footer-link-size);
  font-weight: var(--cv-footer-link-weight);
  font-family: inherit;
  color: var(--cv-text-3);
  cursor: pointer;
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

/* --- Copyright --- */
.cv-footer__copyright {
  font-size: var(--cv-footer-small-size);
  font-weight: var(--cv-footer-link-weight);
  color: var(--cv-text-3);
  letter-spacing: 0.2px;
  white-space: nowrap;
}

/* ============================================================
   Единый focus-visible для всех интерактивных элементов
   ============================================================ */
.cv-footer__brand:focus-visible,
.cv-footer__nav-link:focus-visible,
.cv-footer__contact:focus-visible,
.cv-footer__social:focus-visible,
.cv-footer__legal-link:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
}

/* ============================================================
   Модалка правового документа
   ============================================================ */
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
  overscroll-behavior: contain;
}

.cv-legal__window {
  width: 100%;
  max-width: 760px;
  max-height: 88vh;
  max-height: 88dvh;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), transparent 30%),
    linear-gradient(180deg, #1a1a20 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 24px;
  box-shadow:
    0 40px 120px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(201, 169, 97, 0.08) inset,
    0 0 120px rgba(201, 169, 97, 0.1);
  overflow: hidden;
  min-width: 0;
}

.cv-legal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 30px 36px 24px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.16);
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.08), transparent);
  min-width: 0;
}

.cv-legal__title-block {
  min-width: 0;
}

.cv-legal__badge {
  display: inline-block;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #f0dda8;
  background: rgba(201, 169, 97, 0.14);
  border: 1px solid rgba(201, 169, 97, 0.4);
  margin-bottom: 14px;
}

.cv-legal__title {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px;
  letter-spacing: -0.4px;
  line-height: 1.25;
  text-shadow: 0 1px 20px rgba(201, 169, 97, 0.15);
  overflow-wrap: anywhere;
}

.cv-legal__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(240, 230, 210, 0.65);
  letter-spacing: 0.1px;
}

.cv-legal__dot {
  opacity: 0.5;
  color: var(--cv-bronze);
}

.cv-legal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(201, 169, 97, 0.2);
  background: rgba(201, 169, 97, 0.06);
  color: rgba(240, 230, 210, 0.75);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.cv-legal__close:hover {
  background: rgba(184, 119, 85, 0.2);
  color: #f0dda8;
  border-color: rgba(184, 119, 85, 0.5);
  transform: scale(1.05);
}
.cv-legal__close:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
}

.cv-legal__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 32px 40px 36px;
  scrollbar-width: thin;
  scrollbar-color: rgba(201, 169, 97, 0.35) transparent;
}
.cv-legal__body::-webkit-scrollbar {
  width: 8px;
}
.cv-legal__body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
.cv-legal__body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c9a961, #8b6f3f);
  border-radius: 4px;
}
.cv-legal__body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #e8d5a0, #c9a961);
}

.cv-legal__section {
  margin-bottom: 32px;
  max-width: 62ch;
}
.cv-legal__section:last-child {
  margin-bottom: 0;
}

.cv-legal__section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--cv-bronze-light);
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
  background: linear-gradient(180deg, var(--cv-bronze-light), var(--cv-bronze-dark));
}

.cv-legal__section-text {
  font-size: 14.5px;
  line-height: 1.75;
  color: rgba(245, 240, 230, 0.92);
  margin: 0;
  white-space: pre-line;
  letter-spacing: 0.05px;
  overflow-wrap: anywhere;
}

.cv-legal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 22px 40px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4), transparent);
  flex-wrap: wrap;
}

.cv-legal__footer-note {
  font-size: var(--cv-footer-link-size);
  font-weight: var(--cv-footer-link-weight);
  color: rgba(240, 230, 210, 0.65);
}
.cv-legal__footer-note a {
  color: var(--cv-bronze-light);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}
.cv-legal__footer-note a:hover {
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.cv-legal__footer-note a:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 2px;
  border-radius: 4px;
}

.cv-legal__btn {
  padding: 11px 28px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #e8d5a0 0%, #c9a961 55%, #8b6f3f 100%);
  color: #1a1208;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.2px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
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
.cv-legal__btn:focus-visible {
  outline: 2px solid var(--cv-focus);
  outline-offset: 3px;
}

/* --- Анимации модалки --- */
.cv-modal-enter-active,
.cv-modal-leave-active {
  transition: opacity 0.25s ease;
}
.cv-modal-enter-active .cv-legal__window,
.cv-modal-leave-active .cv-legal__window {
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.25s ease;
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

/* ============================================================
   Адаптив
   ============================================================ */

/* Планшет: контакты и соцсети — в столбик, право — тоже */
@media (max-width: 900px) {
  .cv-footer__row--contacts,
  .cv-footer__row--bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--cv-footer-gap-sm);
  }

  .cv-footer__copyright {
    white-space: normal;
  }
}

/* Мобилка: всё вертикально, ссылки — на всю ширину */
@media (max-width: 640px) {
  .cv-footer {
    --cv-footer-mt: 64px;
    --cv-footer-px: 20px;
    --cv-footer-pt: 32px;
    --cv-footer-pb: 24px;
    --cv-footer-gap: 16px;
  }

  .cv-footer__row--top {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .cv-footer__nav {
    width: 100%;
    gap: 0;
  }

  .cv-footer__nav-link {
    padding: 10px 12px;
  }

  .cv-footer__contacts {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
  }

  .cv-footer__socials {
    flex-wrap: wrap;
  }

  .cv-footer__legal {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
  }

  .cv-footer__legal-link {
    padding: 8px 0;
  }

  .cv-footer__legal-link::after {
    bottom: 4px;
    left: 0;
    transform: none;
    width: 0;
  }

  .cv-footer__legal-link:hover::after {
    width: 100%;
  }

  /* Модалка */
  .cv-legal {
    padding: 12px;
  }

  .cv-legal__header,
  .cv-legal__body,
  .cv-legal__footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .cv-legal__header {
    padding-top: 22px;
    padding-bottom: 18px;
  }

  .cv-legal__body {
    padding-top: 22px;
    padding-bottom: 24px;
  }

  .cv-legal__title {
    font-size: 21px;
  }

  .cv-legal__section-title {
    font-size: 15px;
  }

  .cv-legal__section-text {
    font-size: 14px;
  }

  .cv-legal__footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .cv-legal__btn {
    width: 100%;
  }
}

/* Узкая мобилка */
@media (max-width: 480px) {
  .cv-footer {
    --cv-footer-px: 16px;
  }

  .cv-footer__nav {
    flex-direction: column;
    align-items: stretch;
  }

  .cv-footer__nav-link {
    padding: 10px 8px;
  }

  .cv-legal__title {
    font-size: 19px;
  }

  .cv-legal__meta {
    font-size: 12px;
  }
}

/* ============================================================
   Уважение к системным настройкам
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .cv-footer__brand,
  .cv-footer__nav-link,
  .cv-footer__contact,
  .cv-footer__social,
  .cv-footer__legal-link,
  .cv-footer__legal-link::after,
  .cv-legal__close,
  .cv-legal__btn,
  .cv-modal-enter-active,
  .cv-modal-leave-active,
  .cv-modal-enter-active .cv-legal__window,
  .cv-modal-leave-active .cv-legal__window {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }

  .cv-footer__brand:hover,
  .cv-footer__social:hover,
  .cv-legal__close:hover,
  .cv-legal__btn:hover {
    transform: none;
  }
}
</style>