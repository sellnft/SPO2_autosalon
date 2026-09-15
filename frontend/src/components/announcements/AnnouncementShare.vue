<script setup>
import { ref, computed } from 'vue'
import BaseDropdown from '@/components/common/BaseDropdown.vue'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  }
})

const toastStore = useToastStore()

const copied = ref(false)

const shareUrl = computed(() => {
  return `${window.location.origin}/announcements/${props.announcementId}`
})

const shareOptions = [
  { label: 'Копировать ссылку', action: 'copy' },
  { label: 'Telegram', action: 'telegram' },
  { label: 'WhatsApp', action: 'whatsapp' },
  { label: 'VK', action: 'vk' }
]

async function handleShare(item) {
  if (item.action === 'copy') {
    try {
      await navigator.clipboard.writeText(shareUrl.value)
      copied.value = true
      toastStore.success('Ссылка скопирована')
      setTimeout(() => (copied.value = false), 2000)
    } catch (err) {
      toastStore.error('Не удалось скопировать')
    }
  } else {
    const urls = {
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl.value)}`,
      vk: `https://vk.com/share.php?url=${encodeURIComponent(shareUrl.value)}`
    }
    window.open(urls[item.action], '_blank')
  }
}
</script>

<template>
  <BaseDropdown :items="shareOptions" @select="handleShare">
    <template #trigger>
      <button
        class="announcement-share"
        :aria-label="copied ? 'Скопировано' : 'Поделиться'"
      >
        <svg v-if="!copied" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 13l2-2-2-2M17 11H8M5 17l-3-3 3-3M2 14h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </template>
  </BaseDropdown>
</template>

<style scoped>
.announcement-share {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #6B7280;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.announcement-share:hover {
  background: #F3F4F6;
  color: #111827;
}
</style>