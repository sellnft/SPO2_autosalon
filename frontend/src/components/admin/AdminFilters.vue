<script setup>
import BaseInput from '@/components/common/BaseInput.vue'

defineProps({
  search: {
    type: String,
    default: ''
  },
  filters: {
    type: Array,
    default: () => []
  },
  activeFilters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:search', 'update:filter', 'reset'])

function updateFilter(key, value) {
  emit('update:filter', { key, value })
}
</script>

<template>
  <div class="admin-filters">
    <div class="admin-filters__search">
      <BaseInput
        :model-value="search"
        placeholder="Поиск..."
        @update:model-value="emit('update:search', $event)"
      />
    </div>
    
    <div
      v-for="filter in filters"
      :key="filter.key"
      class="admin-filters__item"
    >
      <select
        class="admin-filters__select"
        :value="activeFilters[filter.key] || ''"
        @change="updateFilter(filter.key, $event.target.value)"
      >
        <option value="">{{ filter.placeholder }}</option>
        <option
          v-for="option in filter.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    
    <button class="admin-filters__reset" @click="emit('reset')">
      Сбросить
    </button>
  </div>
</template>

<style scoped>
.admin-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.admin-filters__search {
  flex: 1;
  min-width: 240px;
}

.admin-filters__select {
  padding: 10px 32px 10px 14px;
  font-size: 13px;
  color: #E5E7EB;
  background: #1A1A1D;
  border: 1px solid #26262A;
  border-radius: 8px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: all 0.2s;
}

.admin-filters__select:hover,
.admin-filters__select:focus {
  border-color: #C8A96E;
}

.admin-filters__reset {
  padding: 10px 14px;
  font-size: 13px;
  color: #6B7280;
  background: none;
  border: 1px solid #26262A;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-filters__reset:hover {
  color: #E5E7EB;
  border-color: #3A3A40;
}
</style>