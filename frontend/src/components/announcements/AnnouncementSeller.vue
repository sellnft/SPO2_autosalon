<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  },
  showPhone: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)
const isPhoneRevealed = ref(false)
const isPhoneCopied = ref(false)

const sellerInitial = computed(() => {
  return props.announcement.sellerName?.charAt(0)?.toUpperCase() || 'П'
})

const maskedPhone = computed(() => {
  const phone = props.announcement.sellerPhone || ''
  if (!phone) return ''
  if (isPhoneRevealed.value) return phone
  return phone.replace(/(\+7\s?\(?\d{3}\)?\s?)\d{3}(-?\d{2}){2}/, '$1•••-••-••')
})

const hasPhone = computed(() => !!props.announcement.sellerPhone)

const isDealer = computed(() => {
  const type = (props.announcement.sellerType || '').toLowerCase()
  return type.includes('дилер') || type.includes('салон') || type.includes('dealer')
})

const sellerRating = computed(() => {
  return props.announcement.sellerRating ?? null
})

const sellerDeals = computed(() => {
  return props.announcement.sellerDeals ?? null
})

async function contactSeller() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы написать продавцу')
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  loading.value = true
  try {
    const chat = await chatStore.createOrOpenChat(
      props.announcement.id,
      props.announcement.sellerId
    )
    router.push({ name: 'chat-detail', params: { id: chat.id } })
  } catch (err) {
    toastStore.error('Не удалось открыть чат')
  } finally {
    loading.value = false
  }
}

function revealPhone() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы увидеть номер')
    router.push({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }
  isPhoneRevealed.value = true
}

async function copyPhone() {
  if (!isPhoneRevealed.value) {
    revealPhone()
    return
  }
  try {
    await navigator.clipboard.writeText(props.announcement.sellerPhone)
    isPhoneCopied.value = true
    toastStore.success('Телефон скопирован')
    setTimeout(() => { isPhoneCopied.value = false }, 1500)
  } catch (e) {
    toastStore.error('Не удалось скопировать')
  }
}

function goToProfile() {
  if (!props.announcement.sellerId) return
  router.push(`/sellers/${props.announcement.sellerId}`)
}
</script>

<template>
  <section class="cv-seller">
    <header class="cv-seller__header">
      <h3 class="cv-seller__title">
        <span class="cv-seller__title-dot" aria-hidden="true"></span>
        Продавец
      </h3>

      <span v-if="isDealer" class="cv-seller__dealer-badge">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
        Автосалон
      </span>
    </header>

    <div class="cv-seller__info">
      <button
        v-if="announcement.sellerId"
        type="button"
        class="cv-seller__avatar"
        aria-label="Профиль продавца"
        @click="goToProfile"
      >
        <span class="cv-seller__avatar-inner">{{ sellerInitial }}</span>
        <span class="cv-seller__avatar-online" aria-hidden="true"></span>
      </button>

      <div v-else class="cv-seller__avatar">
        <span class="cv-seller__avatar-inner">{{ sellerInitial }}</span>
      </div>

      <div class="cv-seller__details">
        <div class="cv-seller__name-row">
          <p class="cv-seller__name">{{ announcement.sellerName || 'Продавец' }}</p>

          <span v-if="sellerRating" class="cv-seller__rating">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18.2 5.5 22l1.7-7.4-5.7-5L9 9z"/>
            </svg>
            {{ sellerRating.toFixed(1) }}
          </span>
        </div>

        <p class="cv-seller__type">{{ announcement.sellerType || 'Частное лицо' }}</p>

        <div class="cv-seller__meta">
          <span v-if="announcement.city" class="cv-seller__meta-item">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 13s-5-3.5-5-8a5 5 0 0110 0c0 4.5-5 8-5 8z"/>
              <circle cx="7" cy="5" r="1.5"/>
            </svg>
            {{ announcement.city }}
          </span>

          <span v-if="sellerDeals" class="cv-seller__meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 7L9 18l-5-5"/>
            </svg>
            {{ sellerDeals }} сделок
          </span>
        </div>
      </div>
    </div>

    <div v-if="hasPhone && showPhone" class="cv-seller__phone">
      <span class="cv-seller__phone-label">Телефон</span>

      <button
        type="button"
        class="cv-seller__phone-value"
        :class="{ 'cv-seller__phone-value--copied': isPhoneCopied }"
        @click="isPhoneRevealed ? copyPhone() : revealPhone()"
      >
        <span class="cv-seller__phone-text">
          {{ maskedPhone || '• • • • • • • • • •' }}
        </span>

        <span class="cv-seller__phone-icon" aria-hidden="true">
          <svg v-if="!isPhoneRevealed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg v-else-if="!isPhoneCopied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
        </span>
      </button>

      <p class="cv-seller__phone-hint">
        {{ isPhoneRevealed ? 'Нажмите, чтобы скопировать' : 'Нажмите, чтобы увидеть номер' }}
      </p>
    </div>

    <div class="cv-seller__actions">
      <BaseButton block size="lg" :loading="loading" @click="contactSeller">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
          <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/>
        </svg>
        Написать продавцу
      </BaseButton>

      <button
        v-if="announcement.sellerId"
        type="button"
        class="cv-seller__view-profile"
        @click="goToProfile"
      >
        <span>Все объявления продавца</span>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 4l4 4-4 4"/>
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.cv-seller {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 24px 24px;
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

.cv-seller::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(232, 213, 160, 0.22) 50%,
    transparent
  );
  pointer-events: none;
  border-radius: inherit inherit 0 0;
}

.cv-seller__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-seller__title {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.15px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-seller__title-dot {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #E8D5A0, #C9A961, #8B6F3F);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.5);
  flex-shrink: 0;
}

.cv-seller__dealer-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
  white-space: nowrap;
}

.cv-seller__info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.cv-seller__avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-seller__avatar:not(button) {
  cursor: default;
}

.cv-seller__avatar:hover {
  transform: scale(1.04);
}

.cv-seller__avatar-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 50%;
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 16px rgba(201, 169, 97, 0.3),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-seller__avatar-online {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  border: 2px solid #121215;
  box-shadow: 0 0 8px rgba(122, 154, 106, 0.7);
  z-index: 2;
}

.cv-seller__details {
  flex: 1;
  min-width: 0;
}

.cv-seller__name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.cv-seller__name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.15px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-seller__rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(201, 169, 97, 0.3);
  white-space: nowrap;
}

.cv-seller__type {
  margin: 0 0 6px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-seller__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-seller__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-seller__meta-item svg {
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-seller__phone {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.22);
}

.cv-seller__phone-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-seller__phone-value {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  font-family: inherit;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  text-align: left;
}

.cv-seller__phone-value:hover {
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.4);
}

.cv-seller__phone-value:active {
  transform: scale(0.98);
}

.cv-seller__phone-value:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

.cv-seller__phone-text {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #E8D5A0;
  white-space: nowrap;
}

.cv-seller__phone-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
  transition: color 0.22s ease;
}

.cv-seller__phone-value:hover .cv-seller__phone-icon {
  color: #E8D5A0;
}

.cv-seller__phone-value--copied .cv-seller__phone-icon {
  color: #B8CEA8;
}

.cv-seller__phone-hint {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.4);
  text-align: center;
}

.cv-seller__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cv-seller__view-profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-seller__view-profile svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-seller__view-profile:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-seller__view-profile:hover svg {
  transform: translateX(3px);
}

.cv-seller__view-profile:active {
  transform: translateY(0) scale(0.98);
}

.cv-seller__view-profile:focus-visible {
  outline: 2px solid #C9A961;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .cv-seller {
    padding: 18px 18px 20px;
    gap: 16px;
    border-radius: 1rem;
  }

  .cv-seller__title {
    font-size: 14px;
  }

  .cv-seller__avatar {
    width: 48px;
    height: 48px;
  }

  .cv-seller__avatar-inner {
    font-size: 18px;
  }

  .cv-seller__name {
    font-size: 14px;
  }

  .cv-seller__phone {
    padding: 12px 14px;
  }

  .cv-seller__phone-text {
    font-size: 13.5px;
  }

  .cv-seller__view-profile {
    font-size: 12px;
    padding: 9px 12px;
  }
}
</style>