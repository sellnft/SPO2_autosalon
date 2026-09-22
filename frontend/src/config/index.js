/**
 * Глобальная конфигурация приложения.
 *
 * Источники:
 * - import.meta.env (VITE_*) — переменные окружения Vite
 * - значения по умолчанию — для локальной разработки
 *
 * Особенности:
 * - Объект заморожен (Object.freeze) — защита от случайной мутации
 * - В production: предупреждение в консоли при отсутствии критичных env
 * - Парсинг boolean устойчив к 'true' / '1' / 'yes' / true
 */

/**
 * Гибкий парсинг boolean из env.
 * Поддерживает: true/'true'/'1'/'yes'/'on' → true, остальное → false.
 */
function parseBool(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'boolean') return value
  const normalized = String(value).trim().toLowerCase()
  return ['true', '1', 'yes', 'on'].includes(normalized)
}

/**
 * Инверсный парсинг: "выключено, если явно false/0/no/off".
 * Полезно для фич, включённых по умолчанию.
 */
function parseBoolInverse(value, defaultEnabled = true) {
  if (value === undefined || value === null) return defaultEnabled
  if (typeof value === 'boolean') return value
  const normalized = String(value).trim().toLowerCase()
  return !['false', '0', 'no', 'off'].includes(normalized)
}

/** Гибкий парсинг числа с fallback */
function parseNumber(value, defaultValue) {
  const num = Number(value)
  return Number.isFinite(num) && num > 0 ? num : defaultValue
}

/** Валидация URL — предупреждение в консоль при некорректном значении */
function validateUrl(url, label) {
  if (!url) return url
  try {
    new URL(url)
    return url
  } catch {
    console.warn(`[config] Invalid ${label}: "${url}". Fallback used.`)
    return null
  }
}

// === Определение окружения ===
const ENV = import.meta.env.MODE || 'development'
const IS_PROD = ENV === 'production'
const IS_DEV = ENV === 'development'

// === Базовые URL с fallback ===
const rawApiUrl = import.meta.env.VITE_API_URL
const rawWsUrl = import.meta.env.VITE_WS_URL

const apiBaseURL =
  validateUrl(rawApiUrl, 'VITE_API_URL') ||
  (IS_DEV ? 'http://localhost:8000/api/v1' : '')

const wsBaseURL =
  validateUrl(rawWsUrl, 'VITE_WS_URL') ||
  (IS_DEV ? 'ws://localhost:8000/ws' : '')

// В production без VITE_API_URL — громко предупреждаем
if (IS_PROD && !apiBaseURL) {
  console.error(
    '[config] VITE_API_URL не задан в production. ' +
    'Приложение не сможет обращаться к API.'
  )
}

const config = {
  // === App ===
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Auto Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: ENV,
    isDev: IS_DEV,
    isProd: IS_PROD
  },

  // === API ===
  api: {
    baseURL: apiBaseURL,
    wsURL: wsBaseURL,
    useMock: parseBool(import.meta.env.VITE_USE_MOCK_API, false),
    timeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 30000),
    retryAttempts: parseNumber(import.meta.env.VITE_API_RETRY, 2)
  },

  // === Features ===
  features: {
    enable2FA: parseBoolInverse(import.meta.env.VITE_ENABLE_2FA, true),
    enableChat: parseBoolInverse(import.meta.env.VITE_ENABLE_CHAT, true),
    enableNotifications: parseBoolInverse(
      import.meta.env.VITE_ENABLE_NOTIFICATIONS,
      true
    ),
    enableAnalytics: parseBool(import.meta.env.VITE_ENABLE_ANALYTICS, false),
    enableSentry: parseBool(import.meta.env.VITE_ENABLE_SENTRY, false)
  },

  // === Debug ===
  debug: {
    enableLogs: parseBool(import.meta.env.VITE_ENABLE_LOGS, IS_DEV),
    enableDevtools: parseBool(import.meta.env.VITE_ENABLE_DEVTOOLS, IS_DEV)
  },

  // === Pagination ===
  pagination: {
    defaultPageSize: parseNumber(import.meta.env.VITE_DEFAULT_PAGE_SIZE, 20),
    pageSizeOptions: [10, 20, 50, 100]
  },

  // === Upload ===
  upload: {
    maxFileSize: parseNumber(
      import.meta.env.VITE_MAX_FILE_SIZE,
      10 * 1024 * 1024
    ), // default 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: parseNumber(import.meta.env.VITE_MAX_FILES, 20)
  },

  // === Валидация форм ===
  validation: {
    phone: /^\+?[0-9\s\-()]{10,20}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: {
      minLength: 8,
      requireUppercase: true,
      requireDigit: true
    },
    vin: /^[A-HJ-NPR-Z0-9]{17}$/i
  }
}

// === Freeze чтобы никто случайно не мутировал ===
// Глубокий freeze через рекурсию
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = obj[prop]
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })
  return Object.freeze(obj)
}

export default deepFreeze(config)

// Именованные экспорты для удобства в тестах
export const isProduction = IS_PROD
export const isDevelopment = IS_DEV
export { parseBool, parseBoolInverse, parseNumber }