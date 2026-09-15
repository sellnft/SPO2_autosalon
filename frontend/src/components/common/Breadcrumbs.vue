<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  showHome: {
    type: Boolean,
    default: true
  }
})

const route = useRoute()

const breadcrumbs = computed(() => {
  if (props.items.length) return props.items

  const items = []
  if (props.showHome) {
    items.push({ label: 'Главная', to: '/', icon: 'home' })
  }

  const pathSegments = route.path.split('/').filter(Boolean)
  let currentPath = ''

  route.matched.forEach((matchedRoute, index) => {
    const segment = pathSegments[index]
    if (!segment) return

    currentPath += `/${segment}`

    if (/^\d+$/.test(segment)) return

    const isLast = index === route.matched.length - 1
    const label = matchedRoute.meta?.title || segment
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
  <nav v-if="breadcrumbs.length > 1" class="cv-crumbs" aria-label="Breadcrumb">
    <div class="cv-crumbs__glow" aria-hidden="true"></div>

    <ol class="cv-crumbs__list">
      <li
        v-for="(item, index) in breadcrumbs"
        :key="index"
        class="cv-crumbs__item"
      >
        <template v-if="item.to && index < breadcrumbs.length - 1">
          <RouterLink :to="item.to" class="cv-crumbs__link">
            <span v-if="item.icon === 'home'" class="cv-crumbs__icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10.5L12 3l9 7.5"/>
                <path d="M5 9.5V21h14V9.5"/>
                <path d="M9.5 21V14h5v7"/>
              </svg>
            </span>
            <span class="cv-crumbs__link-text">{{ item.label }}</span>
          </RouterLink>

          <span class="cv-crumbs__separator" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </span>
        </template>

        <span v-else class="cv-crumbs__current" aria-current="page">
          <span class="cv-crumbs__current-dot" aria-hidden="true"></span>
          <span class="cv-crumbs__current-text">{{ item.label }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.cv-crumbs {
  position: relative;
  padding: 14px 0;
  overflow: visible;
}

.cv-crumbs__glow {
  position: absolute;
  top: -20px;
  left: 0;
  width: 240px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.1), transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-crumbs__list {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-crumbs__item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.cv-crumbs__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
}

.cv-crumbs__link::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.22s ease;
  pointer-events: none;
}

.cv-crumbs__link:hover {
  color: #E8D5A0;
}

.cv-crumbs__link:hover::before {
  opacity: 1;
}

.cv-crumbs__link:active {
  transform: scale(0.96);
}

.cv-crumbs__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
  transition: transform 0.22s ease;
}

.cv-crumbs__link:hover .cv-crumbs__icon {
  transform: translateY(-1px) scale(1.08);
}

.cv-crumbs__link-text {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.cv-crumbs__separator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
  transition: color 0.22s ease;
}

.cv-crumbs__item:hover .cv-crumbs__separator {
  color: rgba(201, 169, 97, 0.6);
}

.cv-crumbs__current {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: #F5E6BC;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.04));
  border: 1px solid rgba(201, 169, 97, 0.28);
  border-radius: 8px;
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 2px 8px rgba(201, 169, 97, 0.15);
}

.cv-crumbs__current-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.7);
  flex-shrink: 0;
  animation: cvCrumbsPulse 2.4s ease-in-out infinite;
}

@keyframes cvCrumbsPulse {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.cv-crumbs__current-text {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cv-crumbs {
    padding: 10px 0;
  }

  .cv-crumbs__link,
  .cv-crumbs__current {
    padding: 5px 8px;
    font-size: 12px;
  }

  .cv-crumbs__link-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cv-crumbs__current-text {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cv-crumbs__glow {
    width: 160px;
    height: 60px;
  }
}
</style>