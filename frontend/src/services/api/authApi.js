import config from '@/config'
import axiosInstance from './axios'
import { mockAuth } from '@/mock/auth'

/* ============================================================
 *  Хелпер: единообразный вызов mock / API
 * ============================================================ */

async function request(mockFn, apiFn, opts = {}) {
  try {
    if (config.api.useMock) {
      return await mockFn()
    }
    const { data } = await apiFn({ signal: opts.signal })
    return data
  } catch (err) {
    // Пробрасываем дальше без изменений — стор/UI решит
    if (opts.rethrow !== false) throw err
    return null
  }
}

/* ============================================================
 *  API
 * ============================================================ */

export const authApi = {
  /* ---------- Основное ---------- */

  /**
   * Вход по email + password.
   * Возвращает: { user, accessToken, refreshToken } или { requires2FA: true }
   */
  async login(credentials, opts = {}) {
    return request(
      () => mockAuth.login(credentials),
      ({ signal }) => axiosInstance.post('/auth/login', credentials, { signal }),
      opts
    )
  },

  /**
   * Регистрация.
   * Возвращает: { user, accessToken, refreshToken } или { requiresVerification: true }
   */
  async register(userData, opts = {}) {
    return request(
      () => mockAuth.register(userData),
      ({ signal }) => axiosInstance.post('/auth/register', userData, { signal }),
      opts
    )
  },

  /**
   * Выход — инвалидация refresh-токена на бэке.
   */
  async logout(opts = {}) {
    return request(
      () => mockAuth.logout(),
      ({ signal }) => axiosInstance.post('/auth/logout', null, { signal }),
      opts
    )
  },

  /**
   * Текущий юзер. При 401 — тихо возвращает null (не бросает).
   * Полезно для initAuth при старте приложения.
   */
  async getCurrentUser(opts = {}) {
    try {
      return await request(
        () => mockAuth.getCurrentUser(),
        ({ signal }) => axiosInstance.get('/auth/me', { signal }),
        opts
      )
    } catch (err) {
      // 401 = юзер не залогинен → не ошибка
      if (err?.response?.status === 401) return null
      if (opts.rethrow) throw err
      return null
    }
  },

  /**
   * Обновить access-токен по refresh-токену.
   * При ошибке — тихо вернуть null, чтобы стор сам разлогинил.
   */
  async refreshToken(opts = {}) {
    try {
      return await request(
        () => mockAuth.refreshToken(),
        ({ signal }) => axiosInstance.post('/auth/refresh', null, { signal }),
        opts
      )
    } catch {
      return null
    }
  },

  /* ---------- Профиль ---------- */

  /**
   * Обновить профиль.
   */
  async updateProfile(payload, opts = {}) {
    return request(
      () => mockAuth.updateProfile?.(payload) ?? Promise.resolve(payload),
      ({ signal }) => axiosInstance.patch('/auth/me', payload, { signal }),
      opts
    )
  },

  /**
   * Сменить пароль.
   * payload: { currentPassword, newPassword }
   */
  async changePassword(payload, opts = {}) {
    return request(
      () => mockAuth.changePassword?.(payload) ?? Promise.resolve({ ok: true }),
      ({ signal }) => axiosInstance.post('/auth/change-password', payload, { signal }),
      opts
    )
  },

  /* ---------- Верификация / сброс ---------- */

  /**
   * Подтвердить email по токену.
   * token приходит в query (типичный сценарий после письма).
   */
  async verifyEmail(token, opts = {}) {
    return request(
      () => mockAuth.verifyEmail(token),
      ({ signal }) => axiosInstance.post('/auth/verify-email', { token }, { signal }),
      opts
    )
  },

  /**
   * Отправить письмо с подтверждением ещё раз.
   */
  async resendVerification(email, opts = {}) {
    return request(
      () => mockAuth.resendVerification?.(email) ?? Promise.resolve({ ok: true }),
      ({ signal }) => axiosInstance.post('/auth/resend-verification', { email }, { signal }),
      opts
    )
  },

  /**
   * Запросить письмо сброса пароля.
   */
  async forgotPassword(email, opts = {}) {
    return request(
      () => mockAuth.forgotPassword(email),
      ({ signal }) => axiosInstance.post('/auth/forgot-password', { email }, { signal }),
      opts
    )
  },

  /**
   * Сбросить пароль по токену из письма.
   * payload: { token, password, passwordConfirm? }
   */
  async resetPassword(payload, opts = {}) {
    return request(
      () => mockAuth.resetPassword(payload),
      ({ signal }) => axiosInstance.post('/auth/reset-password', payload, { signal }),
      opts
    )
  },

  /* ---------- Двухфакторка ---------- */

  /**
   * Проверить код 2FA (после логина).
   */
  async verify2FA(code, opts = {}) {
    return request(
      () => mockAuth.verify2FA(code),
      ({ signal }) => axiosInstance.post('/auth/2fa/verify', { code }, { signal }),
      opts
    )
  },

  /**
   * Начать настройку 2FA.
   * Возвращает: { secret, qrCode, backupCodes }
   */
  async setup2FA(opts = {}) {
    return request(
      () => mockAuth.setup2FA(),
      ({ signal }) => axiosInstance.post('/auth/2fa/setup', null, { signal }),
      opts
    )
  },

  /**
   * Подтвердить и включить 2FA (по коду из приложения).
   */
  async enable2FA(code, opts = {}) {
    return request(
      () => mockAuth.enable2FA(code),
      ({ signal }) => axiosInstance.post('/auth/2fa/enable', { code }, { signal }),
      opts
    )
  },

  /**
   * Отключить 2FA (требует пароль).
   */
  async disable2FA(password, opts = {}) {
    return request(
      () => mockAuth.disable2FA(password),
      ({ signal }) => axiosInstance.post('/auth/2fa/disable', { password }, { signal }),
      opts
    )
  },

  /* ---------- Сессии ---------- */

  /**
   * Список активных сессий.
   */
  async getSessions(opts = {}) {
    return request(
      () => mockAuth.getSessions?.() ?? Promise.resolve([]),
      ({ signal }) => axiosInstance.get('/auth/sessions', { signal }),
      opts
    )
  },

  /**
   * Завершить конкретную сессию.
   */
  async revokeSession(sessionId, opts = {}) {
    return request(
      () => mockAuth.revokeSession?.(sessionId) ?? Promise.resolve({ ok: true }),
      ({ signal }) => axiosInstance.delete(`/auth/sessions/${sessionId}`, { signal }),
      opts
    )
  },

  /**
   * Завершить все сессии кроме текущей.
   */
  async revokeAllSessions(opts = {}) {
    return request(
      () => mockAuth.revokeAllSessions?.() ?? Promise.resolve({ ok: true }),
      ({ signal }) => axiosInstance.delete('/auth/sessions', { signal }),
      opts
    )
  }
}