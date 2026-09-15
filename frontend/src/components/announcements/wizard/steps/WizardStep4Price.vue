<script setup>
import { computed, ref, watch } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSwitch from '@/components/common/BaseSwitch.vue'
import { formatPrice } from '@/utils/formatPrice'

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
    default: 4
  },
  totalSteps: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['update:modelValue'])

const activePreset = ref('')

const priceRanges = [
  { label: 'до 500 тыс.', from: 0, to: 500000 },
  { label: '500 тыс. – 1 млн', from: 500000, to: 1000000 },
  { label: '1 – 2 млн', from: 1000000, to: 2000000 },
  { label: '2 – 3 млн', from: 2000000, to: 3000000 },
  { label: '3 – 5 млн', from: 3000000, to: 5000000 },
  { label: '5 – 10 млн', from: 5000000, to: 10000000 },
  { label: 'от 10 млн', from: 10000000, to: null }
]

const priceValue = computed(() => Number(props.modelValue.price) || 0)

const priceCategory = computed(() => {
  const p = priceValue.value
  if (!p) return null
  if (p < 500000) return { label: 'Бюджетный сегмент', state: 'neutral' }
  if (p < 2000000) return { label: 'Средний сегмент', state: 'accent' }
  if (p < 5000000) return { label: 'Премиум сегмент', state: 'ok' }
  if (p < 10000000) return { label: 'Люкс сегмент', state: 'ok' }
  return { label: 'Эксклюзив', state: 'accent' }
})

const priceDigits = computed(() => {
  return String(priceValue.value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
})

const priceInWords = computed(() => {
  const p = priceValue.value
  if (!p) return ''
  return numberToWords(p)
})

const monthlyEstimate = computed(() => {
  const p = priceValue.value
  if (!p) return null
  const rate = 0.16 / 12
  const months = 60
  const initial = p * 0.2
  const body = p - initial
  const monthly = body * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
  return {
    monthly: Math.round(monthly),
    initial: Math.round(initial)
  }
})

const taxEstimate = computed(() => {
  const p = priceValue.value
  if (!p) return null
  return Math.round(p * 0.13)
})

const filledCount = computed(() => {
  const fields = ['price']
  let count = fields.reduce((acc, key) => acc + (props.modelValue[key] ? 1 : 0), 0)
  if (props.modelValue.negotiable !== undefined && props.modelValue.negotiable !== null) count++
  return count
})

const priceHint = computed(() => {
  const p = priceValue.value
  if (!p) return null
  if (p < 50000) return { state: 'warn', text: 'Подозрительно низкая цена — привлечёт внимание' }
  if (p > 50000000) return { state: 'warn', text: 'Убедитесь, что цена указана верно' }
  return null
})

const maxLength = 12

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function applyRange(range) {
  activePreset.value = range.label
  update('price', range.to ? range.to : range.from)
}

watch(priceValue, () => {
  activePreset.value = ''
})

function numberToWords(num) {
  if (num >= 1000000) {
    const mln = num / 1000000
    const rounded = Math.round(mln * 100) / 100
    return `${rounded} млн ₽`
  }
  if (num >= 1000) {
    const th = num / 1000
    const rounded = Math.round(th * 10) / 10
    return `${rounded} тыс. ₽`
  }
  return `${num} ₽`
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
            Цена
          </h2>
          <p class="cv-step__subtitle">Установите стоимость и условия торга</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ filledCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">2</span>
      </span>
    </header>

    <div class="cv-step__price-hero">
      <div class="cv-step__price-display">
        <span class="cv-step__price-currency">₽</span>
        <span class="cv-step__price-value">{{ priceDigits || '0' }}</span>
      </div>

      <div class="cv-step__price-meta">
        <span v-if="priceInWords" class="cv-step__price-words">{{ priceInWords }}</span>
        <span v-if="priceCategory" class="cv-step__price-category" :data-state="priceCategory.state">
          <span class="cv-step__price-category-dot" aria-hidden="true"></span>
          {{ priceCategory.label }}
        </span>
      </div>
    </div>

    <div class="cv-step__field">
      <BaseInput
        :model-value="modelValue.price"
        label="Цена, ₽"
        type="number"
        placeholder="5000000"
        :error="errors.price"
        :maxlength="maxLength"
        required
        @update:model-value="update('price', $event)"
      />

      <p v-if="priceHint" class="cv-step__hint" :class="`cv-step__hint--${priceHint.state}`">
        <span class="cv-step__hint-icon" aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 17h.01"/>
          </svg>
        </span>
        {{ priceHint.text }}
      </p>
    </div>

    <div class="cv-step__presets">
      <span class="cv-step__presets-label">Быстрый выбор:</span>

      <div class="cv-step__presets-grid">
        <button
          v-for="range in priceRanges"
          :key="range.label"
          type="button"
          class="cv-step__preset"
          :class="{ 'cv-step__preset--active': activePreset === range.label }"
          @click="applyRange(range)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <div class="cv-step__switch-card">
      <div class="cv-step__switch-icon" :class="{ 'cv-step__switch-icon--active': modelValue.negotiable }" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M8 12h8M12 8v8"/>
        </svg>
      </div>

      <div class="cv-step__switch-content">
        <p class="cv-step__switch-title">Возможен торг</p>
        <p class="cv-step__switch-description">
          {{ modelValue.negotiable
            ? 'Покупатели смогут предложить свою цену'
            : 'Цена фиксированная' }}
        </p>
      </div>

      <BaseSwitch
        :model-value="modelValue.negotiable"
        @update:model-value="update('negotiable', $event)"
      />
    </div>

    <div v-if="monthlyEstimate && taxEstimate" class="cv-step__extras">
      <div class="cv-step__extra">
        <span class="cv-step__extra-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="2"/>
            <path d="M3 10h18M7 15h2M12 15h5"/>
          </svg>
        </span>
        <span class="cv-step__extra-content">
          <span class="cv-step__extra-label">Кредит от</span>
          <span class="cv-step__extra-value">{{ formatPrice(monthlyEstimate.monthly) }}/мес</span>
        </span>
      </div>

      <div class="cv-step__extra">
        <span class="cv-step__extra-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 2"/>
          </svg>
        </span>
        <span class="cv-step__extra-content">
          <span class="cv-step__extra-label">Первоначальный взнос 20%</span>
          <span class="cv-step__extra-value">{{ formatPrice(monthlyEstimate.initial) }}</span>
        </span>
      </div>

      <div class="cv-step__extra">
        <span class="cv-step__extra-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M9 6V4M15 6V4M6 6l1 14h10l1-14"/>
          </svg>
        </span>
        <span class="cv-step__extra-content">
          <span class="cv-step__extra-label">Налог 13% (если применимо)</span>
          <span class="cv-step__extra-value">≈ {{ formatPrice(taxEstimate) }}</span>
        </span>
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

.cv-step__price-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.3);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 0 60px rgba(201, 169, 97, 0.1),
    0 1px 0 rgba(232, 213, 160, 0.06) inset;
}

.cv-step__price-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
}

.cv-step__price-display {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  max-width: 100%;
}

.cv-step__price-currency {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.4px;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  opacity: 0.75;
}

.cv-step__price-value {
  font-size: 46px;
  font-weight: 800;
  letter-spacing: -1.4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 40px rgba(201, 169, 97, 0.2);
}

.cv-step__price-meta {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-step__price-words {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
}

.cv-step__price-category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 999px;
  border: 1px solid transparent;
}

.cv-step__price-category[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.18), rgba(122, 154, 106, 0.05));
  border-color: rgba(122, 154, 106, 0.42);
}

.cv-step__price-category[data-state="accent"] {
  color: #F5E6BC;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.18), rgba(201, 169, 97, 0.05));
  border-color: rgba(201, 169, 97, 0.42);
}

.cv-step__price-category[data-state="neutral"] {
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.cv-step__price-category-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
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

.cv-step__hint--warn {
  color: #F0C080;
}

.cv-step__hint--warn .cv-step__hint-icon {
  color: #F0C080;
}

.cv-step__presets {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-step__presets-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__presets-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cv-step__preset {
  padding: 7px 14px;
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

.cv-step__preset:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-step__preset:active {
  transform: translateY(0) scale(0.96);
}

.cv-step__preset--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.55);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  font-weight: 700;
}

.cv-step__switch-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 14px;
  transition: all 0.25s ease;
}

.cv-step__switch-card:has(.cv-step__switch-icon--active) {
  border-color: rgba(232, 213, 160, 0.42);
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.08),
    0 6px 20px rgba(0, 0, 0, 0.35);
}

.cv-step__switch-icon {
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

.cv-step__switch-icon--active {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.25);
}

.cv-step__switch-content {
  flex: 1;
  min-width: 0;
}

.cv-step__switch-title {
  margin: 0 0 3px;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-step__switch-description {
  margin: 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__extras {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 18px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
}

.cv-step__extra {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.12);
  border-radius: 12px;
  transition: all 0.22s ease;
}

.cv-step__extra:hover {
  border-color: rgba(201, 169, 97, 0.3);
  transform: translateY(-1px);
}

.cv-step__extra-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}

.cv-step__extra-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cv-step__extra-label {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.2px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.45);
}

.cv-step__extra-value {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.2;
  color: #E8D5A0;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 900px) {
  .cv-step__extras {
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

  .cv-step__price-hero {
    padding: 20px 16px 18px;
  }

  .cv-step__price-value {
    font-size: 34px;
    letter-spacing: -1px;
  }

  .cv-step__price-currency {
    font-size: 20px;
  }

  .cv-step__price-words {
    font-size: 11.5px;
  }

  .cv-step__switch-card {
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

  .cv-step__extra-value {
    font-size: 13px;
  }
}
</style>