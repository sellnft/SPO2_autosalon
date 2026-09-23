import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import EmptyLayout from '@/layouts/EmptyLayout.vue'

/* ============================================================
 *  Структура маршрутов
 *  ------------------------------------------------------------
 *  - Vue Router 4 матчит по специфичности, а не по порядку,
 *    но одинаковые по специфичности пути разрешаются в порядке
 *    объявления — поэтому статика выше динамики, wildcard в конце.
 *  - meta.requiresAuth / requiresGuest / requiresAdmin читаются
 *    через to.matched, чтобы наследоваться от родителя к детям.
 *  - meta.preserveScroll — не сбрасывать скролл при back/forward.
 *  - meta.layout — опциональный override layout (используется,
 *    если layout выбирается в router-view, а не вложенностью).
 * ============================================================ */

/* ============================================================
 *  Стратегия валидации ID
 *  ------------------------------------------------------------
 *  Если backend вернёт UUID вместо числовых ID — достаточно
 *  поменять ID_STRATEGY на 'uuid'. Все динамические маршруты
 *  автоматически начнут принимать UUID и перестанут принимать
 *  числовые значения (и наоборот).
 *
 *  Регулярки:
 *  - numeric: только цифры, 1 и более
 *  - uuid:    канонический UUID v4, регистр не важен
 * ============================================================ */
const ID_STRATEGY = 'numeric' // 'numeric' | 'uuid'

const NUMERIC_ID = ':id(\\d+)'
const UUID_ID = ':id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})'

/** Универсальный сегмент ID для всех динамических маршрутов */
const ID = ID_STRATEGY === 'uuid' ? UUID_ID : NUMERIC_ID

/* ============================================================
 *  Прочие параметры
 * ============================================================ */
/** Токен из письма: base64url, hex или JWT */
const TOKEN = ':token([A-Za-z0-9._~-]+)'

/* ============================================================
 *  Хелперы для проверки параметров внутри компонента
 *  (на случай, если роут всё-таки пропустил невалидное значение)
 * ============================================================ */
export const isNumericId = (v) => /^\d+$/.test(String(v))
export const isUuid = (v) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(String(v))
export const isValidId = (v) =>
  ID_STRATEGY === 'uuid' ? isUuid(v) : isNumericId(v)

/* ============================================================
 *  Маршруты
 * ============================================================ */
const routes = [
  /* ============================================================
   *  Основной сайт
   * ============================================================ */
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

      /* ---------- Каталог ---------- */
      {
        path: 'announcements',
        name: 'announcements',
        component: () => import('@/pages/Announcements/AnnouncementsPage.vue'),
        meta: { title: 'Каталог', preserveScroll: true }
      },
      {
        path: 'announcements/create',
        name: 'announcement-create',
        component: () => import('@/pages/Announcements/CreateAnnouncementPage.vue'),
        meta: { title: 'Создать объявление', requiresAuth: true }
      },
      {
        path: `announcements/${ID}`,
        name: 'announcement-detail',
        component: () => import('@/pages/Announcements/AnnouncementPage.vue'),
        props: true,
        meta: { title: 'Объявление' }
      },
      {
        path: `announcements/${ID}/edit`,
        name: 'announcement-edit',
        component: () => import('@/pages/Announcements/EditAnnouncementPage.vue'),
        props: true,
        meta: { title: 'Редактировать', requiresAuth: true }
      },

      /* ---------- Избранное ---------- */
      {
        path: 'favourites',
        name: 'favourites',
        component: () => import('@/pages/Favourites/FavouritesPage.vue'),
        meta: { title: 'Избранное', requiresAuth: true, preserveScroll: true }
      },

      /* ---------- Публичный профиль продавца ---------- */
      {
        path: `sellers/${ID}`,
        name: 'seller-profile',
        component: () => import('@/pages/Sellers/SellerProfilePage.vue'),
        props: true,
        meta: { title: 'Профиль продавца' }
      },

      /* ---------- Аналитика (личная) ---------- */
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/pages/Analytics/AnalyticsPage.vue'),
        meta: { title: 'Аналитика', requiresAuth: true }
      },

      /* ---------- Профиль ---------- */
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

          /* Уведомления: inbox + настройки — два разных роута */
          {
            path: 'notifications',
            name: 'notifications',
            component: () => import('@/pages/Profile/NotificationsPage.vue'),
            meta: { title: 'Уведомления', preserveScroll: true }
          },
          {
            path: 'notifications/settings',
            name: 'notification-settings',
            component: () => import('@/pages/Profile/NotificationSettingsPage.vue'),
            meta: { title: 'Настройки уведомлений' }
          },

          /* Безопасность */
          {
            path: 'security',
            name: 'security',
            component: () => import('@/pages/Profile/SecurityPage.vue'),
            meta: { title: 'Безопасность' }
          },
          {
            path: 'sessions',
            name: 'my-sessions',
            component: () => import('@/pages/Profile/SessionsPage.vue'),
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
        path: `chat/${ID}`,
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
        path: `feedback/${ID}`,
        name: 'feedback-detail',
        component: () => import('@/pages/Feedback/FeedbackDetailsPage.vue'),
        props: true,
        meta: { title: 'Обращение', requiresAuth: true }
      },

      /* ---------- Правовое ---------- */
      {
        path: 'terms',
        name: 'terms',
        component: () => import('@/pages/Legal/TermsPage.vue'),
        meta: { title: 'Пользовательское соглашение' }
      },
      {
        path: 'privacy',
        name: 'privacy',
        component: () => import('@/pages/Legal/PrivacyPage.vue'),
        meta: { title: 'Политика конфиденциальности' }
      }
    ]
  },

  /* ============================================================
   *  Auth
   * ============================================================ */
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
        path: `verify-email/${TOKEN}`,
        name: 'verify-email-token',
        component: () => import('@/pages/Auth/VerifyEmailPage.vue'),
        props: true,
        meta: { title: 'Подтверждение email' }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/pages/Auth/ForgotPasswordPage.vue'),
        meta: { title: 'Восстановление пароля', requiresGuest: true }
      },
      {
        path: `reset-password/${TOKEN}`,
        name: 'reset-password',
        component: () => import('@/pages/Auth/ResetPasswordPage.vue'),
        props: true,
        meta: { title: 'Новый пароль' }
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

  /* ============================================================
   *  Админка
   * ============================================================ */
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
        path: 'analytics',
        name: 'admin-analytics',
        component: () => import('@/pages/Admin/AdminAnalyticsPage.vue'),
        meta: { title: 'Аналитика', preserveScroll: true }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/pages/Admin/AdminUsersPage.vue'),
        meta: { title: 'Пользователи', preserveScroll: true }
      },
      {
        path: `users/${ID}`,
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
        path: `announcements/${ID}`,
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
        path: `feedback/${ID}`,
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

  /* ============================================================
   *  Ошибки
   * ============================================================ */
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

  /* ============================================================
   *  Fallback 404 (с сохранением исходного пути)
   * ============================================================ */
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