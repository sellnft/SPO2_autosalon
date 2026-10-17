<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  centered: { type: Boolean, default: false },
  dotVariant: { type: String, default: 'bronze' } // bronze | olive
})
</script>

<template>
  <header class="section-head" :class="{ 'section-head--center': centered }">
    <div class="section-head__left">
      <span v-if="eyebrow" class="section-head__eyebrow">
        <span
          class="section-head__dot"
          :class="`section-head__dot--${dotVariant}`"
          aria-hidden="true"
        />
        {{ eyebrow }}
      </span>
      <h2 class="section-head__title">{{ title }}</h2>
    </div>
    <div v-if="$slots.actions" class="section-head__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.section-head--center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.section-head__left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.section-head__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.section-head__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(201, 169, 97, 0.6);
  flex-shrink: 0;
}
.section-head__dot--bronze {
  background: linear-gradient(135deg, #f5e6bc, #c9a961);
}
.section-head__dot--olive {
  background: linear-gradient(135deg, #b8cea8, #7a9a6a);
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.6);
}

.section-head__title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.95);
}

@media (max-width: 1024px) {
  .section-head__title { font-size: 26px; }
}
@media (max-width: 768px) {
  .section-head { margin-bottom: 24px; }
  .section-head__title { font-size: 22px; letter-spacing: -0.3px; }
}
</style>