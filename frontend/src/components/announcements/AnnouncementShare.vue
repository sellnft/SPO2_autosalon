<script setup>
import { ref, computed } from 'vue'
import BaseDropdown from '@/components/common/BaseDropdown.vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  },
  variant: {
    type: String,
    default: 'icon',
    validator: (v) => ['icon', 'button'].includes(v)
  },
  title: {
    type: String,
    default: ''
  }
})

const toastStore = useToastStore()

const copied = ref(false)
const canNativeShare = ref(
  typeof navigator !== 'undefined' && typeof navigator.share === 'function'
)

const shareUrl = computed(() => {
  return `${window.location.origin}/announcements/${props.announcementId}`
})

const shareOptions = computed(() => {
  const options = []

  if (canNativeShare.value) {
    options.push({ label: 'Поделиться...', action: 'native', icon: 'sparkles' })
  }

  options.push(
    { label: 'Копировать ссылку', action: 'copy', icon: 'link' },
    { label: 'Telegram', action: 'telegram', icon: 'telegram' },
    { label: 'WhatsApp', action: 'whatsapp', icon: 'whatsapp' },
    { label: 'ВКонтакте', action: 'vk', icon: 'vk' }
  )

  return options
})

async function handleShare(item) {
  if (item.action === 'copy') {
    await copyLink()
    return
  }

  if (item.action === 'native') {
    try {
      await navigator.share({
        title: props.title || 'Объявление на CarVibe',
        text: props.title ? `${props.title} — CarVibe` : 'Смотрите на CarVibe',
        url: shareUrl.value
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        toastStore.error('Не удалось поделиться')
      }
    }
    return
  }

  const text = props.title
    ? `${props.title} — ${shareUrl.value}`
    : shareUrl.value

  const urls = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(props.title || '')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    vk: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(props.title || '')}`
  }

  window.open(urls[item.action], '_blank', 'noopener,noreferrer')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    toastStore.success('Ссылка скопирована')
    setTimeout(() => (copied.value = false), 2000)
  } catch (err) {
    toastStore.error('Не удалось скопировать')
  }
}
</script>

<template>
  <BaseDropdown :items="shareOptions" placement="bottom-end" @select="handleShare">
    <template #trigger>
      <button
        v-if="variant === 'icon'"
        type="button"
        class="cv-share cv-share--icon"
        :class="{ 'cv-share--copied': copied }"
        :aria-label="copied ? 'Скопировано' : 'Поделиться'"
      >
        <span class="cv-share__icon" aria-hidden="true">
          <svg v-if="!copied" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
        </span>
      </button>

      <button
        v-else
        type="button"
        class="cv-share cv-share--full"
        :class="{ 'cv-share--copied': copied }"
      >
        <span class="cv-share__icon" aria-hidden="true">
          <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
        </span>
        <span class="cv-share__label">
          {{ copied ? 'Скопировано' : 'Поделиться' }}
        </span>
      </button>
    </template>
  </BaseDropdown>
</template>

<style scoped>
.cv-share {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-share::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
  z-index: 0;
}

.cv-share:hover::before {
  opacity: 1;
}

.cv-share--icon {
  width: 42px;
  height: 42px;
  padding: 0;
  color: rgba(220, 210, 195, 0.7);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 11px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-share--icon:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(201, 169, 97, 0.2);
}

.cv-share--icon:active {
  transform: translateY(0) scale(0.96);
}

.cv-share--full {
  gap: 9px;
  padding: 11px 20px 11px 18px;
  font-size: 13.5px;
  font-weight: 650;
  letter-spacing: 0.15px;
  color: rgba(220, 210, 195, 0.8);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-radius: 12px;
}

.cv-share--full:hover {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(201, 169, 97, 0.18);
}

.cv-share--full:active {
  transform: translateY(0) scale(0.98);
}

.cv-share:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(201, 169, 97, 0.15);
}

.cv-share__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-share:hover .cv-share__icon {
  transform: translateY(-1px);
}

.cv-share--copied {
  color: #B8CEA8;
  border-color: rgba(122, 154, 106, 0.5);
}

.cv-share--copied::before {
  background: linear-gradient(135deg, rgba(122, 154, 106, 0.14), rgba(122, 154, 106, 0.03));
  opacity: 1;
}

.cv-share--copied:hover {
  color: #B8CEA8;
  border-color: rgba(122, 154, 106, 0.6);
}

.cv-share__label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cv-share--icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .cv-share--full {
    padding: 10px 16px 10px 14px;
    font-size: 13px;
    gap: 8px;
  }
}
</style>