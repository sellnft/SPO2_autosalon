<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const router = useRouter()
const announcementsStore = useAnnouncementsStore()

const searchQuery = ref('')
const selectedBrand = ref('')
const priceFrom = ref('')
const priceTo = ref('')
const selectedCity = ref('')

const popularAnnouncements = ref([])
const freshAnnouncements = ref([])
const loadingPopular = ref(true)
const loadingFresh = ref(true)

const heroStatsRef = ref(null)
const heroStatsVisible = ref(false)
const animatedStats = ref({ listings: 0, sellers: 0, deals: 0 })

const brands = [
  { value: 'BMW', label: 'BMW' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Toyota', label: 'Toyota' },
  { value: 'Audi', label: 'Audi' },
  { value: 'Volkswagen', label: 'Volkswagen' },
  { value: 'Kia', label: 'Kia' },
  { value: 'Hyundai', label: 'Hyundai' },
  { value: 'Lexus', label: 'Lexus' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'Volvo', label: 'Volvo' },
  { value: 'Mazda', label: 'Mazda' },
  { value: 'Skoda', label: 'Skoda' },
  { value: 'Nissan', label: 'Nissan' },
  { value: 'Land Rover', label: 'Land Rover' }
]

const cities = [
  { value: 'Москва', label: 'Москва' },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
  { value: 'Казань', label: 'Казань' },
  { value: 'Екатеринбург', label: 'Екатеринбург' },
  { value: 'Новосибирск', label: 'Новосибирск' },
  { value: 'Краснодар', label: 'Краснодар' },
  { value: 'Ростов-на-Дону', label: 'Ростов-на-Дону' },
  { value: 'Сочи', label: 'Сочи' }
]

const bodyTypes = [
  { value: 'Седан', label: 'Седан', icon: 'sedan' },
  { value: 'Кроссовер', label: 'Кроссовер', icon: 'suv' },
  { value: 'SUV', label: 'SUV', icon: 'suv-large' },
  { value: 'Хэтчбек', label: 'Хэтчбек', icon: 'hatch' },
  { value: 'Универсал', label: 'Универсал', icon: 'wagon' },
  { value: 'Купе', label: 'Купе', icon: 'coupe' }
]

const features = [
  {
    icon: 'shield',
    title: 'Проверенные продавцы',
    description: 'Каждый продавец проходит верификацию личности и документов автомобиля'
  },
  {
    icon: 'lock',
    title: 'Безопасная сделка',
    description: 'Защита платежей через escrow-счёт и юридическое сопровождение'
  },
  {
    icon: 'chart',
    title: 'Честная статистика',
    description: 'Реальные цены и пробеги на основе 50 000+ объявлений ежедневно'
  },
  {
    icon: 'bolt',
    title: 'Мгновенная связь',
    description: 'Чат с продавцом без посредников, push-уведомления о статусах'
  },
  {
    icon: 'history',
    title: 'Полная история',
    description: 'Проверка VIN, ДТП, залогов и ограничений в один клик'
  },
  {
    icon: 'star',
    title: 'Экспертная поддержка',
    description: 'Консультации специалистов на каждом этапе сделки'
  }
]

const steps = [
  {
    number: '01',
    title: 'Найдите автомобиль',
    description: 'Используйте умный поиск и фильтры, чтобы найти идеальный вариант'
  },
  {
    number: '02',
    title: 'Проверьте историю',
    description: 'Узнайте всё о ДТП, пробеге и юридической чистоте по VIN'
  },
  {
    number: '03',
    title: 'Свяжитесь с продавцом',
    description: 'Общайтесь в чате, задавайте вопросы и договаривайтесь о встрече'
  },
  {
    number: '04',
    title: 'Оформите сделку',
    description: 'Безопасная оплата и помощь юристов на всех этапах'
  }
]

const reviews = [
  {
    id: 1,
    name: 'Максим В.',
    city: 'Москва',
    car: 'BMW X5 2020',
    text: 'Продал свой X5 за 3 дня. Удобно, быстро, без лишних звонков. Покупатель нашёлся через 12 часов после публикации.',
    rating: 5,
    initial: 'М'
  },
  {
    id: 2,
    name: 'Анна К.',
    city: 'Санкт-Петербург',
    car: 'Toyota Camry 2019',
    text: 'Купила Camry. Проверила историю через CarVibe — никаких сюрпризов. Отдельное спасибо за проверку залогов.',
    rating: 5,
    initial: 'А'
  },
  {
    id: 3,
    name: 'Дмитрий С.',
    city: 'Казань',
    car: 'Audi Q7 2021',
    text: 'Приятно удивлён качеством сервиса. Помогли с оформлением документов и страхованием. Рекомендую!',
    rating: 5,
    initial: 'Д'
  }
]

const sellerBenefits = [
  { icon: 'bolt', text: 'Публикация за 2 минуты' },
  { icon: 'users', text: '50 000+ активных покупателей' },
  { icon: 'chart', text: 'Продвижение в топ по цене' }
]

const activeReviewsIndex = ref(0)

function handleSearch() {
  const query = {}
  if (searchQuery.value.trim()) query.search = searchQuery.value.trim()
  if (selectedBrand.value) query.brand = selectedBrand.value
  if (priceFrom.value) query.priceFrom = priceFrom.value
  if (priceTo.value) query.priceTo = priceTo.value
  if (selectedCity.value) query.city = selectedCity.value
  router.push({ path: '/announcements', query })
}

function handleQuickSearch(brand) {
  router.push({ path: '/announcements', query: { brand } })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goToSell() {
  if (!announcementsStore.isAuthenticated) {
    router.push('/register')
  } else {
    router.push('/announcements/create')
  }
}

async function loadPopular() {
  loadingPopular.value = true
  try {
    const response = await announcementsStore.fetchAnnouncements({
      perPage: 6,
      sortBy: 'views',
      sortOrder: 'desc'
    })
    popularAnnouncements.value = response.items || []
  } catch (err) {
    console.error('Failed to load popular:', err)
  } finally {
    loadingPopular.value = false
  }
}

async function loadFresh() {
  loadingFresh.value = true
  try {
    const response = await announcementsStore.fetchAnnouncements({
      perPage: 6,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    freshAnnouncements.value = response.items || []
  } catch (err) {
    console.error('Failed to load fresh:', err)
  } finally {
    loadingFresh.value = false
  }
}

function animateValue(obj, key, end, duration = 1400) {
  const start = obj[key]
  const startTime = performance.now()
  function tick(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    obj[key] = Math.round(start + (end - start) * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function startStatsAnimation() {
  animateValue(animatedStats.value, 'listings', 25000, 1800)
  setTimeout(() => animateValue(animatedStats.value, 'sellers', 1500, 1400), 200)
  setTimeout(() => animateValue(animatedStats.value, 'deals', 98, 1000), 400)
}

let statsObserver = null

onMounted(async () => {
  await Promise.all([loadPopular(), loadFresh()])

  await nextTick()

  if (heroStatsRef.value) {
    statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !heroStatsVisible.value) {
            heroStatsVisible.value = true
            startStatsAnimation()
            statsObserver?.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )
    statsObserver.observe(heroStatsRef.value)
  }
})

onUnmounted(() => {
  statsObserver?.disconnect()
})
</script>

<template>
  <div class="cv-home">
    <section class="cv-hero">
      <div class="cv-hero__bg" aria-hidden="true">
        <img
          src="@/assets/images/home.png"
          alt=""
          class="cv-hero__bg-image"
          loading="eager"
          fetchpriority="high"
        />
        <div class="cv-hero__bg-overlay"></div>
        <div class="cv-hero__bg-orb cv-hero__bg-orb--1"></div>
        <div class="cv-hero__bg-orb cv-hero__bg-orb--2"></div>
        <div class="cv-hero__bg-grid"></div>
      </div>

      <div class="cv-hero__container">
        <div class="cv-hero__content">
          <span class="cv-hero__eyebrow">
            <span class="cv-hero__eyebrow-dot" aria-hidden="true"></span>
            Премиальная платформа
          </span>

          <h1 class="cv-hero__title">
            Ваш следующий автомобиль
            <span class="cv-hero__title-accent">уже здесь</span>
          </h1>

          <p class="cv-hero__subtitle">
            Более 25 000 проверенных объявлений от честных продавцов.
            Безопасные сделки, полная история и умный поиск.
          </p>

          <form class="cv-hero__search" @submit.prevent="handleSearch">
            <div class="cv-hero__search-main">
              <span class="cv-hero__search-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
              </span>
              <input
                v-model="searchQuery"
                type="text"
                class="cv-hero__search-input"
                placeholder="Марка, модель или ключевое слово..."
              />
            </div>

            <div class="cv-hero__search-extra">
              <div class="cv-hero__search-field">
                <BaseSelect
                  :model-value="selectedBrand"
                  :options="brands"
                  placeholder="Марка"
                  searchable
                  clearable
                  @update:model-value="selectedBrand = $event"
                />
              </div>

              <div class="cv-hero__search-field cv-hero__search-field--price">
                <BaseInput
                  :model-value="priceFrom"
                  type="number"
                  placeholder="Цена от"
                  @update:model-value="priceFrom = $event"
                />
                <span class="cv-hero__search-dash">—</span>
                <BaseInput
                  :model-value="priceTo"
                  type="number"
                  placeholder="до"
                  @update:model-value="priceTo = $event"
                />
              </div>

              <div class="cv-hero__search-field">
                <BaseSelect
                  :model-value="selectedCity"
                  :options="cities"
                  placeholder="Город"
                  searchable
                  clearable
                  @update:model-value="selectedCity = $event"
                />
              </div>

              <BaseButton
                type="submit"
                size="lg"
                class="cv-hero__search-submit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
                Найти
              </BaseButton>
            </div>
          </form>

          <div ref="heroStatsRef" class="cv-hero__stats">
            <div class="cv-hero__stat">
              <span class="cv-hero__stat-value">
                {{ animatedStats.listings.toLocaleString('ru-RU') }}+
              </span>
              <span class="cv-hero__stat-label">объявлений</span>
            </div>
            <span class="cv-hero__stat-divider" aria-hidden="true"></span>
            <div class="cv-hero__stat">
              <span class="cv-hero__stat-value">
                {{ animatedStats.sellers.toLocaleString('ru-RU') }}+
              </span>
              <span class="cv-hero__stat-label">продавцов</span>
            </div>
            <span class="cv-hero__stat-divider" aria-hidden="true"></span>
            <div class="cv-hero__stat">
              <span class="cv-hero__stat-value">
                {{ animatedStats.deals }}%
              </span>
              <span class="cv-hero__stat-label">успешных сделок</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cv-hero__scroll" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>

    <section class="cv-brands">
      <div class="cv-brands__container">
        <span class="cv-brands__label">Популярные марки:</span>

        <div class="cv-brands__scroll">
          <button
            v-for="brand in brands"
            :key="brand.value"
            type="button"
            class="cv-brands__chip"
            @click="handleQuickSearch(brand.value)"
          >
            {{ brand.label }}
          </button>
        </div>
      </div>
    </section>

    <section class="cv-categories">
      <div class="cv-categories__container">
        <header class="cv-section-head">
          <div class="cv-section-head__left">
            <span class="cv-section-head__eyebrow">Тип кузова</span>
            <h2 class="cv-section-head__title">Категории автомобилей</h2>
          </div>
        </header>

        <div class="cv-categories__grid">
          <button
            v-for="type in bodyTypes"
            :key="type.value"
            type="button"
            class="cv-category"
            @click="router.push({ path: '/announcements', query: { bodyType: type.value } })"
          >
            <span class="cv-category__icon" aria-hidden="true">
              <svg v-if="type.icon === 'sedan'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l3-5h12l3 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.icon === 'suv'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l2.5-6h13L21 14"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.icon === 'suv-large'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 14v3h20v-3M2 14l2-7h16l2 7"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.icon === 'hatch'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14l2-5h14v5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else-if="type.icon === 'wagon'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M3 14V9h13l5 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 14v3h18v-3M4 14l4-5h8l4 5"/>
                <circle cx="7" cy="17" r="1.6"/>
                <circle cx="17" cy="17" r="1.6"/>
              </svg>
            </span>
            <span class="cv-category__label">{{ type.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="cv-popular">
      <div class="cv-popular__container">
        <header class="cv-section-head">
          <div class="cv-section-head__left">
            <span class="cv-section-head__eyebrow">
              <span class="cv-section-head__dot" aria-hidden="true"></span>
              Топ по просмотрам
            </span>
            <h2 class="cv-section-head__title">Популярные автомобили</h2>
          </div>
          <BaseButton variant="ghost" @click="router.push('/announcements')">
            Смотреть все
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </BaseButton>
        </header>

        <div v-if="loadingPopular" class="cv-popular__grid">
          <AnnouncementSkeleton v-for="i in 6" :key="i" />
        </div>

        <div v-else class="cv-popular__grid">
          <AnnouncementCard
            v-for="announcement in popularAnnouncements"
            :key="announcement.id"
            :announcement="announcement"
          />
        </div>
      </div>
    </section>

    <section class="cv-sell-cta">
      <div class="cv-sell-cta__bg" aria-hidden="true">
        <div class="cv-sell-cta__bg-orb cv-sell-cta__bg-orb--1"></div>
        <div class="cv-sell-cta__bg-orb cv-sell-cta__bg-orb--2"></div>
        <div class="cv-sell-cta__bg-carbon"></div>
      </div>

      <div class="cv-sell-cta__container">
        <div class="cv-sell-cta__content">
          <span class="cv-sell-cta__eyebrow">
            <span class="cv-sell-cta__eyebrow-dot" aria-hidden="true"></span>
            Для продавцов
          </span>

          <h2 class="cv-sell-cta__title">
            Продайте автомобиль
            <span class="cv-sell-cta__title-accent">за 3 дня</span>
          </h2>

          <p class="cv-sell-cta__subtitle">
            Разместите объявление бесплатно и получите первые звонки уже через час.
            50 000+ активных покупателей ищут машину на CarVibe прямо сейчас.
          </p>

          <ul class="cv-sell-cta__benefits">
            <li v-for="benefit in sellerBenefits" :key="benefit.text" class="cv-sell-cta__benefit">
              <span class="cv-sell-cta__benefit-icon" aria-hidden="true">
                <svg v-if="benefit.icon === 'bolt'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
                </svg>
                <svg v-else-if="benefit.icon === 'users'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="M7 15l4-4 3 3 6-6"/>
                </svg>
              </span>
              {{ benefit.text }}
            </li>
          </ul>

          <div class="cv-sell-cta__actions">
            <BaseButton size="lg" @click="goToSell">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Разместить объявление
            </BaseButton>

            <button
              type="button"
              class="cv-sell-cta__link"
              @click="router.push('/analytics')"
            >
              Узнать цену авто
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="cv-sell-cta__visual">
          <div class="cv-sell-cta__visual-card">
            <div class="cv-sell-cta__visual-header">
              <span class="cv-sell-cta__visual-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="M7 15l4-4 3 3 6-6"/>
                </svg>
              </span>
              <span class="cv-sell-cta__visual-label">Прогноз цены</span>
            </div>

            <div class="cv-sell-cta__visual-price">
              <span class="cv-sell-cta__visual-price-value">2 850 000</span>
              <span class="cv-sell-cta__visual-price-currency">₽</span>
            </div>

            <div class="cv-sell-cta__visual-chart">
              <svg viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sellChartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#C9A961" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#C9A961" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 L30,35 L60,38 L90,25 L120,22 L150,18 L180,12 L200,10 L200,60 L0,60 Z"
                  fill="url(#sellChartFill)"
                />
                <path
                  d="M0,40 L30,35 L60,38 L90,25 L120,22 L150,18 L180,12 L200,10"
                  stroke="#E8D5A0"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <div class="cv-sell-cta__visual-footer">
              <span class="cv-sell-cta__visual-stat">
                <strong>+12%</strong> к средней цене рынка
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="cv-steps">
      <div class="cv-steps__container">
        <header class="cv-section-head cv-section-head--center">
          <span class="cv-section-head__eyebrow">Как это работает</span>
          <h2 class="cv-section-head__title">4 шага к вашей новой машине</h2>
        </header>

        <div class="cv-steps__grid">
          <div
            v-for="(step, index) in steps"
            :key="step.number"
            class="cv-step"
          >
            <div class="cv-step__number-wrap">
              <span class="cv-step__number">{{ step.number }}</span>
              <span
                v-if="index < steps.length - 1"
                class="cv-step__connector"
                aria-hidden="true"
              ></span>
            </div>

            <h3 class="cv-step__title">{{ step.title }}</h3>
            <p class="cv-step__description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cv-features">
      <div class="cv-features__container">
        <header class="cv-section-head cv-section-head--center">
          <span class="cv-section-head__eyebrow">Почему CarVibe</span>
          <h2 class="cv-section-head__title">Премиум-подход к каждой сделке</h2>
        </header>

        <div class="cv-features__grid">
          <div v-for="feature in features" :key="feature.title" class="cv-feature">
            <span class="cv-feature__icon" aria-hidden="true">
              <svg v-if="feature.icon === 'shield'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.5l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6l8-3z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <svg v-else-if="feature.icon === 'lock'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="10" width="16" height="11" rx="2"/>
                <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
              </svg>
              <svg v-else-if="feature.icon === 'chart'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M7 15l4-4 3 3 6-6"/>
              </svg>
              <svg v-else-if="feature.icon === 'bolt'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
              </svg>
              <svg v-else-if="feature.icon === 'history'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M12 7v5l3 2"/>
              </svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>
              </svg>
            </span>

            <h3 class="cv-feature__title">{{ feature.title }}</h3>
            <p class="cv-feature__description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cv-reviews">
      <div class="cv-reviews__container">
        <header class="cv-section-head">
          <div class="cv-section-head__left">
            <span class="cv-section-head__eyebrow">
              <span class="cv-section-head__dot" aria-hidden="true"></span>
              Отзывы
            </span>
            <h2 class="cv-section-head__title">Что говорят пользователи</h2>
          </div>
        </header>

        <div class="cv-reviews__grid">
          <article v-for="review in reviews" :key="review.id" class="cv-review">
            <div class="cv-review__rating" aria-label="5 из 5">
              <svg v-for="i in 5" :key="i" width="14" height="14" viewBox="0 0 24 24" fill="#E8D5A0">
                <path d="M12 2l3 7 7.5.6-5.7 5 1.7 7.4L12 18.2 5.5 22l1.7-7.4-5.7-5L9 9z"/>
              </svg>
            </div>

            <p class="cv-review__text">«{{ review.text }}»</p>

            <div class="cv-review__author">
              <span class="cv-review__avatar">
                <span class="cv-review__avatar-inner">{{ review.initial }}</span>
              </span>

              <div class="cv-review__author-info">
                <span class="cv-review__author-name">{{ review.name }}</span>
                <span class="cv-review__author-meta">
                  {{ review.city }} · {{ review.car }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="cv-fresh">
      <div class="cv-fresh__container">
        <header class="cv-section-head">
          <div class="cv-section-head__left">
            <span class="cv-section-head__eyebrow">
              <span class="cv-section-head__dot cv-section-head__dot--olive" aria-hidden="true"></span>
              Только что опубликовано
            </span>
            <h2 class="cv-section-head__title">Свежие объявления</h2>
          </div>
          <BaseButton variant="ghost" @click="router.push({ path: '/announcements', query: { sort: 'createdAt-desc' } })">
            Смотреть все
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </BaseButton>
        </header>

        <div v-if="loadingFresh" class="cv-fresh__grid">
          <AnnouncementSkeleton v-for="i in 6" :key="i" />
        </div>

        <div v-else class="cv-fresh__grid">
          <AnnouncementCard
            v-for="announcement in freshAnnouncements"
            :key="announcement.id"
            :announcement="announcement"
          />
        </div>
      </div>
    </section>

    <section class="cv-final-cta">
      <div class="cv-final-cta__bg" aria-hidden="true">
        <div class="cv-final-cta__glow"></div>
      </div>

      <div class="cv-final-cta__container">
        <h2 class="cv-final-cta__title">
          Присоединяйтесь к CarVibe
        </h2>

        <p class="cv-final-cta__subtitle">
          Создайте аккаунт за 30 секунд и получите доступ к лучшим
          автомобилям и продавцам страны.
        </p>

        <div class="cv-final-cta__actions">
          <BaseButton size="lg" @click="router.push('/register')">
            Начать бесплатно
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </BaseButton>

          <BaseButton variant="outline" size="lg" @click="router.push('/announcements')">
            Смотреть каталог
          </BaseButton>
        </div>

        <p class="cv-final-cta__note">
          Бесплатно · Без обязательств · Верификация за 1 минуту
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cv-home {
  display: flex;
  flex-direction: column;
}

.cv-hero {
  position: relative;
  min-height: 720px;
  display: flex;
  align-items: center;
  overflow: hidden;
  isolation: isolate;
}

.cv-hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.cv-hero__bg-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.cv-hero__bg-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 10, 12, 0.72) 0%, rgba(10, 10, 12, 0.55) 40%, rgba(10, 10, 12, 0.92) 100%),
    linear-gradient(90deg, rgba(10, 10, 12, 0.85) 0%, rgba(10, 10, 12, 0.4) 60%, rgba(10, 10, 12, 0.75) 100%);
  pointer-events: none;
}

.cv-hero__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.55;
  pointer-events: none;
}

.cv-hero__bg-orb--1 {
  top: -10%;
  left: -5%;
  width: 460px;
  height: 460px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.4), transparent 70%);
  animation: cvHeroOrbFloat 22s ease-in-out infinite;
}

.cv-hero__bg-orb--2 {
  bottom: -20%;
  right: 5%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.28), transparent 70%);
  animation: cvHeroOrbFloat 28s ease-in-out infinite reverse;
}

@keyframes cvHeroOrbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, -30px) scale(1.08); }
}

.cv-hero__bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse at 30% 50%, black 20%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 30% 50%, black 20%, transparent 75%);
  pointer-events: none;
  opacity: 0.6;
}

.cv-hero__container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 100px 48px 80px;
}

.cv-hero__content {
  max-width: 760px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(232, 213, 160, 0.95);
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.2), rgba(201, 169, 97, 0.05));
  border: 1px solid rgba(201, 169, 97, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 32px rgba(201, 169, 97, 0.15);
}

.cv-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 12px rgba(201, 169, 97, 0.9);
  animation: cvHeroDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvHeroDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-hero__title {
  margin: 0;
  font-size: 68px;
  font-weight: 800;
  letter-spacing: -1.8px;
  line-height: 1.05;
  color: rgba(245, 240, 230, 0.98);
}

.cv-hero__title-accent {
  display: block;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 4px 60px rgba(201, 169, 97, 0.25);
}

.cv-hero__subtitle {
  margin: 0;
  max-width: 620px;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.75);
}

.cv-hero__search {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.6) 0%, rgba(15, 13, 10, 0.75) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.cv-hero__search-main {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.25s ease;
}

.cv-hero__search-main:focus-within {
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(201, 169, 97, 0.4);
  box-shadow: 0 0 0 3px rgba(201, 169, 97, 0.1);
}

.cv-hero__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.75);
  flex-shrink: 0;
  transition: color 0.25s ease;
}

.cv-hero__search-main:focus-within .cv-hero__search-icon {
  color: #E8D5A0;
}

.cv-hero__search-input {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(245, 240, 230, 0.95);
  background: transparent;
  border: none;
  outline: none;
}

.cv-hero__search-input::placeholder {
  color: rgba(200, 190, 175, 0.45);
}

.cv-hero__search-extra {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 0 8px 8px;
}

.cv-hero__search-field {
  min-width: 0;
}

.cv-hero__search-field--price {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 6px;
  align-items: center;
}

.cv-hero__search-dash {
  color: rgba(200, 190, 175, 0.4);
  font-size: 12px;
  text-align: center;
}

.cv-hero__search-submit {
  white-space: nowrap;
}

.cv-hero__stats {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.cv-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cv-hero__stat-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-hero__stat-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.75);
}

.cv-hero__stat-divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent, rgba(201, 169, 97, 0.4), transparent);
}

.cv-hero__scroll {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: rgba(232, 213, 160, 0.7);
  background: rgba(10, 10, 14, 0.6);
  border: 1px solid rgba(201, 169, 97, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: cvHeroScrollBounce 2.4s ease-in-out infinite;
}

@keyframes cvHeroScrollBounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(6px); }
}

.cv-brands {
  padding: 28px 0;
  border-bottom: 1px solid rgba(201, 169, 97, 0.1);
}

.cv-brands__container {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}

.cv-brands__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
  flex-shrink: 0;
  white-space: nowrap;
}

.cv-brands__scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 4px 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
}

.cv-brands__scroll::-webkit-scrollbar { display: none; }

.cv-brands__chip {
  flex-shrink: 0;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(201, 169, 97, 0.18);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-brands__chip:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border-color: rgba(201, 169, 97, 0.42);
  transform: translateY(-1px);
}

.cv-brands__chip:active {
  transform: translateY(0) scale(0.96);
}

.cv-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.cv-section-head--center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cv-section-head__left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.cv-section-head__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-section-head__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvSectionDot 2.2s ease-in-out infinite;
}

.cv-section-head__dot--olive {
  background: linear-gradient(135deg, #B8CEA8, #7A9A6A);
  box-shadow: 0 0 10px rgba(122, 154, 106, 0.8);
}

@keyframes cvSectionDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-section-head__title {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.6px;
  line-height: 1.15;
  color: rgba(245, 240, 230, 0.95);
}

.cv-categories,
.cv-popular,
.cv-steps,
.cv-features,
.cv-reviews,
.cv-fresh {
  padding: 96px 0;
}

.cv-categories__container,
.cv-popular__container,
.cv-steps__container,
.cv-features__container,
.cv-reviews__container,
.cv-fresh__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}

.cv-categories__grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

.cv-category {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 28px 16px 24px;
  font-family: inherit;
  color: rgba(220, 210, 195, 0.85);
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
  pointer-events: none;
}

.cv-category::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.1), rgba(201, 169, 97, 0.02));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.cv-category:hover {
  border-color: rgba(201, 169, 97, 0.45);
  transform: translateY(-4px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(201, 169, 97, 0.18);
}

.cv-category:hover::after { opacity: 1; }

.cv-category:active { transform: translateY(-2px) scale(0.98); }

.cv-category__icon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.28);
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 32px rgba(201, 169, 97, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-category:hover .cv-category__icon {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(232, 213, 160, 0.55);
  transform: scale(1.06);
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 0 48px rgba(201, 169, 97, 0.28);
}

.cv-category__label {
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05px;
  transition: color 0.25s ease;
}

.cv-category:hover .cv-category__label {
  color: #F5E6BC;
}

.cv-popular__grid,
.cv-fresh__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.cv-sell-cta {
  position: relative;
  padding: 96px 0;
  overflow: hidden;
  isolation: isolate;
}

.cv-sell-cta__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.cv-sell-cta__bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
}

.cv-sell-cta__bg-orb--1 {
  top: -20%;
  left: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(184, 119, 85, 0.35), transparent 70%);
  animation: cvSellOrb 22s ease-in-out infinite;
}

.cv-sell-cta__bg-orb--2 {
  bottom: -25%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 70%);
  animation: cvSellOrb 26s ease-in-out infinite reverse;
}

@keyframes cvSellOrb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -30px) scale(1.06); }
}

.cv-sell-cta__bg-carbon {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.012) 0px, rgba(255, 255, 255, 0.012) 1px, transparent 1px, transparent 4px);
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
}

.cv-sell-cta__container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 64px;
  align-items: center;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
}

.cv-sell-cta__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-sell-cta__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #E8A88A;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.2), rgba(184, 119, 85, 0.05));
  border: 1px solid rgba(184, 119, 85, 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.cv-sell-cta__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E8A88A, #B87755);
  box-shadow: 0 0 12px rgba(184, 119, 85, 0.9);
  animation: cvSellDot 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes cvSellDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.25); }
}

.cv-sell-cta__title {
  margin: 0;
  font-size: 52px;
  font-weight: 800;
  letter-spacing: -1.4px;
  line-height: 1.05;
  color: rgba(245, 240, 230, 0.98);
}

.cv-sell-cta__title-accent {
  display: block;
  background: linear-gradient(135deg, #E8A88A 0%, #B87755 55%, #6B4225 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 4px 60px rgba(184, 119, 85, 0.3);
}

.cv-sell-cta__subtitle {
  margin: 0;
  max-width: 520px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.75);
}

.cv-sell-cta__benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;
  padding: 0;
  list-style: none;
}

.cv-sell-cta__benefit {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.05px;
  color: rgba(220, 210, 195, 0.85);
}

.cv-sell-cta__benefit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 8px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.14);
  border: 1px solid rgba(184, 119, 85, 0.32);
}

.cv-sell-cta__actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.cv-sell-cta__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8A88A;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-sell-cta__link svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-sell-cta__link:hover {
  color: #F0C080;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: rgba(232, 168, 138, 0.5);
}

.cv-sell-cta__link:hover svg { transform: translateX(3px); }

.cv-sell-cta__visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cv-sell-cta__visual-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.65)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.28);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(201, 169, 97, 0.06) inset,
    0 0 80px rgba(201, 169, 97, 0.15);
  overflow: hidden;
  isolation: isolate;
  animation: cvSellCard 4s ease-in-out infinite;
}

@keyframes cvSellCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.cv-sell-cta__visual-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.28) 50%, transparent);
}

.cv-sell-cta__visual-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.cv-sell-cta__visual-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.15);
  border: 1px solid rgba(201, 169, 97, 0.35);
}

.cv-sell-cta__visual-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-sell-cta__visual-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 20px;
}

.cv-sell-cta__visual-price-value {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 2px 40px rgba(201, 169, 97, 0.25);
}

.cv-sell-cta__visual-price-currency {
  font-size: 20px;
  font-weight: 800;
  color: rgba(232, 213, 160, 0.6);
}

.cv-sell-cta__visual-chart {
  height: 70px;
  margin-bottom: 18px;
}

.cv-sell-cta__visual-chart svg {
  width: 100%;
  height: 100%;
  display: block;
}

.cv-sell-cta__visual-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-sell-cta__visual-stat {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: rgba(200, 190, 175, 0.65);
}

.cv-sell-cta__visual-stat strong {
  color: #B8CEA8;
  font-weight: 800;
}

.cv-steps__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.cv-step {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px;
}

.cv-step__number-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.cv-step__number {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 12px 32px rgba(201, 169, 97, 0.4),
    0 0 0 1px rgba(255, 245, 214, 0.15) inset,
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.cv-step__connector {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(201, 169, 97, 0.5), rgba(201, 169, 97, 0.05));
  position: relative;
}

.cv-step__connector::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.4);
}

.cv-step__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-step__description {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(200, 190, 175, 0.65);
}

.cv-features__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.cv-feature {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 26px 24px 24px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.14);
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-feature::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
}

.cv-feature:hover {
  border-color: rgba(201, 169, 97, 0.38);
  transform: translateY(-3px);
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.45),
    0 0 32px rgba(201, 169, 97, 0.12);
}

.cv-feature__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 15px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
  box-shadow:
    0 0 0 1px rgba(201, 169, 97, 0.04) inset,
    0 0 32px rgba(201, 169, 97, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-feature:hover .cv-feature__icon {
  background: rgba(201, 169, 97, 0.2);
  border-color: rgba(232, 213, 160, 0.55);
  transform: scale(1.06);
}

.cv-feature__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-feature__description {
  margin: 0;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(200, 190, 175, 0.65);
}

.cv-reviews__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.cv-review {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 26px 24px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35), rgba(15, 13, 10, 0.45)),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
}

.cv-review::before {
  content: '„';
  position: absolute;
  top: -28px;
  right: 16px;
  font-size: 140px;
  font-weight: 800;
  font-family: Georgia, serif;
  line-height: 1;
  color: rgba(201, 169, 97, 0.08);
  pointer-events: none;
  z-index: 0;
}

.cv-review__rating {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 3px;
}

.cv-review__text {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(245, 240, 230, 0.85);
}

.cv-review__author {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  margin-top: auto;
  border-top: 1px solid rgba(201, 169, 97, 0.1);
}

.cv-review__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 0 0 1.5px rgba(201, 169, 97, 0.5),
    0 0 0 3px rgba(10, 10, 12, 0.95),
    0 4px 14px rgba(201, 169, 97, 0.3);
}

.cv-review__avatar-inner {
  font-size: 15px;
  font-weight: 800;
  color: #1A1208;
  letter-spacing: -0.2px;
}

.cv-review__author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-review__author-name {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: -0.05px;
  color: rgba(245, 240, 230, 0.95);
}

.cv-review__author-meta {
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-final-cta {
  position: relative;
  padding: 120px 0 96px;
  overflow: hidden;
  isolation: isolate;
}

.cv-final-cta__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.cv-final-cta__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.28), transparent 65%);
  filter: blur(100px);
  opacity: 0.65;
}

.cv-final-cta__container {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 22px;
  align-items: center;
}

.cv-final-cta__title {
  margin: 0;
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1.2px;
  line-height: 1.1;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  text-shadow: 0 4px 60px rgba(201, 169, 97, 0.2);
}

.cv-final-cta__subtitle {
  margin: 0;
  max-width: 540px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.65;
  color: rgba(220, 210, 195, 0.75);
}

.cv-final-cta__actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.cv-final-cta__note {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: rgba(200, 190, 175, 0.5);
}

@media (max-width: 1280px) {
  .cv-hero__title { font-size: 56px; }
  .cv-sell-cta__title { font-size: 44px; }
  .cv-final-cta__title { font-size: 40px; }

  .cv-hero__container,
  .cv-brands__container,
  .cv-categories__container,
  .cv-popular__container,
  .cv-steps__container,
  .cv-features__container,
  .cv-reviews__container,
  .cv-fresh__container,
  .cv-sell-cta__container,
  .cv-final-cta__container {
    padding-left: 32px;
    padding-right: 32px;
  }
}

@media (max-width: 1024px) {
  .cv-hero { min-height: 640px; }
  .cv-hero__title { font-size: 44px; letter-spacing: -1.2px; }
  .cv-hero__subtitle { font-size: 15.5px; }
  .cv-hero__search-extra { grid-template-columns: 1fr 1fr; }

  .cv-categories,
  .cv-popular,
  .cv-steps,
  .cv-features,
  .cv-reviews,
  .cv-fresh,
  .cv-sell-cta { padding: 64px 0; }

  .cv-section-head__title { font-size: 26px; }
  .cv-sell-cta__title { font-size: 38px; }
  .cv-final-cta__title { font-size: 34px; }
  .cv-final-cta { padding: 80px 0 64px; }

  .cv-categories__grid { grid-template-columns: repeat(3, 1fr); }
  .cv-popular__grid,
  .cv-fresh__grid { grid-template-columns: repeat(2, 1fr); }
  .cv-steps__grid { grid-template-columns: repeat(2, 1fr); }
  .cv-features__grid { grid-template-columns: repeat(2, 1fr); }
  .cv-reviews__grid { grid-template-columns: 1fr; }
  .cv-sell-cta__container { grid-template-columns: 1fr; gap: 40px; }
  .cv-sell-cta__visual { justify-content: flex-start; }
  .cv-sell-cta__visual-card { max-width: 100%; }
}

@media (max-width: 768px) {
  .cv-hero { min-height: 560px; }
  .cv-hero__container { padding: 72px 20px 60px; }
  .cv-hero__title { font-size: 34px; letter-spacing: -0.8px; }
  .cv-hero__subtitle { font-size: 14.5px; }
  .cv-hero__search-extra { grid-template-columns: 1fr; }
  .cv-hero__search-submit { width: 100%; }
  .cv-hero__stats { gap: 18px; padding-top: 12px; }
  .cv-hero__stat-value { font-size: 22px; }
  .cv-hero__stat-divider { height: 26px; }
  .cv-hero__scroll { display: none; }

  .cv-section-head__title { font-size: 22px; letter-spacing: -0.3px; }
  .cv-sell-cta__title { font-size: 32px; letter-spacing: -0.8px; }
  .cv-final-cta__title { font-size: 28px; letter-spacing: -0.6px; }

  .cv-categories,
  .cv-popular,
  .cv-steps,
  .cv-features,
  .cv-reviews,
  .cv-fresh,
  .cv-sell-cta { padding: 48px 0; }

  .cv-categories__container,
  .cv-popular__container,
  .cv-steps__container,
  .cv-features__container,
  .cv-reviews__container,
  .cv-fresh__container,
  .cv-sell-cta__container,
  .cv-final-cta__container,
  .cv-brands__container {
    padding-left: 20px;
    padding-right: 20px;
  }

  .cv-categories__grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .cv-category { padding: 22px 12px 18px; }
  .cv-category__icon { width: 54px; height: 54px; border-radius: 15px; }
  .cv-category__label { font-size: 13px; }

  .cv-popular__grid,
  .cv-fresh__grid { grid-template-columns: 1fr; gap: 14px; }
  .cv-steps__grid { grid-template-columns: 1fr; gap: 20px; }
  .cv-features__grid { grid-template-columns: 1fr; gap: 12px; }

  .cv-step__number { width: 48px; height: 48px; font-size: 18px; border-radius: 14px; }
  .cv-step__connector { display: none; }

  .cv-sell-cta__eyebrow { font-size: 10px; padding: 6px 12px; }
  .cv-sell-cta__actions { flex-direction: column; align-items: stretch; }
  .cv-sell-cta__link { justify-content: center; }

  .cv-final-cta { padding: 60px 0 48px; }
  .cv-final-cta__actions { flex-direction: column; width: 100%; }
  .cv-final-cta__actions > * { width: 100%; }

  .cv-brands__container { flex-direction: column; align-items: flex-start; gap: 12px; }
  .cv-brands__scroll { width: 100%; }

  .cv-review { padding: 22px 20px 20px; }
  .cv-review::before { font-size: 100px; top: -20px; }
}

@media (max-width: 480px) {
  .cv-hero__title { font-size: 28px; }
  .cv-sell-cta__title { font-size: 26px; }
  .cv-final-cta__title { font-size: 24px; }
  .cv-section-head__title { font-size: 20px; }
}
</style>