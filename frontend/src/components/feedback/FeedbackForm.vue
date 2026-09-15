<script setup>
import { ref, reactive } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const emit = defineEmits(['success', 'cancel'])

const feedbackStore = useFeedbackStore()
const toastStore = useToastStore()

const loading = ref(false)

const form = reactive({
  category: '',
  priority: 'normal',
  subject: '',
  message: ''
})

const errors = reactive({
  category: '',
  subject: '',
  message: ''
})

const categories = [
  { value: 'technical', label: 'Техническая проблема', icon: '🔧' },
  { value: 'payment', label: 'Оплата и сделки', icon: '💳' },
  { value: 'account', label: 'Аккаунт', icon: '👤' },
  { value: 'moderation', label: 'Модерация', icon: '🛡️' },
  { value: 'suggestion', label: 'Предложение', icon: '💡' },
  { value: 'other', label: 'Другое', icon: '📝' }
]

const priorities = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
  { value: 'critical', label: 'Критический' }
]

function validate() {
  errors.category = ''
  errors.subject = ''
  errors.message = ''

  if (!form.category) errors.category = 'Выберите тему'
  if (!form.subject) errors.subject = 'Введите заголовок'
  else if (form.subject.length < 5) errors.subject = 'Минимум 5 символов'
  if (!form.message) errors.message = 'Опишите проблему'
  else if (form.message.length < 20) errors.message = 'Минимум 20 символов'

  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  try {
    const feedback = await feedbackStore.createFeedback({
      category: form.category,
      priority: form.priority,
      subject: form.subject,
      message: form.message
    })

    toastStore.success('Обращение создано')
    emit('success', feedback)

    Object.assign(form, {
      category: '',
      priority: 'normal',
      subject: '',
      message: ''
    })
  } catch (err) {
    toastStore.error(err.message || 'Ошибка создания обращения')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="cv-fform" @submit.prevent="handleSubmit">
    <div class="cv-fform__group">
      <label class="cv-fform__label">
        Тема обращения <span class="cv-fform__required">*</span>
      </label>
      <div class="cv-fform__categories">
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          :class="[
            'cv-fform__category',
            { 'cv-fform__category--active': form.category === cat.value }
          ]"
          @click="form.category = cat.value"
        >
          <span class="cv-fform__category-icon">{{ cat.icon }}</span>
          <span class="cv-fform__category-label">{{ cat.label }}</span>
          <span class="cv-fform__category-check" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l3.5 3.5L13 5"/>
            </svg>
          </span>
        </button>
      </div>
      <p v-if="errors.category" class="cv-fform__error">{{ errors.category }}</p>
    </div>

    <div class="cv-fform__row">
      <BaseInput
        v-model="form.subject"
        label="Заголовок"
        placeholder="Кратко опишите проблему"
        :error="errors.subject"
        required
      />

      <div class="cv-fform__group">
        <label class="cv-fform__label">Приоритет</label>
        <div class="cv-fform__priorities">
          <button
            v-for="p in priorities"
            :key="p.value"
            type="button"
            :class="[
              'cv-fform__priority',
              `cv-fform__priority--${p.value}`,
              { 'cv-fform__priority--active': form.priority === p.value }
            ]"
            @click="form.priority = p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <BaseTextarea
      v-model="form.message"
      label="Описание проблемы"
      placeholder="Опишите подробно, что произошло, когда, какие действия вы выполняли..."
      :rows="6"
      :maxlength="2000"
      :error="errors.message"
      required
    />

    <div class="cv-fform__actions">
      <BaseButton
        v-if="cancel"
        type="button"
        variant="ghost"
        @click="emit('cancel')"
      >
        Отмена
      </BaseButton>
      <BaseButton type="submit" :loading="loading">
        Отправить обращение
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.cv-fform {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.cv-fform__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-fform__label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-fform__required {
  color: #E8A88A;
  font-weight: 700;
}

.cv-fform__categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.cv-fform__category {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 15px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: rgba(220, 210, 195, 0.7);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  text-align: left;
  overflow: hidden;
}

.cv-fform__category::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-fform__category:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.35);
  transform: translateY(-1px);
}

.cv-fform__category:hover::before {
  opacity: 0.6;
}

.cv-fform__category--active {
  color: #F5E6BC;
  border-color: rgba(201, 169, 97, 0.55);
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.6)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 6px 20px rgba(201, 169, 97, 0.18),
    0 1px 0 rgba(232, 213, 160, 0.1) inset;
  transform: translateY(-1px);
}

.cv-fform__category--active::before {
  opacity: 1;
}

.cv-fform__category-icon {
  position: relative;
  z-index: 1;
  font-size: 17px;
  line-height: 1;
  flex-shrink: 0;
}

.cv-fform__category-label {
  position: relative;
  z-index: 1;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-fform__category-check {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: linear-gradient(135deg, #E8D5A0, #C9A961);
  color: #1A1208;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.cv-fform__category--active .cv-fform__category-check {
  opacity: 1;
  transform: scale(1);
}

.cv-fform__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.cv-fform__priorities {
  display: flex;
  gap: 6px;
}

.cv-fform__priority {
  flex: 1;
  padding: 13px 12px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.15px;
  color: rgba(220, 210, 195, 0.6);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cv-fform__priority:hover {
  color: rgba(245, 240, 230, 0.9);
  border-color: rgba(201, 169, 97, 0.25);
  transform: translateY(-1px);
}

.cv-fform__priority--active {
  color: #1A1208;
  border-color: transparent;
  font-weight: 700;
  transform: translateY(-1px);
}

.cv-fform__priority--low.cv-fform__priority--active {
  background: linear-gradient(135deg, #D5CDBE, #8E8779);
  box-shadow:
    0 6px 20px rgba(142, 135, 121, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.3) inset;
}

.cv-fform__priority--normal.cv-fform__priority--active {
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-fform__priority--high.cv-fform__priority--active {
  background: linear-gradient(135deg, #F0C080 0%, #D97706 55%, #8B4513 100%);
  box-shadow:
    0 6px 20px rgba(217, 119, 6, 0.4),
    0 1px 0 rgba(255, 220, 170, 0.4) inset;
}

.cv-fform__priority--critical.cv-fform__priority--active {
  background: linear-gradient(135deg, #E8A88A 0%, #B87755 55%, #6B4225 100%);
  box-shadow:
    0 6px 20px rgba(184, 119, 85, 0.45),
    0 1px 0 rgba(255, 210, 190, 0.35) inset;
}

.cv-fform__error {
  margin: 0;
  padding-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #E8A88A;
  letter-spacing: 0.1px;
}

.cv-fform__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
  position: relative;
}

.cv-fform__actions::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(201, 169, 97, 0.25) 50%,
    transparent
  );
}

@media (max-width: 640px) {
  .cv-fform {
    gap: 22px;
  }

  .cv-fform__categories {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .cv-fform__category {
    padding: 11px 12px;
    font-size: 12.5px;
  }

  .cv-fform__category-icon {
    font-size: 15px;
  }

  .cv-fform__row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .cv-fform__priorities {
    flex-wrap: wrap;
  }

  .cv-fform__priority {
    flex: 1 1 calc(50% - 3px);
    padding: 11px 10px;
    font-size: 12px;
  }

  .cv-fform__actions {
    flex-direction: column-reverse;
    gap: 10px;
  }

  .cv-fform__actions > * {
    width: 100%;
  }
}
</style>