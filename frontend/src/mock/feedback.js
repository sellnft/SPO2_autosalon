// TODO: При реальном backend - удалить этот файл
export const mockFeedback = [
  {
    id: 1,
    userId: 4,
    userName: 'Александр',
    subject: 'Не загружаются фотографии в объявление',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 1,
        feedbackId: 1,
        authorId: 4,
        authorName: 'Александр',
        authorType: 'user',
        content: 'Добрый день! При попытке загрузить фото в объявление выдаёт ошибку "Неверный формат". Фото JPG, размер до 5 МБ.',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 2,
        feedbackId: 1,
        authorId: 100,
        authorName: 'Служба поддержки',
        authorType: 'admin',
        content: 'Здравствуйте, Александр! Спасибо за обращение. Уточните, пожалуйста, какой именно файл вы пытаетесь загрузить? Возможно, проблема в кодировке имени файла.',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 3,
        feedbackId: 1,
        authorId: 4,
        authorName: 'Александр',
        authorType: 'user',
        content: 'Файл называется "фото машины 2024.jpg". Пробовал переименовать на "photo.jpg" — тоже не работает.',
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 4,
        feedbackId: 1,
        authorId: 100,
        authorName: 'Служба поддержки',
        authorType: 'admin',
        content: 'Спасибо за информацию! Мы воспроизвели проблему и уже работаем над исправлением. Ожидайте обновления в течение 2 часов.',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false
      }
    ]
  },
  {
    id: 2,
    userId: 4,
    userName: 'Александр',
    subject: 'Вопрос по безопасной сделке',
    category: 'payment',
    priority: 'normal',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 5,
        feedbackId: 2,
        authorId: 4,
        authorName: 'Александр',
        authorType: 'user',
        content: 'Как работает система безопасной сделки? Какие гарантии?',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 6,
        feedbackId: 2,
        authorId: 100,
        authorName: 'Служба поддержки',
        authorType: 'admin',
        content: 'Здравствуйте! Безопасная сделка работает через escrow-счёт: покупатель вносит средства, они блокируются до подтверждения получения автомобиля. При возникновении споров мы выступаем посредником.',
        createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 7,
        feedbackId: 2,
        authorId: 4,
        authorName: 'Александр',
        authorType: 'user',
        content: 'Понял, спасибо! Всё ясно.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ]
  },
  {
    id: 3,
    userId: 4,
    userName: 'Александр',
    subject: 'Предложение по улучшению фильтров',
    category: 'suggestion',
    priority: 'low',
    status: 'waiting_user',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 8,
        feedbackId: 3,
        authorId: 4,
        authorName: 'Александр',
        authorType: 'user',
        content: 'Было бы удобно добавить фильтр по количеству владельцев и по наличию сервисной книжки.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: 9,
        feedbackId: 3,
        authorId: 100,
        authorName: 'Служба поддержки',
        authorType: 'admin',
        content: 'Спасибо за предложение! Мы передали его команде разработки. Уточните, какие ещё фильтры были бы полезны?',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ]
  }
]