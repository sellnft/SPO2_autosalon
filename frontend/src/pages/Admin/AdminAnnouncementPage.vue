<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatPrice'
import { formatMileage } from '@/utils/formatMileage'
import AdminStatusBadge from '@/components/admin/AdminStatusBadge.vue'
import AnnouncementGallery from '@/components/announcements/AnnouncementGallery.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const toastStore = useToastStore()

const showRejectModal = ref(false)
const showBanSellerModal = ref(false)
const rejectReason = ref('')
const rejectComment = ref('')
const rejectError = ref('')
const banning = ref(false)

const rejectReasons = [
  { value: 'photos', label: 'Недостоверные фото' },
  { value: 'price', label: 'Некорректная цена' },
  { value: 'rules', label: 'Нарушение правил' },
  { value: 'duplicate', label: 'Дубликат объявления' },
  { value: 'vehicle', label: 'Проблемы с автомобилем' },
  { value: 'other', label: 'Другая причина' }
]

const announcement = computed(() =>
  adminStore.announcements.find(a => a.id === Number(route.params.id))
)

const breadcrumbItems = computed(() => [
  { label: 'Админ', to: '/admin' },
  { label: 'Объявления', to: '/admin/announcements' },
  { label: `#${route.params.id}` }
])

const checks = computed(() => {
  const a = announcement.value
  if (!a) return []
  const list = []

  list.push({
    icon: 'vin',
    label: a.vin ? 'VIN валиден' : 'VIN не указан',
    state: a.vin ? 'ok' : 'warn'
  })

  const photoCount = a.photos?.length || 0
  list.push({
    icon: 'photo',
    label: `Фото ${photoCount}/10`,
    state: photoCount >= 5 ? 'ok' : 'warn'
  })

  const descLen = (a.description || '').length
  list.push({
    icon: 'text',
    label: `Описание ${descLen} симв.`,
    state: descLen >= 100 ? 'ok' : 'warn'
  })

  if (a.sellerViolations > 0) {
    list.push({
      icon: 'user',
      label: `Продавец: ${a.sellerViolations} наруш.`,
      state: 'danger'
    })
  } else {
    list.push({ icon: 'user', label: 'Продавец без нарушений', state: 'ok' })
  }

  if (a.isPledged) {
    list.push({ icon: 'shield', label: 'Авто в залоге', state: 'danger' })
  }

  return list
})

const moderationHistory = computed(() => [
  { state: 'approved', title: 'Одобрено', date: '15 сентября, 14:32', author: 'Анна С.' },
  { state: 'edited', title: 'Изменено продавцом', date: '14 сентября, 18:10', author: 'Иван П.' },
  { state: 'rejected', title: 'Отклонено', date: '13 сентября, 11:00', author: 'Пётр М.', comment: 'Недостоверные фото' },
  { state: 'created', title: 'Создано', date: '13 сентября, 10:15', author: 'Иван П.' }
])

const reports = computed(() => [
  { reason: 'Мошенничество', author: 'Анна', date: '12.09' },
  { reason: 'Недостоверные фото', author: 'Дмитрий', date: '11.09' }
])

async function moderate(action) {
  try {
    await adminStore.moderateAnnouncement(route.params.id, action)

    if (action === 'approve') {
      toastStore.success('Объявление одобрено')
    } else if (action === 'block') {
      toastStore.success('Объявление заблокировано')
    }
  } catch (err) {
    toastStore.error('Ошибка модерации')
  }
}

function openRejectModal() {
  rejectReason.value = ''
  rejectComment.value = ''
  rejectError.value = ''
  showRejectModal.value = true
}

async function confirmReject() {
  if (!rejectReason.value) {
    rejectError.value = 'Выберите причину отклонения'
    return
  }

  try {
    await adminStore.moderateAnnouncement(route.params.id, 'reject', {
      reason: rejectReason.value,
      comment: rejectComment.value
    })
    toastStore.success('Объявление отклонено')
    showRejectModal.value = false
  } catch (err) {
    toastStore.error('Не удалось отклонить')
  }
}

function confirmBanSeller() {
  banning.value = true
  setTimeout(() => {
    banning.value = false
    showBanSellerModal.value = false
    toastStore.success('Продавец заблокирован')
  }, 800)
}

function goToPreview() {
  window.open(`/announcements/${route.params.id}`, '_blank')
}

function goToSeller() {
  router.push(`/admin/users/${announcement.value?.sellerId}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(async () => {
  if (!adminStore.announcements.length) {
    await adminStore.fetchAnnouncements()
  }
})
</script>

<template>
  <div class="cv-aad">
    <div class="cv-aad__container">
      <div class="cv-aad__top">
        <button
          type="button"
          class="cv-aad__back"
          @click="router.push('/admin/announcements')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          К объявлениям
        </button>
      </div>

      <div v-if="!announcement" class="cv-aad__loading">
        <span class="spinner spinner-lg"></span>
        <p>Загрузка объявления...</p>
      </div>

      <template v-else>
        <header class="cv-aad__hero">
          <div class="cv-aad__hero-glow" aria-hidden="true"></div>

          <div class="cv-aad__hero-content">
            <div class="cv-aad__hero-badges">
              <span class="cv-aad__id">
                <span class="cv-aad__id-label">ID</span>
                #{{ announcement.id }}
              </span>

              <AdminStatusBadge :status="announcement.status" type="announcement" />

              <span v-if="reports.length" class="cv-aad__reports">
                <span class="cv-aad__reports-icon" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 22V4a2 2 0 0 1 2-2h13l-3 5 3 5H6"/>
                  </svg>
                </span>
                {{ reports.length }} жалоб
              </span>
            </div>

            <h1 class="cv-aad__title">
              {{ announcement.brand }} {{ announcement.model }}, {{ announcement.year }}
            </h1>

            <div class="cv-aad__meta">
              <span class="cv-aad__meta-item">
                <span class="cv-aad__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="14" rx="2"/>
                    <path d="M3 10h18M8 6V3M16 6V3"/>
                  </svg>
                </span>
                Создано {{ formatDate(announcement.createdAt) }}
              </span>

              <span class="cv-aad__meta-dot" aria-hidden="true"></span>

              <span class="cv-aad__meta-item">
                <span class="cv-aad__meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
                  </svg>
                </span>
                Продавец: {{ announcement.sellerName }}
                <template v-if="announcement.sellerType"> ({{ announcement.sellerType }})</template>
              </span>
            </div>

            <div class="cv-aad__checks">
              <span
                v-for="(check, idx) in checks"
                :key="idx"
                class="cv-aad__check"
                :data-state="check.state"
              >
                <span class="cv-aad__check-icon" aria-hidden="true">
                  <svg v-if="check.state === 'ok'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 8.5l5 5L20 2.5"/>
                  </svg>
                  <svg v-else-if="check.state === 'warn'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 8v5M12 17h.01"/>
                  </svg>
                  <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 6l12 12M18 6L6 18"/>
                  </svg>
                </span>
                {{ check.label }}
              </span>
            </div>
          </div>

          <div class="cv-aad__hero-actions">
            <BaseButton
              v-if="announcement.status === 'pending'"
              @click="moderate('approve')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
              Одобрить
            </BaseButton>

            <BaseButton
              v-if="announcement.status === 'pending'"
              variant="danger"
              @click="openRejectModal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
              Отклонить
            </BaseButton>

            <BaseButton
              v-if="announcement.status === 'active'"
              variant="danger"
              @click="moderate('block')"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              Заблокировать
            </BaseButton>

            <BaseButton
              v-if="announcement.status === 'blocked'"
              @click="moderate('approve')"
            >
              Разблокировать
            </BaseButton>

            <BaseButton variant="outline" @click="goToPreview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Предпросмотр
            </BaseButton>
          </div>
        </header>

        <div class="cv-aad__content">
          <div class="cv-aad__main">
            <AnnouncementGallery :photos="announcement.photos" />

            <section class="cv-aad__card">
              <h2 class="cv-aad__card-title">Описание</h2>
              <p class="cv-aad__description">{{ announcement.description }}</p>
            </section>

            <section v-if="reports.length" class="cv-aad__card">
              <header class="cv-aad__card-header">
                <h2 class="cv-aad__card-title">Жалобы от пользователей</h2>
                <span class="cv-aad__card-count">{{ reports.length }}</span>
              </header>

              <ul class="cv-aad__reports-list">
                <li
                  v-for="(report, idx) in reports"
                  :key="idx"
                  class="cv-aad__report"
                >
                  <span class="cv-aad__report-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 22V4a2 2 0 0 1 2-2h13l-3 5 3 5H6"/>
                    </svg>
                  </span>

                  <div class="cv-aad__report-content">
                    <span class="cv-aad__report-reason">{{ report.reason }}</span>
                    <span class="cv-aad__report-meta">
                      От {{ report.author }} · {{ report.date }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="cv-aad__report-view"
                    aria-label="Разобрать"
                  >
                    Разобрать
                  </button>
                </li>
              </ul>
            </section>
          </div>

          <aside class="cv-aad__sidebar">
            <section class="cv-aad__price-card">
              <div class="cv-aad__price-glow" aria-hidden="true"></div>
              <span class="cv-aad__price-label">Цена</span>
              <span class="cv-aad__price-value">{{ formatPrice(announcement.price) }}</span>
              <span v-if="announcement.negotiable" class="cv-aad__price-tag">Торг возможен</span>
            </section>

            <section class="cv-aad__card">
              <h3 class="cv-aad__card-title">Продавец</h3>

              <div class="cv-aad__seller">
                <span class="cv-aad__seller-avatar">
                  <span class="cv-aad__seller-avatar-inner">
                    {{ announcement.sellerName?.charAt(0) }}
                  </span>
                </span>

                <div class="cv-aad__seller-info">
                  <span class="cv-aad__seller-name">{{ announcement.sellerName }}</span>
                  <span class="cv-aad__seller-type">
                    {{ announcement.sellerType || 'Частное лицо' }}
                  </span>
                  <span
                    v-if="announcement.sellerViolations > 0"
                    class="cv-aad__seller-violations"
                  >
                    ⚠ {{ announcement.sellerViolations }} нарушени{{ announcement.sellerViolations === 1 ? 'е' : 'я' }}
                  </span>
                  <span v-else class="cv-aad__seller-clean">
                    ✓ Без нарушений
                  </span>
                </div>
              </div>

              <div class="cv-aad__seller-actions">
                <button
                  type="button"
                  class="cv-aad__seller-btn"
                  @click="goToSeller"
                >
                  Профиль продавца
                </button>
                <button
                  type="button"
                  class="cv-aad__seller-btn cv-aad__seller-btn--danger"
                  @click="showBanSellerModal = true"
                >
                  Забанить
                </button>
              </div>
            </section>

            <section class="cv-aad__card">
              <h3 class="cv-aad__card-title">Характеристики</h3>

              <dl class="cv-aad__specs">
                <div><dt>Пробег</dt><dd>{{ formatMileage(announcement.mileage) }}</dd></div>
                <div><dt>Двигатель</dt><dd>{{ announcement.engineType }} {{ announcement.engineVolume }}л</dd></div>
                <div><dt>Мощность</dt><dd>{{ announcement.power }} л.с.</dd></div>
                <div><dt>КПП</dt><dd>{{ announcement.transmission }}</dd></div>
                <div><dt>Привод</dt><dd>{{ announcement.drive }}</dd></div>
                <div><dt>Кузов</dt><dd>{{ announcement.bodyType }}</dd></div>
                <div><dt>Цвет</dt><dd>{{ announcement.color }}</dd></div>
                <div><dt>Город</dt><dd>{{ announcement.city }}</dd></div>
              </dl>
            </section>

            <section class="cv-aad__card">
              <h3 class="cv-aad__card-title">История модерации</h3>

              <ol class="cv-aad__timeline">
                <li
                  v-for="(item, idx) in moderationHistory"
                  :key="idx"
                  class="cv-aad__timeline-item"
                  :data-state="item.state"
                >
                  <span class="cv-aad__timeline-marker" aria-hidden="true">
                    <svg v-if="item.state === 'approved'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 8.5l5 5L20 2.5"/>
                    </svg>
                    <svg v-else-if="item.state === 'rejected'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M6 6l12 12M18 6L6 18"/>
                    </svg>
                    <svg v-else-if="item.state === 'edited'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 3l5 5-11 11H5v-5z"/>
                    </svg>
                    <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </span>

                  <div class="cv-aad__timeline-content">
                    <span class="cv-aad__timeline-title">{{ item.title }}</span>
                    <span class="cv-aad__timeline-meta">
                      {{ item.date }} · {{ item.author }}
                    </span>
                    <span v-if="item.comment" class="cv-aad__timeline-comment">
                      «{{ item.comment }}»
                    </span>
                  </div>
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </template>
    </div>

    <ConfirmModal
      v-model="showRejectModal"
      title="Отклонить объявление"
      message="Укажите причину — продавец получит её в уведомлении"
      confirm-text="Отклонить"
      variant="danger"
      icon="x"
      @confirm="confirmReject"
    >
      <div class="cv-aad__reject">
        <label class="cv-aad__reject-label">Причина отклонения</label>
        <select v-model="rejectReason" class="cv-aad__reject-select">
          <option value="">Выберите причину</option>
          <option v-for="r in rejectReasons" :key="r.value" :value="r.value">
            {{ r.label }}
          </option>
        </select>

        <BaseInput
          v-model="rejectComment"
          label="Комментарий для продавца"
          placeholder="Дополнительные детали (необязательно)"
        />

        <p v-if="rejectError" class="cv-aad__reject-error">{{ rejectError }}</p>
      </div>
    </ConfirmModal>

    <ConfirmModal
      v-model="showBanSellerModal"
      title="Забанить продавца?"
      :message="`Все объявления пользователя ${announcement?.sellerName} будут скрыты. Пользователь не сможет публиковать новые.`"
      confirm-text="Забанить"
      cancel-text="Отмена"
      variant="danger"
      icon="lock"
      :loading="banning"
      @confirm="confirmBanSeller"
    />
  </div>
</template>

<style scoped>
.cv-aad {
  position: relative;
  padding: 20px 0 60px;
  isolation: isolate;
}

.cv-aad__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-aad__top {
  display: flex;
  align-items: center;
}

.cv-aad__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-aad__back:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateX(-2px);
}

.cv-aad__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 100px 0;
}

.cv-aad__loading p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-aad__hero {
  position: relative;
  padding: 28px 30px;
  border-radius: 1.5rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 80px rgba(201, 169, 97, 0.08);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-aad__hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.32) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}

.cv-aad__hero-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

.cv-aad__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.cv-aad__hero-badges {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-aad__id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
}

.cv-aad__id-label {
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.65);
}

.cv-aad__reports {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border: 1px solid rgba(184, 119, 85, 0.4);
}

.cv-aad__reports-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-aad__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.98);
}

.cv-aad__meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-aad__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cv-aad__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-aad__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
}

.cv-aad__checks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.cv-aad__check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.1px;
  border: 1px solid;
}

.cv-aad__check[data-state="ok"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.1);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-aad__check[data-state="warn"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-aad__check[data-state="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.12);
  border-color: rgba(184, 119, 85, 0.38);
}

.cv-aad__check-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

.cv-aad__hero-actions {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.cv-aad__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
}

.cv-aad__main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.cv-aad__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.cv-aad__card {
  position: relative;
  padding: 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-aad__card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
  pointer-events: none;
}

.cv-aad__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.1);
}

.cv-aad__card-title {
  margin: 0 0 14px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-aad__card-header .cv-aad__card-title {
  margin: 0;
}

.cv-aad__card-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A, #B87755);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(184, 119, 85, 0.4);
}

.cv-aad__description {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.7;
  color: rgba(220, 210, 195, 0.8);
  white-space: pre-line;
}

.cv-aad__price-card {
  position: relative;
  padding: 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.65)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  overflow: hidden;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 0 60px rgba(201, 169, 97, 0.1);
}

.cv-aad__price-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.4) 50%, transparent);
}

.cv-aad__price-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
}

.cv-aad__price-label {
  position: relative;
  z-index: 1;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-aad__price-value {
  position: relative;
  z-index: 1;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 40px rgba(201, 169, 97, 0.2);
}

.cv-aad__price-tag {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  margin-top: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.32);
}

.cv-aad__seller {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.cv-aad__seller-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 14px rgba(201, 169, 97, 0.3);
}

.cv-aad__seller-avatar-inner {
  font-size: 18px;
  font-weight: 800;
  color: #1A1208;
}

.cv-aad__seller-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.cv-aad__seller-name {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-aad__seller-type {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-aad__seller-violations {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8A88A;
}

.cv-aad__seller-clean {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #B8CEA8;
}

.cv-aad__seller-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cv-aad__seller-btn {
  padding: 9px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-aad__seller-btn:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-1px);
}

.cv-aad__seller-btn--danger {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.08);
  border-color: rgba(184, 119, 85, 0.28);
}

.cv-aad__seller-btn--danger:hover {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.6);
  border-color: rgba(232, 168, 138, 0.6);
}

.cv-aad__specs {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
}

.cv-aad__specs > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
}

.cv-aad__specs dt {
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-aad__specs dd {
  margin: 0;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.9);
  text-align: right;
}

.cv-aad__timeline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  position: relative;
}

.cv-aad__timeline-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.cv-aad__timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 30px;
  bottom: -4px;
  width: 1px;
  background: linear-gradient(180deg, rgba(201, 169, 97, 0.3), rgba(201, 169, 97, 0.05));
}

.cv-aad__timeline-marker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid;
}

.cv-aad__timeline-item[data-state="approved"] .cv-aad__timeline-marker {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-aad__timeline-item[data-state="rejected"] .cv-aad__timeline-marker {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border-color: rgba(184, 119, 85, 0.4);
}

.cv-aad__timeline-item[data-state="edited"] .cv-aad__timeline-marker {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.35);
}

.cv-aad__timeline-item[data-state="created"] .cv-aad__timeline-marker {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.35);
}

.cv-aad__timeline-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 2px;
}

.cv-aad__timeline-title {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.92);
}

.cv-aad__timeline-meta {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-aad__timeline-comment {
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 500;
  font-style: italic;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(220, 210, 195, 0.65);
}

.cv-aad__reports-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cv-aad__report {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.08), rgba(184, 119, 85, 0.02));
  border: 1px solid rgba(184, 119, 85, 0.22);
}

.cv-aad__report-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.12);
  border: 1px solid rgba(184, 119, 85, 0.3);
}

.cv-aad__report-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-aad__report-reason {
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(232, 168, 138, 0.95);
}

.cv-aad__report-meta {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-aad__report-view {
  align-self: center;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  color: #E8A88A;
  background: transparent;
  border: 1px solid rgba(184, 119, 85, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  flex-shrink: 0;
}

.cv-aad__report-view:hover {
  color: #F5F0E6;
  background: rgba(184, 119, 85, 0.4);
  border-color: rgba(232, 168, 138, 0.6);
}

.cv-aad__reject {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-aad__reject-label {
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: rgba(220, 210, 195, 0.7);
}

.cv-aad__reject-select {
  padding: 12px 14px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.95);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.22);
  border-radius: 11px;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #C9A961 50%),
    linear-gradient(135deg, #C9A961 50%, transparent 50%);
  background-position:
    calc(100% - 20px) calc(50% - 2px),
    calc(100% - 15px) calc(50% - 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  transition: all 0.22s ease;
}

.cv-aad__reject-select:hover {
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-aad__reject-select:focus {
  border-color: rgba(201, 169, 97, 0.6);
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.cv-aad__reject-select option {
  background: #16161C;
  color: rgba(245, 240, 230, 0.92);
}

.cv-aad__reject-error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.12), rgba(184, 119, 85, 0.03));
  border: 1px solid rgba(184, 119, 85, 0.35);
}

@media (max-width: 1280px) {
  .cv-aad__content { grid-template-columns: minmax(0, 1fr) 320px; }
}

@media (max-width: 1024px) {
  .cv-aad__container { padding: 0 24px; }
  .cv-aad__content { grid-template-columns: 1fr; }
  .cv-aad__sidebar { position: static; }
  .cv-aad__title { font-size: 22px; }
}

@media (max-width: 768px) {
  .cv-aad { padding: 12px 0 40px; }
  .cv-aad__container { padding: 0 20px; gap: 16px; }

  .cv-aad__hero { padding: 20px 20px; border-radius: 1rem; flex-direction: column; }
  .cv-aad__hero-content { width: 100%; }
  .cv-aad__title { font-size: 18px; }
  .cv-aad__hero-actions { width: 100%; }
  .cv-aad__hero-actions > * { flex: 1; min-width: 0; }

  .cv-aad__card { padding: 16px 18px; border-radius: 0.875rem; }
  .cv-aad__card-title { font-size: 12.5px; }

  .cv-aad__seller-actions { grid-template-columns: 1fr; }

  .cv-aad__report { flex-wrap: wrap; }
  .cv-aad__report-view { width: 100%; justify-content: center; margin-top: 4px; }
}

@media (max-width: 480px) {
  .cv-aad__title { font-size: 16px; }
  .cv-aad__price-value { font-size: 22px; }
}
</style>