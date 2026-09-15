<script setup>
import { formatPrice } from '@/utils/formatPrice'

defineProps({
  price: {
    type: Number,
    required: true
  },
  negotiable: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="announcement-price">
    <span class="announcement-price__value">{{ formatPrice(price) }}</span>
    <span v-if="negotiable" class="announcement-price__negotiable">торг</span>
  </div>
</template>

<style scoped>
.announcement-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.announcement-price__value {
  font-size: 32px;
  font-weight: 700;
  color: #0A84FF;
  line-height: 1;
}

.announcement-price__negotiable {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #065f46;
  background: #D1FAE5;
  border-radius: 6px;
  text-transform: uppercase;
}

@media (max-width: 480px) {
  .announcement-price__value {
    font-size: 26px;
  }
}
</style>