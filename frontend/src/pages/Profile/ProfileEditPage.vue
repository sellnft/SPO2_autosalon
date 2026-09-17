<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const saving = ref(false)
const isDirty = ref(false)
const avatarInputRef = ref(null)
const showDeleteConfirm = ref(false)
const deleting = ref(false)

const form = reactive({
  name: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  telegram: '',
  whatsapp: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: ''
})

const initialForm = ref({})

const cities = [
  { value: 'Москва', label: 'Москва' },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
  { value: 'Казань', label: 'Казань' },
  { value: 'Екатеринбург', label: 'Екатеринбург' },
  { value: 'Новосибирск', label: 'Новосибирск' },
  { value: 'Краснодар', label: 'Краснодар' },
  { value: 'Ростов-на-Дону', label: 'Ростов-на-Дону' },
  { value: 'Нижний Новгород', label: 'Нижний Новгород' },
  { value: 'Самара', label: 'Самара' },
  { value: 'Уфа', label: 'Уфа' },
  { value: 'Воронеж', label: 'Воронеж' },
  { value: 'Пермь', label: 'Пермь' },
  { value: 'Сочи', label: 'Сочи' },
  { value: 'Волгоград', label: 'Волгоград' },
  { value: 'Красноярск', label: 'Красноярск' },
  { value: 'Саратов', label: 'Саратов' },
  { value: 'Тюмень', label: 'Тюмень' },
  { value: 'Тольятти', label: 'Тольятти' },
  { value: 'Ижевск', label: 'Ижевск' },
  { value: 'Барнаул', label: 'Барнаул' }
]

const avatarInitial = computed(() => {
  const name = form.name || authStore.user?.name || 'П'
  return name.charAt(0).toUpperCase()
})

const emailVerified = computed(() => authStore.user?.emailVerified ?? false)

const requiredFields = ['name', 'email', 'phone', 'city']

const filledCount = computed(() =>
  requiredFields.filter(f => form[f]?.trim()).length
)

const completeness = computed(() =>
  Math.round((filledCount.value / requiredFields.length) * 100)
)

const missingFields = computed(() => {
  const labels = { name: 'имя', email: 'email', phone: 'телефон', city: 'город' }
  return requiredFields.filter(f => !form[f]?.trim()).map(f => labels[f])
})

const completenessState = computed(() => {
  const c = completeness.value
  if (c === 100) return 'ok'
  if (c >= 50) return 'accent'
  return 'warn'
})

function validate() {
  errors.name = ''
  errors.email = ''
  errors.phone = ''

  if (!form.name.trim()) errors.name = 'Имя обязательно'
  else if (form.name.trim().length < 2) errors.name = 'Минимум 2 символа'

  if (!form.email.trim()) errors.email = 'Email обязателен'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный email'

  if (form.phone && !/^\+?[\d\s\-()]{10,}$/.test(form.phone)) {
    errors.phone = 'Некорректный телефон'
  }

  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!validate()) {
    toastStore.error('Проверьте заполненные поля')
    return
  }

  saving.value = true
  try {
    const payload = {
      id: authStore.user.id,
      name: form.name,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      telegram: form.telegram,
      whatsapp: form.whatsapp
    }

    await userStore.updateProfile(payload)
    authStore.user = { ...authStore.user, ...payload }

    toastStore.success('Профиль обновлён')
    isDirty.value = false
    initialForm.value = { ...form }
  } catch (err) {
    toastStore.error(err.message || 'Не удалось сохранить')
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push('/profile')
}

function handleReset() {
  Object.assign(form, initialForm.value)
  isDirty.value = false
}

function triggerAvatarInput() {
  avatarInputRef.value?.click()
}

async function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toastStore.error('Только изображения')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toastStore.error('Максимум 5 МБ')
    return
  }

  const url = URL.createObjectURL(file)
  authStore.user = { ...authStore.user, avatar: url }
  toastStore.success('Аватар обновлён')
  event.target.value = ''
}

async function handleDeleteAccount() {
  deleting.value = true
  try {
    toastStore.success('Запрос на удаление аккаунта отправлен')
    showDeleteConfirm.value = false
  } catch (err) {
    toastStore.error('Не удалось удалить аккаунт')
  } finally {
    deleting.value = false
  }
}

watch(form, () => {
  isDirty.value = JSON.stringify(form) !== JSON.stringify(initialForm.value)
}, { deep: true })

onMounted(() => {
  if (authStore.user) {
    const user = authStore.user
    const nameParts = (user.name || '').split(' ')
    form.name = nameParts[0] || ''
    form.lastName = nameParts[1] || ''
    form.email = user.email || ''
    form.phone = user.phone || ''
    form.city = user.city || ''
    form.telegram = user.telegram || ''
    form.whatsapp = user.whatsapp || ''

    initialForm.value = { ...form }
  }
})
</script>

<template>
  <div class="cv-pedit">
    <div class="cv-pedit__container">
      <Breadcrumbs />

      <header class="cv-pedit__header">
        <div class="cv-pedit__header-left">
          <span class="cv-pedit__eyebrow">
            <span class="cv-pedit__eyebrow-dot" aria-hidden="true"></span>
            Профиль · Настройки
          </span>
          <h1 class="cv-pedit__title">Редактирование профиля</h1>
          <p class="cv-pedit__subtitle">
            Ваши личные данные, способы связи и местоположение
          </p>
        </div>
      </header>

      <section class="cv-pedit__avatar-section">
        <div class="cv-pedit__avatar-wrap">
          <div class="cv-pedit__avatar">
            <img
              v-if="authStore.user?.avatar"
              :src="authStore.user.avatar"
              :alt="form.name"
              class="cv-pedit__avatar-img"
            />
            <span v-else class="cv-pedit__avatar-initial">{{ avatarInitial }}</span>

            <button
              type="button"
              class="cv-pedit__avatar-overlay"
              aria-label="Изменить аватар"
              @click="triggerAvatarInput"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
          </div>

          <input
            ref="avatarInputRef"
            type="file"
            accept="image/*"
            hidden
            @change="handleAvatarChange"
          />
        </div>

        <div class="cv-pedit__avatar-info">
          <p class="cv-pedit__avatar-title">Ваш аватар</p>
          <p class="cv-pedit__avatar-text">
            JPG, PNG или WEBP, до 5 МБ. Рекомендуем квадратное фото 500×500 px.
          </p>

          <div class="cv-pedit__avatar-actions">
            <button
              type="button"
              class="cv-pedit__avatar-btn"
              @click="triggerAvatarInput"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <path d="M17 8l-5-5-5 5"/>
                <path d="M12 3v12"/>
              </svg>
              Загрузить фото
            </button>

            <button
              v-if="authStore.user?.avatar"
              type="button"
              class="cv-pedit__avatar-btn cv-pedit__avatar-btn--muted"
            >
              Удалить
            </button>
          </div>
        </div>
      </section>

      <section class="cv-pedit__completeness" :data-state="completenessState">
        <div class="cv-pedit__completeness-header">
          <span class="cv-pedit__completeness-icon" aria-hidden="true">
            <svg v-if="completenessState === 'ok'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8.5l5 5L20 2.5"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v5M12 17h.01"/>
            </svg>
          </span>

          <div class="cv-pedit__completeness-content">
            <span class="cv-pedit__completeness-title">
              Профиль заполнен на <strong>{{ completeness }}%</strong>
            </span>
            <span v-if="missingFields.length" class="cv-pedit__completeness-text">
              Осталось заполнить: {{ missingFields.join(', ') }}
            </span>
            <span v-else class="cv-pedit__completeness-text">
              Все обязательные поля заполнены
            </span>
          </div>
        </div>

        <div class="cv-pedit__completeness-bar">
          <span
            class="cv-pedit__completeness-fill"
            :style="{ width: `${completeness}%` }"
          ></span>
        </div>
      </section>

      <form class="cv-pedit__form" @submit.prevent="handleSubmit">
        <section class="cv-pedit__section">
          <header class="cv-pedit__section-header">
            <span class="cv-pedit__section-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
            </span>
            <div class="cv-pedit__section-titles">
              <h2 class="cv-pedit__section-title">Личные данные</h2>
              <p class="cv-pedit__section-subtitle">Имя и фамилия — как вас будут видеть другие</p>
            </div>
          </header>

          <div class="cv-pedit__grid">
            <BaseInput
              v-model="form.name"
              label="Имя"
              placeholder="Иван"
              :error="errors.name"
              required
              clearable
            />

            <BaseInput
              v-model="form.lastName"
              label="Фамилия"
              placeholder="Петров"
              clearable
            />
          </div>
        </section>

        <section class="cv-pedit__section">
          <header class="cv-pedit__section-header">
            <span class="cv-pedit__section-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 7l9 6 9-6"/>
              </svg>
            </span>
            <div class="cv-pedit__section-titles">
              <h2 class="cv-pedit__section-title">Контакты</h2>
              <p class="cv-pedit__section-subtitle">
                Email нужен для входа, телефон — для связи покупателей
              </p>
            </div>
          </header>

          <div class="cv-pedit__grid">
            <div class="cv-pedit__field-wrap">
              <BaseInput
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="example@email.com"
                :error="errors.email"
                required
              />

              <span
                v-if="emailVerified"
                class="cv-pedit__field-status cv-pedit__field-status--ok"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 8.5l5 5L20 2.5"/>
                </svg>
                Подтверждён
              </span>

              <span
                v-else
                class="cv-pedit__field-status cv-pedit__field-status--warn"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 8v5M12 17h.01"/>
                </svg>
                Не подтверждён
              </span>
            </div>

            <BaseInput
              v-model="form.phone"
              label="Телефон"
              type="tel"
              placeholder="+7 (900) 123-45-67"
              :error="errors.phone"
              clearable
            />
          </div>
        </section>

        <section class="cv-pedit__section">
          <header class="cv-pedit__section-header">
            <span class="cv-pedit__section-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
                <circle cx="12" cy="11" r="2.5"/>
              </svg>
            </span>
            <div class="cv-pedit__section-titles">
              <h2 class="cv-pedit__section-title">Местоположение</h2>
              <p class="cv-pedit__section-subtitle">
                Город влияет на видимость ваших объявлений
              </p>
            </div>
          </header>

          <div class="cv-pedit__grid">
            <BaseSelect
              :model-value="form.city"
              :options="cities"
              label="Город"
              placeholder="Выберите город"
              searchable
              clearable
              @update:model-value="form.city = $event"
            />
          </div>
        </section>

        <section class="cv-pedit__section">
          <header class="cv-pedit__section-header">
            <span class="cv-pedit__section-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/>
                <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>
              </svg>
            </span>
            <div class="cv-pedit__section-titles">
              <h2 class="cv-pedit__section-title">Связанные аккаунты</h2>
              <p class="cv-pedit__section-subtitle">
                Мессенджеры для быстрой связи с покупателями
              </p>
            </div>
          </header>

          <div class="cv-pedit__grid">
            <BaseInput
              v-model="form.telegram"
              label="Telegram"
              placeholder="@username"
              clearable
            />

            <BaseInput
              v-model="form.whatsapp"
              label="WhatsApp"
              placeholder="+7 (900) 123-45-67"
              clearable
            />
          </div>
        </section>

        <footer class="cv-pedit__footer">
          <span
            class="cv-pedit__footer-status"
            :class="{ 'cv-pedit__footer-status--dirty': isDirty }"
          >
            <span class="cv-pedit__footer-dot" aria-hidden="true"></span>
            <span v-if="isDirty">Есть несохранённые изменения</span>
            <span v-else>Все изменения сохранены</span>
          </span>

          <div class="cv-pedit__footer-actions">
            <BaseButton
              v-if="isDirty"
              type="button"
              variant="ghost"
              @click="handleReset"
            >
              Отменить изменения
            </BaseButton>

            <BaseButton
              v-else
              type="button"
              variant="ghost"
              @click="handleCancel"
            >
              Отмена
            </BaseButton>

            <BaseButton
              type="submit"
              :loading="saving"
              :disabled="!isDirty"
              size="lg"
            >
              <svg v-if="!saving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              Сохранить
            </BaseButton>
          </div>
        </footer>
      </form>

      <section class="cv-pedit__danger">
        <header class="cv-pedit__danger-header">
          <span class="cv-pedit__danger-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </span>
          <div class="cv-pedit__danger-titles">
            <h2 class="cv-pedit__danger-title">Удаление аккаунта</h2>
            <p class="cv-pedit__danger-subtitle">
              Все объявления, избранное и переписка будут удалены безвозвратно
            </p>
          </div>
        </header>

        <button
          type="button"
          class="cv-pedit__danger-btn"
          @click="showDeleteConfirm = true"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
          Удалить аккаунт
        </button>
      </section>
    </div>

    <ConfirmModal
      v-model="showDeleteConfirm"
      title="Удалить аккаунт навсегда?"
      message="Все ваши объявления, избранное, подписки и переписка будут безвозвратно удалены. Это действие нельзя отменить."
      confirm-text="Удалить навсегда"
      cancel-text="Отмена"
      variant="danger"
      icon="trash"
      :loading="deleting"
      @confirm="handleDeleteAccount"
    />
  </div>
</template>

<style scoped>
.cv-pedit {
  position: relative;
  padding: 20px 0 80px;
}

.cv-pedit__container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-pedit__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-pedit__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-pedit__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvPeditDot 2.2s ease-in-out infinite;
}

@keyframes cvPeditDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-pedit__title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-pedit__subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-pedit__avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 22px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-pedit__avatar-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-pedit__avatar-wrap {
  flex-shrink: 0;
}

.cv-pedit__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 2px rgba(201, 169, 97, 0.5),
    0 0 0 5px rgba(10, 10, 12, 0.95),
    0 12px 40px rgba(201, 169, 97, 0.35);
  overflow: hidden;
}

.cv-pedit__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cv-pedit__avatar-initial {
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #1A1208;
}

.cv-pedit__avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1208;
  background: rgba(255, 245, 214, 0.85);
  opacity: 0;
  border: none;
  cursor: pointer;
  transition: opacity 0.25s ease;
}

.cv-pedit__avatar:hover .cv-pedit__avatar-overlay {
  opacity: 1;
}

.cv-pedit__avatar-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-pedit__avatar-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.1px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-pedit__avatar-text {
  margin: 0 0 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

.cv-pedit__avatar-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-pedit__avatar-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-pedit__avatar-btn:hover {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-pedit__avatar-btn:active {
  transform: translateY(0) scale(0.97);
}

.cv-pedit__avatar-btn--muted {
  color: rgba(220, 210, 195, 0.6);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.cv-pedit__avatar-btn--muted:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-pedit__completeness {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid;
}

.cv-pedit__completeness[data-state="ok"] {
  color: #B8CEA8;
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.1), rgba(122, 154, 106, 0.02));
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-pedit__completeness[data-state="accent"] {
  color: #E8D5A0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-pedit__completeness[data-state="warn"] {
  color: #F0C080;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(217, 119, 6, 0.02));
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-pedit__completeness-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cv-pedit__completeness-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-pedit__completeness-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-pedit__completeness-title {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
}

.cv-pedit__completeness-title strong {
  font-weight: 800;
}

.cv-pedit__completeness-text {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  opacity: 0.85;
}

.cv-pedit__completeness-bar {
  position: relative;
  height: 4px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.cv-pedit__completeness-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: currentColor;
  transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow: 0 0 8px currentColor;
}

.cv-pedit__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-pedit__section {
  padding: 22px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-pedit__section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
}

.cv-pedit__section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.1);
  margin-bottom: 18px;
}

.cv-pedit__section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
  box-shadow: 0 0 24px rgba(201, 169, 97, 0.1);
}

.cv-pedit__section-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-pedit__section-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}

.cv-pedit__section-subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

.cv-pedit__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 20px;
}

.cv-pedit__field-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cv-pedit__field-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 3px 9px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-radius: 999px;
  border: 1px solid;
}

.cv-pedit__field-status--ok {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-pedit__field-status--warn {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.35);
}

.cv-pedit__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.4), rgba(15, 13, 10, 0.5)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.2);
  position: sticky;
  bottom: 20px;
  z-index: 10;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.cv-pedit__footer-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: #B8CEA8;
}

.cv-pedit__footer-status--dirty {
  color: #F0C080;
}

.cv-pedit__footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvPeditDot 2.2s ease-in-out infinite;
}

.cv-pedit__footer-actions {
  display: inline-flex;
  gap: 10px;
  margin-left: auto;
}

.cv-pedit__danger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: 20px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(40, 20, 14, 0.35), rgba(20, 12, 8, 0.45)),
    linear-gradient(180deg, #1A1612 0%, #14100C 100%);
  border: 1px solid rgba(184, 119, 85, 0.3);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.cv-pedit__danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 168, 138, 0.3) 50%, transparent);
}

.cv-pedit__danger-header {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.cv-pedit__danger-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border: 1px solid rgba(184, 119, 85, 0.35);
}

.cv-pedit__danger-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cv-pedit__danger-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.25;
  color: #E8A88A;
}

.cv-pedit__danger-subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(232, 168, 138, 0.75);
}

.cv-pedit__danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.12);
  border: 1px solid rgba(184, 119, 85, 0.4);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.cv-pedit__danger-btn:hover {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.6);
  border-color: rgba(232, 168, 138, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(184, 119, 85, 0.35);
}

.cv-pedit__danger-btn:active {
  transform: translateY(0) scale(0.97);
}

@media (max-width: 1024px) {
  .cv-pedit__container { padding: 0 32px; }
  .cv-pedit__title { font-size: 30px; letter-spacing: -0.6px; }
}

@media (max-width: 768px) {
  .cv-pedit { padding: 12px 0 60px; }
  .cv-pedit__container { padding: 0 20px; gap: 18px; }
  .cv-pedit__title { font-size: 24px; letter-spacing: -0.4px; }
  .cv-pedit__subtitle { font-size: 13.5px; }

  .cv-pedit__avatar-section { flex-direction: column; align-items: flex-start; padding: 20px; gap: 18px; }
  .cv-pedit__avatar { width: 84px; height: 84px; }
  .cv-pedit__avatar-initial { font-size: 32px; }
  .cv-pedit__avatar-actions { width: 100%; }
  .cv-pedit__avatar-btn { flex: 1; justify-content: center; }

  .cv-pedit__section { padding: 18px 18px; border-radius: 1rem; }
  .cv-pedit__section-icon { width: 38px; height: 38px; border-radius: 10px; }
  .cv-pedit__section-title { font-size: 14.5px; }

  .cv-pedit__grid { grid-template-columns: 1fr; gap: 14px; }

  .cv-pedit__footer { flex-direction: column; align-items: stretch; padding: 14px 16px; gap: 12px; bottom: 12px; }
  .cv-pedit__footer-actions { margin-left: 0; width: 100%; flex-direction: column-reverse; }
  .cv-pedit__footer-actions > * { width: 100%; }

  .cv-pedit__danger { flex-direction: column; align-items: stretch; padding: 18px 20px; gap: 14px; }
  .cv-pedit__danger-btn { width: 100%; justify-content: center; }
}

@media (max-width: 480px) {
  .cv-pedit__title { font-size: 22px; }
}
</style>