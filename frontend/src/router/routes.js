import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import EmptyLayout from '@/layouts/EmptyLayout.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/Home/HomePage.vue'),
        meta: { title: 'Главная', requiresAuth: false }
      },
      {
        path: 'announcements',
        name: 'announcements',
        component: () => import('@/pages/Announcements/AnnouncementsPage.vue'),
        meta: { title: 'Каталог', requiresAuth: false }
      },
      {
        path: 'announcements/create',
        name: 'announcement-create',
        component: () => import('@/pages/Announcements/CreateAnnouncementPage.vue'),
        meta: { title: 'Создать объявление', requiresAuth: true, requiresVerifiedEmail: true }
      },
      {
        path: 'announcements/:id',
        name: 'announcement-detail',
        component: () => import('@/pages/Announcements/AnnouncementPage.vue'),
        meta: { title: 'Объявление', requiresAuth: false },
        props: true
      },
      {
        path: 'announcements/:id/edit',
        name: 'announcement-edit',
        component: () => import('@/pages/Announcements/EditAnnouncementPage.vue'),
        meta: { title: 'Редактировать', requiresAuth: true },
        props: true
      },
      {
        path: 'favourites',
        name: 'favourites',
        component: () => import('@/pages/Favourites/FavouritesPage.vue'),
        meta: { title: 'Избранное', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/Profile/ProfilePage.vue'),
        meta: { title: 'Профиль', requiresAuth: true }
      },
      {
        path: 'profile/edit',
        name: 'profile-edit',
        component: () => import('@/pages/Profile/ProfileEditPage.vue'),
        meta: { title: 'Настройки', requiresAuth: true }
      },
      {
        path: 'profile/announcements',
        name: 'my-announcements',
        component: () => import('@/pages/Profile/MyAnnouncementsPage.vue'),
        meta: { title: 'Мои объявления', requiresAuth: true }
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import('@/pages/Chat/ChatPage.vue'),
        meta: { title: 'Чаты', requiresAuth: true }
      },
      {
        path: 'chat/:id',
        name: 'chat-detail',
        component: () => import('@/pages/Chat/ChatPage.vue'),
        meta: { title: 'Чат', requiresAuth: true },
        props: true
      },
      {
        path: 'feedback',
        name: 'feedback',
        component: () => import('@/pages/Feedback/FeedbackPage.vue'),
        meta: { title: 'Поддержка', requiresAuth: false }
      }
    ]
  },
  
  // Auth routes - без path: '/'
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/Auth/LoginPage.vue'),
        meta: { title: 'Вход', requiresGuest: true }
      }
    ]
  },
  {
    path: '/register',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'register',
        component: () => import('@/pages/Auth/RegisterPage.vue'),
        meta: { title: 'Регистрация', requiresGuest: true }
      }
    ]
  },
  {
    path: '/verify-email',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'verify-email',
        component: () => import('@/pages/Auth/VerifyEmailPage.vue'),
        meta: { title: 'Подтверждение email', requiresAuth: true }
      }
    ]
  },
  {
    path: '/forgot-password',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'forgot-password',
        component: () => import('@/pages/Auth/ForgotPasswordPage.vue'),
        meta: { title: 'Восстановление пароля', requiresGuest: true }
      }
    ]
  },
  {
    path: '/reset-password',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'reset-password',
        component: () => import('@/pages/Auth/ResetPasswordPage.vue'),
        meta: { title: 'Новый пароль', requiresGuest: true }
      }
    ]
  },
  {
    path: '/2fa',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: '2fa',
        component: () => import('@/pages/Auth/TwoFactorPage.vue'),
        meta: { title: 'Двухфакторная аутентификация' }
      }
    ]
  },
  {
    path: '/2fa/setup',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: '2fa-setup',
        component: () => import('@/pages/Auth/TwoFactorSetupPage.vue'),
        meta: { title: 'Настройка 2FA', requiresAuth: true }
      }
    ]
  },
  
  // Admin
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
        meta: { title: 'Пользователи' }
      },
      {
        path: 'users/:id',
        name: 'admin-user',
        component: () => import('@/pages/Admin/AdminUserPage.vue'),
        meta: { title: 'Пользователь' },
        props: true
      },
      {
        path: 'announcements',
        name: 'admin-announcements',
        component: () => import('@/pages/Admin/AdminAnnouncementsPage.vue'),
        meta: { title: 'Объявления' }
      },
      {
        path: 'announcements/:id',
        name: 'admin-announcement',
        component: () => import('@/pages/Admin/AdminAnnouncementPage.vue'),
        meta: { title: 'Объявление' },
        props: true
      },
      {
        path: 'feedback',
        name: 'admin-feedback',
        component: () => import('@/pages/Admin/AdminFeedbackPage.vue'),
        meta: { title: 'Обращения' }
      },
      {
        path: 'audit-logs',
        name: 'admin-audit-logs',
        component: () => import('@/pages/Admin/AdminAuditLogsPage.vue'),
        meta: { title: 'Журнал действий' }
      }
    ]
  },
  
  // Error pages
  {
    path: '/403',
    component: EmptyLayout,
    children: [
      {
        path: '',
        name: 'forbidden',
        component: () => import('@/pages/Errors/ForbiddenPage.vue'),
        meta: { title: 'Доступ запрещен' }
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
  
  // Redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

export default routes