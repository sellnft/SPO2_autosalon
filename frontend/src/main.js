import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import config from '@/config'
import '@/assets/styles/main.css'

/* ============================================================
 *  Валидация окружения (до старта)
 * ============================================================ */

if (config.app.isProd) {
  if (config.api.useMock) {
    console.error(
      '[boot] ❌ VITE_USE_MOCK_API=true в production. ' +
      'Отключаю mock-режим — приложение будет ходить на реальный API.'
    )
    config.api.useMock = false
  }

  if (!config.api.baseURL) {
    console.error(
      '[boot] ❌ VITE_API_URL не задан. ' +
      'Приложение не сможет обращаться к API.'
    )
  }
}

/* ============================================================
 *  Создание приложения
 * ============================================================ */

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

/* ============================================================
 *  Глобальные обработчики ошибок
 * ============================================================ */

/**
 * Ошибка внутри Vue-компонента (render, setup, watcher).
 */
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue error]', info, err)

  // Логируем в Sentry / аналитику — если подключено
  // if (window.Sentry) {
  //   window.Sentry.captureException(err, { extra: { info } })
  // }
}

/**
 * Vue-предупреждения (dev-only, но оставляем для prod-логов).
 */
app.config.warnHandler = (msg, instance, trace) => {
  if (config.debug.enableLogs) {
    console.warn('[Vue warn]', msg, trace)
  }
}

/**
 * Необработанный промис (async-ошибки вне Vue).
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled promise]', event.reason)

  // Не даём браузеру дефолтный лог — мы уже залогировали
  event.preventDefault?.()
})

/**
 * Необработанная синхронная ошибка.
 */
window.addEventListener('error', (event) => {
  // Игнорируем ошибки от сторонних скриптов (расширения браузера)
  if (event.filename && !event.filename.includes(window.location.origin)) {
    return
  }

  console.error('[Global error]', event.error || event.message)
})

/* ============================================================
 *  Chunk-load errors — автоперезагрузка
 * ============================================================ */

/**
 * Если файл после деплоя не найден — перезагружаем страницу.
 * Один раз, чтобы не зациклиться.
 */
const RELOAD_KEY = 'cv_chunk_reload_at'

function handleChunkError() {
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
  const now = Date.now()

  // Не перезагружаем чаще, чем раз в 30 секунд
  if (now - last < 30_000) {
    console.warn('[chunk] Skipping reload — too soon')
    return
  }

  sessionStorage.setItem(RELOAD_KEY, String(now))
  console.warn('[chunk] Reloading page due to chunk-load error')
  window.location.reload()
}

window.addEventListener('vite:preloadError', (event) => {
  // Vite-специфичное событие для ошибок предзагрузки
  event.preventDefault?.()
  handleChunkError()
})

/* ============================================================
 *  Онлайн / оффлайн
 * ============================================================ */

window.addEventListener('online', () => {
  if (config.debug.enableLogs) console.log('[net] online')
  window.dispatchEvent(new CustomEvent('cv:network-online'))
})

window.addEventListener('offline', () => {
  if (config.debug.enableLogs) console.log('[net] offline')
  window.dispatchEvent(new CustomEvent('cv:network-offline'))
})

/* ============================================================
 *  Монтирование
 * ============================================================ */

/**
 * Ждём готовности роутера ПЕРЕД монтированием.
 * Это гарантирует, что guard'ы отработали и auth инициализирован.
 */
router.isReady()
  .then(() => {
    app.mount('#app')

    if (config.debug.enableLogs) {
      console.log(
        `%c[CarVibe] ${config.app.title} v${config.app.version} ` +
        `(${config.app.environment})`,
        'color:#C9A961;font-weight:bold'
      )
      console.log(`[CarVibe] API: ${config.api.baseURL}`)
      console.log(`[CarVibe] Mock: ${config.api.useMock ? 'ON' : 'OFF'}`)
    }
  })
  .catch((err) => {
    console.error('[boot] router.isReady() failed:', err)
    // Всё равно монтируем — иначе юзер увидит белый экран
    app.mount('#app')
  })

/* ============================================================
 *  HMR (только в dev)
 * ============================================================ */

if (import.meta.hot) {
  import.meta.hot.accept()
}