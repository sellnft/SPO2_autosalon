<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()
const userStore = useUserStore()

const loading = ref(false)
const saving = ref(false)
const successMessage = ref('')

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
  
  if (!form.name) {
    errors.name = 'Имя обязательно'
  }
  
  if (!form.email) {
    errors.email = 'Email обязателен'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email'
  }
  
  if (form.phone && !/^\+?[\d\s-]{10,}$/.test(form.phone)) {
    errors.phone = 'Некорректный телефон'
  }
  
  return !errors.name && !errors.email && !errors.phone
}

async function handleSubmit() {
  if (!validate()) return
  
  saving.value = true
  successMessage.value = ''
  
  try {
    await userStore.updateProfile({
      id: authStore.user.id,
      ...form
    })
    successMessage.value = 'Профиль обновлён'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (authStore.user) {
    form.name = authStore.user.name
    form.email = authStore.user.email
    form.phone = authStore.user.phone || ''
    form.city = authStore.user.city || ''
  }
})
</script>

<template>
  <div class="profile-edit-page">
    <div class="container">
      <h1 class="profile-edit-page__title">Редактирование профиля</h1>
      
      <form class="profile-edit-page__form" @submit.prevent="handleSubmit">
        <div v-if="successMessage" class="profile-edit-page__success">
          {{ successMessage }}
        </div>
        
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
          <BaseButton
            type="button"
            variant="ghost"
            @click="$router.back()"
          >
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
  padding: 40px 0;
}

.profile-edit-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
}

.profile-edit-page__form {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px;
  background: white;
  border-radius: 16px;
}

.profile-edit-page__success {
  padding: 12px;
  font-size: 14px;
  color: #065f46;
  background: #D1FAE5;
  border-radius: 8px;
}

.profile-edit-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>