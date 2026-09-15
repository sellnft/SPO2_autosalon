<script setup>
import BaseButton from './BaseButton.vue'

const props = defineProps({
  icon: { type: String, default: 'search' },
  title: { type: String, default: 'Ничего не найдено' },
  description: { type: String, default: '' },
  actionText: { type: String, default: '' },
  actionLink: { type: String, default: '' },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'error', 'warning', 'info'].includes(v)
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="cv-empty" :data-variant="variant">
    <div class="cv-empty__orb" aria-hidden="true"></div>

    <div class="cv-empty__icon">
      <span class="cv-empty__icon-inner">
        <svg v-if="icon === 'search'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="22" cy="22" r="12"/>
          <path d="M31 31l8 8"/>
        </svg>

        <svg v-else-if="icon === 'car'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 36V20l4-10h24l4 10v16"/>
          <path d="M8 28h32"/>
          <circle cx="16" cy="36" r="4"/>
          <circle cx="32" cy="36" r="4"/>
        </svg>

        <svg v-else-if="icon === 'heart'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M24 42S8 32 8 20a8 8 0 0116-4 8 8 0 0116 4c0 12-16 22-16 22z"/>
        </svg>

        <svg v-else-if="icon === 'chat'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 8h32v24H16L8 40V8z"/>
          <path d="M16 16h.01M24 16h.01M32 16h.01"/>
        </svg>

        <svg v-else-if="icon === 'calendar'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="8" y="12" width="32" height="28" rx="3"/>
          <path d="M8 20h32"/>
          <path d="M16 6v6M32 6v6"/>
        </svg>

        <svg v-else-if="icon === 'star'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M24 6l6 12 13 2-9.5 9.5 2.5 13L24 36l-12 6.5 2.5-13L5 20l13-2 6-12z"/>
        </svg>

        <svg v-else-if="icon === 'user'" width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="24" cy="16" r="8"/>
          <path d="M8 42c0-8 8-12 16-12s16 4 16 12"/>
        </svg>

        <svg v-else width="38" height="38" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="24" cy="24" r="20"/>
          <path d="M24 16v8l6 6"/>
        </svg>
      </span>
      <span class="cv-empty__icon-shine" aria-hidden="true"></span>
    </div>

    <h3 class="cv-empty__title">{{ title }}</h3>
    <p v-if="description" class="cv-empty__description">{{ description }}</p>

    <div class="cv-empty__action">
      <slot>
        <BaseButton
          v-if="actionText"
          variant="primary"
          @click="actionLink ? $router.push(actionLink) : $emit('action')"
        >
          {{ actionText }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.cv-empty {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  overflow: hidden;
  isolation: isolate;
}

.cv-empty__orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 360px;
  height: 360px;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.2), transparent 70%);
  animation: cvEmptyOrbPulse 4s ease-in-out infinite;
}

.cv-empty[data-variant="error"] .cv-empty__orb {
  background: radial-gradient(circle, rgba(184, 119, 85, 0.22), transparent 70%);
}

.cv-empty[data-variant="warning"] .cv-empty__orb {
  background: radial-gradient(circle, rgba(217, 119, 6, 0.2), transparent 70%);
}

.cv-empty[data-variant="info"] .cv-empty__orb {
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
}

@keyframes cvEmptyOrbPulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-empty__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: 26px;
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 80px rgba(201, 169, 97, 0.12);
  overflow: hidden;
  animation: cvEmptyFloat 4s ease-in-out infinite;
}

.cv-empty[data-variant="error"] .cv-empty__icon {
  color: #E8A88A;
  border-color: rgba(184, 119, 85, 0.32);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(184, 119, 85, 0.06) inset,
    0 1px 0 rgba(232, 168, 138, 0.12) inset,
    0 0 80px rgba(184, 119, 85, 0.16);
}

.cv-empty[data-variant="warning"] .cv-empty__icon {
  color: #F0C080;
  border-color: rgba(217, 119, 6, 0.32);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(217, 119, 6, 0.06) inset,
    0 1px 0 rgba(240, 192, 128, 0.12) inset,
    0 0 80px rgba(217, 119, 6, 0.16);
}

.cv-empty[data-variant="info"] .cv-empty__icon {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.35);
}

.cv-empty:not([data-variant]) .cv-empty__icon,
.cv-empty[data-variant="default"] .cv-empty__icon {
  color: #E8D5A0;
}

@keyframes cvEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cv-empty__icon-inner {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 16px rgba(0, 0, 0, 0.4));
}

.cv-empty__icon-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.15) 50%,
    transparent 70%
  );
  animation: cvEmptyShine 4s ease-in-out infinite;
  animation-delay: 1s;
  pointer-events: none;
}

@keyframes cvEmptyShine {
  0%, 60%, 100% { left: -100%; }
  80% { left: 100%; }
}

.cv-empty__title {
  position: relative;
  z-index: 1;
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-empty[data-variant="error"] .cv-empty__title {
  color: #E8A88A;
}

.cv-empty[data-variant="warning"] .cv-empty__title {
  color: #F0C080;
}

.cv-empty__description {
  position: relative;
  z-index: 1;
  max-width: 420px;
  margin: 0 0 26px;
  font-size: 13.5px;
  line-height: 1.6;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.55);
}

.cv-empty__action {
  position: relative;
  z-index: 1;
}

@media (max-width: 640px) {
  .cv-empty {
    padding: 48px 20px;
  }

  .cv-empty__orb {
    width: 260px;
    height: 260px;
  }

  .cv-empty__icon {
    width: 82px;
    height: 82px;
    border-radius: 22px;
    margin-bottom: 20px;
  }

  .cv-empty__icon svg {
    width: 32px;
    height: 32px;
  }

  .cv-empty__title {
    font-size: 17px;
  }

  .cv-empty__description {
    font-size: 13px;
    margin-bottom: 22px;
  }
}
</style>