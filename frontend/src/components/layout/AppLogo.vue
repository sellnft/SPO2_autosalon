<script setup>
import logoImage from '@/assets/images/logo.png'

defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'light', 'mono'].includes(v)
  }
})
</script>

<template>
  <RouterLink to="/" class="cv-logo" :class="[`cv-logo--${size}`, `cv-logo--${variant}`]">
    <span class="cv-logo__emblem">
      <img
        :src="logoImage"
        alt="CarVibe"
        class="cv-logo__image"
        draggable="false"
      />
      <span class="cv-logo__emblem-shine" aria-hidden="true"></span>
    </span>

    <span class="cv-logo__text">
      <span class="cv-logo__title">
        Car<span class="cv-logo__title-accent">Vibe</span>
      </span>
      <span class="cv-logo__subtitle">premium auto</span>
    </span>
  </RouterLink>
</template>

<style scoped>
.cv-logo {
  --cv-bronze-light: #E8D5A0;
  --cv-bronze: #C9A961;
  --cv-bronze-dark: #8B6F3F;
  --cv-title: #F5F0E6;
  --cv-title-accent: #E8D5A0;
  --cv-subtitle: rgba(220, 210, 195, 0.45);

  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-logo:hover {
  transform: translateY(-1px);
}

.cv-logo__emblem {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.9) 0%, rgba(15, 12, 8, 0.95) 100%);
  border: 1px solid rgba(201, 169, 97, 0.35);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.15) inset;
  overflow: hidden;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.cv-logo:hover .cv-logo__emblem {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(201, 169, 97, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.1) inset,
    0 1px 0 rgba(232, 213, 160, 0.2) inset;
}

.cv-logo__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  position: relative;
  z-index: 1;
  padding: 6px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  transition: transform 0.3s ease;
}

.cv-logo:hover .cv-logo__image {
  transform: scale(1.05);
}

.cv-logo__emblem-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 245, 214, 0.25) 50%,
    transparent 70%
  );
  transition: left 0.7s ease;
  pointer-events: none;
  z-index: 2;
}

.cv-logo:hover .cv-logo__emblem-shine {
  left: 100%;
}

.cv-logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 3px;
}

.cv-logo__title {
  font-size: 19px;
  font-weight: 800;
  color: var(--cv-title);
  letter-spacing: -0.6px;
  line-height: 1.1;
  text-shadow: 0 1px 12px rgba(201, 169, 97, 0.15);
}

.cv-logo__title-accent {
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.cv-logo__subtitle {
  font-size: 10px;
  font-weight: 600;
  color: var(--cv-subtitle);
  text-transform: uppercase;
  letter-spacing: 1.8px;
  line-height: 1;
}

.cv-logo--sm {
  gap: 10px;
}
.cv-logo--sm .cv-logo__emblem {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}
.cv-logo--sm .cv-logo__image { padding: 4px; }
.cv-logo--sm .cv-logo__title { font-size: 16px; }
.cv-logo--sm .cv-logo__subtitle {
  font-size: 9px;
  letter-spacing: 1.5px;
}

.cv-logo--lg {
  gap: 14px;
}
.cv-logo--lg .cv-logo__emblem {
  width: 52px;
  height: 52px;
  border-radius: 14px;
}
.cv-logo--lg .cv-logo__image { padding: 8px; }
.cv-logo--lg .cv-logo__title { font-size: 24px; }
.cv-logo--lg .cv-logo__subtitle {
  font-size: 11px;
  letter-spacing: 2px;
}

.cv-logo--default .cv-logo__emblem {
  width: 42px;
  height: 42px;
}

.cv-logo--light {
  --cv-title: #1A1208;
  --cv-subtitle: rgba(60, 45, 25, 0.55);
}
.cv-logo--light .cv-logo__emblem {
  background: linear-gradient(180deg, #FFFFFF 0%, #F5EFE0 100%);
  border-color: rgba(201, 169, 97, 0.5);
  box-shadow:
    0 4px 16px rgba(139, 111, 63, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

.cv-logo--mono .cv-logo__emblem {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}
.cv-logo--mono .cv-logo__title {
  color: var(--cv-title);
}
.cv-logo--mono:hover .cv-logo__emblem {
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 20px rgba(201, 169, 97, 0.2);
}

@media (max-width: 640px) {
  .cv-logo__subtitle {
    display: none;
  }
  .cv-logo--default .cv-logo__emblem {
    width: 38px;
    height: 38px;
  }
  .cv-logo__title { font-size: 17px; }
}
</style>