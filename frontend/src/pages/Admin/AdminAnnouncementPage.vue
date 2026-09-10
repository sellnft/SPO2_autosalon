<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatPrice'
import { formatMileage } from '@/utils/formatMileage'
import { formatDate } from '@/utils/formatDate'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AnnouncementGallery from '@/components/announcements/AnnouncementGallery.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const showRejectModal = ref(false)
const rejectReason = ref('')

const announcement = computed(() => 
  adminStore.announcements.find(a => a.id === Number(route.params.id))
)

async function moderate(action) {
  try {
    await adminStore.moderateAnnouncement(route.params.id, action)
    
    if (action === 'approve') {
      toastStore.success('Объявление одобрено')
    } else if (action === 'reject') {
      toastStore.success('Объявление отклонено')
      showRejectModal.value = false
    } else if (action === 'block') {
      toastStore.success('Объявление заблокировано')
    }
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

onMounted(async () => {
  if (!adminStore.announcements.length) {
    await adminStore.fetchAnnouncements()
  }
})
</script>

<template>
  <div class="admin-announcement">
    <button class="admin-announcement__back" @click="router.push('/admin/announcements')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      К объявлениям
    </button>
    
    <div v-if="!announcement" class="admin-announcement__loading">
      Загрузка...
    </div>
    
    <template v-else>
      <!-- Header with actions -->
      <div class="admin-announcement__header-card">
        <div class="admin-announcement__header-top">
          <div>
            <div class="admin-announcement__meta">
              <span class="admin-announcement__id">#{{ announcement.id }}</span>
              <AdminStatusBadge :status="announcement.status" type="announcement" />
            </div>
            <h1 class="admin-announcement__title">
              {{ announcement.brand }} {{ announcement.model }}, {{ announcement.year }}
            </h1>
            <p class="admin-announcement__date">
              Создано: {{ formatDate(announcement.createdAt, 'datetime') }}
            </p>
          </div>
        </div>
        
        <div class="admin-announcement__actions">
          <BaseButton
            v-if="announcement.status === 'pending'"
            variant="primary"
            @click="moderate('approve')"
          >
            Одобрить
          </BaseButton>
          
          <BaseButton
            v-if="announcement.status === 'pending'"
            variant="danger"
            @click="showRejectModal = true"
          >
            Отклонить
          </BaseButton>
          
          <BaseButton
            v-if="announcement.status === 'active'"
            variant="danger"
            @click="moderate('block')"
          >
            Заблокировать
          </BaseButton>
          
          <BaseButton
            v-if="announcement.status === 'blocked'"
            variant="primary"
            @click="moderate('approve')"
          >
            Разблокировать
          </BaseButton>
        </div>
      </div>
      
      <!-- Content -->
      <div class="admin-announcement__content">
        <div class="admin-announcement__main">
          <AnnouncementGallery :photos="announcement.photos" />
          
          <div class="admin-announcement__section">
            <h2 class="admin-announcement__section-title">Описание</h2>
            <p class="admin-announcement__description">{{ announcement.description }}</p>
          </div>
        </div>
        
        <aside class="admin-announcement__sidebar">
          <div class="admin-announcement__card">
            <div class="admin-announcement__price">
              {{ formatPrice(announcement.price) }}
            </div>
          </div>
          
          <div class="admin-announcement__card">
            <h3 class="admin-announcement__card-title">Характеристики</h3>
            <dl class="admin-announcement__specs">
              <div><dt>Пробег</dt><dd>{{ formatMileage(announcement.mileage) }}</dd></div>
              <div><dt>Двигатель</dt><dd>{{ announcement.engineType }} {{ announcement.engineVolume }}л</dd></div>
              <div><dt>Мощность</dt><dd>{{ announcement.power }} л.с.</dd></div>
              <div><dt>КПП</dt><dd>{{ announcement.transmission }}</dd></div>
              <div><dt>Привод</dt><dd>{{ announcement.drive }}</dd></div>
              <div><dt>Кузов</dt><dd>{{ announcement.bodyType }}</dd></div>
              <div><dt>Цвет</dt><dd>{{ announcement.color }}</dd></div>
              <div><dt>Город</dt><dd>{{ announcement.city }}</dd></div>
            </dl>
          </div>
          
          <div class="admin-announcement__card">
            <h3 class="admin-announcement__card-title">Продавец</h3>
            <p class="admin-announcement__seller">{{ announcement.sellerName }}</p>
            <p class="admin-announcement__seller-type">{{ announcement.sellerType }}</p>
          </div>
        </aside>
      </div>
    </template>
    
    <!-- Reject Modal -->
    <ConfirmModal
      v-model="showRejectModal"
      title="Отклонить объявление"
      message="Укажите причину отклонения, чтобы продавец мог исправить ошибки."
      confirm-text="Отклонить"
      variant="danger"
      @confirm="moderate('reject')"
    />
  </div>
</template>

<style scoped>
.admin-announcement {
  max-width: 1200px;
}

.admin-announcement__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 12px;
  font-size: 13px;
  color: #9CA3AF;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.admin-announcement__back:hover {
  color: #E5E7EB;
  background: #1A1A1D;
}

.admin-announcement__loading {
  padding: 60px 0;
  text-align: center;
  color: #6B7280;
}

.admin-announcement__header-card {
  padding: 24px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
  margin-bottom: 24px;
}

.admin-announcement__header-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.admin-announcement__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.admin-announcement__id {
  font-family: monospace;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

.admin-announcement__title {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #E5E7EB;
}

.admin-announcement__date {
  font-size: 13px;
  color: #6B7280;
}

.admin-announcement__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-announcement__content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.admin-announcement__main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-announcement__section {
  padding: 24px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
}

.admin-announcement__section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-announcement__description {
  font-size: 14px;
  line-height: 1.7;
  color: #9CA3AF;
  white-space: pre-line;
}

.admin-announcement__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-announcement__card {
  padding: 20px;
  background: #161618;
  border: 1px solid #26262A;
  border-radius: 12px;
}

.admin-announcement__price {
  font-size: 28px;
  font-weight: 700;
  color: #C8A96E;
}

.admin-announcement__card-title {
  margin-bottom: 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6B7280;
}

.admin-announcement__specs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-announcement__specs > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.admin-announcement__specs dt {
  color: #6B7280;
}

.admin-announcement__specs dd {
  font-weight: 500;
  color: #E5E7EB;
  text-align: right;
}

.admin-announcement__seller {
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 600;
  color: #E5E7EB;
}

.admin-announcement__seller-type {
  font-size: 12px;
  color: #6B7280;
}

@media (max-width: 1024px) {
  .admin-announcement__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-announcement__title {
    font-size: 20px;
  }

  .admin-announcement__actions {
    flex-direction: column;
  }
}
</style>