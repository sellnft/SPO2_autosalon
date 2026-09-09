// TODO: При реальном backend - удалить этот файл
export const mockFeedback = [
  {
    id: 1,
    userId: 4,
    userName: 'Админ',
    subject: 'Проблема с загрузкой фото',
    message: 'Не могу загрузить фотографии в объявление',
    status: 'new',
    createdAt: '2024-01-20T12:00:00',
    replies: []
  },
  {
    id: 2,
    userId: 1,
    userName: 'Алексей Петров',
    subject: 'Вопрос по оплате',
    message: 'Как работает система безопасной сделки?',
    status: 'answered',
    createdAt: '2024-01-22T14:30:00',
    replies: [
      {
        id: 1,
        message: 'Безопасная сделка работает через escrow-счет',
        createdAt: '2024-01-22T15:00:00',
        fromAdmin: true
      }
    ]
  }
]