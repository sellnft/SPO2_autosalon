<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { label: 'Главная', to: '/', icon: 'home' },
  { label: 'Каталог', to: '/announcements', icon: 'car' },
  { label: 'Избранное', to: '/favourites', icon: 'heart' },
  { label: 'Поддержка', to: '/feedback', icon: 'chat' }
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="app-navigation" aria-label="Основная навигация">
    <ul class="app-navigation__list">
      <li v-for="link in links" :key="link.to">
        <RouterLink
          :to="link.to"
          :class="[
            'app-navigation__link',
            { 'app-navigation__link--active': isActive(link.to) }
          ]"
        >
          {{ link.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.app-navigation__list {
  display: flex;
  align-items: center;
  gap: 4px;
}

.app-navigation__link {
  display: block;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  border-radius: 8px;
  transition: all 0.2s;
}

.app-navigation__link:hover {
  background: #F3F4F6;
  color: #111827;
}

.app-navigation__link--active {
  color: #0A84FF;
  background: #F0F7FF;
}

@media (max-width: 1024px) {
  .app-navigation {
    display: none;
  }
}
</style>