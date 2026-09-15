<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  description: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'Описание'
  },
  collapsible: {
    type: Boolean,
    default: true
  },
  maxHeight: {
    type: Number,
    default: 320
  }
})

const isExpanded = ref(false)

const isLong = computed(() => {
  if (!props.collapsible) return false
  const chars = props.description?.length || 0
  const newlines = (props.description?.match(/\n/g) || []).length
  return chars > 400 || newlines > 6
})

const shouldCollapse = computed(() => isLong.value && !isExpanded.value)
</script>

<template>
  <section class="cv-desc">
    <header class="cv-desc__header">
      <h3 class="cv-desc__title">
        <span class="cv-desc__title-dot" aria-hidden="true"></span>
        {{ title }}
      </h3>

      <button
        v-if="isLong"
        type="button"
        class="cv-desc__toggle"
        @click="isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'Свернуть' : 'Развернуть' }}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          :style="{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }"
        >
          <path d="M2 4l4 4 4-4"/>
        </svg>
      </button>
    </header>

    <div
      class="cv-desc__body"
      :class="{ 'cv-desc__body--collapsed': shouldCollapse }"
      :style="shouldCollapse ? { maxHeight: `${maxHeight}px` } : {}"
    >
      <p class="cv-desc__text">{{ description }}</p>

      <div v-if="shouldCollapse" class="cv-desc__fade" aria-hidden="true"></div>
    </div>

    <button
      v-if="shouldCollapse"
      type="button"
      class="cv-desc__show-more"
      @click="isExpanded = true"
    >
      <span class="cv-desc__show-more-text">Показать полностью</span>
      <span class="cv-desc__show-more-icon" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2v8M2 6l4 4 4-4"/>
        </svg>
      </span>
    </button>
  </section>
</template>

<style scoped>
.cv-desc {
  position: relative;
  padding: 24px 26px 26px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 1.25rem;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-desc::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.25) 50%,
    transparent
  );
  pointer-events: none;
  border-radius: inherit inherit 0 0;
}

.cv-desc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.cv-desc__title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.15px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-desc__title-dot {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.55);
  flex-shrink: 0;
}

.cv-desc__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-desc__toggle svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-desc__toggle:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
  transform: translateY(-1px);
}

.cv-desc__toggle:active {
  transform: translateY(0) scale(0.96);
}

.cv-desc__toggle:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-desc__body {
  position: relative;
  overflow: hidden;
  transition: max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.cv-desc__body--collapsed {
  mask-image: linear-gradient(180deg, #000 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent 100%);
}

.cv-desc__text {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.75;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.82);
  white-space: pre-line;
  overflow-wrap: break-word;
  word-wrap: break-word;
}

.cv-desc__fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(15, 13, 10, 0.5) 60%,
    rgba(15, 13, 10, 0.85) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.cv-desc__show-more {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 14px;
  padding: 11px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border: 1px solid rgba(232, 213, 160, 0.5);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.3),
    0 0 0 1px rgba(255, 245, 214, 0.12) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-desc__show-more:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 28px rgba(201, 169, 97, 0.5),
    0 0 32px rgba(201, 169, 97, 0.28),
    0 0 0 1px rgba(255, 245, 214, 0.18) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-desc__show-more:active {
  transform: translateY(0) scale(0.98);
}

.cv-desc__show-more:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-desc__show-more-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-desc__show-more:hover .cv-desc__show-more-icon {
  transform: translateY(2px);
}

@media (max-width: 640px) {
  .cv-desc {
    padding: 20px 18px 22px;
    border-radius: 1rem;
  }

  .cv-desc__header {
    margin-bottom: 14px;
  }

  .cv-desc__title {
    font-size: 15px;
  }

  .cv-desc__text {
    font-size: 14px;
    line-height: 1.7;
  }

  .cv-desc__toggle {
    padding: 5px 10px;
    font-size: 12px;
  }

  .cv-desc__show-more {
    padding: 10px 16px;
    font-size: 12.5px;
  }
}
</style>