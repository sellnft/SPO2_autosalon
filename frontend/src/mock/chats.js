// TODO: При реальном backend - удалить этот файл
export const mockChats = [
  {
    id: 1,
    announcementId: 1,
    sellerId: 1,
    buyerId: 4,
    sellerName: 'Алексей Петров',
    buyerName: 'Вы',
    announcementTitle: 'BMW X5 xDrive30d',
    lastMessage: 'Отлично! А возможен торг?',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 2
  },
  {
    id: 2,
    announcementId: 3,
    sellerId: 3,
    buyerId: 4,
    sellerName: 'Мария Иванова',
    buyerName: 'Вы',
    announcementTitle: 'Toyota Camry 2.5',
    lastMessage: 'Спасибо, договорились',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0
  },
  {
    id: 3,
    announcementId: 8,
    sellerId: 8,
    buyerId: 4,
    sellerName: 'ООО Лексус Премиум',
    buyerName: 'Вы',
    announcementTitle: 'Lexus RX 350',
    lastMessage: 'Здравствуйте! Автомобиль в наличии',
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1
  }
]