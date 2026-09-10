<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileBottomNavigation from '@/components/layout/MobileBottomNavigation.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div class="default-layout">
    <AppHeader />
    
    <main class="default-layout__main">
      <router-view />
    </main>
    
    <AppFooter />
    <MobileBottomNavigation />
    <ToastContainer />
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.default-layout__main {
  flex: 1;
  padding-bottom: 60px;
}

@media (min-width: 769px) {
  .default-layout__main {
    padding-bottom: 0;
  }
}
</style>