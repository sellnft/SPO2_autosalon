<script setup>
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'
import SubscribeButton from '@/components/subscriptions/SubscribeButton.vue'

defineProps({
  announcement: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="announcement-actions">
    <FavouriteButton
      :announcement-id="announcement.id"
      variant="button"
    />
    <SubscribeButton :announcement-id="announcement.id" />
  </div>
</template>

<style scoped>
.announcement-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>