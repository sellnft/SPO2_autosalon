const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/Home/HomePage.vue'),
    meta: { 
      layout: 'DefaultLayout',
      requiresAuth: false,
      title: 'Главная'
    }
  },
  // Другие маршруты будут добавлены позже
]

export default routes