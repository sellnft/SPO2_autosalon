<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useToastStore } from '@/stores/toast'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import BaseLoader from '@/components/common/BaseLoader.vue'
import { formatPrice } from '@/utils/formatPrice'

const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const toastStore = useToastStore()

const loading = ref(true)
const showDeleteModal = ref(false)
const searchToDelete = ref(null)
const activeTab = ref('all')
const sortBy = ref('recent')

const sortOptions = [
  { key: 'recent', label: 'Недавние' },
  { key: 'alphabetical', label: 'По алфавиту' },
  { key: 'new-results', label: 'С новыми' }
]

const savedSearches = computed(() => subscriptionsStore.savedSearches || [])

const tabs = computed(() => [
  { key: 'all', label: 'Все', count: savedSearches.value.length },
  { key: 'with-new', label: 'С новыми', count: savedSearches.value.filter(s => s.newCount > 0).length }
])

const searchCountText = computed(() => {
  const n = savedSearches.value.length
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'поиск'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'поиска'
  return 'поисков'
})

const filteredAndSorted = computed(() => {
  let items = savedSearches.value

  if (activeTab.value === 'with-new') {
    items = items.filter(s => s.newCount > 0)
  }

  items = [...items].sort((a, b) => {
    if (sortBy.value === 'alphabetical') {
      return (a.name || '').localeCompare(b.name || '')
    }
    if (sortBy.value === 'new-results') {
      return (b.newCount || 0) - (a.newCount || 0)
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  return items
})

function getSearchFilters(search) {
  const filters = search.filters || {}
  const list = []

  if (filters.brand) list.push({ label: filters.brand, type: 'brand' })
  if (filters.model) list.push({ label: filters.model, type: 'model' })
  if (filters.bodyType) list.push({ label: filters.bodyType, type: 'body' })
  if (filters.transmission) list.push({ label: filters.transmission, type: 'trans' })
  if (filters.drive) list.push({ label: filters.drive, type: 'drive' })
  if (filters.color) list.push({ label: filters.color, type: 'color' })
  if (filters.city) list.push({ label: filters.city, type: 'city' })

  if (filters.priceFrom && filters.priceTo) {
    list.push({
      label: `${formatPrice(filters.priceFrom)} — ${formatPrice(filters.priceTo)}`,
      type: 'price'
    })
  } else if (filters.priceTo) {
    list.push({ label: `до ${formatPrice(filters.priceTo)}`, type: 'price' })
  } else if (filters.priceFrom) {
    list.push({ label: `от ${formatPrice(filters.priceFrom)}`, type: 'price' })
  }

  if (filters.yearFrom && filters.yearTo) {
    list.push({ label: `${filters.yearFrom}–${filters.yearTo} г.`, type: 'year' })
  } else if (filters.yearFrom) {
    list.push({ label: `от ${filters.yearFrom} г.`, type: 'year' })
  } else if (filters.yearTo) {
    list.push({ label: `до ${filters.yearTo} г.`, type: 'year' })
  }

  if (filters.mileageTo) {
    list.push({
      label: `до ${Number(filters.mileageTo).toLocaleString('ru-RU')} км`,
      type: 'mileage'
    })
  }

  return list
}

function getVisibleFilters(search, max = 5) {
  const all = getSearchFilters(search)
  return {
    visible: all.slice(0, max),
    hidden: all.length - max,
    total: all.length
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return 'не использован'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) return `${minutes} мин. назад`
  if (hours < 24) return `${hours} ч. назад`
  if (days < 7) return `${days} дн. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function confirmDelete(search) {
  searchToDelete.value = search
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!searchToDelete.value) return

  try {
    await subscriptionsStore.deleteSavedSearch(searchToDelete.value.id)
    toastStore.success('Поиск удалён')
  } catch (err) {
    toastStore.error('Ошибка удаления')
  } finally {
    showDeleteModal.value = false
    searchToDelete.value = null
  }
}

function applySearch(search) {
  router.push({ path: '/announcements', query: search.filters })
}

function editSearch(search) {
  router.push({ path: '/announcements', query: { ...search.filters, edit: search.id } })
}

function goToCatalog() {
  router.push('/announcements')
}

function goToNotificationSettings() {
  router.push('/profile/notifications')
}

async function shareSearch(search) {
  const query = new URLSearchParams(search.filters).toString()
  const url = `${window.location.origin}/announcements?${query}`

  try {
    await navigator.clipboard.writeText(url)
    toastStore.success('Ссылка на поиск скопирована')
  } catch (err) {
    toastStore.error('Не удалось скопировать')
  }
}

onMounted(async () => {
  try {
    await subscriptionsStore.fetchSavedSearches()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="cv-ssearch">
    <div class="cv-ssearch__container">
      <Breadcrumbs />

      <header class="cv-ssearch__header">
        <div class="cv-ssearch__header-left">
          <span class="cv-ssearch__eyebrow">
            <span class="cv-ssearch__eyebrow-dot" aria-hidden="true"></span>
            Профиль · Сохранённые поиски
          </span>
          <h1 class="cv-ssearch__title">Сохранённые поиски</h1>
          <p class="cv-ssearch__subtitle">
            Быстро возвращайтесь к избранным фильтрам —
            <strong v-if="savedSearches.length">{{ savedSearches.length }} {{ searchCountText }}</strong>
            <span v-else>сохраняйте параметры поиска для быстрого доступа</span>
          </p>
        </div>

        <div v-if="savedSearches.length" class="cv-ssearch__header-actions">
          <BaseButton variant="outline" size="lg" @click="goToNotificationSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
            Уведомления
          </BaseButton>

          <BaseButton size="lg" @click="goToCatalog">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M20 20l-3.5-3.5"/>
            </svg>
            Найти авто
          </BaseButton>
        </div>
      </header>

      <section v-if="savedSearches.length" class="cv-ssearch__toolbar">
        <div class="cv-ssearch__tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="cv-ssearch__tab"
            :class="{ 'cv-ssearch__tab--active': activeTab === tab.key }"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span class="cv-ssearch__tab-label">{{ tab.label }}</span>
            <span class="cv-ssearch__tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="cv-ssearch__sort">
          <span class="cv-ssearch__sort-label">Сортировка:</span>
          <div class="cv-ssearch__sort-buttons">
            <button
              v-for="opt in sortOptions"
              :key="opt.key"
              type="button"
              class="cv-ssearch__sort-btn"
              :class="{ 'cv-ssearch__sort-btn--active': sortBy === opt.key }"
              @click="sortBy = opt.key"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </section>

      <BaseLoader v-if="loading" text="Загрузка поисков..." />

      <template v-else>
        <div v-if="!savedSearches.length" class="cv-ssearch__empty">
          <div class="cv-ssearch__empty-orb" aria-hidden="true"></div>

          <div class="cv-ssearch__empty-content">
            <span class="cv-ssearch__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
            </span>

            <h3 class="cv-ssearch__empty-title">Нет сохранённых поисков</h3>
            <p class="cv-ssearch__empty-text">
              Настройте фильтры в каталоге и нажмите «Сохранить поиск» —
              вы сможете возвращаться к ним одним кликом и получать уведомления о новых объявлениях.
            </p>

            <div class="cv-ssearch__empty-actions">
              <BaseButton size="lg" @click="goToCatalog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
                Найти автомобиль
              </BaseButton>

              <button
                type="button"
                class="cv-ssearch__empty-link"
                @click="goToNotificationSettings"
              >
                Как работают уведомления
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="!filteredAndSorted.length" class="cv-ssearch__empty">
          <div class="cv-ssearch__empty-content">
            <span class="cv-ssearch__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </span>

            <h3 class="cv-ssearch__empty-title">Нет поисков с новыми объявлениями</h3>
            <p class="cv-ssearch__empty-text">
              Как только появятся новые объявления по вашим поискам — они появятся здесь.
            </p>

            <BaseButton variant="outline" @click="activeTab = 'all'">
              Показать все поиски
            </BaseButton>
          </div>
        </div>

        <div v-else class="cv-ssearch__list">
          <article
            v-for="search in filteredAndSorted"
            :key="search.id"
            class="cv-saved"
            :class="{ 'cv-saved--has-new': search.newCount > 0 }"
          >
            <div class="cv-saved__glow" aria-hidden="true"></div>

            <header class="cv-saved__header">
              <span class="cv-saved__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
              </span>

              <div class="cv-saved__title-block">
                <div class="cv-saved__title-row">
                  <h3 class="cv-saved__name">{{ search.name || 'Мой поиск' }}</h3>

                  <span
                    v-if="search.newCount > 0"
                    class="cv-saved__badge"
                  >
                    <span class="cv-saved__badge-dot" aria-hidden="true"></span>
                    +{{ search.newCount }} новых
                  </span>
                </div>

                <span class="cv-saved__meta">
                  <span class="cv-saved__meta-item">
                    <span class="cv-saved__meta-icon" aria-hidden="true">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3 2"/>
                      </svg>
                    </span>
                    {{ formatRelativeTime(search.lastUsedAt || search.createdAt) }}
                  </span>

                  <span v-if="search.resultCount" class="cv-saved__meta-dot" aria-hidden="true"></span>

                  <span v-if="search.resultCount" class="cv-saved__meta-item cv-saved__meta-item--accent">
                    <span class="cv-saved__meta-icon" aria-hidden="true">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </span>
                    {{ search.resultCount.toLocaleString('ru-RU') }} объявлений
                  </span>
                </span>
              </div>
            </header>

            <div class="cv-saved__filters">
              <template v-for="(filter, index) in getVisibleFilters(search).visible" :key="index">
                <span class="cv-saved__filter" :data-type="filter.type">
                  {{ filter.label }}
                </span>
              </template>

              <span
                v-if="getVisibleFilters(search).hidden > 0"
                class="cv-saved__filter cv-saved__filter--more"
              >
                +{{ getVisibleFilters(search).hidden }} ещё
              </span>

              <span
                v-if="!getVisibleFilters(search).total"
                class="cv-saved__filter cv-saved__filter--empty"
              >
                Без фильтров
              </span>
            </div>

            <footer class="cv-saved__footer">
              <div class="cv-saved__actions">
                <BaseButton size="sm" @click="applySearch(search)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="M20 20l-3.5-3.5"/>
                  </svg>
                  Показать
                </BaseButton>

                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="editSearch(search)"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 3l5 5-11 11H5v-5z"/>
                  </svg>
                  Изменить
                </BaseButton>
              </div>

              <div class="cv-saved__utilities">
                <button
                  type="button"
                  class="cv-saved__util"
                  aria-label="Поделиться поиском"
                  title="Скопировать ссылку на поиск"
                  @click="shareSearch(search)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
                  </svg>
                </button>

                <button
                  type="button"
                  class="cv-saved__util cv-saved__util--danger"
                  aria-label="Удалить поиск"
                  title="Удалить поиск"
                  @click="confirmDelete(search)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            </footer>
          </article>
        </div>
      </template>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Удалить этот поиск?"
      :message="`«${searchToDelete?.name || 'Мой поиск'}» будет удалён. Все объявления по этому фильтру останутся в каталоге.`"
      confirm-text="Удалить"
      cancel-text="Отмена"
      variant="danger"
      icon="trash"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
.cv-ssearch {
  position: relative;
  padding: 20px 0 60px;
}

.cv-ssearch__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-ssearch__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cv-ssearch__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cv-ssearch__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-ssearch__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvSsearchDot 2.2s ease-in-out infinite;
}

@keyframes cvSsearchDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-ssearch__title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
}

.cv-ssearch__subtitle {
  margin: 0;
  max-width: 640px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-ssearch__subtitle strong {
  color: #E8D5A0;
  font-weight: 800;
}

.cv-ssearch__header-actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.cv-ssearch__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cv-ssearch__tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-ssearch__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
  white-space: nowrap;
}

.cv-ssearch__tab:hover:not(.cv-ssearch__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-ssearch__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-ssearch__tab-label {
  white-space: nowrap;
}

.cv-ssearch__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(220, 210, 195, 0.7);
}

.cv-ssearch__tab--active .cv-ssearch__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-ssearch__sort {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cv-ssearch__sort-label {
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.5);
}

.cv-ssearch__sort-buttons {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-ssearch__sort-btn {
  padding: 7px 12px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.1px;
  color: rgba(220, 210, 195, 0.6);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
}

.cv-ssearch__sort-btn:hover {
  color: #E8D5A0;
}

.cv-ssearch__sort-btn--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.35),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-ssearch__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-saved {
  position: relative;
  padding: 22px 24px 20px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  transition: all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset;
}

.cv-saved::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.2) 50%, transparent);
  pointer-events: none;
  z-index: 2;
}

.cv-saved:hover {
  border-color: rgba(201, 169, 97, 0.4);
  transform: translateY(-2px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.45),
    0 0 32px rgba(201, 169, 97, 0.12);
}

.cv-saved--has-new {
  border-color: rgba(232, 213, 160, 0.42);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 3px rgba(201, 169, 97, 0.06),
    0 0 40px rgba(201, 169, 97, 0.15);
}

.cv-saved__glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.15), transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.cv-saved:hover .cv-saved__glow,
.cv-saved--has-new .cv-saved__glow {
  opacity: 1;
}

.cv-saved__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
}

.cv-saved__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 13px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border: 1px solid rgba(201, 169, 97, 0.3);
  transition: all 0.3s ease;
}

.cv-saved--has-new .cv-saved__icon {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 6px 20px rgba(201, 169, 97, 0.4),
    0 0 32px rgba(201, 169, 97, 0.25),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
}

.cv-saved__title-block {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-saved__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.cv-saved__name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.95);
}

.cv-saved__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-radius: 999px;
  box-shadow:
    0 4px 14px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.5) inset;
  white-space: nowrap;
}

.cv-saved__badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
  animation: cvSsearchDot 2.2s ease-in-out infinite;
}

.cv-saved__meta {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05px;
  color: rgba(200, 190, 175, 0.55);
}

.cv-saved__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.cv-saved__meta-item--accent {
  color: #E8D5A0;
  font-weight: 700;
}

.cv-saved__meta-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-saved__meta-item--accent .cv-saved__meta-icon {
  color: #E8D5A0;
}

.cv-saved__meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(201, 169, 97, 0.35);
  flex-shrink: 0;
}

.cv-saved__filters {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(201, 169, 97, 0.1);
}

.cv-saved__filter {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  font-size: 11.5px;
  font-weight: 650;
  letter-spacing: 0.05px;
  border-radius: 999px;
  border: 1px solid;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.cv-saved__filter[data-type="brand"],
.cv-saved__filter[data-type="model"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-saved__filter[data-type="price"],
.cv-saved__filter[data-type="mileage"] {
  color: #B8CEA8;
  background: rgba(122, 154, 106, 0.12);
  border-color: rgba(122, 154, 106, 0.32);
}

.cv-saved__filter[data-type="year"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.3);
}

.cv-saved__filter[data-type="body"],
.cv-saved__filter[data-type="trans"],
.cv-saved__filter[data-type="drive"] {
  color: rgba(220, 210, 195, 0.75);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.cv-saved__filter[data-type="city"],
.cv-saved__filter[data-type="color"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.1);
  border-color: rgba(184, 119, 85, 0.3);
}

.cv-saved__filter--more {
  color: rgba(200, 190, 175, 0.65);
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
  font-style: italic;
}

.cv-saved__filter--empty {
  color: rgba(200, 190, 175, 0.5);
  background: transparent;
  border-color: rgba(255, 255, 255, 0.08);
  border-style: dashed;
}

.cv-saved__footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-saved__actions {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cv-saved__utilities {
  display: inline-flex;
  gap: 6px;
  flex-shrink: 0;
}

.cv-saved__util {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: rgba(220, 210, 195, 0.55);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.22s ease;
}

.cv-saved__util:hover {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.12);
  border-color: rgba(201, 169, 97, 0.32);
  transform: translateY(-1px);
}

.cv-saved__util:active {
  transform: translateY(0) scale(0.94);
}

.cv-saved__util--danger:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.4);
}

.cv-ssearch__empty {
  position: relative;
  padding: 72px 32px 64px;
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.3) 0%, rgba(15, 13, 10, 0.4) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  text-align: center;
}

.cv-ssearch__empty-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 97, 0.15), transparent 70%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  animation: cvSsearchEmptyOrb 4s ease-in-out infinite;
}

@keyframes cvSsearchEmptyOrb {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-ssearch__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.cv-ssearch__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  margin-bottom: 12px;
  border-radius: 24px;
  color: #E8D5A0;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5) 0%, rgba(15, 13, 10, 0.6) 100%),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1px solid rgba(201, 169, 97, 0.24);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(201, 169, 97, 0.05) inset,
    0 1px 0 rgba(232, 213, 160, 0.08) inset,
    0 0 60px rgba(201, 169, 97, 0.15);
  animation: cvSsearchEmptyFloat 4s ease-in-out infinite;
}

@keyframes cvSsearchEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-ssearch__empty-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-ssearch__empty-text {
  margin: 0 0 20px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.6);
}

.cv-ssearch__empty-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-ssearch__empty-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cv-ssearch__empty-link svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-ssearch__empty-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.cv-ssearch__empty-link:hover svg { transform: translateX(3px); }

@media (max-width: 1024px) {
  .cv-ssearch__container { padding: 0 32px; }
  .cv-ssearch__title { font-size: 32px; letter-spacing: -0.7px; }
}

@media (max-width: 768px) {
  .cv-ssearch { padding: 12px 0 40px; }
  .cv-ssearch__container { padding: 0 20px; gap: 18px; }
  .cv-ssearch__title { font-size: 26px; letter-spacing: -0.5px; }
  .cv-ssearch__subtitle { font-size: 13.5px; }
  .cv-ssearch__header-actions { width: 100%; flex-direction: column; }
  .cv-ssearch__header-actions > * { width: 100%; }

  .cv-ssearch__toolbar { flex-direction: column; align-items: stretch; gap: 12px; }
  .cv-ssearch__sort { flex-direction: column; align-items: stretch; gap: 6px; }
  .cv-ssearch__sort-buttons { justify-content: space-between; }

  .cv-saved { padding: 18px 16px 16px; }
  .cv-saved__icon { width: 42px; height: 42px; border-radius: 11px; }
  .cv-saved__name { font-size: 15.5px; }
  .cv-saved__meta { font-size: 11.5px; gap: 10px; }

  .cv-saved__filters { gap: 5px; padding-bottom: 14px; margin-bottom: 14px; }
  .cv-saved__filter { font-size: 11px; padding: 4px 9px; }

  .cv-saved__footer { flex-direction: column; align-items: stretch; gap: 10px; }
  .cv-saved__actions { flex-direction: column; }
  .cv-saved__actions > * { width: 100%; justify-content: center; }
  .cv-saved__utilities { justify-content: flex-end; }

  .cv-ssearch__empty { padding: 52px 20px 44px; border-radius: 1rem; }
  .cv-ssearch__empty-icon { width: 72px; height: 72px; border-radius: 20px; }
  .cv-ssearch__empty-title { font-size: 17px; }
  .cv-ssearch__empty-text { font-size: 13px; }
  .cv-ssearch__empty-actions { flex-direction: column; width: 100%; gap: 12px; }
  .cv-ssearch__empty-actions > * { width: 100%; }
  .cv-ssearch__empty-link { justify-content: center; }
}
</style>