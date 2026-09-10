<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useToastStore } from '@/stores/toast'
import { useAnnouncementDraft } from '@/composables/useAnnouncementDraft'
import BaseButton from '@/components/common/BaseButton.vue'
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

const steps = [
  { id: 1, title: 'Основное', component: WizardStep1Basic },
  { id: 2, title: 'Характеристики', component: WizardStep2Specs },
  { id: 3, title: 'Состояние', component: WizardStep3Condition },
  { id: 4, title: 'Цена', component: WizardStep4Price },
  { id: 5, title: 'Местоположение', component: WizardStep5Location },
  { id: 6, title: 'Фото', component: WizardStep6Photos },
  { id: 7, title: 'Описание', component: WizardStep7Description },
  { id: 8, title: 'Публикация', component: WizardStep8Preview }
]

const totalSteps = steps.length

const form = reactive({
  // Step 1
  brand: '',
  model: '',
  year: '',
  vin: '',
  
  // Step 2
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
  
  // Step 3
  condition: 'Хорошее',
  hasAccidents: false,
  serviceHistory: false,
  
  // Step 4
  price: '',
  negotiable: false,
  
  // Step 5
  city: '',
  
  // Step 6
  photos: [],
  
  // Step 7
  description: ''
})

const currentStepComponent = computed(() => steps[currentStep.value - 1].component)
const currentStepTitle = computed(() => steps[currentStep.value - 1].title)
const progress = computed(() => (currentStep.value / totalSteps) * 100)

const isFirstStep = computed(() => currentStep.value === 1)
const isLastStep = computed(() => currentStep.value === totalSteps)

// Autosave on form change
watch(form, (newVal) => {
  if (props.mode === 'create') {
    draftManager.autoSave({ ...newVal, _step: currentStep.value })
  }
}, { deep: true })

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
    if (!form.mileage) errors.value.mileage = 'Введите пробег'
    if (!form.engineType) errors.value.engineType = 'Выберите тип двигателя'
    if (!form.transmission) errors.value.transmission = 'Выберите КПП'
    if (!form.drive) errors.value.drive = 'Выберите привод'
    if (!form.bodyType) errors.value.bodyType = 'Выберите кузов'
    if (!form.color) errors.value.color = 'Выберите цвет'
  }
  
  if (step === 4) {
    if (!form.price) errors.value.price = 'Введите цену'
    else if (form.price <= 0) errors.value.price = 'Некорректная цена'
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
  if (step <= currentStep.value) {
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
      if (announcement[key] !== undefined) {
        form[key] = announcement[key]
      }
    })
  } catch (err) {
    toastStore.error('Не удалось загрузить объявление')
    router.push('/profile/announcements')
  } finally {
    loading.value = false
  }
}

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
    }
  }
})
</script>

<template>
  <div class="wizard">
    <!-- Progress -->
    <div class="wizard__progress">
      <div class="wizard__progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Steps -->
    <div class="wizard__steps">
      <button
        v-for="step in steps"
        :key="step.id"
        :class="[
          'wizard__step',
          {
            'wizard__step--active': step.id === currentStep,
            'wizard__step--done': step.id < currentStep,
            'wizard__step--disabled': step.id > currentStep
          }
        ]"
        :disabled="step.id > currentStep"
        @click="goToStep(step.id)"
      >
        <span class="wizard__step-number">
          <svg v-if="step.id < currentStep" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span v-else>{{ step.id }}</span>
        </span>
        <span class="wizard__step-title">{{ step.title }}</span>
      </button>
    </div>

    <!-- Content -->
    <div v-if="loading" class="wizard__loading">
      Загрузка...
    </div>

    <form v-else class="wizard__content" @submit.prevent="isLastStep ? handlePublish() : nextStep()">
      <h2 class="wizard__title">{{ currentStepTitle }}</h2>

      <component
        :is="currentStepComponent"
        v-model="form"
        :errors="errors"
      />

      <!-- Actions -->
      <div class="wizard__actions">
        <BaseButton
          v-if="!isFirstStep"
          type="button"
          variant="ghost"
          @click="prevStep"
        >
          Назад
        </BaseButton>
        <div v-else></div>

        <BaseButton
          v-if="!isLastStep"
          type="submit"
          size="lg"
        >
          Далее
        </BaseButton>
        <BaseButton
          v-else
          type="submit"
          size="lg"
          :loading="saving"
        >
          {{ mode === 'edit' ? 'Сохранить' : 'Опубликовать' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.wizard {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 0 40px;
}

.wizard__progress {
  height: 3px;
  background: #E5E7EB;
  border-radius: 2px;
  margin-bottom: 32px;
  overflow: hidden;
}

.wizard__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0A84FF, #0066CC);
  transition: width 0.3s ease;
}

.wizard__steps {
  display: flex;
  gap: 4px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.wizard__step {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 100px;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.wizard__step--active {
  color: white;
  background: #0A84FF;
  border-color: #0A84FF;
}

.wizard__step--done {
  color: #065f46;
  background: #D1FAE5;
  border-color: #D1FAE5;
}

.wizard__step--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wizard__step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
}

.wizard__step--active .wizard__step-number {
  background: rgba(255, 255, 255, 0.2);
}

.wizard__step--done .wizard__step-number {
  background: rgba(6, 95, 70, 0.1);
}

.wizard__loading {
  padding: 60px 0;
  text-align: center;
  color: #6B7280;
}

.wizard__content {
  padding: 32px;
  background: white;
  border-radius: 16px;
}

.wizard__title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.wizard__actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #F3F4F6;
}

@media (max-width: 640px) {
  .wizard__content {
    padding: 20px;
  }

  .wizard__title {
    font-size: 20px;
  }

  .wizard__actions {
    flex-direction: column-reverse;
  }

  .wizard__actions > * {
    width: 100%;
  }
}
</style>