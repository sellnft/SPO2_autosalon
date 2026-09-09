<script setup>
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
</script>

<template>
  <div class="announcement-skeleton">
    <BaseSkeleton variant="rectangular" height="200px" />
    <div class="announcement-skeleton__content">
      <BaseSkeleton variant="text" width="80%" height="20px" />
      <BaseSkeleton variant="text" width="40%" height="24px" />
      <BaseSkeleton variant="text" width="100%" height="14px" />
      <BaseSkeleton variant="text" width="60%" height="14px" />
    </div>
  </div>
</template>

<style scoped>
.announcement-skeleton {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.announcement-skeleton__content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>