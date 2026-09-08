<script setup>
// Admin layout with sidebar
</script>

<template>
  <div class="admin-layout">
    <slot />
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
}
</style>