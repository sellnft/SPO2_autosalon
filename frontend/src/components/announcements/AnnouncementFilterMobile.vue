<script setup>
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import AnnouncementFilters from './AnnouncementFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'

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

function handleApply() {
  emit('update:modelValue', false)
}
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

    <template #footer>
      <BaseButton block size="lg" @click="handleApply">
        Показать результаты
      </BaseButton>
    </template>
  </BaseDrawer>
</template>