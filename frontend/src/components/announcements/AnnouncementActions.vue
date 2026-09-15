<script setup>
import { computed } from 'vue'
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'
import SubscribeButton from '@/components/subscriptions/SubscribeButton.vue'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  },
  orientation: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical'].includes(v)
  },
  shareable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['share'])

const canShare = computed(() =>
  typeof navigator !== 'undefined'
  && typeof navigator.share === 'function'
)

function handleShare() {
  emit('share')
}
</script>

<template>
  <div class="cv-aactions" :class="`cv-aactions--${orientation}`">
    <FavouriteButton
      :announcement-id="announcement.id"
      variant="button"
    />

    <SubscribeButton :announcement-id="announcement.id" />

    <button
      v-if="shareable"
      type="button"
      class="cv-aactions__share"
      aria-label="Поделиться"
      @click="handleShare"
    >
      <span class="cv-aactions__share-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/>
          <path d="M16 6l-4-4-4 4"/>
          <path d="M12 2v14"/>
        </svg>
      </span>
      <span class="cv-aactions__share-text">Поделиться</span>
    </button>
  </div>
</template>

<style scoped>
.cv-aactions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  position: relative;
}

.cv-aactions--horizontal {
  flex-direction: row;
}

.cv-aactions--vertical {
  flex-direction: column;
  align-items: stretch;
}

.cv-aactions--vertical > * {
  width: 100%;
}

.cv-aactions__share {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 20px 12px 18px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: rgba(220, 210, 195, 0.8);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-aactions__share::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 0;
}

.cv-aactions__share:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(201, 169, 97, 0.2);
}

.cv-aactions__share:hover::before {
  opacity: 1;
}

.cv-aactions__share:active {
  transform: translateY(0) scale(0.98);
}

.cv-aactions__share:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-aactions__share-icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-aactions__share:hover .cv-aactions__share-icon {
  transform: translateY(-2px);
}

.cv-aactions__share-text {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cv-aactions {
    width: 100%;
    gap: 8px;
  }

  .cv-aactions--horizontal > * {
    flex: 1;
    min-width: 0;
  }

  .cv-aactions__share {
    padding: 11px 16px 11px 14px;
    font-size: 13px;
    gap: 7px;
  }
}

@media (max-width: 480px) {
  .cv-aactions--horizontal {
    flex-direction: column;
  }

  .cv-aactions--horizontal > * {
    width: 100%;
    flex: none;
  }

  .cv-aactions__share-text {
    display: inline;
  }
}
</style>