<script setup>
import { formatPrice } from '@/utils/formatPrice'

defineProps({
  price: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="announcement-price">
    <span class="announcement-price__value">{{ formatPrice(price) }}</span>
  </div>
</template>

<style scoped>
.announcement-price__value {
  font-size: 32px;
  font-weight: 700;
  color: #0A84FF;
}
</style>