// TODO: При реальном backend - удалить этот файл
import { mockUsers } from './users'

const registeredUsers = [...mockUsers]
let currentUserId = null

export const mockAuth = {
  async login(credentials) {
    await new Promise(r => setTimeout(r, 500))

    const user = registeredUsers.find(u => u.email === credentials.email)
    if (!user || credentials.password !== 'password123') {
      const error = new Error('Неверный email или пароль')
      error.status = 401
      throw error
    }

    currentUserId = user.id

    return {
      accessToken: `mock_access_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
      user: { ...user },
      requires2FA: false
    }
  },

  async register(userData) {
    await new Promise(r => setTimeout(r, 500))

    const existing = registeredUsers.find(u => u.email === userData.email)
    if (existing) {
      const error = new Error('Пользователь с таким email уже существует')
      error.status = 409
      throw error
    }

    const newUser = {
      id: registeredUsers.length + 1,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: 'user',
      status: 'active',
      emailVerified: false,
      avatar: '',
      city: userData.city || '',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      announcementsCount: 0,
      feedbackCount: 0
    }

    registeredUsers.push(newUser)

    return {
      user: newUser,
      message: 'Регистрация успешна. Проверьте email для подтверждения.'
    }
  },

  async logout() {
    await new Promise(r => setTimeout(r, 200))
    currentUserId = null
    return true
  },

  async getCurrentUser() {
    await new Promise(r => setTimeout(r, 300))

    // Возвращаем null если токен отсутствует
    if (!currentUserId) {
      // Пробуем восстановить из первого токена в storage
      // Но в реальности это делает backend
      return null
    }

    return registeredUsers.find(u => u.id === currentUserId) || null
  },

  async refreshToken() {
    await new Promise(r => setTimeout(r, 200))
    if (!currentUserId) throw new Error('Not authenticated')
    return {
      accessToken: `mock_access_${currentUserId}_${Date.now()}`,
      refreshToken: `mock_refresh_${currentUserId}_${Date.now()}`
    }
  },

  async verifyEmail(token) {
    await new Promise(r => setTimeout(r, 500))
    // В mock просто подтверждаем первого неверифицированного
    const user = registeredUsers.find(u => !u.emailVerified)
    if (user) user.emailVerified = true
    return { success: true, user }
  },

  async forgotPassword(email) {
    await new Promise(r => setTimeout(r, 500))
    return { success: true, message: 'Письмо отправлено' }
  },

  async resetPassword(payload) {
    await new Promise(r => setTimeout(r, 500))
    return { success: true, message: 'Пароль изменён' }
  },

  async verify2FA(code) {
    await new Promise(r => setTimeout(r, 500))
    if (code === '123456') {
      return { success: true }
    }
    const error = new Error('Неверный код')
    error.status = 401
    throw error
  },

  async setup2FA() {
    await new Promise(r => setTimeout(r, 300))
    return {
      secret: 'JBSWY3DPEHPK3PXP',
      qrCode: 'data:image/svg+xml;base64,PHN2Zy...' // placeholder
    }
  },

  async enable2FA(code) {
    await new Promise(r => setTimeout(r, 500))
    if (code === '123456') {
      return {
        success: true,
        recoveryCodes: Array.from({ length: 8 }, () =>
          Math.random().toString(36).substring(2, 10).toUpperCase()
        )
      }
    }
    throw new Error('Неверный код')
  },

  async disable2FA(password) {
    await new Promise(r => setTimeout(r, 500))
    if (password === 'password123') {
      return { success: true }
    }
    throw new Error('Неверный пароль')
  }
}

export function setMockCurrentUser(userId) {
  currentUserId = userId
}

export function getMockCurrentUser() {
  return registeredUsers.find(u => u.id === currentUserId) || null
}