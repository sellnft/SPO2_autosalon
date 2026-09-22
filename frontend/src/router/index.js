import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupRouterGuards } from './guards'
import config from '@/config'

/**
 * Определение base URL.
 * - Vite: import.meta.env.BASE_URL подставляется автоматически при билде
 * - По умолчанию '/' для деплоя в корень
 */
const BASE_URL = import.meta.env.BASE_URL || '/'

/**
 * Фабрика роутера.
 * Отдельная функция полезна для тестов и SSR.
 */
export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(BASE_URL),
    routes,

    // Кастомные активные классы (используются в RouterLink)
    linkActiveClass: 'cv-link-active',
    linkExactActiveClass: 'cv-link-exact-active',

    scrollBehavior(to, from, savedPosition) {
      // 1) Back/forward — восстанавливаем позицию
      if (savedPosition) {
        return { ...savedPosition, behavior: 'instant' }
      }

      // 2) Якорь — плавно скроллим к элементу
      if (to.hash) {
        return {
          el: to.hash,
          behavior: 'smooth',
          // Небольшая задержка для отрисовки динамического контента
          top: 80 // отступ под фиксированный хедер (если есть)
        }
      }

      // 3) Обычный переход — наверх
      return { top: 0, behavior: 'instant' }
    }
  })

  // Настройка guards (auth, title, redirects)
  setupRouterGuards(router)

  // Централизованная обработка ошибок навигации
  router.onError((err, to, from) => {
    // Отменённые навигации — норма, не логируем
    if (err?.message?.includes('Navigation cancelled')) return
    if (err?.message?.includes('Navigation aborted')) return

    // Динамический импорт не загрузился (chunk error)
    if (
      err?.message?.includes('Failed to fetch dynamically imported module') ||
      err?.name === 'ChunkLoadError'
    ) {
      console.warn('[router] chunk load failed, reloading…', to?.fullPath)
      // Один раз перезагружаем — обычно помогает после деплоя
      window.location.reload()
      return
    }

    console.error('[router] navigation error:', err, { to, from })
  })

  // Логирование в dev
  if (config.debug.enableLogs) {
    router.afterEach((to) => {
      console.log(
        `%c[router] → ${to.fullPath}`,
        'color:#C9A961;font-weight:bold'
      )
    })
  }

  return router
}

// === Экспорт готового инстанса ===
const router = createAppRouter()

export default router