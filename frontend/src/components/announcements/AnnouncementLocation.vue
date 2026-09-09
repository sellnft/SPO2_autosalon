<script setup>
defineProps({
  city: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="announcement-location">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 18s-7-5-7-11a7 7 0 0114 0c0 6-7 11-7 11z" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="10" cy="7" r="2" stroke="currentColor" stroke-width="1.5"/>
    </svg>
    <span>{{ city }}</span>
  </div>
</template>

<style scoped>
.announcement-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
}
</style>