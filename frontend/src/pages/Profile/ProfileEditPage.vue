<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const saving = ref(false)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  city: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: ''
})

function validate() {
  errors.name = ''
  errors.email = ''
  errors.phone = ''

  if (!form.name) errors.name = 'Имя обязательно'
  else if (form.name.length < 2) errors.name = 'Минимум 2 символа'

  if (!form.email) errors.email = 'Email обязателен'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Некорректный email'

  if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) {
    errors.phone = 'Некорректный телефон'
  }

  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!validate()) return

  saving.value = true

  try {
    await userStore.updateProfile({
      id: authStore.user.id,
      ...form
    })

    // Обновляем auth store
    authStore.user = { ...authStore.user, ...form }

    toastStore.success('Профиль обновлён')
    router.push('/profile')
  } catch (err) {
    toastStore.error(err.message || 'Не удалось сохранить')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name || ''
    form.email = authStore.user.email || ''
    form.phone = authStore.user.phone || ''
    form.city = authStore.user.city || ''
  }
})
</script>

<template>
  <div class="profile-edit-page">
    <div class="container">
      <Breadcrumbs />

      <h1 class="profile-edit-page__title">Редактирование профиля</h1>

      <form class="profile-edit-page__form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.name"
          label="Имя"
          placeholder="Иван Петров"
          :error="errors.name"
          required
        />

        <BaseInput
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="example@email.com"
          :error="errors.email"
          required
        />

        <BaseInput
          v-model="form.phone"
          label="Телефон"
          type="tel"
          placeholder="+7 (900) 123-45-67"
          :error="errors.phone"
        />

        <BaseInput
          v-model="form.city"
          label="Город"
          placeholder="Москва"
        />

        <div class="profile-edit-page__actions">
          <BaseButton type="button" variant="ghost" @click="router.back()">
            Отмена
          </BaseButton>

          <BaseButton type="submit" :loading="saving">
            Сохранить
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-edit-page {
  padding: 20px 0 40px;
}

.profile-edit-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.profile-edit-page__form {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.profile-edit-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

@media (max-width: 640px) {
  .profile-edit-page__title {
    font-size: 24px;
  }
}
</style>