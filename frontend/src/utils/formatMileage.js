/**
 * Форматирование пробега.
 *
 * Особенности:
 * - Кэш Intl.NumberFormat (быстро при массовом рендере)
 * - Устойчивость к строкам, NaN, отрицательным
 * - Форматы: обычный, короткий ('50 тыс. км'), диапазон
 * - Обратный парсинг (parseMileage / unformatMileage)
 */

/* ============================================================
 *  Кэш форматеров
 * ============================================================ */

const formatterCache = new Map()

function getNumberFormatter(locale, options = {}) {
  const key = locale + '|' + JSON.stringify(options)
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options))
  }
  return formatterCache.get(key)
}

/* ============================================================
 *  Локаль
 * ============================================================ */

function getLocale() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('cv_locale') || 'ru-RU'
  }
  return 'ru-RU'
}

/* ============================================================
 *  Внутренние
 * ============================================================ */

/**
 * Привести значение к безопасному числу или null.
 */
function toSafeNumber(value) {
  if (value == null || value === '') return null

  // Строка типа '50 000' или '50,000' — убираем пробелы и запятые
  if (typeof value === 'string') {
    const cleaned = value.replace(/[\s,]/g, '').replace(/[^\d.-]/g, '')
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : null
  }

  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/* ============================================================
 *  Публичный API
 * ============================================================ */

/**
 * Форматировать пробег.
 *
 * @param {number|string|null} mileage
 * @param {Object} [opts]
 * @param {boolean} [opts.withUnit=true] — добавлять ' км'
 * @param {boolean} [opts.short=false] — короткий формат ('50 тыс. км')
 * @param {string}  [opts.fallback=''] — что вернуть, если значение пустое
 * @returns {string}
 * @example
 *   formatMileage(50000)              // '50 000 км'
 *   formatMileage('50000')            // '50 000 км'
 *   formatMileage(50000, { short: true })   // '50 тыс. км'
 *   formatMileage(50000, { withUnit: false }) // '50 000'
 *   formatMileage(null)               // ''
 */
export function formatMileage(mileage, opts = {}) {
  const {
    withUnit = true,
    short = false,
    fallback = ''
  } = opts

  const n = toSafeNumber(mileage)

  if (n == null) return fallback

  // Отрицательный пробег — считаем невалидным
  if (n < 0) return fallback

  // 0 км — валидное значение (новый авто)
  if (n === 0) {
    return withUnit ? '0 км' : '0'
  }

  const locale = getLocale()

  if (short) {
    return formatShortMileage(n, withUnit, locale)
  }

  const formatted = getNumberFormatter(locale, {
    maximumFractionDigits: 0
  }).format(n)

  return withUnit ? `${formatted} км` : formatted
}

/**
 * Короткий формат: '50 тыс. км', '1.5 млн км'.
 */
function formatShortMileage(n, withUnit, locale) {
  let result

  if (n >= 1_000_000) {
    const millions = n / 1_000_000
    result = `${getNumberFormatter(locale, {
      maximumFractionDigits: millions < 10 ? 1 : 0
    }).format(millions)} млн`
  } else if (n >= 1000) {
    const thousands = n / 1000
    result = `${getNumberFormatter(locale, {
      maximumFractionDigits: thousands < 100 ? 1 : 0
    }).format(thousands)} тыс.`
  } else {
    result = getNumberFormatter(locale, {
      maximumFractionDigits: 0
    }).format(n)
  }

  return withUnit ? `${result} км` : result
}

/**
 * Диапазон пробега: '10 000 — 50 000 км'.
 */
export function formatMileageRange(from, to, opts = {}) {
  const a = toSafeNumber(from)
  const b = toSafeNumber(to)
  const { withUnit = true, short = false } = opts

  const validA = a != null && a >= 0 ? a : null
  const validB = b != null && b >= 0 ? b : null

  if (validA == null && validB == null) return ''

  if (validA == null) {
    return formatMileage(validB, { withUnit, short })
  }
  if (validB == null) {
    return formatMileage(validA, { withUnit, short })
  }

  const locale = getLocale()
  const formatter = getNumberFormatter(locale, { maximumFractionDigits: 0 })

  return `${formatter.format(validA)} — ${formatter.format(validB)}${withUnit ? ' км' : ''}`
}

/**
 * Пробег в год (важная метрика для б/у авто).
 *
 * @param {number} mileage — общий пробег
 * @param {number} year — год выпуска
 * @returns {string} — '15 000 км/год' или '' если данные невалидны
 */
export function formatMileagePerYear(mileage, year) {
  const n = toSafeNumber(mileage)
  const y = toSafeNumber(year)

  if (n == null || n < 0) return ''
  if (y == null || y < 1950) return ''

  const currentYear = new Date().getFullYear()
  const age = Math.max(1, currentYear - y)

  const perYear = Math.round(n / age)

  return `${formatMileage(perYear, { withUnit: false })} км/год`
}

/**
 * Обратный парсинг: '50 000 км' → 50000.
 * Работает и с числом, и со строкой.
 *
 * @param {string|number|null} value
 * @returns {number|null}
 * @example
 *   parseMileage('50 000 км')   // 50000
 *   parseMileage('50000')       // 50000
 *   parseMileage('abc')         // null
 */
export function parseMileage(value) {
  const n = toSafeNumber(value)
  return n == null || n < 0 ? null : Math.round(n)
}

/**
 * Очистить ввод (для input type=number / form).
 * Убирает всё, кроме цифр.
 *
 * @param {string|number|null} value
 * @returns {number|null}
 * @example
 *   unformatMileage('50 000 км')  // 50000
 *   unformatMileage('50,000')     // 50000
 *   unformatMileage('abc')        // null
 */
export function unformatMileage(value) {
  return parseMileage(value)
}

/**
 * Проверка «пробег реалистичен».
 * Для оценки б/у авто — например, предупреждение «пробег не соответствует году».
 *
 * @param {number} mileage
 * @param {number} year
 * @returns {{ ok: boolean, reason?: string, perYear?: number }}
 */
export function validateMileage(mileage, year) {
  const n = toSafeNumber(mileage)
  const y = toSafeNumber(year)

  if (n == null || n < 0) return { ok: false, reason: 'invalid_mileage' }
  if (y == null || y < 1950 || y > new Date().getFullYear()) {
    return { ok: false, reason: 'invalid_year' }
  }

  const age = Math.max(1, new Date().getFullYear() - y)
  const perYear = Math.round(n / age)

  // Норма: до 30 000 км/год
  if (perYear > 50000) {
    return { ok: false, reason: 'too_high', perYear }
  }
  if (perYear > 30000) {
    return { ok: true, reason: 'above_average', perYear }
  }
  return { ok: true, perYear }
}

/**
 * Очистить кэш (при смене локали).
 */
export function clearMileageFormatterCache() {
  formatterCache.clear()
}

export default formatMileage