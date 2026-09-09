// TODO: При реальном backend - удалить этот файл
export const mockNotifications = [
  {
    id: 1,
    title: 'Новое сообщение',
    message: 'У вас новое сообщение в чате',
    type: 'chat',
    read: false,
    link: '/chat/1',
    createdAt: '2024-01-25T14:20:00'
  },
  {
    id: 2,
    title: 'Цена снижена',
    message: 'BMW X5 xDrive30d подешевел на 200 000 ₽',
    type: 'price',
    read: false,
    link: '/announcements/1',
    createdAt: '2024-01-26T10:00:00'
  },
  {
    id: 3,
    title: 'Объявление одобрено',
    message: 'Ваше объявление прошло модерацию',
    type: 'success',
    read: true,
    link: '/announcements/3',
    createdAt: '2024-01-28T15:30:00'
  }
]