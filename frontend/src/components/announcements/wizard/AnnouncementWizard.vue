<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useToastStore } from '@/stores/toast'
import { useAnnouncementDraft } from '@/composables/useAnnouncementDraft'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import WizardStep1Basic from './steps/WizardStep1Basic.vue'
import WizardStep2Specs from './steps/WizardStep2Specs.vue'
import WizardStep3Condition from './steps/WizardStep3Condition.vue'
import WizardStep4Price from './steps/WizardStep4Price.vue'
import WizardStep5Location from './steps/WizardStep5Location.vue'
import WizardStep6Photos from './steps/WizardStep6Photos.vue'
import WizardStep7Description from './steps/WizardStep7Description.vue'
import WizardStep8Preview from './steps/WizardStep8Preview.vue'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    default: null
  },
  mode: {
    type: String,
    default: 'create',
    validator: (v) => ['create', 'edit'].includes(v)
  }
})

const router = useRouter()
const announcementsStore = useAnnouncementsStore()
const toastStore = useToastStore()
const draftManager = useAnnouncementDraft()

const currentStep = ref(1)
const saving = ref(false)
const loading = ref(false)
const errors = ref({})
const showExitConfirm = ref(false)
const lastSavedAt = ref(null)
const pendingRoute = ref(null)
const isDirty = ref(false)

const steps = [
  { id: 1, title: 'Основное', icon: 'info', component: WizardStep1Basic },
  { id: 2, title: 'Характеристики', icon: 'specs', component: WizardStep2Specs },
  { id: 3, title: 'Состояние', icon: 'condition', component: WizardStep3Condition },
  { id: 4, title: 'Цена', icon: 'price', component: WizardStep4Price },
  { id: 5, title: 'Локация', icon: 'pin', component: WizardStep5Location },
  { id: 6, title: 'Фото', icon: 'photo', component: WizardStep6Photos },
  { id: 7, title: 'Описание', icon: 'text', component: WizardStep7Description },
  { id: 8, title: 'Публикация', icon: 'check', component: WizardStep8Preview }
]

const totalSteps = steps.length

const form = reactive({
  brand: '',
  model: '',
  year: '',
  vin: '',
  mileage: '',
  engineType: '',
  engineVolume: '',
  power: '',
  transmission: '',
  drive: '',
  bodyType: '',
  color: '',
  steeringWheel: 'Левый',
  owners: '',
  country: '',
  condition: 'Хорошее',
  hasAccidents: false,
  serviceHistory: false,
  price: '',
  negotiable: false,
  city: '',
  photos: [],
  description: ''
})

const currentStepComponent = computed(() => steps[currentStep.value - 1].component)
const currentStepTitle = computed(() => steps[currentStep.value - 1].title)
const progress = computed(() => ((currentStep.value - 1) / (totalSteps - 1)) * 100)

const isFirstStep = computed(() => currentStep.value === 1)
const isLastStep = computed(() => currentStep.value === totalSteps)

const stepStates = computed(() =>
  steps.map(s => ({
    ...s,
    state: s.id === currentStep.value
      ? 'active'
      : s.id < currentStep.value
      ? 'done'
      : 'pending'
  }))
)

const saveLabel = computed(() => {
  if (!lastSavedAt.value) return null
  const seconds = Math.floor((Date.now() - lastSavedAt.value) / 1000)
  if (seconds < 5) return 'только что'
  if (seconds < 60) return `${seconds} сек. назад`
  const minutes = Math.floor(seconds / 60)
  return `${minutes} мин. назад`
})

const dirtyText = computed(() => {
  return isDirty.value ? 'Есть несохранённые изменения' : 'Все изменения сохранены'
})

let autosaveTimeout = null
let saveLabelInterval = null

watch(form, () => {
  if (props.mode !== 'create') return
  isDirty.value = true
  if (autosaveTimeout) clearTimeout(autosaveTimeout)
  autosaveTimeout = setTimeout(() => {
    draftManager.autoSave({ ...form, _step: currentStep.value })
    lastSavedAt.value = Date.now()
    isDirty.value = false
  }, 1200)
}, { deep: true })

watch(currentStep, () => {
  if (props.mode !== 'create') return
  draftManager.autoSave({ ...form, _step: currentStep.value })
  lastSavedAt.value = Date.now()
})

function onFormUpdate(newForm) {
  Object.assign(form, newForm)
}

function validateStep(step) {
  errors.value = {}

  if (step === 1) {
    if (!form.brand) errors.value.brand = 'Выберите марку'
    if (!form.model) errors.value.model = 'Введите модель'
    if (!form.year) errors.value.year = 'Введите год'
    else if (form.year < 1950 || form.year > new Date().getFullYear() + 1) {
      errors.value.year = 'Некорректный год'
    }
  }

  if (step === 2) {
    if (!form.mileage && form.mileage !== 0) errors.value.mileage = 'Введите пробег'
    if (!form.engineType) errors.value.engineType = 'Выберите тип двигателя'
    if (!form.transmission) errors.value.transmission = 'Выберите КПП'
    if (!form.drive) errors.value.drive = 'Выберите привод'
    if (!form.bodyType) errors.value.bodyType = 'Выберите кузов'
    if (!form.color) errors.value.color = 'Выберите цвет'
  }

  if (step === 4) {
    if (!form.price) errors.value.price = 'Введите цену'
    else if (Number(form.price) <= 0) errors.value.price = 'Некорректная цена'
  }

  if (step === 5) {
    if (!form.city) errors.value.city = 'Введите город'
  }

  if (step === 6) {
    if (!form.photos.length) errors.value.photos = 'Добавьте хотя бы одно фото'
  }

  if (step === 7) {
    if (!form.description) errors.value.description = 'Добавьте описание'
    else if (form.description.length < 30) {
      errors.value.description = 'Минимум 30 символов'
    }
  }

  return Object.keys(errors.value).length === 0
}

function nextStep() {
  if (!validateStep(currentStep.value)) {
    toastStore.error('Заполните обязательные поля')
    return
  }
  if (!isLastStep.value) {
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function prevStep() {
  if (!isFirstStep.value) {
    currentStep.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goToStep(step) {
  if (step < currentStep.value) {
    currentStep.value = step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function handlePublish() {
  if (!validateStep(currentStep.value)) {
    toastStore.error('Заполните обязательные поля')
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form,
      year: Number(form.year),
      mileage: Number(form.mileage),
      price: Number(form.price),
      engineVolume: Number(form.engineVolume) || 0,
      power: Number(form.power) || 0,
      owners: Number(form.owners) || 1,
      title: `${form.brand} ${form.model}`,
      sellerId: 1,
      sellerName: 'Вы',
      sellerType: 'Частное лицо'
    }

    let result
    if (props.mode === 'edit' && props.announcementId) {
      result = await announcementsStore.updateAnnouncement(props.announcementId, payload)
      toastStore.success('Объявление обновлено')
    } else {
      result = await announcementsStore.createAnnouncement(payload)
      draftManager.clearDraft()
      toastStore.success('Объявление создано и отправлено на модерацию')
    }

    isDirty.value = false
    router.push(`/announcements/${result.id}`)
  } catch (err) {
    toastStore.error(err.message || 'Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

async function loadForEdit() {
  if (!props.announcementId) return

  loading.value = true
  try {
    const announcement = await announcementsStore.fetchAnnouncement(props.announcementId)

    Object.keys(form).forEach(key => {
      if (announcement[key] !== undefined && key !== 'photos') {
        form[key] = announcement[key]
      }
    })

    if (Array.isArray(announcement.photos)) {
      form.photos = announcement.photos.map((photo, index) => {
        if (typeof photo === 'string') {
          return {
            id: `photo-${index}-${Date.now()}`,
            url: photo,
            name: `photo-${index + 1}.jpg`,
            main: index === 0
          }
        }
        return photo
      })
    }
  } catch (err) {
    toastStore.error('Не удалось загрузить объявление')
    router.push('/profile/announcements')
  } finally {
    loading.value = false
  }
}

function confirmExit() {
  showExitConfirm.value = false
  if (pendingRoute.value) {
    isDirty.value = false
    router.push(pendingRoute.value)
  }
}

function cancelExit() {
  showExitConfirm.value = false
  pendingRoute.value = null
}

function clearDraft() {
  draftManager.clearDraft()
  toastStore.success('Черновик удалён')
  isDirty.value = false
}

onBeforeRouteLeave((to, from, next) => {
  if (props.mode === 'edit' || !isDirty.value) {
    next()
    return
  }
  pendingRoute.value = to.fullPath
  showExitConfirm.value = true
  next(false)
})

onMounted(() => {
  if (props.mode === 'edit') {
    loadForEdit()
  } else {
    const saved = draftManager.loadDraft()
    if (saved) {
      Object.keys(form).forEach(key => {
        if (saved[key] !== undefined) form[key] = saved[key]
      })
      if (saved._step) currentStep.value = saved._step
      toastStore.info('Черновик восстановлен')
    }
    lastSavedAt.value = null
  }

  saveLabelInterval = setInterval(() => {
    if (lastSavedAt.value) lastSavedAt.value = lastSavedAt.value
  }, 30000)
})

onUnmounted(() => {
  if (autosaveTimeout) clearTimeout(autosaveTimeout)
  if (saveLabelInterval) clearInterval(saveLabelInterval)
})
</script>

<template>
  <div class="cv-wizard">
    <header class="cv-wizard__header">
      <div class="cv-wizard__header-left">
        <div class="cv-wizard__heading">
          <span class="cv-wizard__eyebrow">
            {{ mode === 'edit' ? 'Редактирование' : 'Новое объявление' }}
          </span>
          <h1 class="cv-wizard__main-title">
            {{ mode === 'edit' ? 'Обновление объявления' : 'Разместите объявление' }}
          </h1>
        </div>

        <div class="cv-wizard__meta">
          <span
            class="cv-wizard__save-status"
            :class="{ 'cv-wizard__save-status--dirty': isDirty }"
          >
            <span class="cv-wizard__save-dot" aria-hidden="true"></span>
            <span class="cv-wizard__save-text">
              <template v-if="isDirty">Есть изменения…</template>
              <template v-else-if="saveLabel">Сохранено {{ saveLabel }}</template>
              <template v-else>Автосохранение включено</template>
            </span>
          </span>

          <button
            v-if="mode === 'create' && saveLabel"
            type="button"
            class="cv-wizard__clear-draft"
            @click="clearDraft"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Черновик
          </button>
        </div>
      </div>

      <div class="cv-wizard__progress-card">
        <span class="cv-wizard__progress-step">{{ currentStep }}</span>
        <span class="cv-wizard__progress-sep">/</span>
        <span class="cv-wizard__progress-total">{{ totalSteps }}</span>
        <span class="cv-wizard__progress-label">шаг</span>
      </div>
    </header>

    <div class="cv-wizard__progress">
      <span
        class="cv-wizard__progress-bar"
        :style="{ width: `${progress}%` }"
      ></span>
    </div>

    <nav class="cv-wizard__steps" aria-label="Шаги публикации">
      <button
        v-for="step in stepStates"
        :key="step.id"
        type="button"
        :class="['cv-wizard__step', `cv-wizard__step--${step.state}`]"
        :disabled="step.state === 'pending'"
        @click="goToStep(step.id)"
      >
        <span class="cv-wizard__step-number">
          <svg v-if="step.state === 'done'" width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7l3 3 5-6"/>
          </svg>
          <span v-else>{{ step.id }}</span>
        </span>
        <span class="cv-wizard__step-title">{{ step.title }}</span>
      </button>
    </nav>

    <div v-if="loading" class="cv-wizard__loading">
      <span class="spinner spinner-lg"></span>
      <p class="cv-wizard__loading-text">Загружаем объявление...</p>
    </div>

    <form v-else class="cv-wizard__form" @submit.prevent="isLastStep ? handlePublish() : nextStep()">
      <component
        :is="currentStepComponent"
        :model-value="form"
        :errors="errors"
        :step-number="currentStep"
        :total-steps="totalSteps"
        @update:model-value="onFormUpdate"
      />

      <footer class="cv-wizard__actions">
        <BaseButton
          v-if="!isFirstStep"
          type="button"
          variant="ghost"
          size="lg"
          @click="prevStep"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Назад
        </BaseButton>
        <div v-else class="cv-wizard__actions-spacer"></div>

        <BaseButton
          v-if="!isLastStep"
          type="submit"
          size="lg"
        >
          Далее
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 6l6 6-6 6"/>
          </svg>
        </BaseButton>

        <BaseButton
          v-else
          type="submit"
          size="lg"
          :loading="saving"
        >
          <svg v-if="!saving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          {{ mode === 'edit' ? 'Сохранить изменения' : 'Опубликовать' }}
        </BaseButton>
      </footer>
    </form>

    <ConfirmModal
      v-model="showExitConfirm"
      title="Выйти без сохранения?"
      message="У вас есть несохранённые изменения в форме. Они сохранятся в черновик, но объявление не будет опубликовано."
      confirm-text="Выйти"
      cancel-text="Остаться"
      variant="warning"
      icon="warning"
      @confirm="confirmExit"
      @cancel="cancelExit"
    />
  </div>
</template>

<style scoped>
.cv-wizard {
  position: relative;
  max-width: 860px;
  margin: 0 auto;
  padding: 0 0 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cv-wizard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 22px 26px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4) 0%, rgba(15, 13, 10, 0.5) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 1.25rem;
  box-shadow:
    0 6px 28px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.cv-wizard__header::before {
  content: '';
  position: absolute;
  top: -60%;
  left: -10%;
  width: 320px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.18), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.cv-wizard__header-left {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.cv-wizard__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cv-wizard__eyebrow {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-wizard__main-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.95);
}

.cv-wizard__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-wizard__save-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.12), rgba(122, 154, 106, 0.03));
  border: 1px solid rgba(122, 154, 106, 0.32);
  transition: all 0.25s ease;
}

.cv-wizard__save-status--dirty {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.03));
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-wizard__save-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvWizardPulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvWizardPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-wizard__save-text {
  white-space: nowrap;
}

.cv-wizard__clear-draft {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.08);
  border: 1px solid rgba(184, 119, 85, 0.28);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-wizard__clear-draft:hover {
  background: rgba(184, 119, 85, 0.18);
  border-color: rgba(184, 119, 85, 0.48);
  transform: translateY(-1px);
}

.cv-wizard__clear-draft:active {
  transform: translateY(0) scale(0.96);
}

.cv-wizard__progress-card {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 12px 18px;
  border-radius: 14px;
  background:
    linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  box-shadow:
    0 8px 24px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.12) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
  flex-shrink: 0;
}

.cv-wizard__progress-step {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
  color: #1A1208;
}

.cv-wizard__progress-sep {
  font-size: 16px;
  font-weight: 800;
  color: rgba(26, 18, 8, 0.4);
  margin: 0 1px;
}

.cv-wizard__progress-total {
  font-size: 16px;
  font-weight: 800;
  color: rgba(26, 18, 8, 0.65);
  line-height: 1;
}

.cv-wizard__progress-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(26, 18, 8, 0.55);
  margin-left: 6px;
  align-self: center;
}

.cv-wizard__progress {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.cv-wizard__progress-bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8B6F3F, #C9A961, #E8D5A0);
  transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 16px rgba(201, 169, 97, 0.5);
  position: relative;
}

.cv-wizard__progress-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 245, 214, 0.35) 50%,
    transparent 100%
  );
  animation: cvWizardShimmer 2.4s ease-in-out infinite;
}

@keyframes cvWizardShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-wizard__steps {
  display: flex;
  gap: 6px;
  padding: 4px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.12);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cv-wizard__steps::-webkit-scrollbar {
  display: none;
}

.cv-wizard__step {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.55);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-wizard__step:hover:not(:disabled) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-wizard__step--pending {
  opacity: 0.45;
  cursor: not-allowed;
}

.cv-wizard__step--done {
  color: #B8CEA8;
}

.cv-wizard__step--done:hover {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.1);
}

.cv-wizard__step--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.12) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
  transform: translateY(-1px);
}

.cv-wizard__step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: rgba(220, 210, 195, 0.6);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-wizard__step--done .cv-wizard__step-number {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  border-color: rgba(184, 206, 168, 0.5);
  box-shadow: 0 2px 8px rgba(122, 154, 106, 0.35);
}

.cv-wizard__step--active .cv-wizard__step-number {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.55);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-wizard__step-title {
  position: relative;
  z-index: 1;
}

.cv-wizard__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 24px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
}

.cv-wizard__loading-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-wizard__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-wizard__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
  position: relative;
  overflow: hidden;
}

.cv-wizard__actions::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.2) 50%,
    transparent
  );
  pointer-events: none;
}

.cv-wizard__actions-spacer {
  flex: 1;
}

.cv-wizard__actions :deep(.cv-btn) {
  min-width: 140px;
}

@media (max-width: 768px) {
  .cv-wizard {
    padding: 0 0 28px;
    gap: 14px;
  }

  .cv-wizard__header {
    padding: 18px 20px;
  }

  .cv-wizard__main-title {
    font-size: 19px;
  }

  .cv-wizard__progress-card {
    padding: 10px 14px;
  }

  .cv-wizard__progress-step {
    font-size: 22px;
  }

  .cv-wizard__progress-total {
    font-size: 14px;
  }

  .cv-wizard__steps {
    padding: 3px;
  }

  .cv-wizard__step {
    padding: 7px 12px;
    font-size: 11.5px;
  }

  .cv-wizard__step-title {
    display: none;
  }

  .cv-wizard__step--active .cv-wizard__step-title,
  .cv-wizard__step--done:hover .cv-wizard__step-title {
    display: inline;
  }

  .cv-wizard__actions {
    padding: 16px 18px;
    flex-direction: column-reverse;
  }

  .cv-wizard__actions :deep(.cv-btn) {
    width: 100%;
    min-width: 0;
  }

  .cv-wizard__actions-spacer {
    display: none;
  }
}

@media (max-width: 480px) {
  .cv-wizard__save-text {
    font-size: 10.5px;
  }

  .cv-wizard__clear-draft {
    font-size: 10px;
    padding: 4px 8px;
  }

  .cv-wizard__meta {
    gap: 6px;
  }
}
</style>