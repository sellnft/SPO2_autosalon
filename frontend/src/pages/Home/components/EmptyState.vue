<script setup>
defineProps({
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  ctaLabel: { type: String, default: '' },
  ctaTo: { type: [String, Object], default: null }
})
</script>

<template>
  <div class="empty">
    <span class="empty__icon" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
    </span>
    <p class="empty__title">{{ title }}</p>
    <p v-if="hint" class="empty__hint">{{ hint }}</p>
    <RouterLink v-if="ctaLabel && ctaTo" :to="ctaTo" class="empty__cta">
      {{ ctaLabel }}
    </RouterLink>
  </div>
</template>

<style scoped>
.empty {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.015);
  border: 1px dashed rgba(201, 169, 97, 0.22);
  border-radius: 16px;
}

.empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: rgba(201, 169, 97, 0.7);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.2);
  margin-bottom: 4px;
}

.empty__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: rgba(245, 240, 230, 0.9);
}

.empty__hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  max-width: 340px;
  color: rgba(200, 190, 175, 0.5);
}

.empty__cta {
  margin-top: 8px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1208;
  text-decoration: none;
  background: linear-gradient(135deg, #e8d5a0 0%, #c9a961 55%, #8b6f3f 100%);
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(201, 169, 97, 0.35);
  transition: transform 0.2s ease;
}
.empty__cta:hover { transform: translateY(-1px); }
.empty__cta:focus-visible {
  outline: 2px solid #e8d5a0;
  outline-offset: 2px;
}
</style>