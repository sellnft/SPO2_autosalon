<script setup>
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import AnnouncementFilters from './AnnouncementFilters.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update:filters', 'reset'])
</script>

<template>
  <BaseDrawer
    :model-value="modelValue"
    title="Фильтры"
    position="left"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AnnouncementFilters
      :filters="filters"
      @update:filters="emit('update:filters', $event)"
      @reset="emit('reset')"
    />
  </BaseDrawer>
</template>