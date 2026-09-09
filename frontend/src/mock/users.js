// TODO: При реальном backend - удалить этот файл
export const mockUsers = [
  {
    id: 1,
    name: 'Алексей Петров',
    email: 'alexey@example.com',
    phone: '+7 (900) 123-45-67',
    role: 'user',
    emailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    city: 'Москва',
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Мария Иванова',
    email: 'maria@example.com',
    phone: '+7 (900) 234-56-78',
    role: 'user',
    emailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    city: 'Казань',
    createdAt: '2024-01-05'
  },
  {
    id: 3,
    name: 'Дмитрий Смирнов',
    email: 'dmitry@example.com',
    phone: '+7 (900) 345-67-89',
    role: 'user',
    emailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    city: 'Екатеринбург',
    createdAt: '2024-01-10'
  },
  {
    id: 4,
    name: 'Админ',
    email: 'admin@example.com',
    phone: '+7 (900) 000-00-00',
    role: 'admin',
    emailVerified: true,
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef',
    city: 'Москва',
    createdAt: '2023-12-01'
  }
]

export const mockAuth = {
  async login(credentials) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = mockUsers.find(u => u.email === credentials.email)
    if (!user || credentials.password !== 'password123') {
      throw new Error('Неверный email или пароль')
    }
    
    return {
      accessToken: 'mock_access_token_' + user.id,
      refreshToken: 'mock_refresh_token_' + user.id,
      user
    }
  },
  
  async register(userData) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const existingUser = mockUsers.find(u => u.email === userData.email)
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует')
    }
    
    const newUser = {
      id: mockUsers.length + 1,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'user',
      emailVerified: false,
      avatar: '',
      city: userData.city || '',
      createdAt: new Date().toISOString()
    }
    
    mockUsers.push(newUser)
    
    return {
      user: newUser,
      message: 'Регистрация успешна. Проверьте email для подтверждения.'
    }
  },
  
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return true
  },
  
  async getCurrentUser() {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Возвращаем первого пользователя как текущего
    return mockUsers[0]
  },
  
  async refreshToken() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      accessToken: 'mock_new_access_token',
      refreshToken: 'mock_new_refresh_token'
    }
  }
}