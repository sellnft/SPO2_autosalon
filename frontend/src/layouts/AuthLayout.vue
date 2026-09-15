<script setup>
import AppLogo from '@/components/layout/AppLogo.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__bg">
      <div class="auth-layout__bg-shape auth-layout__bg-shape--1"></div>
      <div class="auth-layout__bg-shape auth-layout__bg-shape--2"></div>
      <div class="auth-layout__bg-grid"></div>
    </div>

    <div class="auth-layout__container">
      <header class="auth-layout__header">
        <AppLogo size="lg" />
      </header>

      <main class="auth-layout__main">
        <router-view />
      </main>

      <footer class="auth-layout__footer">
        <RouterLink to="/" class="auth-layout__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          На главную
        </RouterLink>
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
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #FAFBFC;
  overflow: hidden;
}

.auth-layout__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.auth-layout__bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.auth-layout__bg-shape--1 {
  width: 500px;
  height: 500px;
  top: -200px;
  right: -100px;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
}

.auth-layout__bg-shape--2 {
  width: 400px;
  height: 400px;
  bottom: -150px;
  left: -100px;
  background: linear-gradient(135deg, #E8A85C, #CD7F32);
}

.auth-layout__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(10, 132, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 132, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.auth-layout__container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
}

.auth-layout__header {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.auth-layout__main {
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 8px 10px -6px rgba(0, 0, 0, 0.04);
}

.auth-layout__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  font-size: 13px;
  color: #9CA3AF;
}

.auth-layout__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6B7280;
  transition: color 0.2s;
}

.auth-layout__back:hover {
  color: #0A84FF;
}

.auth-layout__copyright {
  font-size: 12px;
}

@media (max-width: 640px) {
  .auth-layout {
    padding: 20px 12px;
    align-items: flex-start;
  }

  .auth-layout__main {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .auth-layout__footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>