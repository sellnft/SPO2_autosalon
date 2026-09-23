<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

defineOptions({ name: 'TermsPage' })

const router = useRouter()

const sections = [
  {
    id: 'general',
    title: '1. Общие положения',
    paragraphs: [
      'Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между администрацией платформы CarVibe (далее — «Платформа») и любым лицом, использующим сервис (далее — «Пользователь»).',
      'Использование Платформы означает полное и безоговорочное согласие Пользователя с условиями настоящего Соглашения. Если Пользователь не согласен с условиями — он обязан прекратить использование Платформы.'
    ]
  },
  {
    id: 'registration',
    title: '2. Регистрация и аккаунт',
    paragraphs: [
      'Для доступа к полному функционалу Платформы Пользователь проходит процедуру регистрации, указывая достоверные данные.',
      'Пользователь несёт ответственность за сохранность своих учётных данных и за все действия, совершённые под его аккаунтом.',
      'Администрация вправе заблокировать аккаунт при нарушении условий Соглашения без предварительного уведомления.'
    ]
  },
  {
    id: 'content',
    title: '3. Размещаемый контент',
    paragraphs: [
      'Пользователь обязуется размещать только достоверную информацию об автомобилях и сделках.',
      'Запрещается размещение контента, нарушающего законодательство РФ, права третьих лиц, содержащего вредоносный код или рекламу без согласования.',
      'Администрация оставляет за собой право удалять любой контент без объяснения причин.'
    ]
  },
  {
    id: 'transactions',
    title: '4. Сделки между пользователями',
    paragraphs: [
      'Платформа является посредником для размещения объявлений и не участвует в сделках между Пользователями напрямую.',
      'Ответственность за качество, законность и юридическую чистоту автомобиля несёт продавец.',
      'Платформа рекомендует использовать сервисы безопасной сделки и проверки истории.'
    ]
  },
  {
    id: 'liability',
    title: '5. Ограничение ответственности',
    paragraphs: [
      'Платформа предоставляется «как есть». Администрация не гарантирует бесперебойную работу и не несёт ответственности за возможные убытки.',
      'Администрация не отвечает за действия третьих лиц, в том числе за мошеннические действия со стороны других Пользователей.'
    ]
  },
  {
    id: 'changes',
    title: '6. Изменение условий',
    paragraphs: [
      'Администрация вправе изменять условия Соглашения в одностороннем порядке. Изменения вступают в силу с момента публикации на этой странице.',
      'Продолжение использования Платформы после публикации изменений означает согласие Пользователя с новой редакцией.'
    ]
  }
]

const activeSection = ref('general')

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
      <h1 class="cv-legal__title">Пользовательское соглашение</h1>
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
            По вопросам, связанным с настоящим Соглашением, обращайтесь в службу поддержки.
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

.cv-legal__meta strong {
  color: #E8D5A0;
  font-weight: 700;
}

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

.cv-legal__toc-item:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.06);
}

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