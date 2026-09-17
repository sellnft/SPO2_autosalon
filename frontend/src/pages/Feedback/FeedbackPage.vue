<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFeedbackStore } from '@/stores/feedback'
import FeedbackList from '@/components/feedback/FeedbackList.vue'
import FeedbackForm from '@/components/feedback/FeedbackForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const feedbackStore = useFeedbackStore()

const showCreateModal = ref(false)
const initialCategory = ref('')
const expandedFaq = ref(null)

const quickTopics = [
  { id: 'payment', label: 'Оплата', icon: 'money', description: 'Проблемы с оплатой, возврат' },
  { id: 'account', label: 'Доступ', icon: 'lock', description: 'Вход, пароль, восстановление' },
  { id: 'moderation', label: 'Объявление', icon: 'car', description: 'Модерация, статус' },
  { id: 'technical', label: 'Техническая', icon: 'wrench', description: 'Ошибки, баги' },
  { id: 'suggestion', label: 'Предложение', icon: 'star', description: 'Идеи и улучшения' },
  { id: 'other', label: 'Другое', icon: 'info', description: 'Не нашли ответа' }
]

const faqItems = [
  {
    id: 'password',
    question: 'Как изменить пароль?',
    answer: 'Перейдите в Профиль → Безопасность → Смена пароля. Введите текущий пароль, новый (минимум 8 символов с цифрами и буквами) и подтверждение. После сохранения пароль обновится мгновенно.',
    icon: 'lock'
  },
  {
    id: 'delete-announcement',
    question: 'Как снять объявление с публикации?',
    answer: 'Откройте Профиль → Мои объявления. Найдите нужное объявление и нажмите «Изменить» → «Снять с публикации». Объявление останется в архиве и его можно вернуть в любой момент.',
    icon: 'car'
  },
  {
    id: 'scam',
    question: 'Что делать при подозрении на мошенника?',
    answer: 'Нажмите «Пожаловаться» на объявлении или напишите в чат с продавцом. Наша служба безопасности проверит пользователя в течение 2 часов. Никогда не переводите деньги без осмотра автомобиля.',
    icon: 'shield'
  },
  {
    id: 'refund',
    question: 'Как получить возврат средств?',
    answer: 'Возврат возможен в течение 14 дней, если услуга не была активирована. Создайте обращение в категории «Оплата и сделки» с номером транзакции — рассмотрим в течение 3 рабочих дней.',
    icon: 'money'
  },
  {
    id: 'moderation-time',
    question: 'Сколько длится модерация объявления?',
    answer: 'Обычно модерация занимает до 30 минут. В часы пик (с 18:00 до 21:00) — до 2 часов. Мы отправим уведомление, когда объявление будет опубликовано.',
    icon: 'clock'
  }
]

const stats = computed(() => [
  {
    key: 'total',
    label: 'Всего обращений',
    value: feedbackStore.feedback.length,
    icon: 'list',
    accent: 'accent',
    filter: 'all'
  },
  {
    key: 'open',
    label: 'Активных',
    value: feedbackStore.openCount || 0,
    icon: 'clock',
    accent: 'warning',
    filter: 'open'
  },
  {
    key: 'unread',
    label: 'Непрочитанных',
    value: feedbackStore.unreadCount || 0,
    icon: 'bell',
    accent: 'danger',
    filter: 'unread'
  }
])

const contacts = [
  {
    id: 'phone',
    label: 'Телефон',
    value: '8 (800) 123-45-67',
    hint: 'Ежедневно с 9:00 до 21:00',
    href: 'tel:+78001234567',
    icon: 'phone',
    accent: 'accent'
  },
  {
    id: 'email',
    label: 'Email',
    value: 'support@carvibe.ru',
    hint: 'Ответим в течение 24 часов',
    href: 'mailto:support@carvibe.ru',
    icon: 'mail',
    accent: 'info'
  },
  {
    id: 'telegram',
    label: 'Telegram',
    value: '@carvibe_support',
    hint: 'Быстрая поддержка в чате',
    href: 'https://t.me/carvibe_support',
    icon: 'telegram',
    accent: 'success'
  }
]

function openCreateModal(category = '') {
  initialCategory.value = category
  showCreateModal.value = true
}

function handleSuccess(feedback) {
  showCreateModal.value = false
  router.push(`/feedback/${feedback.id}`)
}

function toggleFaq(id) {
  expandedFaq.value = expandedFaq.value === id ? null : id
}

onMounted(() => {
  feedbackStore.fetchFeedback()
})
</script>

<template>
  <div class="cv-fb">
    <div class="cv-fb__container">
      <Breadcrumbs />

      <section class="cv-fb__hero">
        <div class="cv-fb__hero-bg" aria-hidden="true">
          <div class="cv-fb__hero-orb cv-fb__hero-orb--1"></div>
          <div class="cv-fb__hero-orb cv-fb__hero-orb--2"></div>
          <div class="cv-fb__hero-carbon"></div>
        </div>

        <div class="cv-fb__hero-content">
          <span class="cv-fb__eyebrow">
            <span class="cv-fb__eyebrow-dot" aria-hidden="true"></span>
            Поддержка 24/7
          </span>

          <h1 class="cv-fb__title">Служба поддержки</h1>

          <p class="cv-fb__subtitle">
            Поможем с любым вопросом — от технических проблем
            до предложений по улучшению платформы
          </p>

          <div class="cv-fb__status">
            <span class="cv-fb__status-dot" aria-hidden="true"></span>
            Все системы работают
          </div>

          <div class="cv-fb__hero-actions">
            <BaseButton size="lg" @click="openCreateModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Создать обращение
            </BaseButton>

            <a href="tel:+78001234567" class="cv-fb__hero-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z"/>
              </svg>
              Позвонить
            </a>
          </div>
        </div>
      </section>

      <section class="cv-fb__stats">
        <div
          v-for="stat in stats"
          :key="stat.key"
          class="cv-fb__stat"
          :data-accent="stat.accent"
        >
          <span class="cv-fb__stat-icon" aria-hidden="true">
            <svg v-if="stat.icon === 'list'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            <svg v-else-if="stat.icon === 'clock'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </span>

          <div class="cv-fb__stat-content">
            <span class="cv-fb__stat-value">{{ stat.value }}</span>
            <span class="cv-fb__stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section class="cv-fb__contacts">
        <a
          v-for="contact in contacts"
          :key="contact.id"
          :href="contact.href"
          target="_blank"
          rel="noopener noreferrer"
          class="cv-fb__contact"
          :data-accent="contact.accent"
        >
          <span class="cv-fb__contact-icon" aria-hidden="true">
            <svg v-if="contact.icon === 'phone'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z"/>
            </svg>
            <svg v-else-if="contact.icon === 'mail'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="M3 7l9 6 9-6"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 3L3 10l7 3 3 7 8-17z"/>
            </svg>
          </span>

          <div class="cv-fb__contact-content">
            <span class="cv-fb__contact-label">{{ contact.label }}</span>
            <span class="cv-fb__contact-value">{{ contact.value }}</span>
            <span class="cv-fb__contact-hint">{{ contact.hint }}</span>
          </div>

          <span class="cv-fb__contact-arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </span>
        </a>
      </section>

      <section class="cv-fb__topics">
        <header class="cv-fb__section-head">
          <div class="cv-fb__section-head-left">
            <span class="cv-fb__section-eyebrow">
              <span class="cv-fb__section-dot" aria-hidden="true"></span>
              Быстрые темы
            </span>
            <h2 class="cv-fb__section-title">С чем помочь?</h2>
          </div>
        </header>

        <div class="cv-fb__topics-grid">
          <button
            v-for="topic in quickTopics"
            :key="topic.id"
            type="button"
            class="cv-fb__topic"
            @click="openCreateModal(topic.id)"
          >
            <span class="cv-fb__topic-icon" aria-hidden="true">
              <svg v-if="topic.icon === 'money'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <circle cx="12" cy="12" r="2.5"/>
              </svg>
              <svg v-else-if="topic.icon === 'lock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              <svg v-else-if="topic.icon === 'car'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
              </svg>
              <svg v-else-if="topic.icon === 'wrench'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"/>
              </svg>
              <svg v-else-if="topic.icon === 'star'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v5M12 17h.01"/>
              </svg>
            </span>

            <div class="cv-fb__topic-content">
              <span class="cv-fb__topic-label">{{ topic.label }}</span>
              <span class="cv-fb__topic-desc">{{ topic.description }}</span>
            </div>

            <span class="cv-fb__topic-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </span>
          </button>
        </div>
      </section>

      <section class="cv-fb__faq">
        <header class="cv-fb__section-head">
          <div class="cv-fb__section-head-left">
            <span class="cv-fb__section-eyebrow">
              <span class="cv-fb__section-dot cv-fb__section-dot--olive" aria-hidden="true"></span>
              Частые вопросы
            </span>
            <h2 class="cv-fb__section-title">Возможно, ответ уже есть</h2>
          </div>
        </header>

        <div class="cv-fb__faq-list">
          <button
            v-for="item in faqItems"
            :key="item.id"
            type="button"
            class="cv-fb__faq-item"
            :class="{ 'cv-fb__faq-item--open': expandedFaq === item.id }"
            @click="toggleFaq(item.id)"
          >
            <div class="cv-fb__faq-header">
              <span class="cv-fb__faq-icon" aria-hidden="true">
                <svg v-if="item.icon === 'lock'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="10" width="16" height="11" rx="2"/>
                  <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                </svg>
                <svg v-else-if="item.icon === 'car'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 13l1.7-4.5A2 2 0 0 1 8.6 7h6.8a2 2 0 0 1 1.9 1.5L19 13"/>
                  <path d="M4 13h16v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z"/>
                </svg>
                <svg v-else-if="item.icon === 'shield'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                </svg>
                <svg v-else-if="item.icon === 'money'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="6" width="18" height="12" rx="2"/>
                  <circle cx="12" cy="12" r="2.5"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
              </span>

              <span class="cv-fb__faq-question">{{ item.question }}</span>

              <span class="cv-fb__faq-chevron" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              </span>
            </div>

            <Transition name="cv-fb-faq">
              <div v-if="expandedFaq === item.id" class="cv-fb__faq-body">
                <p class="cv-fb__faq-answer">{{ item.answer }}</p>

                <button
                  type="button"
                  class="cv-fb__faq-cta"
                  @click.stop="openCreateModal()"
                >
                  Не помогло — создать обращение
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 4l4 4-4 4"/>
                  </svg>
                </button>
              </div>
            </Transition>
          </button>
        </div>
      </section>

      <section class="cv-fb__list">
        <header class="cv-fb__section-head">
          <div class="cv-fb__section-head-left">
            <span class="cv-fb__section-eyebrow">
              <span class="cv-fb__section-dot" aria-hidden="true"></span>
              Мои обращения
            </span>
            <h2 class="cv-fb__section-title">История обращений</h2>
          </div>

          <BaseButton
            v-if="feedbackStore.feedback.length"
            variant="ghost"
            size="sm"
            @click="openCreateModal()"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Новое обращение
          </BaseButton>
        </header>

        <FeedbackList @create="openCreateModal()" />
      </section>
    </div>

    <BaseModal
      v-model="showCreateModal"
      title="Новое обращение"
      subtitle="Опишите проблему — ответим в течение 2 часов"
      size="lg"
    >
      <FeedbackForm
        :initial-category="initialCategory"
        @success="handleSuccess"
        @cancel="showCreateModal = false"
      />
    </BaseModal>
  </div>
</template>

<style scoped>
.cv-fb {
  position: relative;
  padding: 20px 0 60px;
}

.cv-fb__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.cv-fb__hero {
  position: relative;
  padding: 36px 38px;
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 100px rgba(201, 169, 97, 0.1);
}

.cv-fb__hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-fb__hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
}

.cv-fb__hero-orb--1 {
  top: -40%;
  right: -10%;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.32), transparent 70%);
  animation: cvFbOrb 20s ease-in-out infinite;
}

.cv-fb__hero-orb--2 {
  bottom: -50%;
  left: -5%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
  animation: cvFbOrb 24s ease-in-out infinite reverse;
}

@keyframes cvFbOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.08); }
}

.cv-fb__hero-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 20%, transparent 85%);
}

.cv-fb__hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.32) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}

.cv-fb__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 640px;
}

.cv-fb__eyebrow {
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
  color: rgba(232, 213, 160, 0.95);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(201, 169, 97, 0.05));
  border: 1px solid rgba(201, 169, 97, 0.35);
}

.cv-fb__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.9);
  animation: cvFbDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvFbDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-fb__title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
}

.cv-fb__subtitle {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.7);
}

.cv-fb__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.1);
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-fb__status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #B8CEA8;
  box-shadow: 0 0 10px #B8CEA8;
  animation: cvFbDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

.cv-fb__hero-actions {
  display: inline-flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.cv-fb__hero-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.8);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.22);
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-fb__hero-link:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
}

.cv-fb__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-fb__stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-fb__stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-fb__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-fb__stat[data-accent="accent"] .cv-fb__stat-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-fb__stat[data-accent="warning"] .cv-fb__stat-icon {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-fb__stat[data-accent="danger"] .cv-fb__stat-icon {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-fb__stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-fb__stat-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-fb__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-fb__contacts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-fb__contact {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.16);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-fb__contact:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-3px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 32px rgba(201, 169, 97, 0.15);
}

.cv-fb__contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
  transition: transform 0.3s ease;
}

.cv-fb__contact[data-accent="accent"] .cv-fb__contact-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-fb__contact[data-accent="info"] .cv-fb__contact-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-fb__contact[data-accent="success"] .cv-fb__contact-icon {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-fb__contact:hover .cv-fb__contact-icon {
  transform: scale(1.06);
}

.cv-fb__contact-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-fb__contact-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

.cv-fb__contact-value {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-fb__contact-hint {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-fb__contact-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-fb__contact:hover .cv-fb__contact-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
}

.cv-fb__section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.cv-fb__section-head-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-fb__section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-fb__section-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvFbDot 2.2s ease-in-out infinite;
}

.cv-fb__section-dot--olive {
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  box-shadow: 0 0 10px rgba(122, 154, 106, 0.8);
}

.cv-fb__section-title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}

.cv-fb__topics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.cv-fb__topic {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-fb__topic:hover {
  background: rgba(201, 169, 97, 0.06);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.cv-fb__topic-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 11px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
  transition: all 0.25s ease;
}

.cv-fb__topic:hover .cv-fb__topic-icon {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(232, 213, 160, 0.5);
  transform: scale(1.05);
}

.cv-fb__topic-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-fb__topic-label {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-fb__topic-desc {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cv-fb__topic-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(200, 190, 175, 0.35);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-fb__topic:hover .cv-fb__topic-arrow {
  color: #E8D5A0;
  transform: translateX(3px);
}

.cv-fb__faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-fb__faq-item {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  isolation: isolate;
}

.cv-fb__faq-item:hover {
  border-color: rgba(201, 169, 97, 0.35);
}

.cv-fb__faq-item--open {
  border-color: rgba(201, 169, 97, 0.42);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 32px rgba(201, 169, 97, 0.1);
}

.cv-fb__faq-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  width: 100%;
}

.cv-fb__faq-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.25);
}

.cv-fb__faq-question {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.4;
  color: rgba(245, 240, 230, 0.95);
}

.cv-fb__faq-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  color: rgba(201, 169, 97, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-fb__faq-item--open .cv-fb__faq-chevron {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.3);
  transform: rotate(180deg);
}

.cv-fb__faq-body {
  padding: 0 20px 18px 68px;
  overflow: hidden;
}

.cv-fb__faq-answer {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.75);
}

.cv-fb__faq-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-fb__faq-cta svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-fb__faq-cta:hover {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-fb__faq-cta:hover svg {
  transform: translateX(3px);
}

.cv-fb-faq-enter-active,
.cv-fb-faq-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-fb-faq-enter-from,
.cv-fb-faq-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.cv-fb-faq-enter-to,
.cv-fb-faq-leave-from {
  opacity: 1;
  max-height: 300px;
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .cv-fb__container { padding: 0 32px; gap: 24px; }
  .cv-fb__topics-grid { grid-template-columns: repeat(2, 1fr); }
  .cv-fb__contacts { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .cv-fb { padding: 12px 0 40px; }
  .cv-fb__container { padding: 0 20px; gap: 20px; }

  .cv-fb__hero { padding: 26px 22px; border-radius: 1.25rem; }
  .cv-fb__title { font-size: 26px; letter-spacing: -0.5px; }
  .cv-fb__subtitle { font-size: 13.5px; }
  .cv-fb__hero-actions { flex-direction: column; width: 100%; }
  .cv-fb__hero-actions > * { width: 100%; justify-content: center; }

  .cv-fb__stats { grid-template-columns: 1fr; gap: 10px; }
  .cv-fb__stat { padding: 16px 18px; }
  .cv-fb__stat-icon { width: 40px; height: 40px; }
  .cv-fb__stat-value { font-size: 22px; }

  .cv-fb__section-title { font-size: 20px; letter-spacing: -0.3px; }

  .cv-fb__topics-grid { grid-template-columns: 1fr; gap: 10px; }
  .cv-fb__topic { padding: 14px 16px; gap: 12px; }
  .cv-fb__topic-icon { width: 36px; height: 36px; }

  .cv-fb__faq-header { padding: 14px 16px; gap: 12px; }
  .cv-fb__faq-icon { width: 30px; height: 30px; }
  .cv-fb__faq-question { font-size: 13px; }
  .cv-fb__faq-body { padding: 0 16px 16px 16px; }
  .cv-fb__faq-answer { font-size: 12.5px; }

  .cv-fb__contact { padding: 14px 16px; gap: 12px; }
  .cv-fb__contact-icon { width: 40px; height: 40px; }
  .cv-fb__contact-value { font-size: 13.5px; }
}
</style>