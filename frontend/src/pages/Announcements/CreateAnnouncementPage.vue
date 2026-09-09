<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const loading = ref(false)
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
  description: '',
  photos: []
})

const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' }
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

async function handleSubmit() {
  loading.value = true
  error.value = null
  
  try {
    const announcement = await announcementsStore.createAnnouncement({
      ...form,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      engineVolume: Number(form.engineVolume),
      power: Number(form.power),
      photos: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'
      ]
    })
    
    router.push(`/announcements/${announcement.id}`)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-announcement-page">
    <div class="container">
      <Breadcrumbs />
      
      <h1 class="create-announcement-page__title">Создать объявление</h1>
      
      <form class="create-announcement-page__form" @submit.prevent="handleSubmit">
        <div class="create-announcement-page__section">
          <h2 class="create-announcement-page__section-title">Основная информация</h2>
          
          <div class="create-announcement-page__grid">
            <BaseSelect
              v-model="form.brand"
              :options="brands"
              label="Марка"
              placeholder="Выберите марку"
              required
            />
            
            <BaseInput
              v-model="form.model"
              label="Модель"
              placeholder="Например: X5"
              required
            />
            
            <BaseInput
              v-model="form.year"
              label="Год выпуска"
              type="number"
              placeholder="2022"
              required
            />
            
            <BaseInput
              v-model="form.price"
              label="Цена, ₽"
              type="number"
              placeholder="5000000"
              required
            />
            
            <BaseInput
              v-model="form.mileage"
              label="Пробег, км"
              type="number"
              placeholder="50000"
              required
            />
            
            <BaseSelect
              v-model="form.bodyType"
              :options="bodyTypes"
              label="Кузов"
              placeholder="Выберите кузов"
              required
            />
          </div>
        </div>
        
        <div class="create-announcement-page__section">
          <h2 class="create-announcement-page__section-title">Характеристики</h2>
          
          <div class="create-announcement-page__grid">
            <BaseSelect
              v-model="form.engineType"
              :options="engineTypes"
              label="Тип двигателя"
              placeholder="Выберите тип"
              required
            />
            
            <BaseInput
              v-model="form.engineVolume"
              label="Объём двигателя, л"
              type="number"
              placeholder="2.0"
              step="0.1"
              required
            />
            
            <BaseInput
              v-model="form.power"
              label="Мощность, л.с."
              type="number"
              placeholder="200"
              required
            />
            
            <BaseSelect
              v-model="form.transmission"
              :options="transmissions"
              label="КПП"
              placeholder="Выберите КПП"
              required
            />
            
            <BaseSelect
              v-model="form.drive"
              :options="drives"
              label="Привод"
              placeholder="Выберите привод"
              required
            />
            
            <BaseSelect
              v-model="form.color"
              :options="colors"
              label="Цвет"
              placeholder="Выберите цвет"
              required
            />
          </div>
        </div>
        
        <div class="create-announcement-page__section">
          <h2 class="create-announcement-page__section-title">Дополнительно</h2>
          
          <BaseInput
            v-model="form.city"
            label="Город"
            placeholder="Москва"
            required
          />
          
          <BaseTextarea
            v-model="form.description"
            label="Описание"
            placeholder="Опишите автомобиль, его состояние, историю обслуживания..."
            :rows="6"
            required
          />
        </div>
        
        <div v-if="error" class="create-announcement-page__error">
          {{ error }}
        </div>
        
        <div class="create-announcement-page__actions">
          <BaseButton
            variant="ghost"
            type="button"
            @click="router.back()"
          >
            Отмена
          </BaseButton>
          
          <BaseButton
            type="submit"
            :loading="loading"
            size="lg"
          >
            Создать объявление
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.create-announcement-page {
  padding: 20px 0 40px;
}

.create-announcement-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.create-announcement-page__form {
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.create-announcement-page__section {
  padding: 24px;
  background: white;
  border-radius: 16px;
}

.create-announcement-page__section-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.create-announcement-page__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.create-announcement-page__error {
  padding: 12px;
  font-size: 14px;
  color: #991b1b;
  background: #FEE2E2;
  border-radius: 8px;
}

.create-announcement-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .create-announcement-page__grid {
    grid-template-columns: 1fr;
  }
  
  .create-announcement-page__actions {
    flex-direction: column;
  }
}
</style>