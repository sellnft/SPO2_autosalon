<script setup>
import { computed } from 'vue'
import AnnouncementCard from './AnnouncementCard.vue'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps({
  announcements: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  skeletonCount: {
    type: Number,
    default: 6
  },
  emptyTitle: {
    type: String,
    default: 'Ничего не найдено'
  },
  emptyDescription: {
    type: String,
    default: 'Попробуйте изменить фильтры или поискать в другой категории'
  },
  emptyIcon: {
    type: String,
    default: 'car'
  },
  view: {
    type: String,
    default: 'grid',
    validator: (v) => ['grid', 'list'].includes(v)
  }
})

const emit = defineEmits(['quick-view', 'compare', 'share', 'reset'])

const showSkeleton = computed(() => props.loading && !props.announcements.length)
const showEmpty = computed(() => !props.loading && !props.announcements.length)
const showGrid = computed(() => props.announcements.length > 0)
</script>

<template>
  <div class="cv-grid-wrap">
    <div v-if="showSkeleton" class="cv-grid cv-grid--grid">
      <div v-for="i in skeletonCount" :key="i" class="cv-grid__skeleton-card">
        <BaseSkeleton variant="rounded" height="200px" />
        <div class="cv-grid__skeleton-body">
          <BaseSkeleton width="70%" height="18px" />
          <BaseSkeleton width="45%" height="24px" />
          <BaseSkeleton :lines="2" height="12px" />
        </div>
      </div>
    </div>

    <EmptyState
      v-else-if="showEmpty"
      :icon="emptyIcon"
      :title="emptyTitle"
      :description="emptyDescription"
      action-text="Сбросить фильтры"
      @action="emit('reset')"
    />

    <div
      v-else-if="showGrid"
      :class="['cv-grid', `cv-grid--${view}`]"
    >
      <AnnouncementCard
        v-for="announcement in announcements"
        :key="announcement.id"
        :announcement="announcement"
        @quick-view="emit('quick-view', $event)"
        @compare="emit('compare', $event)"
        @share="emit('share', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.cv-grid-wrap {
  position: relative;
  width: 100%;
}

.cv-grid {
  display: grid;
  gap: 22px;
}

.cv-grid--grid {
  grid-template-columns: repeat(3, 1fr);
}

.cv-grid--list {
  grid-template-columns: 1fr;
  gap: 14px;
}

.cv-grid__skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-grid__skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.2) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 2;
}

.cv-grid__skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 18px;
}

@media (max-width: 1280px) {
  .cv-grid--grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
}

@media (max-width: 1024px) {
  .cv-grid--grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .cv-grid {
    gap: 14px;
  }
}

@media (max-width: 640px) {
  .cv-grid--grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .cv-grid--list {
    gap: 10px;
  }

  .cv-grid__skeleton-body {
    padding: 14px 14px 16px;
  }
}
</style>