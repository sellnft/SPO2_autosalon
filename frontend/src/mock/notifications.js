// TODO: При реальном backend - удалить этот файл
export const mockNotifications = [
  {
    id: 1,
    type: 'chat',
    title: 'Новое сообщение',
    message: 'Алексей Петров ответил на ваше сообщение',
    read: false,
    link: '/chat/1',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    type: 'price',
    title: 'Цена снижена',
    message: 'BMW X5 xDrive30d подешевел на 200 000 ₽',
    read: false,
    link: '/announcements/1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    type: 'status',
    title: 'Объявление одобрено',
    message: 'Ваше объявление прошло модерацию',
    read: false,
    link: '/profile/announcements',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    type: 'sold',
    title: 'Автомобиль продан',
    message: 'Ваше объявление "Toyota Camry" отмечено как проданное',
    read: true,
    link: '/profile/announcements',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    type: 'support',
    title: 'Ответ поддержки',
    message: 'Ваш запрос обработан. Пожалуйста, проверьте ответ.',
    read: true,
    link: '/feedback/1',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    type: 'security',
    title: 'Вход в аккаунт',
    message: 'Выполнен вход с нового устройства: Chrome на macOS',
    read: true,
    link: '/profile/sessions',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 7,
    type: 'system',
    title: 'Обновление платформы',
    message: 'Мы добавили новые фильтры поиска. Попробуйте!',
    read: true,
    link: '/announcements',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
]