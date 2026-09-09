<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters', 'reset'])

const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' },
  { value: 'Mazda', label: 'Mazda' },
  { value: 'Skoda', label: 'Skoda' },
  { value: 'Volvo', label: 'Volvo' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'Renault', label: 'Renault' },
  { value: 'Subaru', label: 'Subaru' }
]

const bodyTypes = [
  { value: 'Седан', label: 'Седан' },
  { value: 'Кроссовер', label: 'Кроссовер' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Лифтбек', label: 'Лифтбек' }
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

function updateFilter(key, value) {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<template>
  <div class="announcement-filters">
    <div class="announcement-filters__header">
      <h3 class="announcement-filters__title">Фильтры</h3>
      <BaseButton variant="ghost" size="sm" @click="emit('reset')">
        Сбросить
      </BaseButton>
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">Марка</label>
      <BaseSelect
        :model-value="filters.brand"
        :options="brands"
        placeholder="Все марки"
        clearable
        @update:model-value="updateFilter('brand', $event)"
      />
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">Цена, ₽</label>
      <div class="announcement-filters__row">
        <BaseInput
          :model-value="filters.priceFrom"
          type="number"
          placeholder="От"
          @update:model-value="updateFilter('priceFrom', $event)"
        />
        <BaseInput
          :model-value="filters.priceTo"
          type="number"
          placeholder="До"
          @update:model-value="updateFilter('priceTo', $event)"
        />
      </div>
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">Год</label>
      <div class="announcement-filters__row">
        <BaseInput
          :model-value="filters.yearFrom"
          type="number"
          placeholder="От"
          @update:model-value="updateFilter('yearFrom', $event)"
        />
        <BaseInput
          :model-value="filters.yearTo"
          type="number"
          placeholder="До"
          @update:model-value="updateFilter('yearTo', $event)"
        />
      </div>
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">Кузов</label>
      <BaseSelect
        :model-value="filters.bodyType"
        :options="bodyTypes"
        placeholder="Любой"
        clearable
        @update:model-value="updateFilter('bodyType', $event)"
      />
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">КПП</label>
      <BaseSelect
        :model-value="filters.transmission"
        :options="transmissions"
        placeholder="Любая"
        clearable
        @update:model-value="updateFilter('transmission', $event)"
      />
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">Привод</label>
      <BaseSelect
        :model-value="filters.drive"
        :options="drives"
        placeholder="Любой"
        clearable
        @update:model-value="updateFilter('drive', $event)"
      />
    </div>
    
    <div class="announcement-filters__group">
      <label class="announcement-filters__label">Пробег, км</label>
      <div class="announcement-filters__row">
        <BaseInput
          :model-value="filters.mileageFrom"
          type="number"
          placeholder="От"
          @update:model-value="updateFilter('mileageFrom', $event)"
        />
        <BaseInput
          :model-value="filters.mileageTo"
          type="number"
          placeholder="До"
          @update:model-value="updateFilter('mileageTo', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.announcement-filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
}

.announcement-filters__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.announcement-filters__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.announcement-filters__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.announcement-filters__label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.announcement-filters__row {
  display: flex;
  gap: 8px;
}
</style>