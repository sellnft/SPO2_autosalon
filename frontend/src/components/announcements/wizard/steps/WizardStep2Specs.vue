<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  stepNumber: {
    type: Number,
    default: 2
  },
  totalSteps: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const engineTypes = [
  { value: 'Бензин', label: 'Бензин' },
  { value: 'Дизель', label: 'Дизель' },
  { value: 'Гибрид', label: 'Гибрид' },
  { value: 'Электро', label: 'Электро' }
]

const transmissions = [
  { value: 'Автомат', label: 'Автомат' },
  { value: 'Механика', label: 'Механика' },
  { value: 'Робот', label: 'Робот' },
  { value: 'Вариатор', label: 'Вариатор' }
]

const drives = [
  { value: 'Передний', label: 'Передний' },
  { value: 'Задний', label: 'Задний' },
  { value: 'Полный', label: 'Полный' }
]

const bodyTypes = [
  { value: 'Седан', label: 'Седан' },
  { value: 'Кроссовер', label: 'Кроссовер' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Хэтчбек', label: 'Хэтчбек' },
  { value: 'Лифтбек', label: 'Лифтбек' },
  { value: 'Универсал', label: 'Универсал' },
  { value: 'Купе', label: 'Купе' }
]

const colors = [
  { value: 'Черный', label: 'Черный', hex: '#1A1A1A' },
  { value: 'Белый', label: 'Белый', hex: '#F5F5F5' },
  { value: 'Серебристый', label: 'Серебристый', hex: '#C0C0C0' },
  { value: 'Серый', label: 'Серый', hex: '#808080' },
  { value: 'Синий', label: 'Синий', hex: '#1E3A8A' },
  { value: 'Красный', label: 'Красный', hex: '#991B1B' },
  { value: 'Зеленый', label: 'Зеленый', hex: '#166534' },
  { value: 'Коричневый', label: 'Коричневый', hex: '#78350F' },
  { value: 'Оранжевый', label: 'Оранжевый', hex: '#EA580C' },
  { value: 'Желтый', label: 'Желтый', hex: '#EAB308' },
  { value: 'Голубой', label: 'Голубой', hex: '#0EA5E9' },
  { value: 'Бежевый', label: 'Бежевый', hex: '#D6C7A8' }
]

const bodyTypeIcons = {
  'Седан': 'sedan',
  'Кроссовер': 'suv',
  'SUV': 'suv',
  'Хэтчбек': 'hatch',
  'Лифтбек': 'liftback',
  'Универсал': 'wagon',
  'Купе': 'coupe'
}

const requiredFields = ['mileage', 'engineType', 'transmission', 'drive', 'bodyType', 'color']

const filledCount = computed(() => {
  return requiredFields.reduce((acc, key) => acc + (props.modelValue[key] ? 1 : 0), 0)
})

const mileageValidation = computed(() => {
  const m = Number(props.modelValue.mileage)
  if (!m) return null
  if (m < 0) return 'invalid'
  if (m > 1000000) return 'high'
  if (m < 10000) return 'low'
  if (m > 300000) return 'high'
  return 'ok'
})

const yearFromContext = computed(() => Number(props.modelValue.year) || new Date().getFullYear())

const mileagePerYear = computed(() => {
  const m = Number(props.modelValue.mileage)
  const age = new Date().getFullYear() - yearFromContext.value
  if (!m || age <= 0) return null
  return Math.round(m / age)
})

const engineVolumes = computed(() => {
  if (props.modelValue.engineType === 'Электро') return []
  if (props.modelValue.engineType === 'Гибрид') {
    return [
      { value: '1.5', label: '1.5 л' },
      { value: '1.8', label: '1.8 л' },
      { value: '2.0', label: '2.0 л' },
      { value: '2.5', label: '2.5 л' }
    ]
  }
  return [
    { value: '1.0', label: '1.0 л' },
    { value: '1.2', label: '1.2 л' },
    { value: '1.4', label: '1.4 л' },
    { value: '1.6', label: '1.6 л' },
    { value: '1.8', label: '1.8 л' },
    { value: '2.0', label: '2.0 л' },
    { value: '2.5', label: '2.5 л' },
    { value: '3.0', label: '3.0 л' },
    { value: '3.5', label: '3.5 л' },
    { value: '4.0', label: '4.0 л' },
    { value: '5.0', label: '5.0 л' }
  ]
})

const powerHint = computed(() => {
  const p = Number(props.modelValue.power)
  if (!p) return null
  if (p < 100) return 'Компактный городской'
  if (p < 200) return 'Оптимальная мощность'
  if (p < 350) return 'Спортивный'
  return 'Высокопроизводительный'
})

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function setColor(value) {
  update('color', props.modelValue.color === value ? '' : value)
}
</script>

<template>
  <section class="cv-step">
    <header class="cv-step__header">
      <div class="cv-step__header-left">
        <span class="cv-step__badge">
          <span class="cv-step__badge-label">Шаг</span>
          <span class="cv-step__badge-value">{{ stepNumber }}/{{ totalSteps }}</span>
        </span>

        <div class="cv-step__heading">
          <h2 class="cv-step__title">
            <span class="cv-step__title-dot" aria-hidden="true"></span>
            Характеристики
          </h2>
          <p class="cv-step__subtitle">Технические параметры автомобиля</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ filledCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">{{ requiredFields.length }}</span>
      </span>
    </header>

    <div class="cv-step__grid">
      <div class="cv-step__field cv-step__field--full">
        <BaseInput
          :model-value="modelValue.mileage"
          label="Пробег"
          type="number"
          placeholder="50 000"
          :error="errors.mileage"
          required
          @update:model-value="update('mileage', $event)"
        />

        <div class="cv-step__mileage-footer">
          <p v-if="mileageValidation === 'ok'" class="cv-step__hint cv-step__hint--ok">
            <span class="cv-step__hint-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            Стандартный пробег
          </p>

          <p v-else-if="mileageValidation === 'low'" class="cv-step__hint cv-step__hint--accent">
            <span class="cv-step__hint-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
              </svg>
            </span>
            Малый пробег — привлекательно для покупателей
          </p>

          <p v-else-if="mileageValidation === 'high'" class="cv-step__hint cv-step__hint--warn">
            <span class="cv-step__hint-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 8v5M12 17h.01"/>
              </svg>
            </span>
            Большой пробег — укажите достоверно
          </p>

          <p v-else-if="mileageValidation === 'invalid'" class="cv-step__hint cv-step__hint--error">
            <span class="cv-step__hint-icon" aria-hidden="true">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8v5M12 17h.01"/>
                <circle cx="12" cy="12" r="9"/>
              </svg>
            </span>
            Пробег не может быть отрицательным
          </p>

          <p v-else class="cv-step__hint">
            Укажите реальный пробег — это влияет на доверие покупателей
          </p>

          <span v-if="mileagePerYear" class="cv-step__stat">
            <span class="cv-step__stat-label">≈</span>
            <span class="cv-step__stat-value">{{ mileagePerYear.toLocaleString('ru-RU') }} км/год</span>
          </span>
        </div>
      </div>

      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.engineType"
          :options="engineTypes"
          label="Тип двигателя"
          placeholder="Выберите"
          :error="errors.engineType"
          required
          @update:model-value="update('engineType', $event)"
        />
      </div>

      <div v-if="modelValue.engineType !== 'Электро'" class="cv-step__field">
        <BaseSelect
          v-if="engineVolumes.length"
          :model-value="modelValue.engineVolume"
          :options="engineVolumes"
          label="Объём двигателя"
          placeholder="Выберите объём"
          searchable
          clearable
          @update:model-value="update('engineVolume', $event)"
        />
      </div>

      <div v-else class="cv-step__field">
        <div class="cv-step__electric-note">
          <span class="cv-step__electric-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
            </svg>
          </span>
          <span class="cv-step__electric-text">
            Электромобиль — объём двигателя не требуется
          </span>
        </div>
      </div>

      <div class="cv-step__field">
        <BaseInput
          :model-value="modelValue.power"
          label="Мощность"
          type="number"
          placeholder="200"
          @update:model-value="update('power', $event)"
        />

        <p v-if="powerHint" class="cv-step__hint cv-step__hint--accent">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
            </svg>
          </span>
          {{ powerHint }}
        </p>
      </div>

      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.transmission"
          :options="transmissions"
          label="КПП"
          placeholder="Выберите"
          :error="errors.transmission"
          required
          @update:model-value="update('transmission', $event)"
        />
      </div>

      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.drive"
          :options="drives"
          label="Привод"
          placeholder="Выберите"
          :error="errors.drive"
          required
          @update:model-value="update('drive', $event)"
        />
      </div>

      <div class="cv-step__field cv-step__field--full">
        <label class="cv-step__label">
          Кузов <span class="cv-step__required">*</span>
        </label>

        <div class="cv-step__body-types">
          <button
            v-for="type in bodyTypes"
            :key="type.value"
            type="button"
            class="cv-step__body-type"
            :class="{ 'cv-step__body-type--active': modelValue.bodyType === type.value }"
            @click="update('bodyType', type.value)"
          >
            <span class="cv-step__body-icon" aria-hidden="true">
              <svg v-if="type.value === 'Седан'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l3-5h12l3 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.value === 'Кроссовер' || type.value === 'SUV'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l2.5-6h13L21 14"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.value === 'Хэтчбек'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l2-5h14v5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.value === 'Универсал'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14V9h13l5 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.value === 'Купе'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M4 14l4-5h8l4 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l3-5h12l3 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
            </span>
            <span class="cv-step__body-label">{{ type.label }}</span>
            <span v-if="modelValue.bodyType === type.value" class="cv-step__body-check" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6.5L4.5 9L10 3"/>
              </svg>
            </span>
          </button>
        </div>

        <p v-if="errors.bodyType" class="cv-step__hint cv-step__hint--error">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v5M12 17h.01"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </span>
          {{ errors.bodyType }}
        </p>
      </div>

      <div class="cv-step__field cv-step__field--full">
        <label class="cv-step__label">
          Цвет <span class="cv-step__required">*</span>
        </label>

        <div class="cv-step__colors">
          <button
            v-for="color in colors"
            :key="color.value"
            type="button"
            class="cv-step__color"
            :class="{ 'cv-step__color--active': modelValue.color === color.value }"
            :style="{ '--color-swatch': color.hex }"
            :aria-label="color.label"
            :title="color.label"
            @click="setColor(color.value)"
          >
            <span class="cv-step__color-swatch" aria-hidden="true"></span>
            <span class="cv-step__color-label">{{ color.label }}</span>
            <span v-if="modelValue.color === color.value" class="cv-step__color-check" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6.5L4.5 9L10 3"/>
              </svg>
            </span>
          </button>
        </div>

        <p v-if="errors.color" class="cv-step__hint cv-step__hint--error">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v5M12 17h.01"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </span>
          {{ errors.color }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cv-step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 24px 26px 26px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.22) 50%,
    transparent
  );
  pointer-events: none;
  border-radius: inherit inherit 0 0;
}

.cv-step__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-step__header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.cv-step__badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 54px;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.35),
    0 0 0 1px rgba(255, 245, 214, 0.12) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  flex-shrink: 0;
}

.cv-step__badge-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(26, 18, 8, 0.65);
  line-height: 1;
}

.cv-step__badge-value {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #1A1208;
  line-height: 1;
}

.cv-step__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-step__title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-step__title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-step__subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.55);
}

.cv-step__progress {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.22);
  flex-shrink: 0;
}

.cv-step__progress-value {
  font-size: 15px;
  font-weight: 800;
  color: #E8D5A0;
  letter-spacing: -0.2px;
}

.cv-step__progress-sep {
  font-size: 12px;
  color: rgba(200, 190, 175, 0.4);
}

.cv-step__progress-total {
  font-size: 12px;
  font-weight: 700;
  color: rgba(220, 210, 195, 0.6);
}

.cv-step__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px 22px;
}

.cv-step__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cv-step__field--full {
  grid-column: 1 / -1;
}

.cv-step__label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-step__required {
  color: #E8A88A;
  font-weight: 700;
  margin-left: 2px;
}

.cv-step__hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
  line-height: 1.4;
}

.cv-step__hint-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
}

.cv-step__hint--ok {
  color: #B8CEA8;
}

.cv-step__hint--ok .cv-step__hint-icon {
  color: #B8CEA8;
}

.cv-step__hint--accent {
  color: #E8D5A0;
}

.cv-step__hint--accent .cv-step__hint-icon {
  color: #E8D5A0;
}

.cv-step__hint--warn {
  color: #F0C080;
}

.cv-step__hint--warn .cv-step__hint-icon {
  color: #F0C080;
}

.cv-step__hint--error {
  color: #E8A88A;
}

.cv-step__hint--error .cv-step__hint-icon {
  color: #E8A88A;
}

.cv-step__mileage-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-step__stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(201, 169, 97, 0.08);
  border: 1px solid rgba(201, 169, 97, 0.22);
  white-space: nowrap;
}

.cv-step__stat-label {
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__stat-value {
  font-size: 11.5px;
  font-weight: 700;
  color: #E8D5A0;
  letter-spacing: 0.1px;
}

.cv-step__electric-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px dashed rgba(201, 169, 97, 0.28);
}

.cv-step__electric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A0;
  flex-shrink: 0;
}

.cv-step__electric-text {
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.7);
}

.cv-step__body-types {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.cv-step__body-type {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 10px 10px;
  font-family: inherit;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-step__body-type::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-step__body-type:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.35);
  transform: translateY(-1px);
}

.cv-step__body-type:hover::before {
  opacity: 0.6;
}

.cv-step__body-type--active {
  color: #F5E6BC;
  border-color: rgba(232, 213, 160, 0.55);
  background: linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6));
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 8px 20px rgba(201, 169, 97, 0.2);
  transform: translateY(-1px);
}

.cv-step__body-type--active::before {
  opacity: 1;
}

.cv-step__body-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-step__body-type:hover .cv-step__body-icon {
  transform: scale(1.08);
}

.cv-step__body-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.cv-step__body-check {
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.cv-step__body-type--active .cv-step__body-check {
  opacity: 1;
  transform: scale(1);
}

.cv-step__colors {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.cv-step__color {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 8px;
  font-family: inherit;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-step__color:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.35);
  transform: translateY(-1px);
}

.cv-step__color--active {
  color: #F5E6BC;
  border-color: rgba(232, 213, 160, 0.55);
  background: linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6));
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 8px 20px rgba(201, 169, 97, 0.2);
  transform: translateY(-1px);
}

.cv-step__color-swatch {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-swatch, #808080);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12) inset,
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-step__color:hover .cv-step__color-swatch {
  transform: scale(1.06);
}

.cv-step__color-label {
  font-size: 10.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.cv-step__color-check {
  position: absolute;
  top: 5px;
  right: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.cv-step__color--active .cv-step__color-check {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 900px) {
  .cv-step__body-types {
    grid-template-columns: repeat(3, 1fr);
  }

  .cv-step__colors {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 640px) {
  .cv-step {
    padding: 20px 18px 22px;
    gap: 18px;
    border-radius: 1rem;
  }

  .cv-step__header {
    padding-bottom: 14px;
  }

  .cv-step__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .cv-step__badge {
    min-width: 48px;
    padding: 7px 10px;
    border-radius: 10px;
  }

  .cv-step__badge-value {
    font-size: 14px;
  }

  .cv-step__title {
    font-size: 16px;
  }

  .cv-step__body-types {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .cv-step__body-type {
    padding: 10px 8px 8px;
  }

  .cv-step__body-label {
    font-size: 10.5px;
  }

  .cv-step__colors {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .cv-step__color {
    padding: 8px 6px;
  }

  .cv-step__color-swatch {
    width: 24px;
    height: 24px;
  }

  .cv-step__color-label {
    font-size: 10px;
  }
}
</style>