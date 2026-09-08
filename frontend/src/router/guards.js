export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    // Здесь будет логика проверки авторизации
    next()
  })

  router.afterEach((to) => {
    document.title = to.meta.title 
      ? `${to.meta.title} - Auto Platform` 
      : 'Auto Platform'
  })
}