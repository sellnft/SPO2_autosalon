<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

const viewsText = computed(() => {
  const views = props.announcement.views || 0
  return `${views} ${pluralizeViews(views)}`
})

function pluralizeViews(count) {
  const forms = ['просмотр', 'просмотра', 'просмотров']
  const cases = [2, 0, 1, 1, 1, 2]
  const index = count % 100 > 4 && count % 100 < 20
    ? 2
    : cases[Math.min(count % 10, 5)]
  return forms[index]
}
</script>

<template>
  <div class="announcement-info">
    <h1 class="announcement-info__title">
      {{ announcement.brand }} {{ announcement.model }}, {{ announcement.year }}
    </h1>

    <div class="announcement-info__meta">
      <span class="announcement-info__views">
        {{ viewsText }}
      </span>
      <span class="announcement-info__dot">•</span>
      <span class="announcement-info__date">
        {{ formatDate(announcement.createdAt, 'long') }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.announcement-info__title {
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}

.announcement-info__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
  flex-wrap: wrap;
}

.announcement-info__dot {
  color: #D1D5DB;
}

@media (max-width: 768px) {
  .announcement-info__title {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .announcement-info__title {
    font-size: 18px;
  }
}
</style>