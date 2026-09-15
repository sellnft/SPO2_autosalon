<script setup>
import { computed, ref } from 'vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'

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
    default: 7
  },
  totalSteps: {
    type: Number,
    default: 7
  }
})

const emit = defineEmits(['update:modelValue'])

const tips = [
  { icon: 'list', text: 'Комплектация и опции' },
  { icon: 'wrench', text: 'История обслуживания' },
  { icon: 'check', text: 'Недавние ремонты' },
  { icon: 'tag', text: 'Причина продажи' },
  { icon: 'pin', text: 'Условия осмотра' }
]

const templates = [
  {
    id: 'detailed',
    label: 'Подробный',
    description: 'Структурированное описание',
    text: `Полное описание комплектации:

• Комплектация: (перечислите пакеты опций)
• История обслуживания: (где, когда, что делалось)
• Состояние: (кузов, салон, двигатель)
• Недавние ремонты: (что менялось)
• Дополнительно: (зимняя резина, коврики)
• Причина продажи: (указывайте честно)
• Условия осмотра: (где, когда, по договорённости)`
  },
  {
    id: 'short',
    label: 'Краткий',
    description: 'Основная информация',
    text: `Кратко об автомобиле:

• Комплектация: (основные опции)
• Обслуживание: (официальный дилер / СТО)
• Состояние: (без ДТП / с небольшими ДТП)
• Причина продажи: (указывайте честно)`
  },
  {
    id: 'dealer',
    label: 'Для дилера',
    description: 'Профессиональный шаблон',
    text: `Автомобиль прошёл полную диагностику.

Комплектация: (пакеты опций)
История: (все ТО по регламенту)
Состояние: (не требует вложений)
Гарантия: (если есть)
Trade-in: (возможен)
Кредит: (помощь в оформлении)
Осмотр: (по адресу автосалона)`
  }
]

const description = computed(() => props.modelValue.description || '')

const charCount = computed(() => description.value.length)
const charStatus = computed(() => {
  if (charCount.value === 0) return 'empty'
  if (charCount.value < 100) return 'low'
  if (charCount.value < 400) return 'mid'
  if (charCount.value < 2000) return 'good'
  return 'long'
})

const charHint = computed(() => {
  const map = {
    empty: 'Опишите автомобиль — это влияет на скорость продажи',
    low: 'Мало информации — покупатели проходят мимо',
    mid: 'Хорошо, но можно детальнее',
    good: 'Отличное описание — максимальный отклик',
    long: 'Очень длинное — покупатели могут не дочитать'
  }
  return map[charStatus.value]
})

const filledCount = computed(() => {
  return description.value.length >= 100 ? 1 : 0
})

function update(value) {
  emit('update:modelValue', { ...props.modelValue, description: value })
}

function applyTemplate(template) {
  update(template.text)
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
            Описание
          </h2>
          <p class="cv-step__subtitle">Расскажите о машине — покупатели читают внимательно</p>
        </div>
      </div>

      <span class="cv-step__progress">
        <span class="cv-step__progress-value">{{ filledCount }}</span>
        <span class="cv-step__progress-sep">/</span>
        <span class="cv-step__progress-total">1</span>
      </span>
    </header>

    <div class="cv-step__templates">
      <span class="cv-step__templates-label">Быстрый старт:</span>

      <div class="cv-step__templates-chips">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          class="cv-step__chip"
          :title="template.description"
          @click="applyTemplate(template)"
        >
          <span class="cv-step__chip-icon" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
            </svg>
          </span>
          <span class="cv-step__chip-content">
            <span class="cv-step__chip-label">{{ template.label }}</span>
            <span class="cv-step__chip-desc">{{ template.description }}</span>
          </span>
        </button>
      </div>
    </div>

    <div class="cv-step__textarea-wrap">
      <BaseTextarea
        :model-value="modelValue.description"
        label="Описание автомобиля"
        placeholder="Расскажите о состоянии, комплектации, истории обслуживания, причинах продажи..."
        :rows="10"
        :maxlength="5000"
        :error="errors.description"
        :show-counter="false"
        required
        @update:model-value="update"
      />

      <div class="cv-step__counter" :data-state="charStatus">
        <span class="cv-step__counter-icon" aria-hidden="true">
          <svg v-if="charStatus === 'good'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          <svg v-else-if="charStatus === 'long'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 17h.01"/>
          </svg>
          <svg v-else-if="charStatus === 'low'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 8v5M12 17h.01"/>
          </svg>
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>
          </svg>
        </span>

        <span class="cv-step__counter-text">{{ charHint }}</span>

        <span class="cv-step__counter-value">
          <span class="cv-step__counter-current">{{ charCount.toLocaleString('ru-RU') }}</span>
          <span class="cv-step__counter-sep">/</span>
          <span class="cv-step__counter-total">5000</span>
        </span>
      </div>
    </div>

    <div class="cv-step__tips">
      <div class="cv-step__tips-header">
        <span class="cv-step__tips-header-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l2.5 2 3.5-.5L19.5 7l3 1.5-.5 3.5L24 14.5 22 17l.5 3.5-3 1.5-1.5 3-3.5-.5L12 26l-2.5-2-3.5.5L4.5 21.5 1.5 20l.5-3.5L0 14l2-2.5L1.5 8l3-1.5L6 3.5 9.5 4z" transform="scale(0.85) translate(2 2)"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </span>
        <span class="cv-step__tips-title">Что стоит упомянуть</span>
      </div>

      <ul class="cv-step__tips-list">
        <li v-for="tip in tips" :key="tip.text" class="cv-step__tip">
          <span class="cv-step__tip-icon" aria-hidden="true">
            <svg v-if="tip.icon === 'list'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
            <svg v-else-if="tip.icon === 'wrench'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2z"/>
            </svg>
            <svg v-else-if="tip.icon === 'check'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            <svg v-else-if="tip.icon === 'tag'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 6l4-4h4l8 8-8 8-8-8z"/>
              <circle cx="8" cy="6" r="1"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
              <circle cx="12" cy="11" r="2.5"/>
            </svg>
          </span>
          <span class="cv-step__tip-text">{{ tip.text }}</span>
        </li>
      </ul>
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

.cv-step__templates {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-step__templates-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__templates-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-step__chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px 9px 12px;
  font-family: inherit;
  text-align: left;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-step__chip:hover {
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
}

.cv-step__chip:active {
  transform: translateY(0) scale(0.98);
}

.cv-step__chip:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-step__chip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.25);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.cv-step__chip:hover .cv-step__chip-icon {
  background: rgba(201, 169, 97, 0.22);
  border-color: rgba(232, 213, 160, 0.5);
  transform: scale(1.05);
}

.cv-step__chip-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-step__chip-label {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.05px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.9);
}

.cv-step__chip-desc {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.3;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__textarea-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-step__counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  line-height: 1.4;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cv-step__counter[data-state="empty"] {
  color: rgba(200, 190, 175, 0.5);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv-step__counter[data-state="low"] {
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.12), rgba(184, 119, 85, 0.03));
  border: 1px solid rgba(184, 119, 85, 0.32);
}

.cv-step__counter[data-state="mid"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(217, 119, 6, 0.03));
  border: 1px solid rgba(217, 119, 6, 0.32);
}

.cv-step__counter[data-state="good"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.14), rgba(122, 154, 106, 0.04));
  border: 1px solid rgba(122, 154, 106, 0.32);
}

.cv-step__counter[data-state="long"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.32);
}

.cv-step__counter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-step__counter-text {
  flex: 1;
  min-width: 0;
}

.cv-step__counter-value {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.cv-step__counter-current {
  font-size: 12px;
  font-weight: 800;
  color: currentColor;
}

.cv-step__counter-sep {
  font-size: 10.5px;
  color: rgba(200, 190, 175, 0.4);
}

.cv-step__counter-total {
  font-size: 10.5px;
  font-weight: 700;
  color: rgba(200, 190, 175, 0.5);
}

.cv-step__tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-left: 3px solid rgba(201, 169, 97, 0.7);
}

.cv-step__tips-header {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cv-step__tips-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A0;
  flex-shrink: 0;
}

.cv-step__tips-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #E8D5A0;
}

.cv-step__tips-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-step__tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.4;
  color: rgba(220, 210, 195, 0.75);
}

.cv-step__tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 7px;
  color: rgba(201, 169, 97, 0.85);
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.22);
}

.cv-step__tip-text {
  min-width: 0;
}

@media (max-width: 900px) {
  .cv-step__tips-list {
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
    padding: 8px 12px 8px 10px;
    gap: 8px;
    flex: 1 1 100%;
  }

  .cv-step__counter {
    font-size: 11px;
    padding: 8px 10px;
    gap: 6px;
    flex-wrap: wrap;
  }

  .cv-step__counter-text {
    flex: 1 1 100%;
    order: 2;
    padding-left: 20px;
  }

  .cv-step__counter-icon {
    order: 1;
  }

  .cv-step__counter-value {
    order: 3;
    margin-left: auto;
  }

  .cv-step__tips {
    padding: 14px 16px;
  }

  .cv-step__tips-list {
    gap: 6px;
  }

  .cv-step__tip {
    font-size: 12px;
  }

  .cv-step__tip-icon {
    width: 20px;
    height: 20px;
  }
}
</style>