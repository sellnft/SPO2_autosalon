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
    
    // Сброс формы
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
  <form class="feedback-form" @submit.prevent="handleSubmit">
    <div class="feedback-form__group">
      <label class="feedback-form__label">
        Тема обращения <span class="feedback-form__required">*</span>
      </label>
      <div class="feedback-form__categories">
        <button
          v-for="cat in categories"
          :key="cat.value"
          type="button"
          :class="[
            'feedback-form__category',
            { 'feedback-form__category--active': form.category === cat.value }
          ]"
          @click="form.category = cat.value"
        >
          <span class="feedback-form__category-icon">{{ cat.icon }}</span>
          <span class="feedback-form__category-label">{{ cat.label }}</span>
        </button>
      </div>
      <p v-if="errors.category" class="feedback-form__error">{{ errors.category }}</p>
    </div>
    
    <div class="feedback-form__row">
      <BaseInput
        v-model="form.subject"
        label="Заголовок"
        placeholder="Кратко опишите проблему"
        :error="errors.subject"
        required
      />
      
      <div class="feedback-form__group">
        <label class="feedback-form__label">Приоритет</label>
        <div class="feedback-form__priorities">
          <button
            v-for="p in priorities"
            :key="p.value"
            type="button"
            :class="[
              'feedback-form__priority',
              `feedback-form__priority--${p.value}`,
              { 'feedback-form__priority--active': form.priority === p.value }
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
    
    <div class="feedback-form__actions">
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
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feedback-form__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feedback-form__label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.feedback-form__required {
  color: #EF4444;
}

.feedback-form__categories {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.feedback-form__category {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.feedback-form__category:hover {
  border-color: #0A84FF;
}

.feedback-form__category--active {
  color: #0A84FF;
  border-color: #0A84FF;
  background: #F0F7FF;
}

.feedback-form__category-icon {
  font-size: 18px;
}

.feedback-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.feedback-form__priorities {
  display: flex;
  gap: 4px;
}

.feedback-form__priority {
  flex: 1;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.feedback-form__priority:hover {
  border-color: #9CA3AF;
}

.feedback-form__priority--active {
  color: white;
  border-color: transparent;
}

.feedback-form__priority--low.feedback-form__priority--active {
  background: #6B7280;
}

.feedback-form__priority--normal.feedback-form__priority--active {
  background: #0A84FF;
}

.feedback-form__priority--high.feedback-form__priority--active {
  background: #F59E0B;
}

.feedback-form__priority--critical.feedback-form__priority--active {
  background: #EF4444;
}

.feedback-form__error {
  font-size: 12px;
  color: #EF4444;
}

.feedback-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

@media (max-width: 640px) {
  .feedback-form__categories {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .feedback-form__row {
    grid-template-columns: 1fr;
  }
  
  .feedback-form__actions {
    flex-direction: column;
  }
}
</style>