<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()
const toastStore = useToastStore()

const loading = ref(false)

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
</script>

<template>
  <div class="announcement-seller">
    <h3 class="announcement-seller__title">Продавец</h3>
    
    <div class="announcement-seller__info">
      <div class="announcement-seller__avatar">
        {{ announcement.sellerName?.charAt(0) }}
      </div>
      
      <div class="announcement-seller__details">
        <p class="announcement-seller__name">{{ announcement.sellerName }}</p>
        <p class="announcement-seller__type">{{ announcement.sellerType }}</p>
        <p class="announcement-seller__location">{{ announcement.city }}</p>
      </div>
    </div>
    
    <div class="announcement-seller__actions">
      <BaseButton block :loading="loading" @click="contactSeller">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Написать продавцу
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.announcement-seller {
  padding: 24px;
  background: white;
  border-radius: 16px;
}

.announcement-seller__title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.announcement-seller__info {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.announcement-seller__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 20px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #0A84FF, #0066CC);
  border-radius: 50%;
}

.announcement-seller__name {
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.announcement-seller__type {
  margin-bottom: 4px;
  font-size: 13px;
  color: #6B7280;
}

.announcement-seller__location {
  font-size: 13px;
  color: #9CA3AF;
}

.announcement-seller__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>