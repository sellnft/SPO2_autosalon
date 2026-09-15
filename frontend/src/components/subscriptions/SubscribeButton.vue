<script setup>
import { ref, computed } from 'vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'

const props = defineProps({
  announcementId: {
    type: [Number, String],
    required: true
  }
})

const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)

const isSubscribed = computed(() =>
  subscriptionsStore.isSubscribed(props.announcementId)
)

async function handleToggle() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы подписаться')
    router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
    return
  }

  loading.value = true
  try {
    if (isSubscribed.value) {
      await subscriptionsStore.unsubscribe(props.announcementId)
      toastStore.success('Вы отписались от объявления')
    } else {
      await subscriptionsStore.subscribe(props.announcementId)
      toastStore.success('Вы подписались на изменения')
    }
  } catch (err) {
    toastStore.error(err.message || 'Ошибка')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    class="cv-sub"
    :class="{ 'cv-sub--active': isSubscribed }"
    :disabled="loading"
    @click="handleToggle"
  >
    <span class="cv-sub__icon" aria-hidden="true">
      <svg width="17" height="17" viewBox="0 0 20 20" :fill="isSubscribed ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 6a5 5 0 10-10 0c0 6-2 7-2 7h14s-2-1-2-7z"/>
        <path d="M8 17a2 2 0 004 0"/>
      </svg>
    </span>
    <span class="cv-sub__label">
      {{ isSubscribed ? 'Вы подписаны' : 'Подписаться' }}
    </span>
    <span v-if="isSubscribed" class="cv-sub__pulse" aria-hidden="true"></span>
  </button>
</template>

<style scoped>
.cv-sub {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 22px;
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
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  isolation: isolate;
}

.cv-sub::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.14), rgba(201, 169, 97, 0.03));
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.cv-sub:hover:not(:disabled) {
  color: #E8D5A0;
  border-color: rgba(201, 169, 97, 0.48);
  transform: translateY(-1px);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(201, 169, 97, 0.18);
}

.cv-sub:hover:not(:disabled)::before {
  opacity: 1;
}

.cv-sub:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.cv-sub:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cv-sub__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-sub:hover:not(:disabled) .cv-sub__icon {
  transform: scale(1.08);
}

.cv-sub__label {
  position: relative;
  z-index: 1;
  white-space: nowrap;
}

.cv-sub--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 6px 24px rgba(201, 169, 97, 0.35),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-sub--active::before {
  opacity: 0;
}

.cv-sub--active:hover:not(:disabled) {
  color: #1A1208;
  border-color: rgba(232, 213, 160, 0.7);
  transform: translateY(-1px);
  box-shadow:
    0 10px 32px rgba(201, 169, 97, 0.5),
    0 0 0 1px rgba(255, 245, 214, 0.2) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-sub__pulse {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1A1208;
  box-shadow: 0 0 0 0 rgba(26, 18, 8, 0.5);
  animation: cvSubPulse 2.2s ease-in-out infinite;
  z-index: 1;
  pointer-events: none;
}

@keyframes cvSubPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(26, 18, 8, 0.5);
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 8px rgba(26, 18, 8, 0);
    opacity: 0.8;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(26, 18, 8, 0);
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .cv-sub {
    padding: 11px 18px;
    font-size: 13px;
    gap: 8px;
  }

  .cv-sub__pulse {
    right: 8px;
  }
}
</style>