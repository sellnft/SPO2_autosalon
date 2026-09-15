export function isEmail(value) {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isPhone(value) {
  if (!value) return false
  return /^\+?[\d\s\-()]{10,}$/.test(value)
}

export function isUrl(value) {
  if (!value) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function minLength(value, min) {
  return typeof value === 'string' && value.length >= min
}

export function maxLength(value, max) {
  return typeof value === 'string' && value.length <= max
}

export function required(value) {
  if (Array.isArray(value)) return value.length > 0
  return value !== null && value !== undefined && value !== ''
}

export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export function isPositive(value) {
  return isNumber(value) && parseFloat(value) > 0
}

export function inRange(value, min, max) {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

export function isYear(value) {
  const year = parseInt(value)
  const currentYear = new Date().getFullYear()
  return !isNaN(year) && year >= 1950 && year <= currentYear + 1
}

export function isVin(value) {
  if (!value) return true // VIN необязателен
  return /^[A-HJ-NPR-Z0-9]{17}$/i.test(value)
}

export function passwordStrength(value) {
  if (!value) return 0
  let score = 0
  if (value.length >= 6) score++
  if (value.length >= 10) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return score
}

// Валидаторы для форм
export function validateEmail(value) {
  if (!required(value)) return 'Email обязателен'
  if (!isEmail(value)) return 'Некорректный email'
  return ''
}

export function validatePassword(value, min = 6) {
  if (!required(value)) return 'Пароль обязателен'
  if (!minLength(value, min)) return `Минимум ${min} символов`
  return ''
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!required(confirmation)) return 'Подтвердите пароль'
  if (password !== confirmation) return 'Пароли не совпадают'
  return ''
}

export function validatePhone(value) {
  if (!required(value)) return 'Телефон обязателен'
  if (!isPhone(value)) return 'Некорректный телефон'
  return ''
}

export function validateName(value, min = 2) {
  if (!required(value)) return 'Имя обязательно'
  if (!minLength(value, min)) return `Минимум ${min} символа`
  return ''
}

export function validateYear(value) {
  if (!required(value)) return 'Укажите год'
  if (!isYear(value)) return 'Некорректный год'
  return ''
}

export function validatePrice(value) {
  if (!required(value)) return 'Укажите цену'
  if (!isPositive(value)) return 'Цена должна быть больше 0'
  return ''
}

export function validateMileage(value) {
  if (!required(value)) return 'Укажите пробег'
  if (!isPositive(value) && value !== 0) return 'Некорректный пробег'
  return ''
}

export function validateVin(value) {
  if (!value) return ''
  if (!isVin(value)) return 'VIN должен содержать 17 символов'
  return ''
}

export function validateRequired(value, fieldName = 'Поле') {
  if (!required(value)) return `${fieldName} обязательно`
  return ''
}