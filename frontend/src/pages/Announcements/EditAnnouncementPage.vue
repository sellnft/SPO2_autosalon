<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const saving = ref(false)
const error = ref(null)

const form = reactive({
  brand: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  bodyType: '',
  engineType: '',
  engineVolume: '',
  power: '',
  transmission: '',
  drive: '',
  color: '',
  city: '',
  description: ''
})

// Те же options что и в CreateAnnouncementPage
const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' }
]

const bodyTypes = [
  { value: 'Седан', label: 'Седан' },
  { value: 'Кроссовер', label: 'Кроссовер' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Лифтбек', label: 'Лифтбек' }
]

const engineTypes = [
  { value: 'Бензин', label: 'Бензин' },
  { value: 'Дизель', label: 'Дизель' },
  { value: 'Гибрид', label: 'Гибрид' },
  { value: 'Электро', label: 'Электро' }
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
  { value: 'Черный', label: 'Черный' },
  { value: 'Белый', label: 'Белый' },
  { value: 'Серебристый', label: 'Серебристый' },
  { value: 'Серый', label: 'Серый' },
  { value: 'Синий', label: 'Синий' },
  { value: 'Красный', label: 'Красный' },
  { value: 'Зеленый', label: 'Зеленый' }
]

async function loadAnnouncement() {
  loading.value = true
  try {
    const announcement = await announcementsStore.fetchAnnouncement(route.params.id)
    
    Object.keys(form).forEach(key => {
      if (announcement[key] !== undefined) {
        form[key] = announcement[key]
      }
    })
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  error.value = null
  
  try {
    const announcement = await announcementsStore.updateAnnouncement(
      route.params.id,
      {
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        engineVolume: Number(form.engineVolume),
        power: Number(form.power)
      }
    )
    
    router.push(`/announcements/${announcement.id}`)
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadAnnouncement()
})
</script>

<template>
  <div class="edit-announcement-page">
    <div class="container">
      <Breadcrumbs />
      
      <h1 class="edit-announcement-page__title">Редактировать объявление</h1>
      
      <div v-if="loading" class="edit-announcement-page__loading">
        <BaseLoader size="lg" text="Загрузка..." />
      </div>
      
      <form v-else class="edit-announcement-page__form" @submit.prevent="handleSubmit">
        <!-- Та же структура что и в CreateAnnouncementPage -->
        <div class="edit-announcement-page__section">
          <h2 class="edit-announcement-page__section-title">Основная информация</h2>
          
          <div class="edit-announcement-page__grid">
            <BaseSelect
              v-model="form.brand"
              :options="brands"
              label="Марка"
              required
            />
            
            <BaseInput
              v-model="form.model"
              label="Модель"
              required
            />
            
            <BaseInput
              v-model="form.year"
              label="Год выпуска"
              type="number"
              required
            />
            
            <BaseInput
              v-model="form.price"
              label="Цена, ₽"
              type="number"
              required
            />
            
            <BaseInput
              v-model="form.mileage"
              label="Пробег, км"
              type="number"
              required
            />
            
            <BaseSelect
              v-model="form.bodyType"
              :options="bodyTypes"
              label="Кузов"
              required
            />
          </div>
        </div>
        
        <div class="edit-announcement-page__section">
          <h2 class="edit-announcement-page__section-title">Характеристики</h2>
          
          <div class="edit-announcement-page__grid">
            <BaseSelect
              v-model="form.engineType"
              :options="engineTypes"
              label="Тип двигателя"
              required
            />
            
            <BaseInput
              v-model="form.engineVolume"
              label="Объём двигателя, л"
              type="number"
              step="0.1"
              required
            />
            
            <BaseInput
              v-model="form.power"
              label="Мощность, л.с."
              type="number"
              required
            />
            
            <BaseSelect
              v-model="form.transmission"
              :options="transmissions"
              label="КПП"
              required
            />
            
            <BaseSelect
              v-model="form.drive"
              :options="drives"
              label="Привод"
              required
            />
            
            <BaseSelect
              v-model="form.color"
              :options="colors"
              label="Цвет"
              required
            />
          </div>
        </div>
        
        <div class="edit-announcement-page__section">
          <h2 class="edit-announcement-page__section-title">Дополнительно</h2>
          
          <BaseInput
            v-model="form.city"
            label="Город"
            required
          />
          
          <BaseTextarea
            v-model="form.description"
            label="Описание"
            :rows="6"
            required
          />
        </div>
        
        <div v-if="error" class="edit-announcement-page__error">
          {{ error }}
        </div>
        
        <div class="edit-announcement-page__actions">
          <BaseButton
            variant="ghost"
            type="button"
            @click="router.back()"
          >
            Отмена
          </BaseButton>
          
          <BaseButton
            type="submit"
            :loading="saving"
            size="lg"
          >
            Сохранить изменения
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-announcement-page {
  padding: 20px 0 40px;
}

.edit-announcement-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.edit-announcement-page__loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.edit-announcement-page__form {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.edit-announcement-page__section {
  padding: 24px;
  background: white;
  border-radius: 16px;
}

.edit-announcement-page__section-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.edit-announcement-page__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.edit-announcement-page__error {
  padding: 12px;
  font-size: 14px;
  color: #991b1b;
  background: #FEE2E2;
  border-radius: 8px;
}

.edit-announcement-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .edit-announcement-page__grid {
    grid-template-columns: 1fr;
  }
  
  .edit-announcement-page__actions {
    flex-direction: column;
  }
}
</style>