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

const announcement = computed(() => announcementsStore.currentAnnouncement)

const isFavourite = computed(() =>
  announcement.value ? favouritesStore.isFavourite(announcement.value.id) : false
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
  const monthly = body * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
  return {
    monthly: Math.round(monthly),
    initial: Math.round(initial)
  }
})

const similarAnnouncements = computed(() =>
  announcementsStore.announcements
    .filter(a =>
      a.id !== announcement.value?.id &&
      a.status === 'active' &&
      Math.abs((a.price || 0) - (announcement.value?.price || 0)) <= (announcement.value?.price || 0) * 0.15
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

const vinChecks = computed(() => [
  { key: 'clean', label: 'Не в залоге', state: announcement.value?.isPledged ? 'warn' : 'ok' },
  { key: 'accidents', label: announcement.value?.accidents ? `${announcement.value.accidents} ДТП` : 'Без ДТП', state: announcement.value?.accidents ? 'warn' : 'ok' },
  { key: 'mileage', label: 'Пробег соответствует', state: 'ok' },
  { key: 'owners', label: `${announcement.value?.owners || 1} владелец`, state: 'ok' }
])

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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    toastStore.error('Ошибка')
  }
}

onMounted(() => {
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
                    <path d="M12 2c1 3 3 4 5 6a7 7 0 1 1-14 0c0-2 1-4 3-5 0 2 1 3 2 3 1 0 1-1 1-2 0-1 0-2 1-3 0 1 1 1 2 1z"/>
                  </svg>
                  <svg v-else-if="chip.icon === 'arrow-down'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                  <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
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
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </span>
                {{ announcement.views || 0 }} просмотров
              </span>

              <span class="cv-adp__hero-meta-dot" aria-hidden="true"></span>

              <span class="cv-adp__hero-meta-item">
                <span class="cv-adp__hero-meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 2"/>
                  </svg>
                </span>
                {{ publishedTime }}
              </span>

              <span v-if="announcement.city" class="cv-adp__hero-meta-dot" aria-hidden="true"></span>

              <span v-if="announcement.city" class="cv-adp__hero-meta-item">
                <span class="cv-adp__hero-meta-icon" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
                    <circle cx="12" cy="11" r="2.5"/>
                  </svg>
                </span>
                {{ announcement.city }}
              </span>
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
              aria-label="Добавить к сравнению"
              title="Добавить к сравнению"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M3 12h12M3 18h6"/>
                <path d="M18 9l3 3-3 3"/>
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
                    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </span>
                <div class="cv-adp__section-titles">
                  <h2 class="cv-adp__section-title">Проверка автомобиля</h2>
                  <p class="cv-adp__section-subtitle">
                    Автоматическая проверка по базам ГИБДД, ФНП и банков
                  </p>
                </div>
              </header>

              <div class="cv-adp__vin">
                <div
                  v-for="check in vinChecks"
                  :key="check.key"
                  class="cv-adp__vin-item"
                  :data-state="check.state"
                >
                  <span class="cv-adp__vin-icon" aria-hidden="true">
                    <svg v-if="check.state === 'ok'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 8.5l5 5L20 2.5"/>
                    </svg>
                    <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 8v5M12 17h.01"/>
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
                    <path d="M2 4l4 4 4-4"/>
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
            <div class="cv-adp__price-card">
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
                    <rect x="3" y="6" width="18" height="12" rx="2"/>
                    <circle cx="12" cy="12" r="2.5"/>
                    <path d="M6 10v4M18 10v4"/>
                  </svg>
                </span>
                <div class="cv-adp__credit-content">
                  <span class="cv-adp__credit-label">Кредит от</span>
                  <span class="cv-adp__credit-value">{{ formatPrice(monthlyEstimate.monthly) }}/мес</span>
                </div>
                <button
                  type="button"
                  class="cv-adp__credit-info"
                  title="Первоначальный взнос 20%, ставка 16%, срок 5 лет"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </button>
              </div>

              <div class="cv-adp__cta">
                <BaseButton
                  size="lg"
                  block
                  :loading="contactLoading"
                  @click="contactSeller"
                >
                  <svg v-if="!contactLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
                  </svg>
                  Написать продавцу
                </BaseButton>

                <button
                  type="button"
                  class="cv-adp__phone"
                  :class="{ 'cv-adp__phone--revealed': phoneRevealed }"
                  @click="copyPhone"
                >
                  <span class="cv-adp__phone-icon" aria-hidden="true">
                    <svg v-if="!phoneRevealed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2.1z"/>
                    </svg>
                  </span>
                  {{ phoneRevealed ? announcement.sellerPhone : 'Показать телефон' }}
                </button>
              </div>

              <p class="cv-adp__safe">
                <span class="cv-adp__safe-icon" aria-hidden="true">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
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
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
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

        <div class="cv-adp__mobile-cta">
          <div class="cv-adp__mobile-price">
            <span class="cv-adp__mobile-price-value">{{ formatPrice(announcement.price) }}</span>
            <span v-if="marketDiff && marketDiff.state === 'good'" class="cv-adp__mobile-price-badge">
              ▼ {{ marketDiff.percent }}%
            </span>
          </div>

          <div class="cv-adp__mobile-actions">
            <button
              type="button"
              class="cv-adp__mobile-btn cv-adp__mobile-btn--icon"
              :class="{ 'cv-adp__mobile-btn--active': isFavourite }"
              aria-label="Избранное"
              @click="toggleFavourite"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="isFavourite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.5l-1.5-1.36C5.4 14.36 3 12.28 3 9.5 3 7 5 5 7.5 5c1.54 0 3.04.83 3.5 2.36C11.46 5.83 12.96 5 14.5 5 17 5 19 7 19 9.5c0 2.78-2.4 4.86-7.5 9.64L12 20.5z"/>
              </svg>
            </button>

            <button
              type="button"
              class="cv-adp__mobile-btn cv-adp__mobile-btn--icon"
              aria-label="Сравнить"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M3 12h12M3 18h6"/>
                <path d="M18 9l3 3-3 3"/>
              </svg>
            </button>

            <BaseButton
              size="md"
              :loading="contactLoading"
              @click="contactSeller"
            >
              <svg v-if="!contactLoading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.5A8 8 0 0 1 11 4h2a8 8 0 0 1 8 8z"/>
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
.cv-adp {
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
  opacity: 0.35;
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-adp__loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.cv-adp__hero {
  position: relative;
  padding: 26px 28px;
  border-radius: 1.25rem;
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
  opacity: 0.7;
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
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.4);
}

.cv-adp__kpi[data-color="success"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.14);
  border-color: rgba(122, 154, 106, 0.4);
}

.cv-adp__kpi[data-color="accent"] {
  color: #E8D5A0;
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

.cv-adp__hero-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
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
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-adp__hero-action:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.cv-adp__hero-action:active {
  transform: translateY(0) scale(0.94);
}

.cv-adp__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
}

.cv-adp__main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.cv-adp__section {
  position: relative;
  padding: 22px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
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
  color: #E8D5A0;
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
  letter-spacing: -0.1px;
  line-height: 1.25;
  color: rgba(245, 240, 230, 0.95);
}

.cv-adp__section-subtitle {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.5;
  color: rgba(200, 190, 175, 0.6);
}

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
  letter-spacing: 0.05px;
  border-radius: 10px;
  border: 1px solid;
}

.cv-adp__vin-item[data-state="ok"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.1);
  border-color: rgba(122, 154, 106, 0.35);
}

.cv-adp__vin-item[data-state="warn"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.35);
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
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
  margin-left: auto;
}

.cv-adp__vin-more:hover {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-adp__vin-more svg {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-adp__sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 90px;
  align-self: flex-start;
}

.cv-adp__price-card {
  position: relative;
  padding: 22px 24px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(40, 32, 22, 0.5), rgba(20, 16, 10, 0.65)),
    linear-gradient(180deg, #1A1A22 0%, #14141A 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 0 80px rgba(201, 169, 97, 0.1);
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
  color: #E8D5A0;
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
  color: rgba(200, 190, 175, 0.5);
}

.cv-adp__credit-value {
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: #F5E6BC;
  font-variant-numeric: tabular-nums;
}

.cv-adp__credit-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: rgba(200, 190, 175, 0.4);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.cv-adp__credit-info:hover {
  color: #E8D5A0;
}

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
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-adp__phone:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-1px);
}

.cv-adp__phone:active {
  transform: translateY(0) scale(0.98);
}

.cv-adp__phone--revealed {
  font-family: var(--font-family-mono, 'SF Mono', Monaco, monospace);
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #F5E6BC;
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
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-adp__safe-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #B8CEA8;
  flex-shrink: 0;
}

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
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvAdpDot 2.2s ease-in-out infinite;
}

@keyframes cvAdpDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
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

.cv-adp__mobile-cta {
  display: none;
}

@media (max-width: 1280px) {
  .cv-adp__container { padding: 0 32px; }
  .cv-adp__content { grid-template-columns: minmax(0, 1fr) 340px; }
}

@media (max-width: 1024px) {
  .cv-adp__container { padding: 0 24px; }
  .cv-adp__content { grid-template-columns: 1fr; }
  .cv-adp__sidebar { position: static; order: -1; }
  .cv-adp__similar-grid { grid-template-columns: repeat(2, 1fr); }
  .cv-adp__title { font-size: 22px; }

  .cv-adp__mobile-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    position: fixed;
    bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    left: 0;
    right: 0;
    z-index: 80;
    padding: 12px 16px;
    background:
      linear-gradient(180deg, rgba(28, 24, 18, 0.95), rgba(15, 13, 10, 0.98)),
      linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
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
    color: #F5E6BC;
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
    letter-spacing: 0.2px;
    color: #B8CEA8;
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
    transition: all 0.22s ease;
    font-family: inherit;
  }

  .cv-adp__mobile-btn--icon {
    width: 42px;
    color: rgba(220, 210, 195, 0.7);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(201, 169, 97, 0.2);
  }

  .cv-adp__mobile-btn--icon:hover {
    color: #E8D5A0;
    background: rgba(201, 169, 97, 0.1);
    border-color: rgba(201, 169, 97, 0.4);
  }

  .cv-adp__mobile-btn--active {
    color: #E8A88A;
    background: rgba(184, 119, 85, 0.15);
    border-color: rgba(184, 119, 85, 0.4);
  }

  .cv-adp__mobile-btn:active {
    transform: scale(0.94);
  }
}

@media (max-width: 768px) {
  .cv-adp { padding: 12px 0 140px; }
  .cv-adp__container { padding: 0 20px; gap: 16px; }

  .cv-adp__hero { padding: 18px 18px; border-radius: 1rem; flex-direction: column; }
  .cv-adp__hero-actions { width: 100%; }
  .cv-adp__hero-action { flex: 1; max-width: 60px; }

  .cv-adp__section { padding: 18px 18px; border-radius: 1rem; }
  .cv-adp__section-icon { width: 38px; height: 38px; border-radius: 10px; }
  .cv-adp__section-title { font-size: 14.5px; }
  .cv-adp__section-subtitle { font-size: 12px; }

  .cv-adp__vin { gap: 8px; }
  .cv-adp__vin-item { font-size: 12px; padding: 6px 10px; }
  .cv-adp__vin-more { width: 100%; justify-content: center; margin-left: 0; }

  .cv-adp__sidebar { gap: 16px; }
  .cv-adp__price-card { padding: 18px 18px; border-radius: 1rem; gap: 14px; }

  .cv-adp__similar-grid { grid-template-columns: 1fr; gap: 12px; }
  .cv-adp__similar-title { font-size: 18px; letter-spacing: -0.3px; }
}

@media (max-width: 480px) {
  .cv-adp__hero-meta { font-size: 11.5px; gap: 8px; }
  .cv-adp__kpi { font-size: 10px; padding: 3px 9px; }
  .cv-adp__credit-value { font-size: 13.5px; }
}
</style>