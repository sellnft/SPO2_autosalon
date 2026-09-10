import { useAuthStore } from '@/stores/auth'

export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // Инициализация auth при первом заходе
    if (!authStore.initialized) {
      await authStore.initAuth()
    }
    
    const requiresAuth = to.meta.requiresAuth
    const requiresGuest = to.meta.requiresGuest
    const requiresAdmin = to.meta.requiresAdmin
    const requiresVerifiedEmail = to.meta.requiresVerifiedEmail
    
    // Требуется авторизация
    if (requiresAuth && !authStore.isAuthenticated) {
      return next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
    }
    
    // Только для гостей (не авторизованных)
    if (requiresGuest && authStore.isAuthenticated) {
      return next({ name: 'home' })
    }
    
    // Требуется админ
    if (requiresAdmin && !authStore.isAdmin) {
      return next({ name: 'forbidden' })
    }
    
    // Требуется подтвержденный email
    if (requiresVerifiedEmail && !authStore.user?.emailVerified) {
      return next({ name: 'verify-email' })
    }
    
    next()
  })
  
  router.afterEach((to) => {
    document.title = to.meta.title 
      ? `${to.meta.title} - Auto Platform` 
      : 'Auto Platform'
  })
}