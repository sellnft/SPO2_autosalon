<script setup>
import AnnouncementCard from './AnnouncementCard.vue'

defineProps({
  announcements: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="announcement-grid">
    <AnnouncementCard
      v-for="announcement in announcements"
      :key="announcement.id"
      :announcement="announcement"
    />
  </div>
</template>

<style scoped>
.announcement-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .announcement-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .announcement-grid {
    grid-template-columns: 1fr;
  }
}
</style>