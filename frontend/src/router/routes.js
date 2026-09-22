import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import EmptyLayout from '@/layouts/EmptyLayout.vue'

/* ============================================================
 *  Комментарии по структуре:
 *  - Порядок важен: static > dynamic > wildcard
 *  - `requiresAuth: false` НЕ указываем — это дефолт
 *  - Группируем auth-роуты под один AuthLayout
 *  - meta.preserveScroll — не сбрасывать скролл при back
 * ============================================================ */

const routes = [
  /* ---------- Основной сайт (DefaultLayout) ---------- */
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/Home/HomePage.vue'),
        meta: { title: 'Главная' }
      },
      {
        path: 'announcements',
        name: 'announcements',
        component: () => import('@/pages/Announcements/AnnouncementsPage.vue'),
        meta: { title: 'Каталог', preserveScroll: true }
      },

      // ВАЖНО: 'create' должен идти ДО ':id', иначе роутер сочтёт за ID
      {
        path: 'announcements/create',
        name: 'announcement-create',
        component: () => import('@/pages/Announcements/CreateAnnouncementPage.vue'),
        meta: { title: 'Создать объявление', requiresAuth: true, layout: 'default' }
      },
      {
        path: 'announcements/:id',
        name: 'announcement-detail',
        component: () => import('@/pages/Announcements/AnnouncementPage.vue'),
        props: true,
        // ID — только цифры (или UUID). Не пускаем /announcements/abc
        meta: { title: 'Объявление' }
      },
      {
        path: 'announcements/:id/edit',
        name: 'announcement-edit',
        component: () => import('@/pages/Announcements/EditAnnouncementPage.vue'),
        props: true,
        meta: { title: 'Редактировать', requiresAuth: true }
      },

      {
        path: 'favourites',
        name: 'favourites',
        component: () => import('@/pages/Favourites/FavouritesPage.vue'),
        meta: { title: 'Избранное', requiresAuth: true, preserveScroll: true }
      },

      /* ---------- Профиль: группируем, чтобы не повторять requiresAuth ---------- */
      {
        path: 'profile',
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            name: 'profile',
            component: () => import('@/pages/Profile/ProfilePage.vue'),
            meta: { title: 'Профиль' }
          },
          {
            path: 'edit',
            name: 'profile-edit',
            component: () => import('@/pages/Profile/ProfileEditPage.vue'),
            meta: { title: 'Настройки' }
          },
          {
            path: 'announcements',
            name: 'my-announcements',
            component: () => import('@/pages/Profile/MyAnnouncementsPage.vue'),
            meta: { title: 'Мои объявления', preserveScroll: true }
          },
          {
            path: 'subscriptions',
            name: 'my-subscriptions',
            component: () => import('@/pages/Profile/MySubscriptionsPage.vue'),
            meta: { title: 'Подписки' }
          },
          {
            path: 'saved-searches',
            name: 'saved-searches',
            component: () => import('@/pages/Profile/SavedSearchesPage.vue'),
            meta: { title: 'Сохранённые поиски' }
          },
          {
            path: 'notifications',
            name: 'notification-settings',
            component: () => import('@/pages/Profile/NotificationSettingsPage.vue'),
            meta: { title: 'Настройки уведомлений' }
          },
          {
            path: 'security',
            name: 'security',
            component: () => import('@/pages/Profile/SecurityPage.vue'),
            meta: { title: 'Безопасность' }
          },
          {
            path: 'sessions',
            name: 'my-sessions',
            component: () => import('@/pages/Profile/MySessionsPage.vue'),
            meta: { title: 'Активные сессии' }
          }
        ]
      },

      /* ---------- Чаты ---------- */
      {
        path: 'chat',
        name: 'chat',
        component: () => import('@/pages/Chat/ChatPage.vue'),
        meta: { title: 'Чаты', requiresAuth: true, preserveScroll: true }
      },
      {
        path: 'chat/:id',
        name: 'chat-detail',
        component: () => import('@/pages/Chat/ChatPage.vue'),
        props: true,
        meta: { title: 'Чат', requiresAuth: true }
      },

      /* ---------- Поддержка ---------- */
      {
        path: 'feedback',
        name: 'feedback',
        component: () => import('@/pages/Feedback/FeedbackPage.vue'),
        meta: { title: 'Поддержка' }
      },
      {
        path: 'feedback/:id',
        name: 'feedback-detail',
        component: () => import('@/pages/Feedback/FeedbackDetailsPage.vue'),
        props: true,
        meta: { title: 'Обращение', requiresAuth: true }
      }
    ]
  },

  /* ---------- Auth (единый AuthLayout) ---------- */
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/Auth/LoginPage.vue'),
        meta: { title: 'Вход', requiresGuest: true }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/Auth/RegisterPage.vue'),
        meta: { title: 'Регистрация', requiresGuest: true }
      },
      {
        path: 'verify-email',
        name: 'verify-email',
        component: () => import('@/pages/Auth/VerifyEmailPage.vue'),
        meta: { title: 'Подтверждение email' }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/pages/Auth/ForgotPasswordPage.vue'),
        meta: { title: 'Восстановление пароля', requiresGuest: true }
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('@/pages/Auth/ResetPasswordPage.vue'),
        meta: { title: 'Новый пароль', requiresGuest: true }
      },
      {
        path: '2fa',
        name: '2fa',
        component: () => import('@/pages/Auth/TwoFactorPage.vue'),
        meta: { title: 'Двухфакторная аутентификация' }
      },
      {
        path: '2fa/setup',
        name: '2fa-setup',
        component: () => import('@/pages/Auth/TwoFactorSetupPage.vue'),
        meta: { title: 'Настройка 2FA', requiresAuth: true }
      }
    ]
  },

  /* ---------- Админка ---------- */
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/Admin/AdminDashboardPage.vue'),
        meta: { title: 'Админ-панель' }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/Admin/AdminUsersPage.vue'),
        meta: { title: 'Пользователи', preserveScroll: true }
      },
      {
        path: 'users/:id',
        name: 'admin-user',
        component: () => import('@/pages/Admin/AdminUserPage.vue'),
        props: true,
        meta: { title: 'Пользователь' }
      },
      {
        path: 'announcements',
        name: 'admin-announcements',
        component: () => import('@/pages/Admin/AdminAnnouncementsPage.vue'),
        meta: { title: 'Объявления', preserveScroll: true }
      },
      {
        path: 'announcements/:id',
        name: 'admin-announcement',
        component: () => import('@/pages/Admin/AdminAnnouncementPage.vue'),
        props: true,
        meta: { title: 'Объявление' }
      },
      {
        path: 'feedback',
        name: 'admin-feedback',
        component: () => import('@/pages/Admin/AdminFeedbackPage.vue'),
        meta: { title: 'Обращения', preserveScroll: true }
      },
      {
        path: 'feedback/:id',
        name: 'admin-feedback-detail',
        component: () => import('@/pages/Admin/AdminFeedbackDetailsPage.vue'),
        props: true,
        meta: { title: 'Обращение' }
      },
      {
        path: 'audit-logs',
        name: 'admin-audit-logs',
        component: () => import('@/pages/Admin/AdminAuditLogsPage.vue'),
        meta: { title: 'Журнал действий', preserveScroll: true }
      }
    ]
  },

  /* ---------- Ошибки ---------- */
  {
    path: '/403',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'forbidden',
        component: () => import('@/pages/Errors/ForbiddenPage.vue'),
        meta: { title: 'Доступ запрещён' }
      }
    ]
  },
  {
    path: '/404',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'not-found',
        component: () => import('@/pages/Errors/NotFoundPage.vue'),
        meta: { title: 'Страница не найдена' }
      }
    ]
  },
  {
    path: '/500',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'server-error',
        component: () => import('@/pages/Errors/ServerErrorPage.vue'),
        meta: { title: 'Ошибка сервера' }
      }
    ]
  },

  /* ---------- Fallback 404 (с сохранением куда шёл) ---------- */
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found-catch',
    redirect: (to) => ({
      name: 'not-found',
      query: { from: to.fullPath }
    })
  }
]

export default routes