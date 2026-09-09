// TODO: При реальном backend - удалить этот файл
import { mockUsers } from './users'

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