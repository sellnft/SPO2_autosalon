<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseSwitch from '@/components/common/BaseSwitch.vue'

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
    default: 3
  },
  totalSteps: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const conditions = [
  { value: 'Отличное', label: 'Отличное' },
  { value: 'Хорошее', label: 'Хорошее' },
  { value: 'Удовлетворительное', label: 'Удовлетворительное' },
  { value: 'Требует ремонта', label: 'Требует ремонта' }
]

const steeringOptions = [
  { value: 'Левый', label: 'Левый' },
  { value: 'Правый', label: 'Правый' }
]

const countries = [
  { value: 'Россия', label: 'Россия' },
  { value: 'Япония', label: 'Япония' },
  { value: 'Германия', label: 'Германия' },
  { value: 'Корея', label: 'Корея' },
  { value: 'Китай', label: 'Китай' },
  { value: 'США', label: 'США' },
  { value: 'Франция', label: 'Франция' },
  { value: 'Италия', label: 'Италия' },
  { value: 'Швеция', label: 'Швеция' },
  { value: 'Чехия', label: 'Чехия' }
]

const conditionConfig = computed(() => {
  const map = {
    'Отличное': { state: 'ok', icon: 'sparkle' },
    'Хорошее': { state: 'ok', icon: 'check' },
    'Удовлетворительное': { state: 'accent', icon: 'info' },
    'Требует ремонта': { state: 'warn', icon: 'wrench' }
  }
  return map[props.modelValue.condition] || null
})

const ownersHint = computed(() => {
  const n = Number(props.modelValue.owners)
  if (!n) return null
  if (n === 1) return { state: 'ok', text: 'Один владелец — повышенный спрос' }
  if (n === 2) return { state: 'accent', text: 'Два владельца — хороший показатель' }
  if (n <= 4) return { state: 'neutral', text: 'Несколько владельцев — это норма' }
  return { state: 'warn', text: 'Много владельцев — покупатели могут насторожиться' }
})

const filledCount = computed(() => {
  const fields = ['condition', 'steeringWheel', 'owners', 'country', 'hasAccidents', 'serviceHistory']
  return fields.reduce((acc, key) => {
    const v = props.modelValue[key]
    return acc + (v !== '' && v !== null && v !== undefined ? 1 : 0)
  }, 0)
})

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
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
            Состояние
          </h2>
          <p class="cv-step__subtitle">История, владельцы и комплектация</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ filledCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">6</span>
      </span>
    </header>

    <div class="cv-step__grid">
      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.condition"
          :options="conditions"
          label="Состояние"
          placeholder="Оцените автомобиль"
          clearable
          @update:model-value="update('condition', $event)"
        />

        <p v-if="conditionConfig" class="cv-step__hint" :class="`cv-step__hint--${conditionConfig.state}`">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg v-if="conditionConfig.icon === 'sparkle'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
              <path d="M19 15l.7 2.1L22 18l-2.3.9L19 21l-.7-2.1L16 18l2.3-.9z"/>
            </svg>
            <svg v-else-if="conditionConfig.icon === 'check'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            <svg v-else-if="conditionConfig.icon === 'wrench'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"/>
            </svg>
            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
          </span>
          <span v-if="modelValue.condition === 'Отличное'">Отличное состояние привлекает покупателей</span>
          <span v-else-if="modelValue.condition === 'Хорошее'">Хорошее — самый частый вариант</span>
          <span v-else-if="modelValue.condition === 'Удовлетворительное'">Честно укажите недостатки в описании</span>
          <span v-else>Опишите все дефекты — это повысит доверие</span>
        </p>
      </div>

      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.steeringWheel"
          :options="steeringOptions"
          label="Руль"
          placeholder="Выберите"
          clearable
          @update:model-value="update('steeringWheel', $event)"
        />
      </div>

      <div class="cv-step__field">
        <BaseInput
          :model-value="modelValue.owners"
          label="Владельцев по ПТС"
          type="number"
          placeholder="1"
          min="1"
          max="20"
          @update:model-value="update('owners', $event)"
        />

        <p v-if="ownersHint" class="cv-step__hint" :class="`cv-step__hint--${ownersHint.state}`">
          <span class="cv-step__hint-icon" aria-hidden="true">
            <svg v-if="ownersHint.state === 'ok'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            <svg v-else-if="ownersHint.state === 'warn'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
          </span>
          {{ ownersHint.text }}
        </p>

        <p v-else class="cv-step__hint">
          Если авто новый — 1 владелец
        </p>
      </div>

      <div class="cv-step__field">
        <BaseSelect
          :model-value="modelValue.country"
          :options="countries"
          label="Страна регистрации"
          placeholder="Выберите"
          searchable
          clearable
          @update:model-value="update('country', $event)"
        />
      </div>
    </div>

    <div class="cv-step__switches">
      <button
        type="button"
        class="cv-step__switch"
        :class="{ 'cv-step__switch--active': modelValue.hasAccidents }"
        @click="update('hasAccidents', !modelValue.hasAccidents)"
      >
        <span class="cv-step__switch-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>
        </span>

        <span class="cv-step__switch-content">
          <span class="cv-step__switch-title">Были ДТП</span>
          <span class="cv-step__switch-description">
            {{ modelValue.hasAccidents
              ? 'Отмечено — укажите детали в описании'
              : 'Автомобиль не участвовал в авариях' }}
          </span>
        </span>

        <BaseSwitch
          :model-value="modelValue.hasAccidents"
          @update:model-value="update('hasAccidents', $event)"
          @click.stop
        />
      </button>

      <button
        type="button"
        class="cv-step__switch"
        :class="{ 'cv-step__switch--active': modelValue.serviceHistory }"
        @click="update('serviceHistory', !modelValue.serviceHistory)"
      >
        <span class="cv-step__switch-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
            <path d="M9 15l2 2 4-4"/>
          </svg>
        </span>

        <span class="cv-step__switch-content">
          <span class="cv-step__switch-title">Сервисная история</span>
          <span class="cv-step__switch-description">
            {{ modelValue.serviceHistory
              ? 'Есть полная история обслуживания'
              : 'Укажите, если есть сервисная книжка' }}
          </span>
        </span>

        <BaseSwitch
          :model-value="modelValue.serviceHistory"
          @update:model-value="update('serviceHistory', $event)"
          @click.stop
        />
      </button>
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

.cv-step__hint--neutral {
  color: rgba(200, 190, 175, 0.55);
}

.cv-step__hint--neutral .cv-step__hint-icon {
  color: rgba(201, 169, 97, 0.55);
}

.cv-step__switches {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-step__switch {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  font-family: inherit;
  text-align: left;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-step__switch::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-step__switch:hover {
  border-color: rgba(201, 169, 97, 0.35);
  transform: translateY(-1px);
}

.cv-step__switch:hover::before {
  opacity: 0.5;
}

.cv-step__switch--active {
  border-color: rgba(232, 213, 160, 0.42);
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.08),
    0 6px 20px rgba(0, 0, 0, 0.35);
}

.cv-step__switch--active::before {
  opacity: 1;
}

.cv-step__switch-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  color: rgba(201, 169, 97, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;
}

.cv-step__switch--active .cv-step__switch-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.25);
}

.cv-step__switch-content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-step__switch-title {
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
  transition: color 0.25s ease;
}

.cv-step__switch--active .cv-step__switch-title {
  color: #F5E6BC;
}

.cv-step__switch-description {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(200, 190, 175, 0.5);
  transition: color 0.25s ease;
}

.cv-step__switch--active .cv-step__switch-description {
  color: rgba(220, 210, 195, 0.7);
}

@media (max-width: 900px) {
  .cv-step__grid {
    gap: 18px;
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

  .cv-step__switches {
    gap: 8px;
    padding-top: 16px;
  }

  .cv-step__switch {
    padding: 12px 14px;
    gap: 12px;
  }

  .cv-step__switch-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .cv-step__switch-title {
    font-size: 13px;
  }

  .cv-step__switch-description {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .cv-step__switch-content {
    min-width: 0;
  }

  .cv-step__switch-description {
    display: none;
  }
}
</style>