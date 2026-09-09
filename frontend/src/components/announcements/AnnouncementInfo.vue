<script setup>
defineProps({
  announcement: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="announcement-info">
    <h1 class="announcement-info__title">
      {{ announcement.brand }} {{ announcement.model }}, {{ announcement.year }}
    </h1>
    
    <div class="announcement-info__meta">
      <span class="announcement-info__views">
        {{ announcement.views }} просмотров
      </span>
      <span class="announcement-info__dot">•</span>
      <span class="announcement-info__date">
        {{ new Date(announcement.createdAt).toLocaleDateString('ru-RU') }}
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
}

.announcement-info__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.announcement-info__dot {
  color: #D1D5DB;
}
</style>