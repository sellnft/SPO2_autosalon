/**
 * Форматирование цен.
 *
 * Особенности:
 * - Кэш Intl.NumberFormat (быстро при массовом рендере)
 * - Устойчивость к строкам, NaN, Infinity, boolean
 * - Компактные форматы: '2,8 млн ₽', '50 тыс. ₽'
 * - Обратный парсинг, работа с диапазонами, скидками
 */

import config from '@/config'

/* ============================================================
 *  Кэш форматеров
 * ============================================================ */

const formatterCache = new Map()

function getCurrencyFormatter(locale, currency, options = {}) {
  const key = `${locale}|${currency}|${JSON.stringify(options)}`
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...options
      })
    )
  }
  return formatterCache.get(key)
}

function getNumberFormatter(locale, options = {}) {
  const key = `num|${locale}|${JSON.stringify(options)}`
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options))
  }
  return formatterCache.get(key)
}

/* ============================================================
 *  Локаль / валюта
 * ============================================================ */

function getLocale() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('cv_locale') || 'ru-RU'
  }
  return 'ru-RU'
}

function getCurrency() {
  return config?.currency || 'RUB'
}

/* ============================================================
 *  Внутренние
 * ============================================================ */

/**
 * Привести значение к безопасному числу или null.
 * Отсекает NaN, Infinity, boolean, объекты, массивы.
 */
function toSafePrice(value) {
  if (value == null || value === '') return null

  // Массивы и объекты — не наша забота
  if (typeof value === 'object') return null

  // Boolean — не число
  if (typeof value === 'boolean') return null

  if (typeof value === 'string') {
    // Убираем всё, кроме цифр, минуса, точки и запятой
    const cleaned = value
      .replace(/\s/g, '')
      .replace(/\u00A0/g, '') // неразрывный пробел
      .replace(',', '.')
      .replace(/[^\d.-]/g, '')
    if (!cleaned) return null
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
 * Форматировать цену.
 *
 * @param {number|string|null} price
 * @param {Object} [opts]
 * @param {boolean} [opts.withCurrency=true] — добавлять ' ₽'
 * @param {boolean} [opts.short=false] — компактный формат ('2,8 млн ₽')
 * @param {string}  [opts.fallback=''] — что вернуть при невалидном значении
 * @param {string}  [opts.currency] — переопределить валюту
 * @returns {string}
 * @example
 *   formatPrice(2850000)                    // '2 850 000 ₽'
 *   formatPrice('2850000')                  // '2 850 000 ₽'
 *   formatPrice(2850000, { short: true })   // '2,85 млн ₽'
 *   formatPrice(2850000, { withCurrency: false }) // '2 850 000'
 *   formatPrice(null)                       // ''
 */
export function formatPrice(price, opts = {}) {
  const {
    withCurrency = true,
    short = false,
    fallback = '',
    currency = getCurrency()
  } = opts

  const n = toSafePrice(price)

  if (n == null) return fallback
  if (n < 0) return fallback // отрицательные цены — невалид

  const locale = getLocale()

  if (short) {
    return formatShortPrice(n, locale, currency, withCurrency)
  }

  if (!withCurrency) {
    return getNumberFormatter(locale, {
      maximumFractionDigits: 0
    }).format(n)
  }

  return getCurrencyFormatter(locale, currency, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n)
}

/**
 * Компактный формат: '2,85 млн ₽', '850 тыс. ₽', '500 ₽'.
 */
function formatShortPrice(n, locale, currency, withCurrency) {
  const suffix = withCurrency
    ? ' ' + (currency === 'RUB' ? '₽' : currency)
    : ''

  if (n >= 1_000_000_000) {
    const b = n / 1_000_000_000
    return `${getNumberFormatter(locale, {
      maximumFractionDigits: b < 10 ? 2 : 1
    }).format(b)} млрд${suffix}`
  }

  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `${getNumberFormatter(locale, {
      maximumFractionDigits: m < 10 ? 2 : (m < 100 ? 1 : 0)
    }).format(m)} млн${suffix}`
  }

  if (n >= 1_000) {
    const k = n / 1_000
    return `${getNumberFormatter(locale, {
      maximumFractionDigits: k < 100 ? 1 : 0
    }).format(k)} тыс.${suffix}`
  }

  return `${getNumberFormatter(locale, {
    maximumFractionDigits: 0
  }).format(n)}${suffix}`
}

/**
 * Диапазон цен: '1 000 000 — 3 000 000 ₽'.
 */
export function formatPriceRange(from, to, opts = {}) {
  const a = toSafePrice(from)
  const b = toSafePrice(to)
  const { withCurrency = true, short = false } = opts

  const validA = a != null && a >= 0 ? a : null
  const validB = b != null && b >= 0 ? b : null

  if (validA == null && validB == null) return ''

  if (validA == null) {
    return `до ${formatPrice(validB, opts)}`
  }
  if (validB == null) {
    return `от ${formatPrice(validA, opts)}`
  }

  if (validA === validB) {
    return formatPrice(validA, opts)
  }

  const locale = getLocale()
  const currency = getCurrency()

  if (short) {
    return `${formatShortPrice(validA, locale, currency, false)} — ${formatPrice(validB, opts)}`
  }

  const formatter = getNumberFormatter(locale, { maximumFractionDigits: 0 })
  const suffix = withCurrency
    ? ' ' + (currency === 'RUB' ? '₽' : currency)
    : ''

  return `${formatter.format(validA)} — ${formatter.format(validB)}${suffix}`
}

/**
 * Цена в месяц (для рассрочки / кредита).
 *
 * @param {number} price — полная цена
 * @param {number} [months=12] — срок
 * @returns {string} — '237 500 ₽/мес'
 */
export function formatPricePerMonth(price, months = 12) {
  const n = toSafePrice(price)
  const m = toSafePrice(months)

  if (n == null || n < 0) return ''
  if (m == null || m <= 0) return ''

  const perMonth = Math.round(n / m)
  return `${formatPrice(perMonth)}/мес`
}

/**
 * Цена со скидкой: { old, new, discount, percent }.
 *
 * @param {number} oldPrice
 * @param {number} newPrice
 * @returns {Object|null}
 */
export function formatPriceWithDiscount(oldPrice, newPrice) {
  const oldN = toSafePrice(oldPrice)
  const newN = toSafePrice(newPrice)

  if (oldN == null || newN == null) return null
  if (oldN <= 0 || newN < 0) return null
  if (newN >= oldN) return null // Нет скидки

  const discount = oldN - newN
  const percent = Math.round((discount / oldN) * 100)

  return {
    old: formatPrice(oldN),
    new: formatPrice(newN),
    discount: formatPrice(discount, { withCurrency: false }),
    discountFormatted: formatPrice(discount),
    percent,
    percentLabel: `−${percent}%`
  }
}

/**
 * Разбить цену на части для стилизации.
 * @returns {{ value: string, currency: string, full: string }}
 * @example
 *   getPriceParts(2850000)
 *   // { value: '2 850 000', currency: '₽', full: '2 850 000 ₽' }
 */
export function getPriceParts(price, opts = {}) {
  const n = toSafePrice(price)
  if (n == null || n < 0) {
    return { value: '', currency: '', full: '' }
  }

  const locale = getLocale()
  const currency = getCurrency()

  const value = getNumberFormatter(locale, {
    maximumFractionDigits: 0
  }).format(n)

  const currencySymbol = currency === 'RUB' ? '₽' : currency

  return {
    value,
    currency: currencySymbol,
    full: `${value} ${currencySymbol}`
  }
}

/**
 * Обратный парсинг: '2 850 000 ₽' → 2850000.
 *
 * @param {string|number|null} value
 * @returns {number|null}
 */
export function parsePrice(value) {
  const n = toSafePrice(value)
  return n == null || n < 0 ? null : Math.round(n)
}

/**
 * Очистить ввод (для input/form).
 * Синоним parsePrice для семантики.
 *
 * @example
 *   unformatPrice('2 850 000 ₽')  // 2850000
 *   unformatPrice('2850000')      // 2850000
 *   unformatPrice('abc')          // null
 */
export function unformatPrice(value) {
  return parsePrice(value)
}

/**
 * Очистить кэш (при смене локали/валюты).
 */
export function clearPriceFormatterCache() {
  formatterCache.clear()
}

export default formatPrice