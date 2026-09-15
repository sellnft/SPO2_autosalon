<script setup>
import { ref, computed } from 'vue'
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
    default: 5
  },
  totalSteps: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const cities = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург',
  'Новосибирск', 'Ростов-на-Дону', 'Уфа', 'Самара',
  'Нижний Новгород', 'Воронеж', 'Краснодар', 'Иркутск',
  'Сочи', 'Красноярск', 'Пермь', 'Волгоград'
]

const popularCities = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Сочи',
  'Екатеринбург', 'Краснодар'
]

const cityOptions = computed(() => {
  return cities.map(c => ({ value: c, label: c }))
})

const contactMethods = [
  { value: 'chat', label: 'Только в чате', icon: 'chat' },
  { value: 'phone', label: 'Показывать телефон', icon: 'phone' },
  { value: 'both', label: 'И чат, и телефон', icon: 'both' }
]

const showMap = ref(false)

const yandexMapUrl = computed(() => {
  if (!props.modelValue.city) return ''
  const city = encodeURIComponent(props.modelValue.city)
  return `https://yandex.ru/map-widget/v1/?text=${city}&z=11`
})

const filledCount = computed(() => {
  let count = 0
  if (props.modelValue.city) count++
  if (props.modelValue.contactMethod) count++
  return count
})

const cityHint = computed(() => {
  const city = props.modelValue.city
  if (!city) return null
  if (cities.includes(city)) return { state: 'ok', text: 'Город из списка популярных' }
  return { state: 'accent', text: 'Город добавлен вручную' }
})

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function selectCity(city) {
  update('city', city)
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
            Местоположение
          </h2>
          <p class="cv-step__subtitle">Город и способ связи с покупателями</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ filledCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">2</span>
      </span>
    </header>

    <div class="cv-step__field">
      <BaseSelect
        :model-value="modelValue.city"
        :options="cityOptions"
        label="Город"
        placeholder="Начните вводить название"
        :error="errors.city"
        searchable
        clearable
        required
        @update:model-value="update('city', $event)"
      />

      <p v-if="cityHint" class="cv-step__hint" :class="`cv-step__hint--${cityHint.state}`">
        <span class="cv-step__hint-icon" aria-hidden="true">
          <svg v-if="cityHint.state === 'ok'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
          </svg>
        </span>
        {{ cityHint.text }}
      </p>

      <p v-else class="cv-step__hint">
        Город влияет на видимость объявления для покупателей
      </p>
    </div>

    <div class="cv-step__popular">
      <span class="cv-step__popular-label">Популярные города:</span>

      <div class="cv-step__popular-chips">
        <button
          v-for="city in popularCities"
          :key="city"
          type="button"
          class="cv-step__chip"
          :class="{ 'cv-step__chip--active': modelValue.city === city }"
          @click="selectCity(city)"
        >
          <span class="cv-step__chip-icon" aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
              <circle cx="12" cy="11" r="2.5"/>
            </svg>
          </span>
          <span class="cv-step__chip-label">{{ city }}</span>
        </button>
      </div>
    </div>

    <div v-if="modelValue.city" class="cv-step__map-toggle-wrap">
      <button
        type="button"
        class="cv-step__map-toggle"
        :aria-expanded="showMap"
        @click="showMap = !showMap"
      >
        <span class="cv-step__map-toggle-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21 1 6"/>
            <line x1="8" y1="3" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="21"/>
          </svg>
        </span>
        <span>{{ showMap ? 'Скрыть карту' : 'Проверить город на карте' }}</span>
        <span
          class="cv-step__map-toggle-chevron"
          :style="{ transform: showMap ? 'rotate(180deg)' : 'rotate(0deg)' }"
          aria-hidden="true"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 4l4 4 4-4"/>
          </svg>
        </span>
      </button>

      <Transition name="cv-map">
        <div v-if="showMap" class="cv-step__map-wrap">
          <iframe
            :src="yandexMapUrl"
            class="cv-step__map"
            frameborder="0"
            allowfullscreen
            loading="lazy"
            title="Предпросмотр города на карте"
          ></iframe>
        </div>
      </Transition>
    </div>

    <div class="cv-step__field">
      <label class="cv-step__label">
        Способ связи <span class="cv-step__required">*</span>
      </label>

      <div class="cv-step__contacts">
        <button
          v-for="method in contactMethods"
          :key="method.value"
          type="button"
          class="cv-step__contact"
          :class="{ 'cv-step__contact--active': modelValue.contactMethod === method.value }"
          @click="update('contactMethod', method.value)"
        >
          <span class="cv-step__contact-icon" aria-hidden="true">
            <svg v-if="method.icon === 'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
            </svg>
            <svg v-else-if="method.icon === 'phone'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
              <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
            </svg>
          </span>

          <span class="cv-step__contact-content">
            <span class="cv-step__contact-label">{{ method.label }}</span>
            <span class="cv-step__contact-hint">
              <template v-if="method.value === 'chat'">Продавец не публикует номер</template>
              <template v-else-if="method.value === 'phone'">Быстрее свяжутся по телефону</template>
              <template v-else>Максимальный отклик покупателей</template>
            </span>
          </span>

          <span v-if="modelValue.contactMethod === method.value" class="cv-step__contact-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 6.5L4.5 9L10 3"/>
            </svg>
          </span>
        </button>
      </div>

      <p v-if="errors.contactMethod" class="cv-step__hint cv-step__hint--error">
        <span class="cv-step__hint-icon" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v5M12 17h.01"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </span>
        {{ errors.contactMethod }}
      </p>
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

.cv-step__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
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

.cv-step__hint--error {
  color: #E8A88A;
}

.cv-step__hint--error .cv-step__hint-icon {
  color: #E8A88A;
}

.cv-step__popular {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-step__popular-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__popular-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cv-step__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px 7px 11px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-step__chip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
  transition: color 0.22s ease;
}

.cv-step__chip:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-step__chip:hover .cv-step__chip-icon {
  color: #E8D5A0;
}

.cv-step__chip:active {
  transform: translateY(0) scale(0.96);
}

.cv-step__chip--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  font-weight: 700;
}

.cv-step__chip--active .cv-step__chip-icon {
  color: #1A1208;
}

.cv-step__map-toggle-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-step__map-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  align-self: flex-start;
}

.cv-step__map-toggle:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
}

.cv-step__map-toggle:active {
  transform: translateY(0) scale(0.98);
}

.cv-step__map-toggle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.8);
  flex-shrink: 0;
}

.cv-step__map-toggle-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.6);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
}

.cv-step__map-wrap {
  position: relative;
  height: 280px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(201, 169, 97, 0.18);
  background: #0F0F14;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
}

.cv-step__map {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  filter: saturate(0.9) contrast(1.05);
}

.cv-map-enter-active,
.cv-map-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-map-enter-from,
.cv-map-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.cv-map-enter-to,
.cv-map-leave-from {
  opacity: 1;
  max-height: 400px;
}

.cv-step__contacts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cv-step__contact {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 14px;
  font-family: inherit;
  text-align: left;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-step__contact::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-step__contact:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.35);
  transform: translateY(-1px);
}

.cv-step__contact:hover::before {
  opacity: 0.5;
}

.cv-step__contact--active {
  color: #F5E6BC;
  border-color: rgba(232, 213, 160, 0.55);
  background: linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6));
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 8px 24px rgba(201, 169, 97, 0.18);
  transform: translateY(-1px);
}

.cv-step__contact--active::before {
  opacity: 1;
}

.cv-step__contact-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  color: rgba(201, 169, 97, 0.75);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;
}

.cv-step__contact--active .cv-step__contact-icon {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 16px rgba(201, 169, 97, 0.25);
}

.cv-step__contact-content {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cv-step__contact-label {
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.05px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
  transition: color 0.25s ease;
}

.cv-step__contact--active .cv-step__contact-label {
  color: #F5E6BC;
}

.cv-step__contact-hint {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__contact-check {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 7px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 4px 12px rgba(201, 169, 97, 0.4);
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-step__contact--active .cv-step__contact-check {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 900px) {
  .cv-step__contacts {
    grid-template-columns: 1fr;
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

  .cv-step__chip {
    padding: 6px 12px 6px 9px;
    font-size: 11.5px;
  }

  .cv-step__contact {
    padding: 12px;
    gap: 10px;
  }

  .cv-step__contact-icon {
    width: 32px;
    height: 32px;
    border-radius: 9px;
  }

  .cv-step__contact-label {
    font-size: 12.5px;
  }

  .cv-step__contact-hint {
    font-size: 10.5px;
  }

  .cv-step__map-wrap {
    height: 220px;
  }
}
</style>