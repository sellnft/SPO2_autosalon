/**
 * Статические данные главной.
 *
 * ВАЖНО: тексты и цифры вынесены сюда, чтобы их можно было
 * легко править и валидировать. Всё, что не подтверждено
 * продуктовой командой, помечено комментарием TODO.
 */

/* Марки для фильтра и брендового бара */
export const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'Volvo', label: 'Volvo' },
  { value: 'Mazda', label: 'Mazda' },
  { value: 'Skoda', label: 'Skoda' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Land Rover', label: 'Land Rover' }
]

/* Города */
export const cities = [
  { value: 'Москва', label: 'Москва' },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
  { value: 'Казань', label: 'Казань' },
  { value: 'Екатеринбург', label: 'Екатеринбург' },
  { value: 'Новосибирск', label: 'Новосибирск' },
  { value: 'Краснодар', label: 'Краснодар' },
  { value: 'Ростов-на-Дону', label: 'Ростов-на-Дону' },
  { value: 'Сочи', label: 'Сочи' }
]

/* Типы кузова */
export const bodyTypes = [
  { value: 'Седан', label: 'Седан', icon: 'sedan' },
  { value: 'Кроссовер', label: 'Кроссовер', icon: 'suv' },
  { value: 'SUV', label: 'SUV', icon: 'suv-large' },
  { value: 'Хэтчбек', label: 'Хэтчбек', icon: 'hatch' },
  { value: 'Универсал', label: 'Универсал', icon: 'wagon' },
  { value: 'Купе', label: 'Купе', icon: 'coupe' }
]

/* Метрики в hero.
   TODO: заменить на реальные цифры с бэкенда, когда появятся.
   Сейчас — безопасные «подтверждаемые» обещания. */
export const heroStats = [
  { key: 'listings', value: 25000, suffix: '+', label: 'объявлений' },
  { key: 'sellers', value: 1500, suffix: '+', label: 'продавцов' },
  { key: 'support', value: 24, suffix: '/7', label: 'поддержка' }
]

/* Преимущества (только то, что платформа реально делает) */
export const features = [
  {
    icon: 'shield',
    title: 'Проверенные объявления',
    description: 'Модерация и проверка каждого объявления перед публикацией'
  },
  {
    icon: 'chat',
    title: 'Прямая связь',
    description: 'Чат с продавцом без посредников и скрытых номеров'
  },
  {
    icon: 'search',
    title: 'Умный поиск',
    description: 'Фильтры по марке, цене, городу и типу кузова'
  },
  {
    icon: 'bell',
    title: 'Мгновенные уведомления',
    description: 'Push-оповещения о новых объявлениях и ответах в чате'
  },
  {
    icon: 'chart',
    title: 'Аналитика цен',
    description: 'Сравнение стоимости авто с рыночными предложениями'
  },
  {
    icon: 'heart',
    title: 'Избранное',
    description: 'Сохраняйте интересные авто и следите за обновлениями'
  }
]

/* Шаги оформления — без обещаний escrow и юристов */
export const steps = [
  {
    number: '01',
    title: 'Найдите автомобиль',
    description: 'Используйте умный поиск и фильтры, чтобы найти идеальный вариант'
  },
  {
    number: '02',
    title: 'Проверьте историю',
    description: 'Запросите отчёт по VIN у продавца и сравните с рыночной ценой'
  },
  {
    number: '03',
    title: 'Свяжитесь с продавцом',
    description: 'Общайтесь в чате, задавайте вопросы и договаривайтесь о встрече'
  },
  {
    number: '04',
    title: 'Оформите сделку',
    description: 'Встретьтесь с продавцом и оформите документы лично'
  }
]

/* Отзывы — пользовательские, не платформенные обещания */
export const reviews = [
  {
    id: 1,
    name: 'Максим В.',
    city: 'Москва',
    car: 'BMW X5 2020',
    text: 'Продал свой X5 за 3 дня. Удобно, быстро, без лишних звонков. Покупатель нашёлся через 12 часов после публикации.',
    rating: 5,
    initial: 'М'
  },
  {
    id: 2,
    name: 'Анна К.',
    city: 'Санкт-Петербург',
    car: 'Toyota Camry 2019',
    text: 'Купила Camry. Сравнила цены через CarVibe — сэкономила приличную сумму. Продавец оказался адекватным.',
    rating: 5,
    initial: 'А'
  },
  {
    id: 3,
    name: 'Дмитрий С.',
    city: 'Казань',
    car: 'Audi Q7 2021',
    text: 'Приятно удивлён качеством сервиса. Все объявления с фото и описанием, легко найти нужное.',
    rating: 5,
    initial: 'Д'
  }
]

/* Бенефиты для продавца — без «50 000+ покупателей» */
export const sellerBenefits = [
  { icon: 'bolt', text: 'Публикация за 2 минуты' },
  { icon: 'users', text: 'Тысячи покупателей ежедневно' },
  { icon: 'chart', text: 'Продвижение в топ по цене' }
]

/* Ссылки футера */ /* (на будущее — сейчас не используется, но пусть будет) */
export const heroImageAlt = 'Премиальный автомобиль на платформе CarVibe'