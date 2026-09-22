/**
 * Хранилище токенов авторизации.
 *
 * Особенности:
 * - SSR-safe (проверяет наличие window/localStorage)
 * - Префикс ключей ('cv_') — защита от коллизий на домене
 * - Автомиграция со старых ключей (без префикса) — не разлогинит текущих юзеров
 * - Парсинг JWT payload (без верификации — только для UI)
 * - Синхронизация между вкладками через событие 'storage'
 *
 * TODO (backend): refresh token rotation — при обновлении access-токена
 * бэк должен выдавать НОВЫЙ refresh-токен и инвалидировать старый.
 * Сейчас фронт просто сохраняет то, что вернул бэк.
 */

const PREFIX = 'cv_'
const ACCESS_KEY = `${PREFIX}access_token`
const REFRESH_KEY = `${PREFIX}refresh_token`

/** Legacy-ключи (до префикса) — для миграции */
const LEGACY_ACCESS_KEY = 'access_token'
const LEGACY_REFRESH_KEY = 'refresh_token'

/* ============================================================
 *  Безопасный доступ к localStorage
 * ============================================================ */

function safeStorage() {
  if (typeof window === 'undefined') return null
  try {
    const test = '__cv_test__'
    window.localStorage.setItem(test, '1')
    window.localStorage.removeItem(test)
    return window.localStorage
  } catch {
    // Приватный режим Safari, отключённое хранилище и т.п.
    return null
  }
}

/* ============================================================
 *  Миграция со старых ключей (одноразовая)
 * ============================================================ */

function migrateLegacyKeys() {
  const ls = safeStorage()
  if (!ls) return

  try {
    // Если новое хранилище пусто, но есть старое — переносим
    if (!ls.getItem(ACCESS_KEY) && ls.getItem(LEGACY_ACCESS_KEY)) {
      ls.setItem(ACCESS_KEY, ls.getItem(LEGACY_ACCESS_KEY))
      ls.removeItem(LEGACY_ACCESS_KEY)
    }
    if (!ls.getItem(REFRESH_KEY) && ls.getItem(LEGACY_REFRESH_KEY)) {
      ls.setItem(REFRESH_KEY, ls.getItem(LEGACY_REFRESH_KEY))
      ls.removeItem(LEGACY_REFRESH_KEY)
    }
  } catch {
    /* no-op */
  }
}

// Запускаем миграцию один раз при импорте модуля
migrateLegacyKeys()

/* ============================================================
 *  JWT-утилиты (без верификации — только для UI)
 * ============================================================ */

/**
 * Декодировать payload JWT.
 * ВАЖНО: не проверяет подпись — только для UI-подсказок.
 * @returns {Object|null}
 */
function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    // Base64URL → Base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/* ============================================================
 *  Публичный API
 * ============================================================ */

export const tokenStorage = {
  /* ---------- Геттеры ---------- */

  /** @returns {string|null} */
  getAccessToken() {
    const ls = safeStorage()
    return ls ? ls.getItem(ACCESS_KEY) : null
  },

  /** @returns {string|null} */
  getRefreshToken() {
    const ls = safeStorage()
    return ls ? ls.getItem(REFRESH_KEY) : null
  },

  /** Есть ли вообще хоть какой-то токен */
  hasTokens() {
    return Boolean(this.getAccessToken() || this.getRefreshToken())
  },

  /* ---------- Сеттеры ---------- */

  /**
   * Установить оба токена.
   * Если refreshToken не передан — НЕ трогаем существующий.
   */
  setTokens(accessToken, refreshToken) {
    const ls = safeStorage()
    if (!ls) return

    if (accessToken) ls.setItem(ACCESS_KEY, accessToken)
    if (refreshToken) ls.setItem(REFRESH_KEY, refreshToken)
  },

  /** Установить только access-токен (при refresh-rotation) */
  setAccessToken(token) {
    const ls = safeStorage()
    if (!ls) return
    if (token) ls.setItem(ACCESS_KEY, token)
  },

  /** Установить только refresh-токен */
  setRefreshToken(token) {
    const ls = safeStorage()
    if (!ls) return
    if (token) ls.setItem(REFRESH_KEY, token)
  },

  /* ---------- Очистка ---------- */

  /** Полная очистка (logout, refresh failed, 401) */
  clear() {
    const ls = safeStorage()
    if (!ls) return
    ls.removeItem(ACCESS_KEY)
    ls.removeItem(REFRESH_KEY)
  },

  /** Alias для совместимости со старым API */
  clearTokens() {
    this.clear()
  },

  /* ---------- JWT-утилиты ---------- */

  /**
   * Payload access-токена.
   * @returns {Object|null}
   */
  getAccessTokenPayload() {
    return decodeJwtPayload(this.getAccessToken())
  },

  /**
   * Истёк ли access-токен.
   * @param {number} [leewaySec=30] — запас в секундах (считаем «истёк» заранее)
   * @returns {boolean} — true если истёк ИЛИ невалиден
   */
  isAccessTokenExpired(leewaySec = 30) {
    const payload = this.getAccessTokenPayload()
    if (!payload?.exp) return true // не JWT или нет exp → считаем невалидным
    const nowSec = Math.floor(Date.now() / 1000)
    return payload.exp - leewaySec <= nowSec
  },

  /**
   * Время до истечения access-токена в секундах.
   * @returns {number|null} — null если токена нет / не JWT
   */
  getAccessTokenTTL() {
    const payload = this.getAccessTokenPayload()
    if (!payload?.exp) return null
    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000))
  },

  /* ---------- Межвкладочная синхронизация ---------- */

  /**
   * Подписка на изменения токенов (из других вкладок).
   * @param {(event: { type: 'set'|'clear', tokens: Object|null }) => void} handler
   * @returns {() => void} — функция отписки
   */
  onCrossTabChange(handler) {
    if (typeof window === 'undefined') return () => {}

    const listener = (e) => {
      if (e.key !== ACCESS_KEY && e.key !== REFRESH_KEY) return

      const hasTokens = this.hasTokens()
      if (!hasTokens) {
        handler({ type: 'clear', tokens: null })
      } else {
        handler({
          type: 'set',
          tokens: {
            accessToken: this.getAccessToken(),
            refreshToken: this.getRefreshToken()
          }
        })
      }
    }

    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
  }
}

// Для тестов и отладки
export { decodeJwtPayload }