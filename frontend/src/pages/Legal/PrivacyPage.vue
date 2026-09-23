<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

defineOptions({ name: 'PrivacyPage' })

const router = useRouter()

const sections = [
  {
    id: 'intro',
    title: '1. Общие сведения',
    paragraphs: [
      'Настоящая Политика конфиденциальности описывает, какие данные собирает платформа CarVibe (далее — «Платформа») и как они используются и защищаются.',
      'Используя Платформу, вы соглашаетесь с условиями настоящей Политики.'
    ]
  },
  {
    id: 'collected',
    title: '2. Какие данные мы собираем',
    paragraphs: [
      'Персональные данные: имя, email, телефон, город — при регистрации и заполнении профиля.',
      'Данные об использовании: IP-адрес, тип устройства, браузер, страницы просмотра, действия на Платформе.',
      'Данные объявлений: фотографии, описания, цена, VIN и прочая информация об автомобиле, которую вы публикуете самостоятельно.'
    ]
  },
  {
    id: 'usage',
    title: '3. Как мы используем данные',
    paragraphs: [
      'Для предоставления доступа к функционалу Платформы и персонализации опыта.',
      'Для связи с вами: уведомления о статусах объявлений, ответы поддержки, важные изменения сервиса.',
      'Для улучшения Платформы: анализ поведения, поиск ошибок, предотвращение мошенничества.'
    ]
  },
  {
    id: 'sharing',
    title: '4. Передача данных третьим лицам',
    paragraphs: [
      'Мы не продаём ваши персональные данные.',
      'Передача возможна только: по требованию закона, для защиты прав Платформы, с вашего явного согласия.'
    ]
  },
  {
    id: 'cookies',
    title: '5. Cookies и аналитика',
    paragraphs: [
      'Платформа использует cookies для аутентификации, сохранения настроек и аналитики.',
      'Вы можете отключить cookies в браузере, но это может ограничить функциональность.'
    ]
  },
  {
    id: 'rights',
    title: '6. Ваши права',
    paragraphs: [
      'Вы вправе запросить доступ к своим персональным данным, их исправление или удаление.',
      'Для реализации прав напишите в поддержку через соответствующий раздел Платформы.'
    ]
  },
  {
    id: 'security',
    title: '7. Безопасность',
    paragraphs: [
      'Мы применяем современные методы шифрования, ограничение доступа и мониторинг подозрительной активности.',
      'Тем не менее ни один метод передачи данных через интернет не даёт 100% гарантии безопасности.'
    ]
  }
]

const activeSection = ref('intro')
const lastUpdated = computed(() => '1 января 2026 года')

function scrollTo(id) {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="cv-legal">
    <button class="cv-legal__back" type="button" @click="router.back()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Назад
    </button>

    <header class="cv-legal__header">
      <span class="cv-legal__eyebrow">
        <span class="cv-legal__eyebrow-dot" aria-hidden="true"></span>
        Правовая информация
      </span>
      <h1 class="cv-legal__title">Политика конфиденциальности</h1>
      <p class="cv-legal__meta">
        Последнее обновление: <strong>{{ lastUpdated }}</strong>
      </p>
    </header>

    <div class="cv-legal__layout">
      <aside class="cv-legal__toc">
        <p class="cv-legal__toc-label">Содержание</p>
        <nav class="cv-legal__toc-list">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="cv-legal__toc-item"
            :class="{ 'cv-legal__toc-item--active': activeSection === s.id }"
            @click="scrollTo(s.id)"
          >
            {{ s.title }}
          </button>
        </nav>
      </aside>

      <article class="cv-legal__content">
        <section
          v-for="s in sections"
          :id="s.id"
          :key="s.id"
          class="cv-legal__section"
        >
          <h2 class="cv-legal__section-title">{{ s.title }}</h2>
          <p
            v-for="(p, i) in s.paragraphs"
            :key="i"
            class="cv-legal__paragraph"
          >
            {{ p }}
          </p>
        </section>

        <footer class="cv-legal__footer">
          <p class="cv-legal__footer-text">
            Если у вас есть вопросы о том, как мы обрабатываем данные, напишите нам.
          </p>
          <BaseButton @click="router.push('/feedback')">
            Связаться с поддержкой
          </BaseButton>
        </footer>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* Стили идентичны TermsPage — можно вынести в общий .cv-legal класс
   или импортировать как общий CSS-модуль. Ниже — те же правила. */
.cv-legal {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-legal__back {
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

.cv-legal__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateX(-2px);
}

.cv-legal__header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-legal__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-legal__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
}

.cv-legal__title {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.7px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-legal__meta {
  margin: 0;
  font-size: 13px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-legal__meta strong { color: #E8D5A0; font-weight: 700; }

.cv-legal__layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 40px;
  align-items: flex-start;
}

.cv-legal__toc {
  position: sticky;
  top: 100px;
  padding: 20px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
}

.cv-legal__toc-label {
  margin: 0 0 14px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-legal__toc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-legal__toc-item {
  padding: 8px 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  text-align: left;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  line-height: 1.4;
}

.cv-legal__toc-item:hover { color: #E8D5A0; background: rgba(201, 169, 97, 0.06); }
.cv-legal__toc-item--active {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.28);
}

.cv-legal__content {
  display: flex;
  flex-direction: column;
  gap: 36px;
  min-width: 0;
}

.cv-legal__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 100px;
}

.cv-legal__section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: -0.2px;
  color: rgba(245, 240, 230, 0.98);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-legal__paragraph {
  margin: 0;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.75;
  color: rgba(220, 210, 195, 0.78);
}

.cv-legal__footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
  border-radius: 1rem;
  background: rgba(201, 169, 97, 0.04);
  border: 1px solid rgba(201, 169, 97, 0.18);
}

.cv-legal__footer-text {
  margin: 0;
  font-size: 13.5px;
  color: rgba(220, 210, 195, 0.7);
}

@media (max-width: 900px) {
  .cv-legal__layout { grid-template-columns: 1fr; gap: 24px; }
  .cv-legal__toc { position: static; }
  .cv-legal__title { font-size: 26px; }
}

@media (max-width: 768px) {
  .cv-legal { padding: 24px 20px 60px; }
  .cv-legal__paragraph { font-size: 14px; }
}
</style>