<script setup>
import { computed } from 'vue'
import BaseDrawer from '@/components/common/BaseDrawer.vue'
import AnnouncementFilters from './AnnouncementFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    required: true
  },
  resultCount: {
    type: Number,
    default: null
  },
  activeCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'update:filters', 'reset'])

const countLabel = computed(() => {
  if (props.resultCount === null) return 'Показать результаты'
  const n = props.resultCount
  const mod10 = n % 10
  const mod100 = n % 100
  let word = 'объявлений'
  if (mod10 === 1 && mod100 !== 11) word = 'объявление'
  else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) word = 'объявления'
  return `Показать ${n.toLocaleString('ru-RU')} ${word}`
})

function handleApply() {
  emit('update:modelValue', false)
}
</script>

<template>
  <BaseDrawer
    :model-value="modelValue"
    title="Фильтры"
    position="left"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header-extra>
      <span v-if="activeCount > 0" class="cv-fd__badge">
        {{ activeCount }}
      </span>
    </template>

    <div class="cv-fd__body">
      <div v-if="activeCount > 0" class="cv-fd__active-hint">
        <span class="cv-fd__active-dot" aria-hidden="true"></span>
        <span class="cv-fd__active-text">
          Активных фильтров: <strong>{{ activeCount }}</strong>
        </span>
        <button
          type="button"
          class="cv-fd__reset-quick"
          @click="emit('reset')"
        >
          Сбросить
        </button>
      </div>

      <AnnouncementFilters
        :filters="filters"
        @update:filters="emit('update:filters', $event)"
        @reset="emit('reset')"
      />
    </div>

    <template #footer>
      <BaseButton block size="lg" @click="handleApply">
        <span class="cv-fd__btn-text">{{ countLabel }}</span>
      </BaseButton>
    </template>
  </BaseDrawer>
</template>

<style scoped>
.cv-fd__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8D5A0 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.4),
    0 4px 12px rgba(201, 169, 97, 0.4);
  flex-shrink: 0;
}

.cv-fd__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cv-fd__active-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.03));
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 12px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
}

.cv-fd__active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
  animation: cvFdPulse 2.2s ease-in-out infinite;
}

@keyframes cvFdPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-fd__active-text {
  flex: 1;
  min-width: 0;
}

.cv-fd__active-text strong {
  color: #E8D5A0;
  font-weight: 700;
}

.cv-fd__reset-quick {
  flex-shrink: 0;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border: 1px solid rgba(184, 119, 85, 0.32);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-fd__reset-quick:hover {
  background: rgba(184, 119, 85, 0.2);
  border-color: rgba(184, 119, 85, 0.5);
  transform: translateY(-1px);
}

.cv-fd__reset-quick:active {
  transform: translateY(0) scale(0.96);
}

.cv-fd__reset-quick:focus-visible {
  outline: 2px solid #E8A88A;
  outline-offset: 2px;
}

.cv-fd__btn-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cv-fd__active-hint {
    padding: 10px 12px;
    font-size: 12px;
    gap: 8px;
  }

  .cv-fd__reset-quick {
    padding: 4px 10px;
    font-size: 11px;
  }
}
</style>