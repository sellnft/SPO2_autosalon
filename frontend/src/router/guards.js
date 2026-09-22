import { useAuthStore } from '@/stores/auth'
import config from '@/config'

/**
 * Паттерн безопасного redirect: только относительные пути.
 * Защита от open redirect.
 */
const SAFE_REDIRECT = /^\/(?!\/)/

/**
 * Единый логгер guard'ов (только в dev).
 */
function logGuard(...args) {
  if (config.debug.enableLogs) {
    console.log('%c[router]', 'color:#C9A961;font-weight:bold', ...args)
  }
}

/**
 * Безопасно достать initAuth: один вызов на всё приложение,
 * устойчивый к параллельным навигациям.
 */
let initPromise = null

async function ensureAuthInitialized(authStore) {
  if (authStore.initialized) return

  if (!initPromise) {
    initPromise = authStore.initAuth().catch((err) => {
      // Не валим роутинг из-за сети — считаем юзера гостем
      console.warn('[router] initAuth failed:', err?.message || err)
      initPromise = null // дать шанс на повтор
      return null
    })
  }

  await initPromise
}

/**
 * Настройка navigation guards.
 * @param {import('vue-router').Router} router
 */
export function setupRouterGuards(router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 1) Инициализация auth (с защитой от параллельных вызовов)
    try {
      await ensureAuthInitialized(authStore)
    } catch (err) {
      // Никогда не блокируем навигацию из-за инициализации
      console.warn('[router] guard init error:', err)
    }

    const {
      requiresAuth,
      requiresGuest,
      requiresAdmin,
      requiresVerifiedEmail
    } = to.meta || {}

    const isAuth = authStore.isAuthenticated
    const isAdmin = authStore.isAdmin
    const user = authStore.user

    // 2) Требуется авторизация
    if (requiresAuth && !isAuth) {
      logGuard('→ login (requiresAuth)', to.fullPath)
      return next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    }

    // 3) Только для гостей
    if (requiresGuest && isAuth) {
      logGuard('→ home (requiresGuest)', to.fullPath)
      return next({ name: 'home' })
    }

    // 4) Требуется админ
    if (requiresAdmin) {
      if (!isAuth) {
        logGuard('→ login (requiresAdmin, not auth)', to.fullPath)
        return next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
      }
      if (!isAdmin) {
        logGuard('→ forbidden (requiresAdmin)', to.fullPath)
        return next({ name: 'forbidden' })
      }
    }

    // 5) Требуется подтверждённый email
    if (requiresVerifiedEmail) {
      if (!isAuth) {
        logGuard('→ login (requiresVerifiedEmail, not auth)', to.fullPath)
        return next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
      }
      if (user && !user.emailVerified) {
        logGuard('→ verify-email', to.fullPath)
        return next({
          name: 'verify-email',
          query: { redirect: to.fullPath }
        })
      }
    }

    // 6) Валидация redirect-параметра (защита от open redirect)
    if (to.query?.redirect && typeof to.query.redirect === 'string') {
      if (!SAFE_REDIRECT.test(to.query.redirect)) {
        logGuard('⚠ unsafe redirect stripped:', to.query.redirect)
        const sanitized = { ...to.query }
        delete sanitized.redirect
        return next({ path: to.path, query: sanitized, replace: true })
      }
    }

    next()
  })

  router.afterEach((to) => {
    // 1) Заголовок документа
    const appTitle = config?.app?.title || 'Auto Platform'
    const pageTitle = to.meta?.title
    document.title = pageTitle ? `${pageTitle} — ${appTitle}` : appTitle

    // 2) Скролл к началу страницы (если не отключено в meta)
    if (to.meta?.preserveScroll !== true) {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }

    logGuard('navigated →', to.fullPath)
  })

  // Отдельный обработчик ошибок навигации
  router.onError((err) => {
    // Отменённые навигации — не ошибка
    if (err?.message?.includes('Navigation cancelled')) return
    console.error('[router] navigation error:', err)
  })
}