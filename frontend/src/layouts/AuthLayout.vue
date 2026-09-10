<template>
  <div class="auth-layout">
    <div class="auth-layout__container">
      <header class="auth-layout__header">
        <AppLogo size="lg" />
      </header>
      
      <main class="auth-layout__main">
        <router-view />
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