<script setup>
import { computed, ref, watch } from 'vue'
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
    default: 1
  },
  totalSteps: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const currentYear = new Date().getFullYear()
const minYear = 1990

const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' },
  { value: 'Mazda', label: 'Mazda' },
  { value: 'Skoda', label: 'Skoda' },
  { value: 'Volvo', label: 'Volvo' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'Renault', label: 'Renault' },
  { value: 'Subaru', label: 'Subaru' },
  { value: 'Land Rover', label: 'Land Rover' },
  { value: 'Jaguar', label: 'Jaguar' },
  { value: 'Mini', label: 'Mini' },
  { value: 'Chery', label: 'Chery' },
  { value: 'Haval', label: 'Haval' },
  { value: 'Geely', label: 'Geely' },
  { value: 'Exeed', label: 'Exeed' }
]

const popularModels = {
  BMW: ['X5', 'X3', 'X6', '3 series', '5 series', '7 series', 'M5'],
  'Mercedes-Benz': ['E-Class', 'S-Class', 'GLC', 'GLE', 'C-Class', 'G-Class'],
  Toyota: ['Camry', 'Corolla', 'Land Cruiser', 'RAV4', 'Highlander'],
  Audi: ['A4', 'A6', 'Q5', 'Q7', 'Q8', 'RS6'],
  Volkswagen: ['Tiguan', 'Polo', 'Passat', 'Touareg', 'Golf'],
  Kia: ['Rio', 'Sportage', 'Sorento', 'K5', 'Carnival'],
  Hyundai: ['Solaris', 'Creta', 'Tucson', 'Santa Fe', 'Palisade'],
  Lexus: ['RX', 'NX', 'LX', 'ES', 'GX'],
  Mazda: ['CX-5', 'CX-9', 'Mazda6', 'Mazda3'],
  Skoda: ['Octavia', 'Kodiaq', 'Superb', 'Karoq'],
  Volvo: ['XC60', 'XC90', 'S60', 'V90'],
  Nissan: ['X-Trail', 'Qashqai', 'Murano', 'Patrol'],
  Porsche: ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan'],
  Renault: ['Duster', 'Logan', 'Sandero', 'Arkana'],
  Subaru: ['Forester', 'Outback', 'XV', 'Impreza'],
  'Land Rover': ['Range Rover', 'Discovery', 'Defender', 'Evoque'],
  Jaguar: ['F-Pace', 'XE', 'XF'],
  Mini: ['Cooper', 'Countryman', 'Clubman'],
  Chery: ['Tiggo 4', 'Tiggo 7 Pro', 'Tiggo 8'],
  Haval: ['Jolion', 'H6', 'Dargo', 'F7'],
  Geely: ['Coolray', 'Tugella', 'Atlas Pro', 'Monjaro'],
  Exeed: ['TXL', 'VX', 'LX']
}

const vinInput = ref(null)

const modelSuggestions = computed(() => {
  if (!props.modelValue.brand) return []
  return popularModels[props.modelValue.brand] || []
})

const yearValidation = computed(() => {
  const y = Number(props.modelValue.year)
  if (!y) return null
  if (y < minYear || y > currentYear) return 'invalid'
  if (y >= currentYear - 1) return 'recent'
  return 'valid'
})

const vinValidation = computed(() => {
  const vin = (props.modelValue.vin || '').trim()
  if (!vin) return null
  if (vin.length !== 17) return 'incomplete'
  if (/[IOQ]/i.test(vin)) return 'invalid'
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return 'invalid'
  return 'valid'
})

const filledCount = computed(() => {
  const fields = ['brand', 'model', 'year', 'vin']
  return fields.reduce((acc, key) => acc + (props.modelValue[key] ? 1 : 0), 0)
})

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function applyModelSuggestion(model) {
  update('model', model)
}

function copyVin() {
  const vin = props.modelValue.vin
  if (!vin) return
  navigator.clipboard.writeText(vin)
}

function clearVin() {
  update('vin', '')
}

watch(() => props.modelValue.brand, (newBrand, oldBrand) => {
  if (oldBrand && newBrand !== oldBrand && props.modelValue.model) {
    const suggestions = popularModels[newBrand] || []
    if (!suggestions.includes(props.modelValue.model)) {
      update('model', '')
    }
  }
})
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
            Основное
          </h2>
          <p class="cv-step__subtitle">Марка, модель, год и VIN автомобиля</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ filledCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">4</span>
      </span>
    </header>

    <div class="cv-step__grid">
      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.brand"
          :options="brands"
          label="Марка"
          placeholder="Выберите марку"
          :error="errors.brand"
          searchable
          clearable
          required
          @update:model-value="update('brand', $event)"
        />

        <p v-if="modelValue.brand" class="cv-step__hint">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
            </svg>
          </span>
          {{ brands.length }} марок в каталоге CarVibe
        </p>
      </div>

      <div class="cv-step__field">
        <BaseInput
          :model-value="modelValue.model"
          label="Модель"
          placeholder="X5, Camry, etc."
          :error="errors.model"
          clearable
          required
          @update:model-value="update('model', $event)"
        />

        <div v-if="modelSuggestions.length && !modelValue.model" class="cv-step__suggestions">
          <span class="cv-step__suggestions-label">Популярные:</span>
          <button
            v-for="m in modelSuggestions.slice(0, 4)"
            :key="m"
            type="button"
            class="cv-step__chip"
            @click="applyModelSuggestion(m)"
          >
            {{ m }}
          </button>
        </div>
      </div>

      <div class="cv-step__field">
        <BaseInput
          :model-value="modelValue.year"
          label="Год выпуска"
          type="number"
          placeholder="2022"
          :min="minYear"
          :max="currentYear"
          :error="errors.year"
          required
          @update:model-value="update('year', $event)"
        />

        <p v-if="yearValidation === 'valid'" class="cv-step__hint cv-step__hint--ok">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
          </span>
          Актуальный год
        </p>

        <p v-else-if="yearValidation === 'recent'" class="cv-step__hint cv-step__hint--accent">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
          </span>
          Свежий автомобиль
        </p>

        <p v-else-if="yearValidation === 'invalid'" class="cv-step__hint cv-step__hint--error">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v5M12 17h.01"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </span>
          Год должен быть от {{ minYear }} до {{ currentYear }}
        </p>

        <p v-else class="cv-step__hint">
          Например: {{ currentYear - 2 }} или {{ currentYear - 5 }}
        </p>
      </div>

      <div class="cv-step__field">
        <BaseInput
          ref="vinInput"
          :model-value="modelValue.vin"
          label="VIN"
          placeholder="17 символов (необязательно)"
          maxlength="17"
          :error="errors.vin"
          clearable
          @update:model-value="update('vin', String($event).toUpperCase())"
        />

        <div v-if="modelValue.vin" class="cv-step__vin-status" :data-state="vinValidation">
          <span class="cv-step__vin-icon" aria-hidden="true">
            <svg v-if="vinValidation === 'valid'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            <svg v-else-if="vinValidation === 'incomplete'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 2"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v5M12 17h.01"/>
              <circle cx="12" cy="12" r="9"/>
            </svg>
          </span>

          <span v-if="vinValidation === 'valid'" class="cv-step__vin-text">
            VIN корректен
          </span>
          <span v-else-if="vinValidation === 'incomplete'" class="cv-step__vin-text">
            Осталось {{ 17 - modelValue.vin.length }} символов
          </span>
          <span v-else class="cv-step__vin-text">
            VIN не может содержать буквы I, O, Q
          </span>

          <button
            v-if="vinValidation === 'valid'"
            type="button"
            class="cv-step__vin-copy"
            aria-label="Скопировать VIN"
            @click="copyVin"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>

        <p v-else class="cv-step__hint">
          VIN указан в свидетельстве о регистрации (СТС)
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

.cv-step__hint--error {
  color: #E8A88A;
}

.cv-step__hint--error .cv-step__hint-icon {
  color: #E8A88A;
}

.cv-step__suggestions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.cv-step__suggestions-label {
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.2px;
  color: rgba(200, 190, 175, 0.45);
}

.cv-step__chip {
  padding: 4px 10px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-step__chip:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
}

.cv-step__chip:active {
  transform: translateY(0) scale(0.96);
}

.cv-step__chip:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-step__vin-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 9px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  line-height: 1.4;
  margin-top: 2px;
  width: fit-content;
  max-width: 100%;
}

.cv-step__vin-status[data-state="valid"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.14), rgba(122, 154, 106, 0.04));
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-step__vin-status[data-state="incomplete"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.14), rgba(217, 119, 6, 0.04));
  border: 1px solid rgba(217, 119, 6, 0.32);
}

.cv-step__vin-status[data-state="invalid"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.14), rgba(184, 119, 85, 0.04));
  border: 1px solid rgba(184, 119, 85, 0.32);
}

.cv-step__vin-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-step__vin-text {
  flex: 1;
  min-width: 0;
}

.cv-step__vin-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: currentColor;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cv-step__vin-copy:hover {
  background: rgba(122, 154, 106, 0.2);
  transform: scale(1.05);
}

.cv-step__vin-copy:active {
  transform: scale(0.94);
}

@media (max-width: 768px) {
  .cv-step {
    padding: 20px 18px 22px;
    gap: 18px;
    border-radius: 1rem;
  }

  .cv-step__header {
    padding-bottom: 14px;
  }

  .cv-step__header-left {
    gap: 12px;
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

  .cv-step__subtitle {
    font-size: 12px;
  }

  .cv-step__progress {
    padding: 5px 10px;
  }

  .cv-step__grid {
    gap: 18px;
  }
}

@media (max-width: 640px) {
  .cv-step__grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .cv-step__header {
    flex-direction: column;
    align-items: stretch;
  }

  .cv-step__progress {
    align-self: flex-start;
  }
}
</style>