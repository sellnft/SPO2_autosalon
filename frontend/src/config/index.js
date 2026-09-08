const config = {
  // App
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Auto Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development'
  },

  // API
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    wsURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
    useMock: import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.VITE_USE_MOCK_API === true,
    timeout: 30000
  },

  // Features
  features: {
    enable2FA: import.meta.env.VITE_ENABLE_2FA !== 'false',
    enableChat: import.meta.env.VITE_ENABLE_CHAT !== 'false',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false'
  },

  // Debug
  debug: {
    enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true',
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true'
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  },

  // Upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 20
  }
}

export default config