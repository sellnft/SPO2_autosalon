<script setup>
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div class="empty-layout">
    <router-view />
    <ToastContainer />
  </div>
</template>

<style scoped>
.empty-layout {
  min-height: 100vh;
}
</style>