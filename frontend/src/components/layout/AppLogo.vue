<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})
</script>

<template>
  <RouterLink to="/" class="app-logo" :class="`app-logo--${size}`">
    <div class="app-logo__icon">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M4 20l4-8h16l4 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 20v4M24 20v4M8 24h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="10" cy="20" r="2" fill="currentColor"/>
        <circle cx="22" cy="20" r="2" fill="currentColor"/>
      </svg>
    </div>
    <div class="app-logo__text">
      <span class="app-logo__title">Auto</span>
      <span class="app-logo__subtitle">Platform</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.app-logo__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 12px;
}

.app-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.app-logo__title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.5px;
}

.app-logo__subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Sizes */
.app-logo--sm .app-logo__icon {
  width: 32px;
  height: 32px;
}

.app-logo--sm .app-logo__title {
  font-size: 16px;
}

.app-logo--lg .app-logo__icon {
  width: 48px;
  height: 48px;
}

.app-logo--lg .app-logo__title {
  font-size: 22px;
}
</style>