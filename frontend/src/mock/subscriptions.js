// TODO: При реальном backend - удалить этот файл
export const mockSubscriptions = [
  {
    id: 1,
    announcementId: 2,
    createdAt: '2024-01-22'
  },
  {
    id: 2,
    announcementId: 5,
    createdAt: '2024-02-05'
  }
]

export const mockSavedSearches = [
  {
    id: 1,
    name: 'BMW до 5 млн',
    filters: {
      brand: 'BMW',
      priceTo: 5000000
    },
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'Кроссоверы 2022+',
    filters: {
      bodyType: 'Кроссовер',
      yearFrom: 2022
    },
    createdAt: '2024-02-10'
  }
]