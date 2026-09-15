export const APP_NAME = 'Auto Platform'

export const BODY_TYPES = [
  { value: 'Седан', label: 'Седан' },
  { value: 'Кроссовер', label: 'Кроссовер' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Хэтчбек', label: 'Хэтчбек' },
  { value: 'Лифтбек', label: 'Лифтбек' },
  { value: 'Универсал', label: 'Универсал' },
  { value: 'Купе', label: 'Купе' },
  { value: 'Кабриолет', label: 'Кабриолет' }
]

export const ENGINE_TYPES = [
  { value: 'Бензин', label: 'Бензин' },
  { value: 'Дизель', label: 'Дизель' },
  { value: 'Гибрид', label: 'Гибрид' },
  { value: 'Электро', label: 'Электро' },
  { value: 'Газ', label: 'Газ' }
]

export const TRANSMISSIONS = [
  { value: 'Автомат', label: 'Автомат' },
  { value: 'Механика', label: 'Механика' },
  { value: 'Робот', label: 'Робот' },
  { value: 'Вариатор', label: 'Вариатор' }
]

export const DRIVES = [
  { value: 'Передний', label: 'Передний' },
  { value: 'Задний', label: 'Задний' },
  { value: 'Полный', label: 'Полный' }
]

export const COLORS = [
  { value: 'Черный', label: 'Черный' },
  { value: 'Белый', label: 'Белый' },
  { value: 'Серебристый', label: 'Серебристый' },
  { value: 'Серый', label: 'Серый' },
  { value: 'Синий', label: 'Синий' },
  { value: 'Красный', label: 'Красный' },
  { value: 'Зеленый', label: 'Зеленый' },
  { value: 'Коричневый', label: 'Коричневый' },
  { value: 'Оранжевый', label: 'Оранжевый' },
  { value: 'Желтый', label: 'Желтый' }
]

export const STEERING_WHEELS = [
  { value: 'Левый', label: 'Левый' },
  { value: 'Правый', label: 'Правый' }
]

export const CONDITIONS = [
  { value: 'Отличное', label: 'Отличное' },
  { value: 'Хорошее', label: 'Хорошее' },
  { value: 'Удовлетворительное', label: 'Удовлетворительное' },
  { value: 'Требует ремонта', label: 'Требует ремонта' }
]

export const BRANDS = [
  'BMW', 'Mercedes-Benz', 'Toyota', 'Audi', 'Volkswagen',
  'Kia', 'Hyundai', 'Lexus', 'Mazda', 'Skoda',
  'Volvo', 'Nissan', 'Porsche', 'Renault', 'Subaru',
  'Mitsubishi', 'Ford', 'Honda', 'Land Rover', 'Jeep'
].map(b => ({ value: b, label: b }))

export const CITIES = [
  'Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург',
  'Новосибирск', 'Ростов-на-Дону', 'Уфа', 'Самара',
  'Нижний Новгород', 'Воронеж', 'Краснодар', 'Иркутск'
].map(c => ({ value: c, label: c }))

export const FEEDBACK_CATEGORIES = [
  { value: 'technical', label: 'Техническая проблема', icon: '🔧' },
  { value: 'payment', label: 'Оплата и сделки', icon: '💳' },
  { value: 'account', label: 'Аккаунт', icon: '👤' },
  { value: 'moderation', label: 'Модерация', icon: '🛡️' },
  { value: 'suggestion', label: 'Предложение', icon: '💡' },
  { value: 'other', label: 'Другое', icon: '📝' }
]

export const FEEDBACK_PRIORITIES = [
  { value: 'low', label: 'Низкий' },
  { value: 'normal', label: 'Обычный' },
  { value: 'high', label: 'Высокий' },
  { value: 'critical', label: 'Критический' }
]

export const FEEDBACK_STATUSES = {
  open: { label: 'Открыто', color: 'info' },
  in_progress: { label: 'В работе', color: 'warning' },
  waiting_user: { label: 'Ждёт ответа', color: 'danger' },
  resolved: { label: 'Решено', color: 'success' },
  closed: { label: 'Закрыто', color: 'neutral' }
}

export const NOTIFICATION_TYPES = {
  chat: { label: 'Сообщение', icon: '💬' },
  price: { label: 'Цена', icon: '💰' },
  status: { label: 'Статус', icon: '✅' },
  sold: { label: 'Продано', icon: '🎉' },
  support: { label: 'Поддержка', icon: '📞' },
  security: { label: 'Безопасность', icon: '🔒' },
  system: { label: 'Система', icon: '⚙️' }
}

export const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Сначала новые' },
  { value: 'createdAt-asc', label: 'Сначала старые' },
  { value: 'price-asc', label: 'Сначала дешевле' },
  { value: 'price-desc', label: 'Сначала дороже' },
  { value: 'year-desc', label: 'Новые по году' },
  { value: 'year-asc', label: 'Старые по году' },
  { value: 'mileage-asc', label: 'Меньше пробег' },
  { value: 'mileage-desc', label: 'Больше пробег' }
]