<script setup>
import { computed } from 'vue'
import { useFavouritesStore } from '@/stores/favourites'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'
import SubscribeButton from '@/components/subscriptions/SubscribeButton.vue'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

const favouritesStore = useFavouritesStore()
const subscriptionsStore = useSubscriptionsStore()

const isFavourite = computed(() => 
  favouritesStore.isFavourite(props.announcement.id)
)

const isSubscribed = computed(() => 
  subscriptionsStore.subscriptions.some(s => s.announcementId === props.announcement.id)
)
</script>

<template>
  <div class="announcement-actions">
    <FavouriteButton
      :announcement-id="announcement.id"
      :is-favourite="isFavourite"
    />
    
    <SubscribeButton
      :announcement-id="announcement.id"
      :is-subscribed="isSubscribed"
    />
  </div>
</template>

<style scoped>
.announcement-actions {
  display: flex;
  gap: 8px;
}
</style>