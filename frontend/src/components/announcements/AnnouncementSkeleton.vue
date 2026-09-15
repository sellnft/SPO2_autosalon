<script setup>
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'

defineProps({
  view: {
    type: String,
    default: 'grid',
    validator: (v) => ['grid', 'list'].includes(v)
  }
})
</script>

<template>
  <div
    class="cv-askeleton"
    :class="`cv-askeleton--${view}`"
  >
    <div class="cv-askeleton__media">
      <BaseSkeleton variant="rounded" height="100%" />
    </div>

    <div class="cv-askeleton__content">
      <div class="cv-askeleton__head">
        <BaseSkeleton width="75%" height="16px" />
        <BaseSkeleton width="55%" height="22px" />
      </div>

      <div class="cv-askeleton__specs">
        <BaseSkeleton variant="rounded" width="58px" height="22px" />
        <BaseSkeleton variant="rounded" width="72px" height="22px" />
        <BaseSkeleton variant="rounded" width="64px" height="22px" />
      </div>

      <div v-if="view === 'list'" class="cv-askeleton__footer">
        <BaseSkeleton width="90px" height="12px" />
        <BaseSkeleton variant="rounded" width="72px" height="26px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cv-askeleton {
  position: relative;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-askeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.2) 50%,
    transparent
  );
  pointer-events: none;
  z-index: 2;
}

.cv-askeleton__media {
  position: relative;
  aspect-ratio: 4/3;
  background: #0F0F14;
  overflow: hidden;
}

.cv-askeleton--list .cv-askeleton__media {
  aspect-ratio: auto;
  width: 220px;
  height: 165px;
  flex-shrink: 0;
  border-radius: 14px;
}

.cv-askeleton__content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 20px;
}

.cv-askeleton--list {
  flex-direction: row;
  gap: 18px;
  padding: 16px;
}

.cv-askeleton--list .cv-askeleton__content {
  flex: 1;
  min-width: 0;
  padding: 4px 4px 4px 0;
  justify-content: space-between;
}

.cv-askeleton__head {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-askeleton__specs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-askeleton__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(201, 169, 97, 0.08);
}

@media (max-width: 640px) {
  .cv-askeleton__content {
    padding: 14px 14px 16px;
    gap: 12px;
  }

  .cv-askeleton--list {
    flex-direction: column;
    padding: 14px;
    gap: 12px;
    border-radius: 1rem;
  }

  .cv-askeleton--list .cv-askeleton__media {
    width: 100%;
    height: 200px;
    aspect-ratio: auto;
  }

  .cv-askeleton--list .cv-askeleton__content {
    padding: 0;
  }
}
</style>