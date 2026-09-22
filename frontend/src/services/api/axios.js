import axios from 'axios'
import config from '@/config'
import { tokenStorage } from '@/services/storage/tokenStorage'

/* ============================================================
 *  Логирование (только в dev)
 * ============================================================ */

function logRequest(config) {
  if (!config.debug.enableLogs) return
  const method = (config.method || 'get').toUpperCase()
  const url = config.url
  console.log(
    `%c→ ${method} %c${url}`,
    'color:#C9A961;font-weight:bold',
    'color:#8B6F3F',
    config.params || config.data || ''
  )
}

function logResponse(response) {
  if (!config.debug.enableLogs) return
  const { config: cfg, status, data } = response
  const method = (cfg.method || 'get').toUpperCase()
  console.log(
    `%c← ${status} %c${method} ${cfg.url}`,
    'color:#7A9A6A;font-weight:bold',
    'color:#8B6F3F',
    data
  )
}

function logError(error) {
  if (!config.debug.enableLogs) return
  const cfg = error.config || {}
  const method = (cfg.method || 'get').toUpperCase()
  console.group(
    `%c✗ ${error.response?.status || 'ERR'} %c${method} ${cfg.url || ''}`,
    'color:#E8A88A;font-weight:bold',
    'color:#8B6F3F'
  )
  console.log('message:', error.message)
  if (error.response?.data) console.log('response:', error.response.data)
  console.groupEnd()
}

/* ============================================================
 *  Инстанс
 * ============================================================ */

const axiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

/* ============================================================
 *  Request interceptor
 * ============================================================ */

axiosInstance.interceptors.request.use(
  (requestConfig) => {
    // 1) Токен
    const token = tokenStorage.getAccessToken()
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    // 2) Content-Type для FormData — убираем, браузер сам поставит boundary
    if (typeof FormData !== 'undefined' && requestConfig.data instanceof FormData) {
      delete requestConfig.headers['Content-Type']
    }

    // 3) Язык
    const locale = localStorage.getItem('cv_locale')
    if (locale) {
      requestConfig.headers['Accept-Language'] = locale
    }

    logRequest(requestConfig)
    return requestConfig
  },
  (error) => {
    logError(error)
    return Promise.reject(error)
  }
)

/* ============================================================
 *  Refresh-token flow
 * ============================================================ */

let refreshPromise = null
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject, config: cfg }) => {
    if (error) {
      reject(error)
    } else {
      cfg.headers.Authorization = `Bearer ${token}`
      resolve(axiosInstance(cfg))
    }
  })
  failedQueue = []
}

function isAuthEndpoint(url = '') {
  // Не пытаемся обновить токен для самих auth-запросов
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/2fa')
  )
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) throw new Error('No refresh token')

      // Отдельный "чистый" axios, чтобы не зациклить interceptor
      const { data } = await axios.post(
        `${config.api.baseURL}/auth/refresh`,
        { refreshToken },
        { timeout: config.api.timeout }
      )

      if (data?.accessToken) {
        tokenStorage.setAccessToken(data.accessToken)
      }
      if (data?.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken)
      }

      return data.accessToken
    } catch (err) {
      // Refresh не удался — чистим токены
      tokenStorage.clear?.()
      throw err
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/* ============================================================
 *  Response interceptor
 * ============================================================ */

axiosInstance.interceptors.response.use(
  (response) => {
    logResponse(response)
    return response
  },
  async (error) => {
    logError(error)

    const originalRequest = error.config

    // Отменённый запрос — не трогаем
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error)
    }

    // Нет конфига (сетевая ошибка до отправки) — пробрасываем
    if (!originalRequest) {
      return Promise.reject(normalizeError(error))
    }

    // === 401: пытаемся обновить токен ===
    const status = error.response?.status

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true

      // Уже обновляем — ставим в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            config: originalRequest
          })
        })
      }

      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        isRefreshing = false
        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshErr) {
        isRefreshing = false
        processQueue(refreshErr, null)

        // Событие — приложение может отреагировать (logout, тост)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('cv:auth-expired')
          )
        }

        return Promise.reject(normalizeError(refreshErr))
      }
    }

    // === Retry на transient-ошибки ===
    const retryable =
      status === 502 ||
      status === 503 ||
      status === 504 ||
      error.code === 'ECONNABORTED' || // timeout
      error.code === 'ETIMEDOUT'

    const maxRetries = config.api.retryAttempts ?? 2
    const attempt = originalRequest._retryCount ?? 0

    if (
      retryable &&
      attempt < maxRetries &&
      ['get', 'head', 'options'].includes((originalRequest.method || '').toLowerCase())
    ) {
      originalRequest._retryCount = attempt + 1
      const delay = Math.min(1000 * 2 ** attempt, 5000) // 1s, 2s, 4s…
      await new Promise(r => setTimeout(r, delay))
      return axiosInstance(originalRequest)
    }

    return Promise.reject(normalizeError(error))
  }
)

/* ============================================================
 *  Нормализация ошибок
 * ============================================================ */

/**
 * Приводим ошибку к единому формату:
 * { message, status, code, field?, original }
 */
function normalizeError(error) {
  // Уже нормализована
  if (error?.__cvNormalized) return error

  const status = error?.response?.status
  const data = error?.response?.data
  const code = error?.code

  let message =
    data?.message ||
    data?.error ||
    error?.message ||
    'Неизвестная ошибка'

  // Сетевые ошибки
  if (code === 'ECONNABORTED') message = 'Превышено время ожидания'
  if (!error?.response && code === 'ERR_NETWORK') message = 'Нет подключения к сети'

  const normalized = {
    __cvNormalized: true,
    message,
    status,
    code,
    field: data?.field || data?.errors?.[0]?.field,
    errors: data?.errors,
    original: error
  }

  return normalized
}

/* ============================================================
 *  Публичные хелперы
 * ============================================================ */

/**
 * Отменить все pending-запросы (например, при logout).
 */
const activeRequests = new Map()

axiosInstance.interceptors.request.use((cfg) => {
  const controller = new AbortController()
  cfg.signal = cfg.signal || controller.signal
  activeRequests.set(cfg, controller)
  return cfg
})

axiosInstance.interceptors.response.use(
  (response) => {
    activeRequests.delete(response.config)
    return response
  },
  (error) => {
    if (error?.config) activeRequests.delete(error.config)
    return Promise.reject(error)
  }
)

/** Отменить все активные запросы */
export function cancelAllRequests() {
  activeRequests.forEach(ctrl => ctrl.abort())
  activeRequests.clear()
}

export default axiosInstance