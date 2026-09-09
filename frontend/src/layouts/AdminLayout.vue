<script setup>
import { ref } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const isSidebarOpen = ref(true)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar :is-open="isSidebarOpen" />
    
    <div class="admin-layout__content">
      <AdminHeader @toggle-sidebar="toggleSidebar" />
      
      <main class="admin-layout__main">
        <slot />
      </main>
    </div>
    
    <ToastContainer />
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
}

.admin-layout__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-layout__main {
  flex: 1;
  padding: 24px;
  background: #F9FAFB;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .admin-layout {
    flex-direction: column;
  }
}
</style>