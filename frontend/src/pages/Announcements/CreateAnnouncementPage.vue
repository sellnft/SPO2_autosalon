<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementDraft } from '@/composables/useAnnouncementDraft'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import AnnouncementWizard from '@/components/announcements/wizard/AnnouncementWizard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const draftManager = useAnnouncementDraft()

const hasDraft = ref(false)
const draftStep = ref(1)

const kpiChips = [
  { icon: 'steps', text: '8 шагов' },
  { icon: 'clock', text: '~3 минуты' },
  { icon: 'save', text: 'Автосохранение' }
]

const tips = [
  'Фотографии автомобиля (экстерьер, салон, двигатель)',
  'VIN-номер из свидетельства о регистрации',
  'Информация о пробеге и состоянии',
  'Желаемая цена или диапазон'
]

const breadcrumbItems = [
  { label: 'Главная', to: '/' },
  { label: 'Мои объявления', to: '/profile/announcements' },
  { label: 'Новое объявление' }
]

function continueDraft() {
  // Логика продолжения черновика уже внутри визарда
  // (он сам подгружает из draftManager в onMounted)
  router.push({ path: '/announcements/create', query: { resume: '1' } })
}

function discardDraft() {
  draftManager.clearDraft()
  hasDraft.value = false
  draftStep.value = 1
}

onMounted(() => {
  const saved = draftManager.loadDraft?.()
  if (saved && Object.keys(saved).some(k => k !== '_step' && saved[k])) {
    hasDraft.value = true
    draftStep.value = saved._step || 1
  }
})
</script>

<template>
  <div class="cv-create">
    <div class="cv-create__bg" aria-hidden="true">
      <div class="cv-create__bg-orb cv-create__bg-orb--1"></div>
      <div class="cv-create__bg-orb cv-create__bg-orb--2"></div>
      <div class="cv-create__bg-grid"></div>
    </div>

    <div class="cv-create__container">
      <Breadcrumbs :items="breadcrumbItems" />

      <header class="cv-create__hero">
        <div class="cv-create__hero-glow" aria-hidden="true"></div>

        <div class="cv-create__hero-content">
          <span class="cv-create__eyebrow">
            <span class="cv-create__eyebrow-dot" aria-hidden="true"></span>
            Новое объявление
          </span>

          <h1 class="cv-create__title">Создайте объявление</h1>

          <p class="cv-create__subtitle">
            Опубликуйте автомобиль за 3 минуты.
            Первые просмотры появятся уже через час.
          </p>

          <div class="cv-create__chips">
            <span
              v-for="chip in kpiChips"
              :key="chip.text"
              class="cv-create__chip"
            >
              <span class="cv-create__chip-icon" aria-hidden="true">
                <svg v-if="chip.icon === 'steps'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18"/>
                </svg>
                <svg v-else-if="chip.icon === 'clock'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 7v5l3 2"/>
                </svg>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <path d="M17 21v-8H7v8M7 3v5h8"/>
                </svg>
              </span>
              {{ chip.text }}
            </span>
          </div>
        </div>

        <div v-if="hasDraft" class="cv-create__draft">
          <span class="cv-create__draft-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
          </span>

          <div class="cv-create__draft-content">
            <span class="cv-create__draft-title">Черновик сохранён</span>
            <span class="cv-create__draft-text">
              Вы остановились на шаге {{ draftStep }}
            </span>
          </div>

          <div class="cv-create__draft-actions">
            <button
              type="button"
              class="cv-create__draft-btn cv-create__draft-btn--primary"
              @click="continueDraft"
            >
              Продолжить
            </button>
            <button
              type="button"
              class="cv-create__draft-btn"
              @click="discardDraft"
            >
              Удалить
            </button>
          </div>
        </div>
      </header>

      <section class="cv-create__tips">
        <span class="cv-create__tips-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </span>

        <div class="cv-create__tips-content">
          <p class="cv-create__tips-title">Что стоит подготовить заранее</p>
          <ul class="cv-create__tips-list">
            <li v-for="tip in tips" :key="tip" class="cv-create__tip">
              <span class="cv-create__tip-icon" aria-hidden="true">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
              </span>
              {{ tip }}
            </li>
          </ul>
        </div>
      </section>

      <section class="cv-create__wizard">
        <AnnouncementWizard mode="create" />
      </section>

      <footer class="cv-create__footer">
        <p class="cv-create__help">
          Что-то не получается?
          <RouterLink to="/feedback" class="cv-create__help-link">
            Напишите в поддержку
          </RouterLink>
        </p>

        <RouterLink to="/profile/announcements" class="cv-create__back">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Вернуться к моим объявлениям
        </RouterLink>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.cv-create {
  position: relative;
  padding: 20px 0 60px;
  isolation: isolate;
}

.cv-create__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-create__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
}

.cv-create__bg-orb--1 {
  top: -10%;
  left: -5%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvCreateOrb 22s ease-in-out infinite;
}

.cv-create__bg-orb--2 {
  bottom: -20%;
  right: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.18), transparent 70%);
  animation: cvCreateOrb 26s ease-in-out infinite reverse;
}

@keyframes cvCreateOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-create__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  opacity: 0.5;
}

.cv-create__container {
  position: relative;
  z-index: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cv-create__hero {
  position: relative;
  padding: 28px 30px;
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
    0 0 80px rgba(201, 169, 97, 0.08);
}

.cv-create__hero::before {
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

.cv-create__hero-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-create__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
}

.cv-create__eyebrow {
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

.cv-create__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.9);
  animation: cvCreateDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvCreateDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-create__title {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
}

.cv-create__subtitle {
  margin: 0;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.7);
}

.cv-create__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.cv-create__chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
}

.cv-create__chip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-create__draft {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-left: 3px solid rgba(201, 169, 97, 0.7);
  flex-wrap: wrap;
}

.cv-create__draft-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.32);
}

.cv-create__draft-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-create__draft-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: #E8D5A0;
}

.cv-create__draft-text {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-create__draft-actions {
  display: inline-flex;
  gap: 8px;
  flex-shrink: 0;
}

.cv-create__draft-btn {
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-create__draft-btn:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-create__draft-btn--primary {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-create__draft-btn--primary:hover {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.6);
  transform: translateY(-1px);
}

.cv-create__tips {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-create__tips-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A0;
  flex-shrink: 0;
  margin-top: 2px;
}

.cv-create__tips-content {
  flex: 1;
  min-width: 0;
}

.cv-create__tips-title {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-create__tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-create__tip {
  display: inline-flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.7);
}

.cv-create__tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  box-shadow: 0 2px 6px rgba(122, 154, 106, 0.3);
  margin-top: 2px;
}

.cv-create__wizard {
  position: relative;
}

.cv-create__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-create__help {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-create__help-link {
  color: #E8D5A0;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.cv-create__help-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.cv-create__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.7);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 10px;
  transition: all 0.22s ease;
}

.cv-create__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateX(-2px);
}

@media (max-width: 1024px) {
  .cv-create__container { padding: 0 32px; }
  .cv-create__title { font-size: 28px; letter-spacing: -0.6px; }
}

@media (max-width: 768px) {
  .cv-create { padding: 12px 0 40px; }
  .cv-create__container { padding: 0 20px; gap: 18px; }

  .cv-create__hero { padding: 22px 20px; border-radius: 1.25rem; }
  .cv-create__title { font-size: 24px; letter-spacing: -0.4px; }
  .cv-create__subtitle { font-size: 13.5px; }

  .cv-create__draft { padding: 12px 14px; gap: 12px; }
  .cv-create__draft-actions { width: 100%; }
  .cv-create__draft-btn { flex: 1; justify-content: center; }

  .cv-create__tips { padding: 14px 16px; gap: 12px; }

  .cv-create__footer { flex-direction: column; align-items: stretch; }
  .cv-create__back { justify-content: center; }
}
</style>