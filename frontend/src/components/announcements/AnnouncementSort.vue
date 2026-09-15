<script setup>
import { computed } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'createdAt-desc'
  },
  label: {
    type: String,
    default: 'Сортировка'
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const sortOptions = [
  { value: 'createdAt-desc', label: 'Сначала новые' },
  { value: 'createdAt-asc', label: 'Сначала старые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'year-desc', label: 'Новые по году' },
  { value: 'year-asc', label: 'Старые по году' },
  { value: 'mileage-asc', label: 'Меньше пробег' },
  { value: 'mileage-desc', label: 'Больше пробег' }
]

const currentLabel = computed(() => {
  const found = sortOptions.find(o => o.value === props.modelValue)
  return found ? found.label : 'Сначала новые'
})

const sortDir = computed(() => {
  if (props.modelValue.endsWith('-asc')) return 'asc'
  if (props.modelValue.endsWith('-desc')) return 'desc'
  return 'desc'
})
</script>

<template>
  <div class="cv-sort" :class="{ 'cv-sort--compact': compact }">
    <div v-if="showLabel" class="cv-sort__label-wrap">
      <span class="cv-sort__label-icon" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M6 12h12M10 18h4"/>
        </svg>
      </span>
      <span class="cv-sort__label">{{ label }}</span>
    </div>

    <div class="cv-sort__select">
      <BaseSelect
        :model-value="modelValue"
        :options="sortOptions"
        :placeholder="currentLabel"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>

    <span
      class="cv-sort__dir"
      :data-dir="sortDir"
      aria-hidden="true"
      :title="sortDir === 'asc' ? 'По возрастанию' : 'По убыванию'"
    >
      <svg v-if="sortDir === 'desc'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7"/>
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </span>
  </div>
</template>

<style scoped>
.cv-sort {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px 8px 14px;
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3), rgba(15, 13, 10, 0.4)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.25),
    0 1px 0 rgba(232, 213, 160, 0.03) inset;
  transition: all 0.25s ease;
}

.cv-sort:hover {
  border-color: rgba(201, 169, 97, 0.32);
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.35),
    0 0 24px rgba(201, 169, 97, 0.08);
}

.cv-sort:focus-within {
  border-color: rgba(201, 169, 97, 0.5);
  box-shadow:
    0 4px 18px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(201, 169, 97, 0.12),
    0 0 32px rgba(201, 169, 97, 0.15);
}

.cv-sort__label-wrap {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding-right: 12px;
  border-right: 1px solid rgba(201, 169, 97, 0.14);
  flex-shrink: 0;
}

.cv-sort__label-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
}

.cv-sort__label {
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: rgba(220, 210, 195, 0.7);
  white-space: nowrap;
}

.cv-sort__select {
  flex: 1;
  min-width: 160px;
}

.cv-sort__select :deep(.cv-select__trigger) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 4px 8px;
  min-height: auto;
}

.cv-sort__select :deep(.cv-select__trigger:hover) {
  background: rgba(201, 169, 97, 0.06);
  border-radius: 8px;
}

.cv-sort__select :deep(.cv-select__trigger--open) {
  background: rgba(201, 169, 97, 0.08);
  border-radius: 8px;
  box-shadow: none;
}

.cv-sort__select :deep(.cv-select__placeholder) {
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #E8D5A0;
}

.cv-sort__select :deep(.cv-select__arrow) {
  color: rgba(201, 169, 97, 0.7);
}

.cv-sort__dir {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 9px;
  box-shadow:
    0 2px 8px rgba(201, 169, 97, 0.15),
    0 1px 0 rgba(255, 245, 214, 0.06) inset;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-sort:hover .cv-sort__dir {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-sort--compact {
  padding: 6px 10px 6px 12px;
  gap: 10px;
}

.cv-sort--compact .cv-sort__label-wrap {
  padding-right: 10px;
}

.cv-sort--compact .cv-sort__label {
  display: none;
}

.cv-sort--compact .cv-sort__select {
  min-width: 130px;
}

.cv-sort--compact .cv-sort__dir {
  width: 26px;
  height: 26px;
  border-radius: 8px;
}

@media (max-width: 640px) {
  .cv-sort {
    width: 100%;
    padding: 8px 10px;
    gap: 8px;
    border-radius: 12px;
  }

  .cv-sort__label-wrap {
    padding-right: 10px;
    gap: 6px;
  }

  .cv-sort__label {
    display: none;
  }

  .cv-sort__select {
    min-width: 0;
  }

  .cv-sort__select :deep(.cv-select__placeholder) {
    font-size: 13px;
  }

  .cv-sort__dir {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }
}
</style>