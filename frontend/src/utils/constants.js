/**
 * Глобальные константы приложения.
 *
 * Особенности:
 * - Все объекты заморожены (Object.freeze) — защита от случайной мутации
 * - value / label единообразны
 * - Хелперы labelOf() и byValue() для удобной работы
 * - APP_NAME берётся из config — единый источник правды
 */

import config from '@/config'

/* ============================================================
 *  Хелперы
 * ============================================================ */

/**
 * Заморозить глубоко (по всем ключам).
 */
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(key => {
    const value = obj[key]
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value)
    }
  })
  return Object.freeze(obj)
}

/**
 * Получить label по value из массива { value, label }.
 * @param {Array} list
 * @param {string} value
 * @param {string} [fallback='']
 */
function labelOf(list, value, fallback = '') {
  if (!Array.isArray(list)) return fallback
  const found = list.find(item => item.value === value)
  return found?.label ?? fallback
}

/**
 * Получить элемент по value.
 */
function byValue(list, value) {
  if (!Array.isArray(list)) return null
  return list.find(item => item.value === value) ?? null
}

/* ============================================================
 *  APP
 * ============================================================ */

export const APP_NAME = config.app.title
export const APP_VERSION = config.app.version
export const APP_ENV = config.app.environment

/* ============================================================
 *  Авто-характеристики
 * ============================================================ */

export const BODY_TYPES = deepFreeze([
  { value: 'sedan', label: 'Седан' },
  { value: 'crossover', label: 'Кроссовер' },
  { value: 'suv', label: 'Внедорожник' },
  { value: 'hatchback', label: 'Хэтчбек' },
  { value: 'liftback', label: 'Лифтбек' },
  { value: 'wagon', label: 'Универсал' },
  { value: 'coupe', label: 'Купе' },
  { value: 'convertible', label: 'Кабриолет' },
  { value: 'minivan', label: 'Минивэн' },
  { value: 'pickup', label: 'Пикап' }
])

export const ENGINE_TYPES = deepFreeze([
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'electric', label: 'Электро' },
  { value: 'gas', label: 'Газ' }
])

export const TRANSMISSIONS = deepFreeze([
  { value: 'automatic', label: 'Автомат' },
  { value: 'manual', label: 'Механика' },
  { value: 'robot', label: 'Робот' },
  { value: 'variator', label: 'Вариатор' }
])

export const DRIVES = deepFreeze([
  { value: 'front', label: 'Передний' },
  { value: 'rear', label: 'Задний' },
  { value: 'all', label: 'Полный' }
])

export const COLORS = deepFreeze([
  { value: 'black', label: 'Чёрный', hex: '#0A0A0C' },
  { value: 'white', label: 'Белый', hex: '#F5F0E6' },
  { value: 'silver', label: 'Серебристый', hex: '#C0C0C0' },
  { value: 'gray', label: 'Серый', hex: '#808080' },
  { value: 'blue', label: 'Синий', hex: '#2563EB' },
  { value: 'red', label: 'Красный', hex: '#DC2626' },
  { value: 'green', label: 'Зелёный', hex: '#16A34A' },
  { value: 'brown', label: 'Коричневый', hex: '#78350F' },
  { value: 'orange', label: 'Оранжевый', hex: '#EA580C' },
  { value: 'yellow', label: 'Жёлтый', hex: '#EAB308' }
])

export const STEERING_WHEELS = deepFreeze([
  { value: 'left', label: 'Левый' },
  { value: 'right', label: 'Правый' }
])

export const CONDITIONS = deepFreeze([
  { value: 'excellent', label: 'Отличное' },
  { value: 'good', label: 'Хорошее' },
  { value: 'satisfactory', label: 'Удовлетворительное' },
  { value: 'needs_repair', label: 'Требует ремонта' }
])

export const SELLER_TYPES = deepFreeze([
  { value: 'private', label: 'Частное лицо' },
  { value: 'dealer', label: 'Дилер' },
  { value: 'salon', label: 'Автосалон' }
])

/* ============================================================
 *  Бренды / города
 * ============================================================ */

const BRAND_NAMES = [
  'BMW', 'Mercedes-Benz', 'Toyota', 'Audi', 'Volkswagen',
  'Kia', 'Hyundai', 'Lexus', 'Mazda', 'Skoda',
  'Volvo', 'Nissan', 'Porsche', 'Renault', 'Subaru',
  'Mitsubishi', 'Ford', 'Honda', 'Land Rover', 'Jeep'
]

export const BRANDS = deepFreeze(
  BRAND_NAMES.map(b => ({ value: b, label: b }))
)

const CITY_NAMES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург',
  'Новосибирск', 'Ростов-на-Дону', 'Уфа', 'Самара',
  'Нижний Новгород', 'Воронеж', 'Краснодар', 'Иркутск'
]

export const CITIES = deepFreeze(
  CITY_NAMES.map(c => ({ value: c, label: c }))
)

/* ============================================================
 *  Feedback
 * ============================================================ */

export const FEEDBACK_CATEGORIES = deepFreeze([
  { value: 'technical', label: 'Техническая проблема', icon: 'wrench' },
  { value: 'payment', label: 'Оплата и сделки', icon: 'credit-card' },
  { value: 'account', label: 'Аккаунт', icon: 'user' },
  { value: 'moderation', label: 'Модерация', icon: 'shield' },
  { value: 'suggestion', label: 'Предложение', icon: 'lightbulb' },
  { value: 'other', label: 'Другое', icon: 'file' }
])

export const FEEDBACK_PRIORITIES = deepFreeze([
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
  { value: 'critical', label: 'Критический' }
])

export const FEEDBACK_STATUSES = deepFreeze({
  open: { label: 'Открыто', color: 'info' },
  in_progress: { label: 'В работе', color: 'warning' },
  waiting_user: { label: 'Ждёт ответа', color: 'danger' },
  resolved: { label: 'Решено', color: 'success' },
  closed: { label: 'Закрыто', color: 'neutral' }
})

/* ============================================================
 *  Notifications
 * ============================================================ */

export const NOTIFICATION_TYPES = deepFreeze({
  chat: { label: 'Сообщение', icon: 'chat' },
  price: { label: 'Цена', icon: 'chart' },
  status: { label: 'Статус', icon: 'check' },
  sold: { label: 'Продано', icon: 'star' },
  support: { label: 'Поддержка', icon: 'headphones' },
  security: { label: 'Безопасность', icon: 'lock' },
  system: { label: 'Система', icon: 'settings' }
})

/* ============================================================
 *  Статусы
 * ============================================================ */

export const ANNOUNCEMENT_STATUSES = deepFreeze({
  draft: { label: 'Черновик', color: 'neutral' },
  pending: { label: 'На модерации', color: 'warning' },
  active: { label: 'Активно', color: 'success' },
  rejected: { label: 'Отклонено', color: 'danger' },
  blocked: { label: 'Заблокировано', color: 'danger' },
  sold: { label: 'Продано', color: 'info' },
  archived: { label: 'В архиве', color: 'neutral' }
})

export const USER_STATUSES = deepFreeze({
  active: { label: 'Активен', color: 'success' },
  pending: { label: 'Ожидает', color: 'warning' },
  blocked: { label: 'Заблокирован', color: 'danger' },
  deleted: { label: 'Удалён', color: 'neutral' }
})

export const USER_ROLES = deepFreeze({
  user: { label: 'Пользователь', color: 'neutral' },
  moderator: { label: 'Модератор', color: 'info' },
  admin: { label: 'Администратор', color: 'accent' }
})

/* ============================================================
 *  Сортировка
 * ============================================================ */

export const SORT_OPTIONS = deepFreeze([
  { value: 'createdAt-desc', label: 'Сначала новые' },
  { value: 'createdAt-asc', label: 'Сначала старые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'year-desc', label: 'Новые по году' },
  { value: 'year-asc', label: 'Старые по году' },
  { value: 'mileage-asc', label: 'Меньше пробег' },
  { value: 'mileage-desc', label: 'Больше пробег' },
  { value: 'views-desc', label: 'Популярные' }
])

export const ADMIN_SORT_OPTIONS = deepFreeze([
  { value: 'updatedAt-desc', label: 'Недавно обновлённые' },
  { value: 'updatedAt-asc', label: 'Давно обновлённые' },
  { value: 'createdAt-desc', label: 'Новые сначала' },
  { value: 'priority-desc', label: 'По приоритету' }
])

/* ============================================================
 *  Пагинация
 * ============================================================ */

export const PAGINATION = deepFreeze({
  defaultPageSize: config.pagination?.defaultPageSize ?? 20,
  pageSizeOptions: config.pagination?.pageSizeOptions ?? [10, 20, 50, 100]
})

/* ============================================================
 *  Дата / валюта
 * ============================================================ */

export const LOCALE = 'ru-RU'
export const CURRENCY = 'RUB'

export const DATE_FORMATS = deepFreeze({
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  long: { day: 'numeric', month: 'long', year: 'numeric' },
  datetime: {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  },
  time: { hour: '2-digit', minute: '2-digit' }
})

/* ============================================================
 *  Storage keys (localStorage / sessionStorage)
 * ============================================================ */

export const STORAGE_KEYS = deepFreeze({
  ACCESS_TOKEN: 'cv_access_token',
  REFRESH_TOKEN: 'cv_refresh_token',
  LOCALE: 'cv_locale',
  THEME: 'cv_theme',
  DRAFT: 'cv_announcement_draft',
  PENDING_2FA: 'cv_pending_2fa',
  RECENT_SEARCHES: 'cv_recent_searches'
})

/* ============================================================
 *  Роуты (часто используемые имена)
 * ============================================================ */

export const ROUTE_NAMES = deepFreeze({
  HOME: 'home',
  ANNOUNCEMENTS: 'announcements',
  ANNOUNCEMENT_CREATE: 'announcement-create',
  ANNOUNCEMENT_DETAIL: 'announcement-detail',
  ANNOUNCEMENT_EDIT: 'announcement-edit',

  LOGIN: 'login',
  REGISTER: 'register',
  VERIFY_EMAIL: 'verify-email',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  TWO_FACTOR: '2fa',
  TWO_FACTOR_SETUP: '2fa-setup',

  PROFILE: 'profile',
  PROFILE_EDIT: 'profile-edit',
  MY_ANNOUNCEMENTS: 'my-announcements',
  MY_SUBSCRIPTIONS: 'my-subscriptions',
  SAVED_SEARCHES: 'saved-searches',
  MY_SESSIONS: 'my-sessions',
  FAVOURITES: 'favourites',

  CHAT: 'chat',
  CHAT_DETAIL: 'chat-detail',
  FEEDBACK: 'feedback',
  FEEDBACK_DETAIL: 'feedback-detail',

  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_USERS: 'admin-users',
  ADMIN_USER: 'admin-user',
  ADMIN_ANNOUNCEMENTS: 'admin-announcements',
  ADMIN_ANNOUNCEMENT: 'admin-announcement',
  ADMIN_FEEDBACK: 'admin-feedback',
  ADMIN_FEEDBACK_DETAIL: 'admin-feedback-detail',
  ADMIN_AUDIT_LOGS: 'admin-audit-logs',

  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  SERVER_ERROR: 'server-error'
})

/* ============================================================
 *  Хелперы (re-export)
 * ============================================================ */

export { labelOf, byValue }