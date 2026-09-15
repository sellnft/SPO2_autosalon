<script setup>
import { ref, computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters', 'reset'])

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
  { value: 'Subaru', label: 'Subaru' }
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

const colors = [
  { value: 'Черный', label: 'Черный', hex: '#1A1A1A' },
  { value: 'Белый', label: 'Белый', hex: '#F5F5F5' },
  { value: 'Серебристый', label: 'Серебристый', hex: '#C0C0C0' },
  { value: 'Серый', label: 'Серый', hex: '#808080' },
  { value: 'Синий', label: 'Синий', hex: '#1E3A8A' },
  { value: 'Красный', label: 'Красный', hex: '#991B1B' },
  { value: 'Зеленый', label: 'Зеленый', hex: '#166534' }
]

const cities = [
  { value: 'Москва', label: 'Москва' },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
  { value: 'Казань', label: 'Казань' },
  { value: 'Екатеринбург', label: 'Екатеринбург' },
  { value: 'Новосибирск', label: 'Новосибирск' },
  { value: 'Ростов-на-Дону', label: 'Ростов-на-Дону' },
  { value: 'Уфа', label: 'Уфа' },
  { value: 'Самара', label: 'Самара' }
]

const currentYear = new Date().getFullYear()
const minYear = 1990

const sections = ref({
  main: true,
  price: true,
  specs: true,
  location: true
})

function toggleSection(key) {
  sections.value[key] = !sections.value[key]
}

const activeCount = computed(() => {
  const keys = [
    'brand', 'model', 'priceFrom', 'priceTo',
    'yearFrom', 'yearTo', 'mileageFrom', 'mileageTo',
    'bodyType', 'transmission', 'drive', 'color', 'city'
  ]
  return keys.reduce((acc, key) => {
    const val = props.filters[key]
    return acc + (val !== '' && val !== null && val !== undefined ? 1 : 0)
  }, 0)
})

function updateFilter(key, value) {
  emit('update:filters', { ...props.filters, [key]: value })
}

const pricePresets = [
  { label: 'до 500 тыс.', from: 0, to: 500000 },
  { label: '500 тыс. – 1 млн', from: 500000, to: 1000000 },
  { label: '1 – 2 млн', from: 1000000, to: 2000000 },
  { label: '2 – 3 млн', from: 2000000, to: 3000000 },
  { label: '3 – 5 млн', from: 3000000, to: 5000000 },
  { label: 'от 5 млн', from: 5000000, to: '' }
]

function applyPricePreset(preset) {
  emit('update:filters', {
    ...props.filters,
    priceFrom: preset.from,
    priceTo: preset.to
  })
}

const yearPresets = [
  { label: 'Новые (2024+)', from: 2024, to: '' },
  { label: '2020–2024', from: 2020, to: 2024 },
  { label: '2015–2020', from: 2015, to: 2020 },
  { label: '2010–2015', from: 2010, to: 2015 },
  { label: 'до 2010', from: '', to: 2010 }
]

function applyYearPreset(preset) {
  emit('update:filters', {
    ...props.filters,
    yearFrom: preset.from,
    yearTo: preset.to
  })
}

const mileagePresets = [
  { label: 'до 30 тыс.', from: 0, to: 30000 },
  { label: '30 – 80 тыс.', from: 30000, to: 80000 },
  { label: '80 – 150 тыс.', from: 80000, to: 150000 },
  { label: '150 – 250 тыс.', from: 150000, to: 250000 },
  { label: 'от 250 тыс.', from: 250000, to: '' }
]

function applyMileagePreset(preset) {
  emit('update:filters', {
    ...props.filters,
    mileageFrom: preset.from,
    mileageTo: preset.to
  })
}
</script>

<template>
  <div class="cv-filters">
    <header class="cv-filters__header">
      <div class="cv-filters__title-wrap">
        <h3 class="cv-filters__title">
          <span class="cv-filters__title-dot" aria-hidden="true"></span>
          Фильтры
        </h3>
        <span v-if="activeCount > 0" class="cv-filters__counter">
          {{ activeCount }}
        </span>
      </div>

      <button
        v-if="activeCount > 0"
        type="button"
        class="cv-filters__reset"
        @click="emit('reset')"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
        Сбросить
      </button>
    </header>

    <section class="cv-filters__section">
      <button
        type="button"
        class="cv-filters__section-head"
        @click="toggleSection('main')"
      >
        <span class="cv-filters__section-label">Основное</span>
        <span class="cv-filters__section-chevron" :class="{ 'cv-filters__section-chevron--open': sections.main }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      <div v-show="sections.main" class="cv-filters__section-body">
        <div class="cv-filters__group">
          <label class="cv-filters__label">Марка</label>
          <BaseSelect
            :model-value="filters.brand"
            :options="brands"
            placeholder="Все марки"
            searchable
            clearable
            @update:model-value="updateFilter('brand', $event)"
          />
        </div>

        <div class="cv-filters__group">
          <label class="cv-filters__label">Модель</label>
          <BaseInput
            :model-value="filters.model"
            placeholder="X5, Camry..."
            clearable
            @update:model-value="updateFilter('model', $event)"
          />
        </div>
      </div>
    </section>

    <section class="cv-filters__section">
      <button
        type="button"
        class="cv-filters__section-head"
        @click="toggleSection('price')"
      >
        <span class="cv-filters__section-label">Цена, ₽</span>
        <span class="cv-filters__section-chevron" :class="{ 'cv-filters__section-chevron--open': sections.price }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      <div v-show="sections.price" class="cv-filters__section-body">
        <div class="cv-filters__group">
          <div class="cv-filters__row">
            <BaseInput
              :model-value="filters.priceFrom"
              type="number"
              placeholder="От"
              @update:model-value="updateFilter('priceFrom', $event)"
            />
            <BaseInput
              :model-value="filters.priceTo"
              type="number"
              placeholder="До"
              @update:model-value="updateFilter('priceTo', $event)"
            />
          </div>
        </div>

        <div class="cv-filters__presets">
          <button
            v-for="preset in pricePresets"
            :key="preset.label"
            type="button"
            class="cv-filters__preset"
            :class="{
              'cv-filters__preset--active':
                filters.priceFrom === preset.from && filters.priceTo === preset.to
            }"
            @click="applyPricePreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="cv-filters__section">
      <button
        type="button"
        class="cv-filters__section-head"
        @click="toggleSection('specs')"
      >
        <span class="cv-filters__section-label">Характеристики</span>
        <span class="cv-filters__section-chevron" :class="{ 'cv-filters__section-chevron--open': sections.specs }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      <div v-show="sections.specs" class="cv-filters__section-body">
        <div class="cv-filters__group">
          <label class="cv-filters__label">Год выпуска</label>
          <div class="cv-filters__row">
            <BaseInput
              :model-value="filters.yearFrom"
              type="number"
              placeholder="От"
              :min="minYear"
              :max="currentYear"
              @update:model-value="updateFilter('yearFrom', $event)"
            />
            <BaseInput
              :model-value="filters.yearTo"
              type="number"
              placeholder="До"
              :min="minYear"
              :max="currentYear"
              @update:model-value="updateFilter('yearTo', $event)"
            />
          </div>

          <div class="cv-filters__presets">
            <button
              v-for="preset in yearPresets"
              :key="preset.label"
              type="button"
              class="cv-filters__preset"
              :class="{
                'cv-filters__preset--active':
                  filters.yearFrom === preset.from && filters.yearTo === preset.to
              }"
              @click="applyYearPreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <div class="cv-filters__group">
          <label class="cv-filters__label">Пробег, км</label>
          <div class="cv-filters__row">
            <BaseInput
              :model-value="filters.mileageFrom"
              type="number"
              placeholder="От"
              @update:model-value="updateFilter('mileageFrom', $event)"
            />
            <BaseInput
              :model-value="filters.mileageTo"
              type="number"
              placeholder="До"
              @update:model-value="updateFilter('mileageTo', $event)"
            />
          </div>

          <div class="cv-filters__presets">
            <button
              v-for="preset in mileagePresets"
              :key="preset.label"
              type="button"
              class="cv-filters__preset"
              :class="{
                'cv-filters__preset--active':
                  filters.mileageFrom === preset.from && filters.mileageTo === preset.to
              }"
              @click="applyMileagePreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <div class="cv-filters__group">
          <label class="cv-filters__label">Кузов</label>
          <BaseSelect
            :model-value="filters.bodyType"
            :options="bodyTypes"
            placeholder="Любой"
            clearable
            @update:model-value="updateFilter('bodyType', $event)"
          />
        </div>

        <div class="cv-filters__group">
          <label class="cv-filters__label">КПП</label>
          <BaseSelect
            :model-value="filters.transmission"
            :options="transmissions"
            placeholder="Любая"
            clearable
            @update:model-value="updateFilter('transmission', $event)"
          />
        </div>

        <div class="cv-filters__group">
          <label class="cv-filters__label">Привод</label>
          <BaseSelect
            :model-value="filters.drive"
            :options="drives"
            placeholder="Любой"
            clearable
            @update:model-value="updateFilter('drive', $event)"
          />
        </div>

        <div class="cv-filters__group">
          <label class="cv-filters__label">Цвет</label>
          <div class="cv-filters__colors">
            <button
              v-for="color in colors"
              :key="color.value"
              type="button"
              class="cv-filters__color"
              :class="{ 'cv-filters__color--active': filters.color === color.value }"
              :style="{ '--color-swatch': color.hex }"
              :aria-label="color.label"
              :title="color.label"
              @click="updateFilter('color', filters.color === color.value ? '' : color.value)"
            >
              <span class="cv-filters__color-swatch" aria-hidden="true"></span>
              <span class="cv-filters__color-check" aria-hidden="true">
                <svg v-if="filters.color === color.value" width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 6.5L4.5 9L10 3"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="cv-filters__section">
      <button
        type="button"
        class="cv-filters__section-head"
        @click="toggleSection('location')"
      >
        <span class="cv-filters__section-label">Местоположение</span>
        <span class="cv-filters__section-chevron" :class="{ 'cv-filters__section-chevron--open': sections.location }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      <div v-show="sections.location" class="cv-filters__section-body">
        <div class="cv-filters__group">
          <label class="cv-filters__label">Город</label>
          <BaseSelect
            :model-value="filters.city"
            :options="cities"
            placeholder="Все города"
            searchable
            clearable
            @update:model-value="updateFilter('city', $event)"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cv-filters {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cv-filters__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-filters__title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.cv-filters__title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-filters__title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-filters__counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
}

.cv-filters__reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border: 1px solid rgba(184, 119, 85, 0.32);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-filters__reset:hover {
  background: rgba(184, 119, 85, 0.2);
  border-color: rgba(184, 119, 85, 0.5);
  transform: translateY(-1px);
}

.cv-filters__reset:active {
  transform: translateY(0) scale(0.96);
}

.cv-filters__reset:focus-visible {
  outline: 2px solid #E8A88A;
  outline-offset: 2px;
}

.cv-filters__section {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.cv-filters__section + .cv-filters__section {
  border-top: 1px solid rgba(201, 169, 97, 0.08);
}

.cv-filters__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 14px 6px;
  font-family: inherit;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s ease;
  border-radius: 8px;
}

.cv-filters__section-head:hover {
  background: rgba(201, 169, 97, 0.05);
}

.cv-filters__section-head:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-filters__section-label {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.75);
  transition: color 0.22s ease;
}

.cv-filters__section-head:hover .cv-filters__section-label {
  color: #E8D5A0;
}

.cv-filters__section-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: rgba(201, 169, 97, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}

.cv-filters__section-chevron--open {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: rotate(180deg);
}

.cv-filters__section-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 6px 16px;
  animation: cvFiltersBody 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cvFiltersBody {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cv-filters__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-filters__label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

.cv-filters__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cv-filters__presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.cv-filters__preset {
  padding: 6px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-filters__preset:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
  transform: translateY(-1px);
}

.cv-filters__preset:active {
  transform: translateY(0) scale(0.96);
}

.cv-filters__preset--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  font-weight: 700;
}

.cv-filters__colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-filters__color {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-filters__color:hover {
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-2px);
}

.cv-filters__color:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-filters__color-swatch {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--color-swatch, #808080);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    0 2px 8px rgba(0, 0, 0, 0.4);
}

.cv-filters__color-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1208;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.cv-filters__color--active {
  border-color: rgba(232, 213, 160, 0.6);
  background: rgba(201, 169, 97, 0.14);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.15),
    0 4px 14px rgba(201, 169, 97, 0.28);
}

.cv-filters__color--active .cv-filters__color-check {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 640px) {
  .cv-filters__header {
    padding-bottom: 14px;
  }

  .cv-filters__title {
    font-size: 15px;
  }

  .cv-filters__section-head {
    padding: 12px 4px;
  }

  .cv-filters__section-body {
    padding: 4px 4px 14px;
    gap: 14px;
  }

  .cv-filters__row {
    gap: 6px;
  }

  .cv-filters__preset {
    padding: 5px 10px;
    font-size: 11px;
  }

  .cv-filters__color {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .cv-filters__color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 5px;
  }
}
</style>