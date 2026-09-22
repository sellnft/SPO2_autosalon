/**
 * Общие утилиты.
 *
 * Разбит на секции:
 * - Тайминги (debounce, throttle, sleep)
 * - Объекты (deepClone, pick, omit, isEmpty)
 * - Строки (truncate, pluralize, createSlug)
 * - Массивы (groupBy, sortBy, unique, chunk, shuffle)
 * - Числа (clamp, roundTo, percentage)
 * - DOM (scrollToTop, scrollToElement, copyToClipboard, downloadFile)
 * - ID (randomId)
 */

/* ============================================================
 *  ТАЙМИНГИ
 * ============================================================ */

/**
 * Debounce: вызов после паузы.
 * @param {Function} fn
 * @param {number} [delay=300]
 * @param {Object} [opts]
 * @param {boolean} [opts.immediate=false] — leading edge
 * @returns {Function & { cancel, flush }}
 */
export function debounce(fn, delay = 300, opts = {}) {
  const { immediate = false } = opts

  let timeout = null
  let lastArgs = null
  let lastThis = null

  function invoke() {
    if (!lastArgs) return
    fn.apply(lastThis, lastArgs)
    lastArgs = null
    lastThis = null
  }

  function debounced(...args) {
    lastArgs = args
    lastThis = this

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) invoke()
    }, delay)

    if (callNow) invoke()
  }

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout)
    timeout = null
    lastArgs = null
    lastThis = null
  }

  debounced.flush = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    invoke()
  }

  return debounced
}

/**
 * Throttle: не чаще, чем раз в limit мс.
 * @param {Function} fn
 * @param {number} [limit=300]
 * @param {Object} [opts]
 * @param {boolean} [opts.leading=true]
 * @param {boolean} [opts.trailing=true]
 * @returns {Function & { cancel }}
 */
export function throttle(fn, limit = 300, opts = {}) {
  const { leading = true, trailing = true } = opts

  let lastCall = 0
  let timer = null
  let lastArgs = null
  let lastThis = null

  function invoke() {
    if (!lastArgs) return
    fn.apply(lastThis, lastArgs)
    lastArgs = null
    lastThis = null
    lastCall = Date.now()
  }

  function throttled(...args) {
    const now = Date.now()
    const elapsed = now - lastCall

    lastArgs = args
    lastThis = this

    if (!lastCall && !leading) lastCall = now

    if (elapsed >= limit) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      invoke()
      return
    }

    if (!timer && trailing) {
      timer = setTimeout(() => {
        timer = null
        invoke()
      }, limit - elapsed)
    }
  }

  throttled.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    lastArgs = null
    lastThis = null
    lastCall = 0
  }

  return throttled
}

/** Пауза */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/* ============================================================
 *  ОБЪЕКТЫ
 * ============================================================ */

/**
 * Глубокое клонирование.
 * - Использует native structuredClone, если доступен
 * - Fallback — ручной обход с поддержкой Map/Set/Date/RegExp
 * - Обрабатывает циклические ссылки
 */
export function deepClone(obj, seen = new WeakMap()) {
  // Примитивы
  if (obj === null || typeof obj !== 'object') return obj

  // Native
  if (typeof structuredClone === 'function') {
    try { return structuredClone(obj) } catch { /* fallthrough */ }
  }

  // Циклическая ссылка
  if (seen.has(obj)) return seen.get(obj)

  // Date
  if (obj instanceof Date) return new Date(obj.getTime())

  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }

  // Map
  if (obj instanceof Map) {
    const result = new Map()
    seen.set(obj, result)
    obj.forEach((v, k) => result.set(deepClone(k, seen), deepClone(v, seen)))
    return result
  }

  // Set
  if (obj instanceof Set) {
    const result = new Set()
    seen.set(obj, result)
    obj.forEach(v => result.add(deepClone(v, seen)))
    return result
  }

  // ArrayBuffer / TypedArray
  if (obj instanceof ArrayBuffer) return obj.slice(0)
  if (ArrayBuffer.isView(obj)) {
    return new obj.constructor(obj.buffer.slice(0))
  }

  // File / Blob — не клонируем, возвращаем как есть (immutable)
  if (typeof File !== 'undefined' && obj instanceof File) return obj
  if (typeof Blob !== 'undefined' && obj instanceof Blob) return obj

  // Array
  if (Array.isArray(obj)) {
    const result = []
    seen.set(obj, result)
    obj.forEach((v, i) => { result[i] = deepClone(v, seen) })
    return result
  }

  // Обычный объект
  const result = {}
  seen.set(obj, result)
  Object.keys(obj).forEach(k => {
    result[k] = deepClone(obj[k], seen)
  })
  return result
}

/**
 * Проверка «пусто».
 * @param {*} value
 * @param {Object} [opts]
 * @param {boolean} [opts.zeroIsEmpty=false] — считать ли 0 пустым
 * @param {boolean} [opts.falseIsEmpty=false] — считать ли false пустым
 * @returns {boolean}
 */
export function isEmpty(value, opts = {}) {
  const { zeroIsEmpty = false, falseIsEmpty = false } = opts

  if (value === null || value === undefined) return true

  if (typeof value === 'string') return value.trim() === ''

  if (Array.isArray(value)) return value.length === 0

  if (value instanceof Map || value instanceof Set) return value.size === 0

  if (value instanceof Date) return false // Дата — не пустая

  if (typeof value === 'number') {
    if (zeroIsEmpty && value === 0) return true
    return false
  }

  if (typeof value === 'boolean') {
    if (falseIsEmpty && value === false) return true
    return false
  }

  if (typeof value === 'object') return Object.keys(value).length === 0

  return false
}

/**
 * Взять только указанные ключи.
 * @param {Object} obj
 * @param {Array<string|symbol>} keys
 */
export function pick(obj, keys) {
  if (!obj || typeof obj !== 'object') return {}
  const result = {}
  keys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Исключить указанные ключи.
 */
export function omit(obj, keys) {
  if (!obj || typeof obj !== 'object') return {}
  const set = new Set(keys)
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !set.has(k))
  )
}

/* ============================================================
 *  СТРОКИ
 * ============================================================ */

/**
 * Обрезать текст до N символов.
 * @param {string} text
 * @param {number} [length=50]
 * @param {string} [suffix='…']
 * @param {boolean} [wordBoundary=false] — не резать посреди слова
 */
export function truncate(text, length = 50, suffix = '…', wordBoundary = false) {
  if (!text) return ''
  if (text.length <= length) return text

  let cut = text.slice(0, length)

  if (wordBoundary) {
    const lastSpace = cut.lastIndexOf(' ')
    if (lastSpace > length * 0.6) {
      cut = cut.slice(0, lastSpace)
    }
  }

  return cut.trimEnd() + suffix
}

/**
 * Склонение существительных.
 * @param {number} count
 * @param {[string, string, string]} forms — ['товар', 'товара', 'товаров']
 */
export function pluralize(count, forms) {
  const n = Math.abs(Number(count) || 0)
  const mod10 = n % 10
  const mod100 = n % 100

  if (mod100 > 4 && mod100 < 20) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

/**
 * Склонение вместе с числом: pluralizeWithCount(5, ['товар', 'товара', 'товаров']) → '5 товаров'
 */
export function pluralizeWithCount(count, forms) {
  return `${count} ${pluralize(count, forms)}`
}

/**
 * Транслитерация в slug (для URL).
 * @param {string} text
 */
export function createSlug(text) {
  if (!text) return ''

  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e',
    ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
    ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
  }

  return text
    .toLowerCase()
    .split('')
    .map(ch => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

/* ============================================================
 *  МАССИВЫ
 * ============================================================ */

/**
 * Группировка массива по ключу или функции.
 * @param {Array} array
 * @param {string|Function} key
 * @param {string} [fallback='other'] — название группы для undefined-ключей
 */
export function groupBy(array, key, fallback = 'other') {
  if (!Array.isArray(array)) return {}

  return array.reduce((acc, item) => {
    const group = typeof key === 'function' ? key(item) : item?.[key]
    const safeGroup = group ?? fallback
    if (!acc[safeGroup]) acc[safeGroup] = []
    acc[safeGroup].push(item)
    return acc
  }, {})
}

/**
 * Сортировка с поддержкой null/undefined и локали.
 */
export function sortBy(array, key, order = 'asc') {
  if (!Array.isArray(array)) return []

  const dir = order === 'asc' ? 1 : -1

  return [...array].sort((a, b) => {
    let aVal = typeof key === 'function' ? key(a) : a?.[key]
    let bVal = typeof key === 'function' ? key(b) : b?.[key]

    // null/undefined — в конец, независимо от порядка
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * dir
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal, 'ru') * dir
    }

    return (aVal > bVal ? 1 : aVal < bVal ? -1 : 0) * dir
  })
}

/** Уникальные значения */
export function unique(array, key) {
  if (!Array.isArray(array)) return []
  if (!key) return Array.from(new Set(array))

  const seen = new Set()
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item?.[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

/** Разбить массив на куски */
export function chunk(array, size = 1) {
  if (!Array.isArray(array)) return []
  const n = Math.max(1, Math.floor(size))
  const result = []
  for (let i = 0; i < array.length; i += n) {
    result.push(array.slice(i, i + n))
  }
  return result
}

/** Перемешать (Fisher-Yates) */
export function shuffle(array) {
  if (!Array.isArray(array)) return []
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/* ============================================================
 *  ЧИСЛА
 * ============================================================ */

/** Ограничить значение */
export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max)
}

/** Округлить до шага */
export function roundTo(value, step = 1) {
  const n = Number(value) || 0
  return Math.round(n / step) * step
}

/** Процент (a от b) */
export function percentage(part, total, decimals = 0) {
  const t = Number(total)
  if (!t) return 0
  const p = (Number(part) / t) * 100
  return decimals ? Number(p.toFixed(decimals)) : Math.round(p)
}

/* ============================================================
 *  DOM
 * ============================================================ */

/** Скролл наверх */
export function scrollToTop(smooth = true) {
  if (typeof window === 'undefined') return
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

/** Скролл к элементу с отступом (для фиксированного хедера) */
export function scrollToElement(target, offset = 80) {
  if (typeof window === 'undefined') return

  const el = typeof target === 'string'
    ? document.querySelector(target)
    : target

  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

/**
 * Скопировать в буфер обмена.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  const string = String(text ?? '')
  if (!string) return false

  // Modern API
  if (navigator?.clipboard && window?.isSecureContext) {
    try {
      await navigator.clipboard.writeText(string)
      return true
    } catch {
      // fallback ниже
    }
  }

  // Fallback
  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = string
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.opacity = '0'
  textarea.setAttribute('readonly', '')
  document.body.appendChild(textarea)

  try {
    textarea.select()
    textarea.setSelectionRange(0, string.length)
    const ok = document.execCommand('copy')
    return ok
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

/**
 * Скачать файл.
 * @param {string|Blob|Object} content
 * @param {string} filename
 * @param {string} [type='text/plain']
 * @param {Object} [opts]
 * @param {boolean} [opts.bom=false] — добавить BOM (для Excel CSV)
 */
export function downloadFile(content, filename, type = 'text/plain', opts = {}) {
  if (typeof document === 'undefined') return

  const { bom = false } = opts

  let blob

  if (content instanceof Blob) {
    blob = content
  } else {
    let data = content

    // Объект → JSON
    if (typeof content === 'object' && content !== null) {
      data = JSON.stringify(content, null, 2)
      type = 'application/json'
    }

    // BOM для Excel
    if (bom && typeof data === 'string') {
      data = '\uFEFF' + data
    }

    blob = new Blob([data], { type })
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // Даём браузеру время начать загрузку (Safari)
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

/* ============================================================
 *  ID
 * ============================================================ */

/**
 * Сгенерировать уникальный id.
 * @param {string} [prefix='id']
 */
export function randomId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}