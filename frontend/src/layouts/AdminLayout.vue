<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const isSidebarOpen = ref(true)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function handleResize() {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => route.path, () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
})
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar :is-open="isSidebarOpen" />
    
    <div class="admin-layout__content">
      <AdminHeader @toggle-sidebar="toggleSidebar" />
      
      <main class="admin-layout__main">
        <router-view />
      </main>
    </div>
    
    <ToastContainer />
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #0F0F10;
  color: #E5E7EB;
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
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .admin-layout__main {
    padding: 16px;
  }
}
</style>