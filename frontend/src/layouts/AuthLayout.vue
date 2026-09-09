<script setup>
import AppLogo from '@/components/layout/AppLogo.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__container">
      <header class="auth-layout__header">
        <AppLogo size="lg" />
      </header>
      
      <main class="auth-layout__main">
        <slot />
      </main>
      
      <footer class="auth-layout__footer">
        <p class="auth-layout__copyright">
          © {{ new Date().getFullYear() }} Auto Platform
        </p>
      </footer>
    </div>
    
    <ToastContainer />
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%);
}

.auth-layout__container {
  width: 100%;
  max-width: 440px;
}

.auth-layout__header {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.auth-layout__main {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.auth-layout__footer {
  margin-top: 24px;
  text-align: center;
}

.auth-layout__copyright {
  font-size: 13px;
  color: #9CA3AF;
}
</style>