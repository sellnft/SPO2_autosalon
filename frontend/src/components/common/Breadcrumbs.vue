<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const route = useRoute()

const breadcrumbs = computed(() => {
  if (props.items.length) return props.items
  
  const items = []
  const pathSegments = route.path.split('/').filter(Boolean)
  
  let currentPath = ''
  items.push({ label: 'Главная', to: '/' })
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    const label = route.matched[index]?.meta?.title || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    items.push({
      label,
      to: isLast ? null : currentPath
    })
  })
  
  return items
})
</script>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumbs__list">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="index"
        class="breadcrumbs__item"
      >
        <template v-if="item.to && index < breadcrumbs.length - 1">
          <RouterLink :to="item.to" class="breadcrumbs__link">
            {{ item.label }}
          </RouterLink>
          <svg class="breadcrumbs__separator" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </template>
        <span v-else class="breadcrumbs__current" aria-current="page">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  padding: 12px 0;
}

.breadcrumbs__list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.breadcrumbs__item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumbs__link {
  font-size: 13px;
  color: #6B7280;
  transition: color 0.2s;
}

.breadcrumbs__link:hover {
  color: #0A84FF;
}

.breadcrumbs__separator {
  color: #D1D5DB;
}

.breadcrumbs__current {
  font-size: 13px;
  font-weight: 500;
  color: #111827;
}
</style>