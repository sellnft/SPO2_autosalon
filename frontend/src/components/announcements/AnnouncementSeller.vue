<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

defineProps({
  announcement: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function contactSeller() {
  router.push(`/chat?announcement=${announcement.id}`)
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
      <BaseButton block @click="contactSeller">
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