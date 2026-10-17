<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useFavouritesStore } from '@/stores/favourites'
import { useToastStore } from '@/stores/toast'
import { formatPrice } from '@/utils/formatPrice'
import AnnouncementGallery from '@/components/announcements/AnnouncementGallery.vue'
import AnnouncementInfo from '@/components/announcements/AnnouncementInfo.vue'
import AnnouncementPrice from '@/components/announcements/AnnouncementPrice.vue'
import AnnouncementSeller from '@/components/announcements/AnnouncementSeller.vue'
import AnnouncementSpecs from '@/components/announcements/AnnouncementSpecs.vue'
import AnnouncementDescription from '@/components/announcements/AnnouncementDescription.vue'
import AnnouncementLocation from '@/components/announcements/AnnouncementLocation.vue'
import AnnouncementShare from '@/components/announcements/AnnouncementShare.vue'
import AnnouncementStatus from '@/components/announcements/AnnouncementStatus.vue'
import FavouriteButton from '@/components/favourites/FavouriteButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const route = useRoute()
const router = useRouter()
const announcementsStore = useAnnouncementsStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const favouritesStore = useFavouritesStore()
const toastStore = useToastStore()

const loading = ref(true)
const error = ref(null)
const contactLoading = ref(false)
const phoneRevealed = ref(false)
const showFullHistory = ref(false)
const showCreditDetails = ref(false)

/* ============================================================
 * Сравнение — локальное, через localStorage (без сервера)
 * ============================================================ */
const COMPARE_KEY = 'cv_compare_ids'
const MAX_COMPARE = 4

const compareIds = ref([])

function loadCompare() {
  try {
    const raw = localStorage.getItem(COMPARE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      compareIds.value = parsed.filter((id) => typeof id === 'number' || typeof id === 'string')
    }
  } catch {
    compareIds.value = []
  }
}

function persistCompare() {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds.value))
  } catch {
    /* localStorage может быть недоступен — не критично */
  }
}

function toggleCompare() {
  if (!announcement.value) return
  const id = announcement.value.id
  const list = compareIds.value.slice()
  const idx = list.indexOf(id)

  if (idx >= 0) {
    list.splice(idx, 1)
    toastStore.success('Удалено из сравнения')
  } else {
    if (list.length >= MAX_COMPARE) {
      toastStore.info(`Можно сравнивать не более ${MAX_COMPARE} автомобилей`)
      return
    }
    list.push(id)
    toastStore.success('Добавлено к сравнению')
  }

  compareIds.value = list
  persistCompare()
}

/* ============================================================
 * Данные объявления
 * ============================================================ */
const announcement = computed(() => announcementsStore.currentAnnouncement)

const isFavourite = computed(() =>
  announcement.value ? favouritesStore.isFavourite(announcement.value.id) : false
)

const isInCompare = computed(() =>
  announcement.value ? compareIds.value.includes(announcement.value.id) : false
)

const publishedTime = computed(() => {
  if (!announcement.value?.createdAt) return ''
  const diff = Date.now() - new Date(announcement.value.createdAt).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)
  if (hours < 1) return 'только что'
  if (hours < 24) return `${hours} ч. назад`
  if (days < 7) return `${days} дн. назад`
  return new Date(announcement.value.createdAt).toLocaleDateString('ru-RU')
})

const marketDiff = computed(() => {
  const a = announcement.value
  if (!a?.marketAverage || !a?.price) return null
  const diff = a.price - a.marketAverage
  const percent = Math.round((diff / a.marketAverage) * 100)
  if (Math.abs(percent) < 3) return { state: 'fair', percent: 0 }
  return { state: diff < 0 ? 'good' : 'high', percent: Math.abs(percent) }
})

const monthlyEstimate = computed(() => {
  const price = announcement.value?.price
  if (!price) return null
  const rate = 0.16 / 12
  const months = 60
  const initial = price * 0.2
  const body = price - initial
  const monthly = (body * (rate * Math.pow(1 + rate, months))) / (Math.pow(1 + rate, months) - 1)
  return {
    monthly: Math.round(monthly),
    initial: Math.round(initial)
  }
})

const similarAnnouncements = computed(() =>
  announcementsStore.announcements
    .filter(
      (a) =>
        a.id !== announcement.value?.id &&
        a.status === 'active' &&
        Math.abs((a.price || 0) - (announcement.value?.price || 0)) <=
          (announcement.value?.price || 0) * 0.15
    )
    .slice(0, 3)
)

const kpiChips = computed(() => {
  const a = announcement.value
  if (!a) return []
  const chips = []
  if (a.views > 200) chips.push({ icon: 'fire', text: 'Популярное', color: 'warning' })
  if (a.priceDrop) chips.push({ icon: 'arrow-down', text: 'Цена снижена', color: 'success' })
  if (publishedTime.value.includes('только что') || publishedTime.value.includes('ч.')) {
    chips.push({ icon: 'clock', text: 'Недавно опубликовано', color: 'accent' })
  }
  return chips
})

/* ============================================================
 * VIN-проверки — нейтральный статус при отсутствии данных
 * ============================================================ */
function pluralizeOwners(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'владелец'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'владельца'
  return 'владельцев'
}

const vinChecks = computed(() => {
  const a = announcement.value
  if (!a) return []

  // Залог
  const pledgedState =
    a.isPledged === true ? 'warn' : a.isPledged === false ? 'ok' : 'unknown'
  const pledgedLabel =
    a.isPledged === true
      ? 'В залоге'
      : a.isPledged === false
        ? 'Не в залоге'
        : 'Залог: нет данных'

  // ДТП
  const accidentsState =
    typeof a.accidents === 'number' && a.accidents > 0
      ? 'warn'
      : typeof a.accidents === 'number' && a.accidents === 0
        ? 'ok'
        : 'unknown'
  const accidentsLabel =
    typeof a.accidents === 'number' && a.accidents > 0
      ? `${a.accidents} ДТП`
      : typeof a.accidents === 'number' && a.accidents === 0
        ? 'Без ДТП'
        : 'ДТП: нет данных'

  // Пробег
  const mileageState =
    typeof a.mileage === 'number' && a.mileage > 0 ? 'ok' : 'unknown'
  const mileageLabel =
    typeof a.mileage === 'number' && a.mileage > 0
      ? 'Пробег указан'
      : 'Пробег: нет данных'

  // Владельцы
  const ownersState =
    typeof a.owners === 'number' && a.owners > 0 ? 'ok' : 'unknown'
  const ownersLabel =
    typeof a.owners === 'number' && a.owners > 0
      ? `${a.owners} ${pluralizeOwners(a.owners)}`
      : 'Владельцы: нет данных'

  return [
    { key: 'pledge', label: pledgedLabel, state: pledgedState },
    { key: 'accidents', label: accidentsLabel, state: accidentsState },
    { key: 'mileage', label: mileageLabel, state: mileageState },
    { key: 'owners', label: ownersLabel, state: ownersState }
  ]
})

/* ============================================================
 * Действия
 * ============================================================ */
async function loadAnnouncement() {
  loading.value = true
  error.value = null
  try {
    await announcementsStore.fetchAnnouncement(route.params.id)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function contactSeller() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы написать продавцу')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  contactLoading.value = true
  try {
    const chat = await chatStore.createOrOpenChat(
      announcement.value.id,
      announcement.value.sellerId
    )
    router.push({ name: 'chat-detail', params: { id: chat.id } })
  } catch {
    toastStore.error('Не удалось открыть чат')
  } finally {
    contactLoading.value = false
  }
}

async function revealPhone() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы увидеть номер')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  phoneRevealed.value = true
}

async function copyPhone() {
  if (!phoneRevealed.value) {
    revealPhone()
    return
  }
  try {
    await navigator.clipboard.writeText(announcement.value.sellerPhone)
    toastStore.success('Телефон скопирован')
  } catch {
    toastStore.error('Не удалось скопировать')
  }
}

async function toggleFavourite() {
  if (!authStore.isAuthenticated) {
    toastStore.info('Войдите, чтобы добавить в избранное')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  try {
    if (isFavourite.value) {
      await favouritesStore.removeFromFavourites(announcement.value.id)
      toastStore.success('Удалено из избранного')
    } else {
      await favouritesStore.addToFavourites(announcement.value.id)
      toastStore.success('Добавлено в избранное')
    }
  } catch {
    toastStore.error('Ошибка')
  }
}

/* ============================================================
 * Lifecycle
 * ============================================================ */
onMounted(() => {
  loadCompare()
  loadAnnouncement()
})

onUnmounted(() => {
  // cleanup если нужно
})
</script>

<template>
  <div class="cv-adp">
    <div class="cv-adp__bg" aria-hidden="true">
      <div class="cv-adp__bg-orb cv-adp__bg-orb--1"></div>
      <div class="cv-adp__bg-orb cv-adp__bg-orb--2"></div>
    </div>

    <div class="cv-adp__container">
      <Breadcrumbs />

      <div v-if="loading" class="cv-adp__loading">
        <BaseLoader size="lg" text="Загрузка объявления..." />
      </div>

      <ErrorMessage
        v-else-if="error"
        :message="error"
        retry
        @retry="loadAnnouncement"
      />

      <template v-else-if="announcement">
        <!-- ============================================
             Hero
             ============================================ -->
        <header class="cv-adp__hero">
          <div class="cv-adp__hero-glow" aria-hidden="true"></div>

          <div class="cv-adp__hero-main">
            <div class="cv-adp__hero-badges">
              <AnnouncementStatus :status="announcement.status" />
              <span
                v-for="chip in kpiChips"
                :key="chip.text"
                class="cv-adp__kpi"
                :data-color="chip.color"
              >
                <span class="cv-adp__kpi-icon" aria-hidden="true">
                  <svg v-if="chip.icon === 'fire'" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2c1 3 3 4 5 6a7 7 0 1 1-14 0c0-2 1-4 3-5 0 2 1 3 2 3 1 0 1-1 1-2 0-1 0-2 1-3 0 1 1 1 2 1z" />
                  </svg>
                  <svg v-else-if="chip.icon === 'arrow-down'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                {{ chip.text }}
              </span>
            </div>

            <AnnouncementInfo :announcement="announcement" />

            <div class="cv-adp__hero-meta">
              <span class="cv-adp__hero-meta-item">
                <span class="cv-adp__hero-meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
                {{ announcement.views || 0 }} просмотров
              </span>

              <span class="cv-adp__hero-meta-dot" aria-hidden="true"></span>

              <span class="cv-adp__hero-meta-item">
                <span class="cv-adp__hero-meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                {{ publishedTime }}
              </span>

              <template v-if="announcement.city">
                <span class="cv-adp__hero-meta-dot" aria-hidden="true"></span>
                <span class="cv-adp__hero-meta-item">
                  <span class="cv-adp__hero-meta-icon" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                      <circle cx="12" cy="11" r="2.5" />
                    </svg>
                  </span>
                  {{ announcement.city }}
                </span>
              </template>
            </div>
          </div>

          <div class="cv-adp__hero-actions">
            <FavouriteButton
              :announcement-id="announcement.id"
              :is-favourite="isFavourite"
            />

            <AnnouncementShare
              :announcement-id="announcement.id"
              :title="`${announcement.brand} ${announcement.model}`"
            />

            <button
              type="button"
              class="cv-adp__hero-action"
              :class="{ 'cv-adp__hero-action--active': isInCompare }"
              :aria-pressed="isInCompare"
              :aria-label="isInCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'"
              @click="toggleCompare"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="isInCompare ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18M3 12h12M3 18h6" />
                <path d="M18 9l3 3-3 3" :fill="'none'" />
              </svg>
            </button>
          </div>
        </header>

        <div class="cv-adp__content">
          <div class="cv-adp__main">
            <AnnouncementGallery :photos="announcement.photos" />

            <AnnouncementSpecs :announcement="announcement" />

            <section class="cv-adp__section">
              <header class="cv-adp__section-header">
                <span class="cv-adp__section-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <div class="cv-adp__section-titles">
                  <h2 class="cv-adp__section-title">Проверка автомобиля</h2>
                  <p class="cv-adp__section-subtitle">
                    Автоматическая проверка по базам ГИБДД, ФНП и банков
                  </p>
                </div>
              </header>

              <div class="cv-adp__vin" role="list">
                <div
                  v-for="check in vinChecks"
                  :key="check.key"
                  class="cv-adp__vin-item"
                  :data-state="check.state"
                  role="listitem"
                >
                  <span class="cv-adp__vin-icon" aria-hidden="true">
                    <svg v-if="check.state === 'ok'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 8.5l5 5L20 2.5" />
                    </svg>
                    <svg v-else-if="check.state === 'warn'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v5M12 17h.01" />
                    </svg>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" />
                    </svg>
                  </span>
                  {{ check.label }}
                </div>

                <button
                  type="button"
                  class="cv-adp__vin-more"
                  @click="showFullHistory = !showFullHistory"
                >
                  {{ showFullHistory ? 'Скрыть детали' : 'Полная история' }}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :style="{ transform: showFullHistory ? 'rotate(180deg)' : 'rotate(0deg)' }"
                  >
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </button>
              </div>
            </section>

            <AnnouncementDescription :description="announcement.description" />

            <AnnouncementLocation
              :city="announcement.city"
              :region="announcement.region"
              :address="announcement.address"
              :lat="announcement.lat"
              :lng="announcement.lng"
            />
          </div>

          <aside class="cv-adp__sidebar">
            <div
              class="cv-adp__price-card"
              role="region"
              aria-label="Цена и связь с продавцом"
            >
              <div class="cv-adp__price-glow" aria-hidden="true"></div>

              <AnnouncementPrice
                :price="announcement.price"
                :old-price="announcement.oldPrice"
                :negotiable="announcement.negotiable"
                :market-average="announcement.marketAverage"
                show-market-compare
                size="lg"
              />

              <div v-if="monthlyEstimate" class="cv-adp__credit">
                <span class="cv-adp__credit-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <circle cx="12" cy="12" r="2.5" />
                    <path d="M6 10v4M18 10v4" />
                  </svg>
                </span>
                <div class="cv-adp__credit-content">
                  <span class="cv-adp__credit-label">Кредит от</span>
                  <span class="cv-adp__credit-value">{{ formatPrice(monthlyEstimate.monthly) }}/мес</span>
                </div>
                <button
                  type="button"
                  class="cv-adp__credit-info"
                  :aria-expanded="showCreditDetails"
                  aria-controls="cv-adp-credit-details"
                  :aria-label="showCreditDetails ? 'Скрыть условия кредита' : 'Показать условия кредита'"
                  @click="showCreditDetails = !showCreditDetails"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </button>
              </div>

              <Transition name="cv-adp-credit">
                <div
                  v-if="showCreditDetails && monthlyEstimate"
                  id="cv-adp-credit-details"
                  class="cv-adp__credit-details"
                >
                  <ul class="cv-adp__credit-list">
                    <li>Первоначальный взнос — 20% ({{ formatPrice(monthlyEstimate.initial) }})</li>
                    <li>Ставка — 16% годовых</li>
                    <li>Срок — 5 лет</li>
                    <li>Ежемесячный платёж — {{ formatPrice(monthlyEstimate.monthly) }}</li>
                  </ul>
                  <p class="cv-adp__credit-note">
                    Расчёт предварительный и не является публичной офертой.
                    Итоговые условия уточняйте у банка.
                  </p>
                </div>
              </Transition>

              <div class="cv-adp__cta">
                <BaseButton
                  size="lg"
                  block
                  :loading="contactLoading"
                  @click="contactSeller"
                >
                  <svg v-if="!contactLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z" />
                  </svg>
                  Написать продавцу
                </BaseButton>

                <button
                  type="button"
                  class="cv-adp__phone"
                  :class="{ 'cv-adp__phone--revealed': phoneRevealed }"
                  :aria-label="phoneRevealed ? `Скопировать телефон ${announcement.sellerPhone}` : 'Показать телефон'"
                  @click="copyPhone"
                >
                  <span class="cv-adp__phone-icon" aria-hidden="true">
                    <svg v-if="!phoneRevealed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z" />
                    </svg>
                  </span>
                  {{ phoneRevealed ? announcement.sellerPhone : 'Показать телефон' }}
                </button>
              </div>

              <p class="cv-adp__safe">
                <span class="cv-adp__safe-icon" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z" />
                  </svg>
                </span>
                Безопасная сделка · Проверенный продавец
              </p>
            </div>

            <AnnouncementSeller :announcement="announcement" />
          </aside>
        </div>

        <section v-if="similarAnnouncements.length" class="cv-adp__similar">
          <header class="cv-adp__similar-header">
            <div class="cv-adp__similar-heading">
              <span class="cv-adp__similar-eyebrow">
                <span class="cv-adp__similar-dot" aria-hidden="true"></span>
                Похожие предложения
              </span>
              <h2 class="cv-adp__similar-title">Похожие автомобили</h2>
            </div>

            <BaseButton
              variant="ghost"
              size="sm"
              @click="router.push({ path: '/announcements', query: { brand: announcement.brand, priceTo: announcement.price * 1.15 } })"
            >
              Смотреть все
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </BaseButton>
          </header>

          <div class="cv-adp__similar-grid">
            <AnnouncementGallery
              v-for="item in similarAnnouncements"
              :key="item.id"
              :photos="[item.photos?.[0]]"
              class="cv-adp__similar-card"
            />
          </div>
        </section>

        <!-- ============================================
             Mobile CTA
             ============================================ -->
        <div class="cv-adp__mobile-cta">
          <div class="cv-adp__mobile-price">
            <span class="cv-adp__mobile-price-value">{{ formatPrice(announcement.price) }}</span>
            <span
              v-if="marketDiff && marketDiff.state === 'good'"
              class="cv-adp__mobile-price-badge"
            >
              ▼ {{ marketDiff.percent }}%
            </span>
          </div>

          <div class="cv-adp__mobile-actions">
            <button
              type="button"
              class="cv-adp__mobile-btn cv-adp__mobile-btn--icon"
              :class="{ 'cv-adp__mobile-btn--active': isFavourite }"
              :aria-pressed="isFavourite"
              aria-label="Избранное"
              @click="toggleFavourite"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavourite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z" />
              </svg>
            </button>

            <button
              type="button"
              class="cv-adp__mobile-btn cv-adp__mobile-btn--icon"
              :class="{ 'cv-adp__mobile-btn--active': isInCompare }"
              :aria-pressed="isInCompare"
              :aria-label="isInCompare ? 'Убрать из сравнения' : 'Добавить к сравнению'"
              @click="toggleCompare"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="isInCompare ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18M3 12h12M3 18h6" />
                <path d="M18 9l3 3-3 3" :fill="'none'" />
              </svg>
            </button>

            <BaseButton
              size="md"
              :loading="contactLoading"
              @click="contactSeller"
            >
              <svg v-if="!contactLoading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z" />
              </svg>
              Написать
            </BaseButton>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================
   Объявление — страница
   - Единая система токенов (--adp-container-px / max / sidebar-w)
   - Иерархия: заголовок → цена+CTA → характеристики → проверка
   - Нейтральный статус для неизвестных VIN-полей
   - Сравнение через localStorage, active-state
   ============================================================ */

.cv-adp {
  --adp-container-max: 1400px;
  --adp-container-px: 48px;
  --adp-sidebar-w: 380px;
  --adp-focus: #e8d5a0;

  position: relative;
  padding: 20px 0 40px;
  isolation: isolate;
}

.cv-adp__bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cv-adp__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
}
.cv-adp__bg-orb--1 {
  top: -10%;
  right: -5%;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvAdpOrb 22s ease-in-out infinite;
}
.cv-adp__bg-orb--2 {
  bottom: -20%;
  left: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.18), transparent 70%);
  animation: cvAdpOrb 26s ease-in-out infinite reverse;
}
@keyframes cvAdpOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.08); }
}

.cv-adp__container {
  position: relative;
  z-index: 1;
  max-width: var(--adp-container-max);
  margin: 0 auto;
  padding: 0 var(--adp-container-px);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-adp__loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

/* ---------- Hero ---------- */
.cv-adp__hero {
  position: relative;
  padding: 26px 28px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.65) 100%),
    linear-gradient(180deg, #14141a 0%, #0e0e12 100%);
  border: 1px solid rgba(201, 169, 97, 0.22);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(201, 169, 97, 0.04) inset;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.cv-adp__hero::before {
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
.cv-adp__hero-glow {
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
  opacity: 0.6;
}
.cv-adp__hero-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
}
.cv-adp__hero-badges {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ---------- KPI ---------- */
.cv-adp__kpi {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  border: 1px solid;
}
.cv-adp__kpi[data-color="warning"] {
  color: #f0c080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.4);
}
.cv-adp__kpi[data-color="success"] {
  color: #b8cea8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}
.cv-adp__kpi[data-color="accent"] {
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.4);
}
.cv-adp__kpi-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}

/* ---------- Hero meta ---------- */
.cv-adp__hero-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(200, 190, 175, 0.6);
}
.cv-adp__hero-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cv-adp__hero-meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}
.cv-adp__hero-meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
}

/* ---------- Hero actions ---------- */
.cv-adp__hero-actions {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 8px;
  flex-shrink: 0;
}
.cv-adp__hero-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: rgba(220, 210, 195, 0.7);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 11px;
  cursor: pointer;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
}
.cv-adp__hero-action:hover {
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-2px);
}
.cv-adp__hero-action:active {
  transform: translateY(0) scale(0.94);
}
.cv-adp__hero-action:focus-visible {
  outline: 2px solid var(--adp-focus);
  outline-offset: 2px;
}
.cv-adp__hero-action--active {
  color: #e8a88a;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.45);
}

/* ---------- Content layout ---------- */
.cv-adp__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--adp-sidebar-w);
  gap: 24px;
}
.cv-adp__main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.cv-adp__sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 90px;
  align-self: flex-start;
}

/* ---------- Section ---------- */
.cv-adp__section {
  position: relative;
  padding: 22px 24px;
  border-radius: 1.25rem;
  background: linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45));
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}
.cv-adp__section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
  pointer-events: none;
}
.cv-adp__section-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.1);
  margin-bottom: 16px;
}
.cv-adp__section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 12px;
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
}
.cv-adp__section-titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cv-adp__section-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}
.cv-adp__section-subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

/* ---------- VIN ---------- */
.cv-adp__vin {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.cv-adp__vin-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 600;
  border-radius: 10px;
  border: 1px solid;
}
.cv-adp__vin-item[data-state="ok"] {
  color: #b8cea8;
  background: rgba(122, 154, 106, 0.1);
  border-color: rgba(122, 154, 106, 0.35);
}
.cv-adp__vin-item[data-state="warn"] {
  color: #f0c080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.35);
}
.cv-adp__vin-item[data-state="unknown"] {
  color: rgba(200, 190, 175, 0.65);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
}
.cv-adp__vin-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}
.cv-adp__vin-more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 650;
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 10px;
  cursor: pointer;
  margin-left: auto;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}
.cv-adp__vin-more:hover {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}
.cv-adp__vin-more:focus-visible {
  outline: 2px solid var(--adp-focus);
  outline-offset: 2px;
}
.cv-adp__vin-more svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ---------- Price card ---------- */
.cv-adp__price-card {
  position: relative;
  padding: 22px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.65)),
    linear-gradient(180deg, #1a1a22 0%, #14141a 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.cv-adp__price-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.4) 50%, transparent);
  pointer-events: none;
  z-index: 3;
}
.cv-adp__price-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.22), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
}

/* ---------- Credit ---------- */
.cv-adp__credit {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.16);
}
.cv-adp__credit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.28);
}
.cv-adp__credit-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cv-adp__credit-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}
.cv-adp__credit-value {
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: #f5e6bc;
  font-variant-numeric: tabular-nums;
}
.cv-adp__credit-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: rgba(200, 190, 175, 0.5);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.cv-adp__credit-info:hover {
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.3);
}
.cv-adp__credit-info:focus-visible {
  outline: 2px solid var(--adp-focus);
  outline-offset: 2px;
}

.cv-adp__credit-details {
  position: relative;
  z-index: 1;
  margin-top: -6px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(201, 169, 97, 0.14);
}
.cv-adp__credit-list {
  margin: 0;
  padding-left: 16px;
  font-size: 12.5px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.8);
}
.cv-adp__credit-list li::marker {
  color: rgba(201, 169, 97, 0.6);
}
.cv-adp__credit-note {
  margin: 8px 0 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.5);
}

/* Transition для раскрытия условий кредита */
.cv-adp-credit-enter-active,
.cv-adp-credit-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.cv-adp-credit-enter-from,
.cv-adp-credit-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ---------- CTA ---------- */
.cv-adp__cta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cv-adp__phone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition:
    color 0.25s ease,
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
}
.cv-adp__phone:hover {
  color: #e8d5a0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
}
.cv-adp__phone:active {
  transform: translateY(0) scale(0.98);
}
.cv-adp__phone:focus-visible {
  outline: 2px solid var(--adp-focus);
  outline-offset: 2px;
}
.cv-adp__phone--revealed {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #f5e6bc;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.12), rgba(201, 169, 97, 0.03));
  border-color: rgba(201, 169, 97, 0.4);
}
.cv-adp__phone-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
}
.cv-adp__safe {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  padding-top: 14px;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
  font-size: 11px;
  font-weight: 600;
  color: rgba(200, 190, 175, 0.5);
}
.cv-adp__safe-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #b8cea8;
  flex-shrink: 0;
}

/* ---------- Similar ---------- */
.cv-adp__similar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}
.cv-adp__similar-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.cv-adp__similar-heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cv-adp__similar-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}
.cv-adp__similar-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5e6bc, #c9a961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
}
.cv-adp__similar-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: rgba(245, 240, 230, 0.98);
}
.cv-adp__similar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* ---------- Mobile CTA (hidden by default) ---------- */
.cv-adp__mobile-cta {
  display: none;
}

/* ============================================================
   Адаптив
   ============================================================ */
@media (max-width: 1280px) {
  .cv-adp { --adp-container-px: 32px; --adp-sidebar-w: 340px; }
}

@media (max-width: 1024px) {
  .cv-adp { --adp-container-px: 24px; }
  .cv-adp__content { grid-template-columns: 1fr; }
  .cv-adp__sidebar {
    position: static;
    order: -1;
  }
  .cv-adp__similar-grid { grid-template-columns: repeat(2, 1fr); }

  .cv-adp__mobile-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: fixed;
    /* 88px — высота нижней навигации из cv-layout */
    bottom: calc(88px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    z-index: 80;
    padding: 12px 16px;
    background:
      linear-gradient(180deg, rgba(28, 24, 18, 0.95), rgba(15, 13, 10, 0.98)),
      linear-gradient(180deg, #14141a 0%, #0e0e12 100%);
    border-top: 1px solid rgba(201, 169, 97, 0.24);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  }
  .cv-adp__mobile-price {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    min-width: 0;
  }
  .cv-adp__mobile-price-value {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: #f5e6bc;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cv-adp__mobile-price-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    font-size: 10px;
    font-weight: 800;
    color: #b8cea8;
    background: rgba(122, 154, 106, 0.15);
    border: 1px solid rgba(122, 154, 106, 0.35);
    border-radius: 6px;
    white-space: nowrap;
  }
  .cv-adp__mobile-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .cv-adp__mobile-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    border-radius: 11px;
    cursor: pointer;
    font-family: inherit;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }
  .cv-adp__mobile-btn--icon {
    width: 42px;
    color: rgba(220, 210, 195, 0.7);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(201, 169, 97, 0.2);
  }
  .cv-adp__mobile-btn--icon:hover {
    color: #e8d5a0;
    background: rgba(201, 169, 97, 0.1);
    border-color: rgba(201, 169, 97, 0.4);
  }
  .cv-adp__mobile-btn--active {
    color: #e8a88a;
    background: rgba(184, 119, 85, 0.15);
    border-color: rgba(184, 119, 85, 0.4);
  }
  .cv-adp__mobile-btn:active {
    transform: scale(0.94);
  }
  .cv-adp__mobile-btn:focus-visible {
    outline: 2px solid var(--adp-focus);
    outline-offset: 2px;
  }
}

@media (max-width: 768px) {
  /* Увеличен padding, чтобы mobile-cta не перекрывал контент */
  .cv-adp { padding: 12px 0 180px; --adp-container-px: 20px; }
  .cv-adp__container { gap: 16px; }

  .cv-adp__hero {
    padding: 18px;
    border-radius: 1rem;
    flex-direction: column;
  }
  .cv-adp__hero-actions { width: 100%; }
  .cv-adp__hero-action { flex: 1; max-width: 60px; }

  .cv-adp__section { padding: 18px; border-radius: 1rem; }
  .cv-adp__section-icon { width: 38px; height: 38px; border-radius: 10px; }
  .cv-adp__section-title { font-size: 14.5px; }
  .cv-adp__section-subtitle { font-size: 12px; }

  .cv-adp__vin { gap: 8px; }
  .cv-adp__vin-item { font-size: 12px; padding: 6px 10px; }
  .cv-adp__vin-more { width: 100%; justify-content: center; margin-left: 0; }

  .cv-adp__sidebar { gap: 16px; }
  .cv-adp__price-card { padding: 18px; border-radius: 1rem; gap: 14px; }

  .cv-adp__similar-grid { grid-template-columns: 1fr; gap: 12px; }
  .cv-adp__similar-title { font-size: 18px; letter-spacing: -0.3px; }
}

@media (max-width: 480px) {
  .cv-adp { --adp-container-px: 16px; }
  .cv-adp__hero-meta { font-size: 11.5px; gap: 8px; }
  .cv-adp__kpi { font-size: 10px; padding: 3px 9px; }
  .cv-adp__credit-value { font-size: 13.5px; }
}

/* ============================================================
   prefers-reduced-motion
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .cv-adp__bg-orb--1,
  .cv-adp__bg-orb--2,
  .cv-adp__similar-dot {
    animation: none;
  }

  .cv-adp__hero-action,
  .cv-adp__phone,
  .cv-adp__credit-info,
  .cv-adp__vin-more,
  .cv-adp__mobile-btn,
  .cv-adp-credit-enter-active,
  .cv-adp-credit-leave-active {
    transition-duration: 0.01ms !important;
  }

  .cv-adp__hero-action:hover,
  .cv-adp__phone:hover,
  .cv-adp__vin-more:hover,
  .cv-adp__mobile-btn:active {
    transform: none;
  }
}
</style>