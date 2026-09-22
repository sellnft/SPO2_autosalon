/**
 * Форматирование дат.
 *
 * Особенности:
 * - Кэш Intl.DateTimeFormat (быстро при массовом рендере)
 * - Устойчивое к часовым поясам парсирование 'YYYY-MM-DD'
 * - Локаль из config / localStorage
 * - Умные relative-форматы ('вчера', 'через 5 мин')
 */

import config from '@/config'

/* ============================================================
 *  Локаль
 * ============================================================ */

const DEFAULT_LOCALE = 'ru-RU'

/** Текущая локаль — из localStorage или дефолт */
function getLocale() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('cv_locale') || DEFAULT_LOCALE
  }
  return DEFAULT_LOCALE
}

/* ============================================================
 *  Кэш Intl-форматтеров
 * ============================================================ */

const formatterCache = new Map()

/**
 * Получить Intl.DateTimeFormat с кэшированием.
 */
function getFormatter(locale, options) {
  const key = locale + '|' + JSON.stringify(options)
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(locale, options))
  }
  return formatterCache.get(key)
}

/* ============================================================
 *  Парсинг дат
 * ============================================================ */

/**
 * Универсальный парсер с устойчивостью к часовым поясам.
 * 'YYYY-MM-DD' → local date (не UTC).
 * Числовые timestamp'ы (сек) — умножаем на 1000.
 */
function parseDate(value) {
  if (value == null) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  // Timestamp в секундах (меньше ~ year 2000 в ms)
  if (typeof value === 'number' && value < 1e12) {
    value = value * 1000
  }

  // ISO date-only 'YYYY-MM-DD' — парсим как локальную
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/* ============================================================
 *  Relative helpers
 * ============================================================ */

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/**
 * Начало дня (00:00:00).
 */
function startOfDay(d) {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/**
 * Разница в календарных днях.
 */
function diffInDays(a, b) {
  const startA = startOfDay(a).getTime()
  const startB = startOfDay(b).getTime()
  return Math.round((startA - startB) / DAY)
}

/* ============================================================
 *  Публичный API
 * ============================================================ */

/**
 * Форматировать дату.
 *
 * @param {Date|string|number|null} date
 * @param {'default'|'short'|'long'|'datetime'|'time'|'relative'|'relative-long'|'relative-short'|'month-year'|'weekday'} [format='default']
 * @returns {string}
 */
export function formatDate(date, format = 'default') {
  const d = parseDate(date)
  if (!d) return ''

  const locale = getLocale()

  switch (format) {
    case 'short':
      return getFormatter(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(d)

    case 'short-numeric':
      return getFormatter(locale, {
        day: '2-digit',
        month: '2-digit'
      }).format(d)

    case 'long':
      return getFormatter(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d)

    case 'datetime':
      return getFormatter(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d)

    case 'time':
      return getFormatter(locale, {
        hour: '2-digit',
        minute: '2-digit'
      }).format(d)

    case 'month-year':
      return getFormatter(locale, {
        month: 'long',
        year: 'numeric'
      }).format(d)

    case 'weekday':
      return getFormatter(locale, {
        weekday: 'long'
      }).format(d)

    case 'relative':
      return formatRelative(d, { style: 'medium' })

    case 'relative-short':
      return formatRelative(d, { style: 'short' })

    case 'relative-long':
      return formatRelative(d, { style: 'long' })

    case 'default':
    default:
      return getFormatter(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(d)
  }
}

/**
 * Относительное форматирование: '5 мин', 'вчера', 'через 2 ч'.
 *
 * @param {Date|string|number} date
 * @param {Object} [opts]
 * @param {'short'|'medium'|'long'} [opts.style='medium']
 * @returns {string}
 */
export function formatRelative(date, opts = {}) {
  const d = parseDate(date)
  if (!d) return ''

  const { style = 'medium' } = opts
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const abs = Math.abs(diffMs)
  const future = diffMs > 0
  const prefix = future ? 'через ' : ''

  // Календарные дни — точнее чем «hours / 24»
  const calDays = diffInDays(d, now)

  // === Особые календарные метки ===
  if (calDays === 0) {
    // Сегодня — показываем время если больше часа
    if (abs < MINUTE) {
      return style === 'long' ? 'только что' : 'сейчас'
    }
    if (abs < HOUR) {
      const m = Math.round(abs / MINUTE)
      return future ? `через ${m} мин` : `${m} мин назад`
    }
  }

  if (calDays === -1) return 'вчера'
  if (calDays === 1) return 'завтра'
  if (calDays === -2) return 'позавчера'
  if (calDays === 2) return 'послезавтра'

  // === Прошлое/будущее в коротких единицах ===
  if (abs < MINUTE) {
    return style === 'long' ? 'только что' : 'сейчас'
  }

  if (abs < HOUR) {
    const m = Math.max(1, Math.round(abs / MINUTE))
    if (style === 'short') return future ? `+${m}м` : `${m}м`
    return future ? `${prefix}${m} мин` : `${m} мин назад`
  }

  if (abs < DAY) {
    const h = Math.max(1, Math.round(abs / HOUR))
    if (style === 'short') return future ? `+${h}ч` : `${h}ч`
    return future ? `${prefix}${h} ч` : `${h} ч назад`
  }

  if (abs < WEEK && calDays > -7 && calDays < 7) {
    const dd = Math.abs(calDays)
    if (style === 'short') return `${dd}д`
    return `${dd} дн${future ? '' : ' назад'}`
  }

  // === Даты в пределах года — без года ===
  const isSameYear = d.getFullYear() === now.getFullYear()
  const locale = getLocale()

  if (isSameYear) {
    return getFormatter(locale, {
      day: 'numeric',
      month: 'short'
    }).format(d)
  }

  // === Даты других лет — с годом ===
  return getFormatter(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d)
}

/**
 * Длительность: '2ч 15м', '45с'.
 * @param {number} ms
 */
export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0с'

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}д ${hours % 24}ч`
  if (hours > 0) return `${hours}ч ${minutes % 60}м`
  if (minutes > 0) return `${minutes}м`
  return `${seconds}с`
}

/**
 * Проверки.
 */
export function isToday(date) {
  const d = parseDate(date)
  if (!d) return false
  return diffInDays(d, new Date()) === 0
}

export function isYesterday(date) {
  const d = parseDate(date)
  if (!d) return false
  return diffInDays(d, new Date()) === -1
}

export function isFuture(date) {
  const d = parseDate(date)
  return d ? d.getTime() > Date.now() : false
}

export function isPast(date) {
  const d = parseDate(date)
  return d ? d.getTime() < Date.now() : false
}

/**
 * Диапазон дат: '1 фев — 15 мар'.
 * @param {Date|string|number} from
 * @param {Date|string|number} to
 * @param {Object} [opts]
 * @param {boolean} [opts.includeYear=true]
 */
export function formatDateRange(from, to, opts = {}) {
  const a = parseDate(from)
  const b = parseDate(to)
  if (!a && !b) return ''
  if (!a) return formatDate(b, opts.includeYear ? 'short' : 'short-numeric')
  if (!b) return formatDate(a, opts.includeYear ? 'short' : 'short-numeric')

  const locale = getLocale()
  const { includeYear = true } = opts

  const sameYear = a.getFullYear() === b.getFullYear()
  const sameMonth = sameYear && a.getMonth() === b.getMonth()

  // '1 — 15 фев'
  if (sameMonth) {
    const fmt = getFormatter(locale, { day: 'numeric' })
    const fmtMonth = getFormatter(locale, {
      day: 'numeric',
      month: 'short',
      ...(includeYear ? { year: 'numeric' } : {})
    })
    return `${fmt.format(a)} — ${fmtMonth.format(b)}`
  }

  // '1 фев — 15 мар'
  const fmt = getFormatter(locale, {
    day: 'numeric',
    month: 'short',
    ...(includeYear && !sameYear ? { year: 'numeric' } : {})
  })
  return `${fmt.format(a)} — ${fmt.format(b)}`
}

/**
 * Очистить кэш Intl (полезно при смене локали).
 */
export function clearDateFormatCache() {
  formatterCache.clear()
}

/**
 * Хелпер для Vue-шаблонов: вернуть функцию с привязанным форматом.
 * @example
 *   <span>{{ formatShort(item.createdAt) }}</span>
 */
export const formatShort = (date) => formatDate(date, 'short')
export const formatLong = (date) => formatDate(date, 'long')
export const formatDateTime = (date) => formatDate(date, 'datetime')
export const formatRelativeShort = (date) => formatDate(date, 'relative-short')

export default formatDate