/**
 * Валидаторы и правила форм.
 *
 * Секции:
 * - Примитивы (email, phone, url, число, год, VIN)
 * - Пароль (strength, requirements)
 * - Формы (validateX — возвращают сообщение об ошибке или '')
 * - Хелперы для комплексных сценариев
 *
 * Все валидаторы безопасны к не-строковым значениям.
 */

/* ============================================================
 *  ХЕЛПЕРЫ
 * ============================================================ */

/** Привести к строке безопасно */
function toStr(value) {
  return typeof value === 'string' ? value : ''
}

/** Трим + снять лишние пробелы внутри */
function normalizeText(value) {
  return toStr(value).trim()
}

/**
 * Длина строки с учётом Unicode (эмодзи считаются за 1).
 */
function trueLength(value) {
  const str = toStr(value)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('ru', { granularity: 'grapheme' })
    return [...segmenter.segment(str)].length
  }
  return [...str].length
}

/* ============================================================
 *  ПРИМИТИВЫ
 * ============================================================ */

/**
 * Проверка email.
 * @param {string} value
 * @param {Object} [opts]
 * @param {boolean} [opts.allowLocal=false] — разрешить 'user@localhost'
 * @param {boolean} [opts.allowUnicode=false] — разрешить кириллицу
 * @returns {boolean}
 */
export function isEmail(value, opts = {}) {
  const str = normalizeText(value)
  if (!str) return false
  if (str.length > 254) return false

  const re = opts.allowUnicode
    ? /^[^\s@]+@[^\s@]+\.(?:[^\s@]{2,}|localhost)$/u
    : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

  if (re.test(str)) return true

  if (opts.allowLocal && /^[^\s@]+@localhost$/.test(str)) return true

  return false
}

/**
 * Проверка телефона. Возвращает true для 10-15 цифр.
 * @param {string} value
 * @returns {boolean}
 */
export function isPhone(value) {
  const str = normalizeText(value)
  if (!str) return false

  // Только цифры в диапазоне 10-15 (международный стандарт)
  const digits = str.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return false

  // Не разрешаем буквы кроме x/доб
  if (!/^[\d\s\-()+]+(?:\s*(?:ext|доб)\.?\s*\d+)?$/.test(str)) return false

  return true
}

/**
 * Нормализация телефона в E.164 (для RU).
 * @param {string} value
 * @param {string} [country='7'] — код страны
 * @returns {string} — '+79991234567' или ''
 */
export function normalizePhone(value, country = '7') {
  const str = normalizeText(value)
  if (!str) return ''

  let digits = str.replace(/\D/g, '')

  // RU: 8XXX → 7XXX
  if (country === '7' && digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  }

  // Добавляем код страны, если его нет
  if (digits.length === 10 && !digits.startsWith(country)) {
    digits = country + digits
  }

  if (digits.length < 10) return ''

  return '+' + digits
}

/**
 * Проверка URL.
 * @param {string} value
 * @param {Object} [opts]
 * @param {Array<string>} [opts.protocols=['http:', 'https:']]
 * @param {boolean} [opts.requireTLD=true]
 * @returns {boolean}
 */
export function isUrl(value, opts = {}) {
  const str = normalizeText(value)
  if (!str) return false

  const { protocols = ['http:', 'https:'], requireTLD = true } = opts

  // Автопрефикс — если нет схемы, пробуем https
  const candidate = /^[a-z][a-z0-9+\-.]*:/i.test(str) ? str : `https://${str}`

  try {
    const url = new URL(candidate)

    if (!protocols.includes(url.protocol)) return false

    if (requireTLD) {
      // Должна быть точка в хосте
      if (!url.hostname.includes('.')) return false
      // Не заканчивается на точку
      if (url.hostname.endsWith('.')) return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Минимальная длина строки (тримим пробелы).
 * @param {string} value
 * @param {number} min
 * @returns {boolean}
 */
export function minLength(value, min) {
  return trueLength(normalizeText(value)) >= min
}

/**
 * Максимальная длина строки.
 */
export function maxLength(value, max) {
  return trueLength(normalizeText(value)) <= max
}

/** Длина в диапазоне */
export function lengthBetween(value, min, max) {
  const len = trueLength(normalizeText(value))
  return len >= min && len <= max
}

/**
 * Проверка «значение не пустое».
 * @param {*} value
 * @param {Object} [opts]
 * @param {boolean} [opts.zeroIsEmpty=false]
 * @param {boolean} [opts.falseIsEmpty=false]
 * @param {boolean} [opts.trimStrings=true]
 * @returns {boolean}
 */
export function required(value, opts = {}) {
  const { zeroIsEmpty = false, falseIsEmpty = false, trimStrings = true } = opts

  if (value === null || value === undefined) return false

  if (typeof value === 'string') {
    return trimStrings ? value.trim() !== '' : value !== ''
  }

  if (Array.isArray(value)) return value.length > 0

  if (value instanceof Map || value instanceof Set) return value.size > 0

  if (value instanceof Date) return !Number.isNaN(value.getTime())

  if (typeof value === 'number') {
    if (Number.isNaN(value)) return false
    if (zeroIsEmpty && value === 0) return false
    return true
  }

  if (typeof value === 'boolean') {
    if (falseIsEmpty && value === false) return false
    return true
  }

  if (typeof value === 'object') return Object.keys(value).length > 0

  return true
}

/**
 * Проверка «это число».
 * Строго: '5abc' → false.
 * @param {*} value
 * @param {Object} [opts]
 * @param {boolean} [opts.allowString=true] — разрешить '5' как число
 * @param {boolean} [opts.allowFloat=true]
 * @returns {boolean}
 */
export function isNumber(value, opts = {}) {
  const { allowString = true, allowFloat = true } = opts

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return false
    return allowFloat ? true : Number.isInteger(value)
  }

  if (typeof value === 'string') {
    if (!allowString) return false
    const trimmed = value.trim()
    if (!trimmed) return false
    // Строгий regex: только валидное число
    const re = allowFloat
      ? /^-?\d+(?:\.\d+)?$/
      : /^-?\d+$/
    if (!re.test(trimmed)) return false
    return Number.isFinite(Number(trimmed))
  }

  return false
}

/** Положительное число */
export function isPositive(value) {
  if (!isNumber(value)) return false
  return Number(value) > 0
}

/** Неотрицательное (≥ 0) */
export function isNonNegative(value) {
  if (!isNumber(value)) return false
  return Number(value) >= 0
}

/** Целое число */
export function isInteger(value) {
  return isNumber(value, { allowFloat: false })
}

/**
 * В диапазоне [min, max].
 * Если min/max не указаны — проверка соответствующей стороны пропускается.
 */
export function inRange(value, min, max) {
  if (!isNumber(value)) return false
  const n = Number(value)
  if (min !== undefined && min !== null && n < min) return false
  if (max !== undefined && max !== null && n > max) return false
  return true
}

/**
 * Проверка года выпуска.
 * @param {*} value
 * @param {Object} [opts]
 * @param {number} [opts.minYear=1900]
 * @param {number} [opts.futureYears=1] — на сколько лет вперёд разрешаем
 */
export function isYear(value, opts = {}) {
  const { minYear = 1900, futureYears = 1 } = opts

  if (!isNumber(value, { allowFloat: false })) return false

  const year = Number(value)
  const currentYear = new Date().getFullYear()

  return year >= minYear && year <= currentYear + futureYears
}

/**
 * VIN: 17 символов, без I/O/Q.
 * @param {string} value
 * @param {Object} [opts]
 * @param {boolean} [opts.allowEmpty=false] — считать пустое значение валидным
 */
export function isVin(value, opts = {}) {
  const str = normalizeText(value)
  if (!str) return opts.allowEmpty === true
  if (str.length !== 17) return false
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(str)
}

/** Проверка гос. номера РФ (примерно) */
export function isLicensePlate(value) {
  const str = normalizeText(value).toUpperCase()
  return /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/.test(str)
}

/** ИНН РФ (10 или 12 цифр) */
export function isINN(value) {
  const str = normalizeText(value)
  return /^\d{10}$/.test(str) || /^\d{12}$/.test(str)
}

/** Дата (можно парсить в Date) */
export function isDate(value) {
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  if (typeof value !== 'string' && typeof value !== 'number') return false
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

/** Объектный id (Mongo-стиль) */
export function isObjectId(value) {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)
}

/* ============================================================
 *  ПАРОЛЬ
 * ============================================================ */

/**
 * Оценка надёжности пароля 0-4 (для индикатора).
 * @param {string} value
 * @returns {number}
 */
export function passwordStrength(value) {
  const str = toStr(value)
  if (!str) return 0

  let score = 0

  if (str.length >= 8) score++
  if (str.length >= 12) score++
  if (/[A-Z]/.test(str) && /[a-z]/.test(str)) score++
  if (/\d/.test(str)) score++
  if (/[^A-Za-z0-9]/.test(str)) score++

  // Штрафы
  if (/^(.)\1+$/.test(str)) score = 0                    // 'aaaaaaaa'
  if (/^\d+$/.test(str)) score = Math.min(score, 1)      // '12345678'
  if (/^[a-z]+$/i.test(str) && str.length < 8) score = Math.min(score, 1)

  const common = ['password', 'qwerty', '123456', 'admin', 'letmein']
  if (common.some(c => str.toLowerCase().includes(c))) {
    score = Math.min(score, 1)
  }

  return Math.min(score, 4)
}

/** Текстовое описание силы пароля */
export function passwordStrengthLabel(score) {
  return ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Надёжный'][score] || ''
}

/**
 * Полная проверка пароля.
 * @returns {{ ok: boolean, errors: string[], score: number }}
 */
export function checkPassword(value, opts = {}) {
  const {
    minLength: min = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireDigit = true,
    requireSpecial = false
  } = opts

  const str = toStr(value)
  const errors = []

  if (!str) {
    return { ok: false, errors: ['Пароль обязателен'], score: 0 }
  }
  if (str.length < min) errors.push(`Минимум ${min} символов`)
  if (requireUppercase && !/[A-Z]/.test(str)) errors.push('Нужна заглавная буква')
  if (requireLowercase && !/[a-z]/.test(str)) errors.push('Нужна строчная буква')
  if (requireDigit && !/\d/.test(str)) errors.push('Нужна цифра')
  if (requireSpecial && !/[^A-Za-z0-9]/.test(str)) errors.push('Нужен спецсимвол')

  return {
    ok: errors.length === 0,
    errors,
    score: passwordStrength(str)
  }
}

/* ============================================================
 *  ФОРМЫ — строки с ошибкой или ''
 * ============================================================ */

export function validateEmail(value) {
  if (!required(value)) return 'Email обязателен'
  if (!isEmail(value)) return 'Некорректный email'
  return ''
}

export function validatePassword(value, opts = {}) {
  const { min = 8 } = typeof opts === 'number' ? { min: opts } : opts

  if (!required(value)) return 'Пароль обязателен'
  if (!minLength(value, min)) return `Минимум ${min} символов`
  return ''
}

export function validatePasswordStrength(value, opts = {}) {
  const result = checkPassword(value, opts)
  if (!result.ok) return result.errors[0]
  return ''
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!required(confirmation)) return 'Подтвердите пароль'
  if (password !== confirmation) return 'Пароли не совпадают'
  return ''
}

export function validatePhone(value, opts = {}) {
  if (!required(value)) return 'Телефон обязателен'
  if (!isPhone(value)) return 'Некорректный телефон'
  return ''
}

export function validateName(value, min = 2) {
  if (!required(value)) return 'Имя обязательно'
  if (!minLength(value, min)) return `Минимум ${min} символа`
  return ''
}

export function validateYear(value, opts = {}) {
  if (!required(value)) return 'Укажите год'
  if (!isYear(value, opts)) return 'Некорректный год'
  return ''
}

export function validatePrice(value) {
  if (!required(value)) return 'Укажите цену'
  if (!isPositive(value)) return 'Цена должна быть больше 0'
  return ''
}

export function validateMileage(value) {
  if (!required(value)) return 'Укажите пробег'
  // ИСПРАВЛЕНО: 0 валиден, но '0' — тоже 0
  if (!isNonNegative(value)) return 'Некорректный пробег'
  return ''
}

export function validateVin(value) {
  // VIN необязателен
  if (!value) return ''
  if (!isVin(value)) return 'VIN должен содержать 17 символов'
  return ''
}

export function validateRequired(value, fieldName = 'Поле') {
  if (!required(value)) return `${fieldName} обязательно`
  return ''
}

/** Обязательная валидация числа */
export function validateNumber(value, fieldName = 'Число') {
  if (!required(value)) return `${fieldName} обязательно`
  if (!isNumber(value)) return `${fieldName} должно быть числом`
  return ''
}

/**
 * Диапазон для числового поля.
 */
export function validateRange(value, min, max, fieldName = 'Значение') {
  if (!isNumber(value)) return `${fieldName} должно быть числом`
  if (!inRange(value, min, max)) {
    return `${fieldName} должно быть от ${min} до ${max}`
  }
  return ''
}

/* ============================================================
 *  ХЕЛПЕРЫ ДЛЯ КОМПЛЕКСНЫХ ФОРМ
 * ============================================================ */

/**
 * Валидировать объект формы по схеме.
 *
 * @param {Object} form
 * @param {Object} schema — { field: validator(value, form) | [validator1, validator2] }
 * @returns {{ valid: boolean, errors: Object }}
 * @example
 *   const { valid, errors } = validateForm(form, {
 *     email: validateEmail,
 *     password: [
 *       v => validatePassword(v),
 *       v => validatePasswordStrength(v)
 *     ]
 *   })
 */
export function validateForm(form, schema) {
  const errors = {}

  for (const [field, validators] of Object.entries(schema)) {
    const list = Array.isArray(validators) ? validators : [validators]

    for (const validator of list) {
      const error = validator(form[field], form)
      if (error) {
        errors[field] = error
        break
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Быстрая проверка одного поля списком валидаторов.
 * Возвращает первую ошибку или ''.
 */
export function validateField(value, validators, form = {}) {
  const list = Array.isArray(validators) ? validators : [validators]
  for (const validator of list) {
    const error = validator(value, form)
    if (error) return error
  }
  return ''
}

/* ============================================================
 *  SANITIZE
 * ============================================================ */

/**
 * Убрать потенциально опасные символы (для ввода).
 * Не заменяет серверную валидацию!
 */
export function sanitizeInput(value, opts = {}) {
  const str = toStr(value)
  const { allowHtml = false } = opts

  if (allowHtml) return str

  return str
    .replace(/<[^>]*>/g, '') // убрать теги
    .replace(/[<>"']/g, '')  // убрать опасные символы
}

/** Оставить только цифры */
export function sanitizeDigits(value) {
  return toStr(value).replace(/\D/g, '')
}