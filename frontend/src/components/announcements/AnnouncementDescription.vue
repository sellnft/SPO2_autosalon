<script setup>
defineProps({
  description: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="announcement-description">
    <h3 class="announcement-description__title">Описание</h3>
    <p class="announcement-description__text">{{ description }}</p>
  </div>
</template>

<style scoped>
.announcement-description {
  padding: 24px;
  background: white;
  border-radius: 16px;
}

.announcement-description__title {
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.announcement-description__text {
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
  white-space: pre-line;
}
</style>