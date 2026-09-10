// TODO: При реальном backend - удалить этот файл
export const mockMessages = [
  // Chat 1
  {
    id: 1,
    chatId: 1,
    senderId: 4,
    content: 'Здравствуйте, автомобиль ещё продаётся?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'sent'
  },
  {
    id: 2,
    chatId: 1,
    senderId: 1,
    content: 'Да, продаётся. Можете приехать посмотреть.',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'received'
  },
  {
    id: 3,
    chatId: 1,
    senderId: 4,
    content: 'Отлично! А возможен торг?',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    status: 'sent'
  },
  
  // Chat 2
  {
    id: 4,
    chatId: 2,
    senderId: 4,
    content: 'Здравствуйте, какая комплектация?',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'sent'
  },
  {
    id: 5,
    chatId: 2,
    senderId: 3,
    content: 'Максимальная, все опции.',
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'received'
  },
  {
    id: 6,
    chatId: 2,
    senderId: 4,
    content: 'Спасибо, договорились',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'sent'
  },
  
  // Chat 3
  {
    id: 7,
    chatId: 3,
    senderId: 4,
    content: 'Добрый день! Интересует этот автомобиль',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    status: 'sent'
  },
  {
    id: 8,
    chatId: 3,
    senderId: 8,
    content: 'Здравствуйте! Автомобиль в наличии',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false,
    status: 'received'
  }
]