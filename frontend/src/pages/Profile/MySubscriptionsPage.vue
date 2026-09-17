<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useAnnouncementsStore } from '@/stores/announcements'
import AnnouncementCard from '@/components/announcements/AnnouncementCard.vue'
import AnnouncementSkeleton from '@/components/announcements/AnnouncementSkeleton.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import { formatPrice } from '@/utils/formatPrice'

const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const announcementsStore = useAnnouncementsStore()

const loading = ref(true)
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: 'Все', icon: 'grid' },
  { key: 'changes', label: 'С изменениями', icon: 'bell' },
  { key: 'price-drop', label: 'Цена снижена', icon: 'arrow-down' },
  { key: 'price-up', label: 'Цена выросла', icon: 'arrow-up' },
  { key: 'sold', label: 'Проданы', icon: 'check' }
]

const subscribedAnnouncements = computed(() => {
  const ids = subscriptionsStore.subscribedIds
  return announcementsStore.announcements.filter(a => ids.includes(a.id))
})

const stats = computed(() => {
  const items = subscribedAnnouncements.value
  return {
    total: items.length,
    changed: items.filter(a => a.hasChanges).length,
    unread: items.filter(a => a.hasChanges && !a.changesRead).length
  }
})

const tabCounts = computed(() => {
  const items = subscribedAnnouncements.value
  return {
    all: items.length,
    changes: items.filter(a => a.hasChanges).length,
    'price-drop': items.filter(a => a.priceDrop).length,
    'price-up': items.filter(a => a.priceUp).length,
    sold: items.filter(a => a.status === 'sold').length
  }
})

const filteredAnnouncements = computed(() => {
  let items = subscribedAnnouncements.value
  if (activeTab.value === 'changes') {
    items = items.filter(a => a.hasChanges)
  } else if (activeTab.value === 'price-drop') {
    items = items.filter(a => a.priceDrop)
  } else if (activeTab.value === 'price-up') {
    items = items.filter(a => a.priceUp)
  } else if (activeTab.value === 'sold') {
    items = items.filter(a => a.status === 'sold')
  }
  return items
})

function goToCatalog() {
  router.push('/announcements')
}

function goToNotificationSettings() {
  router.push('/profile/notifications')
}

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      subscriptionsStore.fetchSubscriptions(),
      announcementsStore.fetchAnnouncements({ perPage: 100 })
    ])
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div class="cv-subs">
    <div class="cv-subs__container">
      <Breadcrumbs />

      <header class="cv-subs__header">
        <div class="cv-subs__header-left">
          <span class="cv-subs__eyebrow">
            <span class="cv-subs__eyebrow-dot" aria-hidden="true"></span>
            Профиль · Подписки
          </span>
          <h1 class="cv-subs__title">Мои подписки</h1>
          <p class="cv-subs__subtitle">
            Следите за изменениями цены, статуса и сообщений по интересующим вас объявлениям
          </p>
        </div>

        <BaseButton
          v-if="subscribedAnnouncements.length"
          variant="outline"
          size="lg"
          class="cv-subs__cta"
          @click="goToNotificationSettings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
          Настроить уведомления
        </BaseButton>
      </header>

      <section v-if="subscribedAnnouncements.length" class="cv-subs__info">
        <span class="cv-subs__info-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </span>
        <div class="cv-subs__info-content">
          <p class="cv-subs__info-title">Чем подписка отличается от избранного?</p>
          <p class="cv-subs__info-text">
            <strong>Подписка</strong> — присылает уведомления об изменениях.
            <strong>Избранное</strong> — просто сохраняет объявление, но не следит за ним.
          </p>
        </div>
        <button
          type="button"
          class="cv-subs__info-link"
          @click="goToNotificationSettings"
        >
          Настроить
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 4l4 4-4 4"/>
          </svg>
        </button>
      </section>

      <section v-if="subscribedAnnouncements.length" class="cv-subs__stats">
        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">Всего подписок</span>
            <span class="cv-stat-card__value">{{ stats.total }}</span>
          </div>
        </div>

        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L4.5 13H11l-1 9L18.5 11H12l1-9z"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">С изменениями</span>
            <span class="cv-stat-card__value">{{ stats.changed }}</span>
          </div>
        </div>

        <div class="cv-stat-card">
          <div class="cv-stat-card__icon" data-accent="danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <div class="cv-stat-card__content">
            <span class="cv-stat-card__label">Непрочитанных</span>
            <span class="cv-stat-card__value">{{ stats.unread }}</span>
          </div>
        </div>
      </section>

      <section v-if="subscribedAnnouncements.length" class="cv-subs__toolbar">
        <div class="cv-subs__tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            role="tab"
            class="cv-subs__tab"
            :class="{ 'cv-subs__tab--active': activeTab === tab.key }"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span class="cv-subs__tab-icon" aria-hidden="true">
              <svg v-if="tab.icon === 'grid'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              <svg v-else-if="tab.icon === 'bell'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
              <svg v-else-if="tab.icon === 'arrow-down'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </svg>
              <svg v-else-if="tab.icon === 'arrow-up'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 8.5l5 5L20 2.5"/>
              </svg>
            </span>
            <span class="cv-subs__tab-label">{{ tab.label }}</span>
            <span class="cv-subs__tab-count">{{ tabCounts[tab.key] || 0 }}</span>
          </button>
        </div>
      </section>

      <section class="cv-subs__content">
        <div v-if="loading" class="cv-subs__grid">
          <AnnouncementSkeleton v-for="i in 6" :key="i" />
        </div>

        <div v-else-if="!subscribedAnnouncements.length" class="cv-subs__empty">
          <div class="cv-subs__empty-orb" aria-hidden="true"></div>

          <div class="cv-subs__empty-content">
            <span class="cv-subs__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </span>

            <h3 class="cv-subs__empty-title">У вас пока нет подписок</h3>
            <p class="cv-subs__empty-text">
              Подпишитесь на интересное объявление — и получайте уведомления
              об изменении цены, статуса и появлении новых сообщений.
            </p>

            <div class="cv-subs__empty-actions">
              <BaseButton size="lg" @click="goToCatalog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"/>
                  <path d="M20 20l-3.5-3.5"/>
                </svg>
                Перейти в каталог
              </BaseButton>

              <button
                type="button"
                class="cv-subs__empty-link"
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

        <div v-else-if="!filteredAnnouncements.length" class="cv-subs__empty">
          <div class="cv-subs__empty-content">
            <span class="cv-subs__empty-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7"/>
                <path d="M20 20l-3.5-3.5"/>
              </svg>
            </span>

            <h3 class="cv-subs__empty-title">Ничего не найдено</h3>
            <p class="cv-subs__empty-text">
              По выбранному фильтру нет подписок. Попробуйте выбрать другой раздел.
            </p>

            <BaseButton variant="outline" @click="activeTab = 'all'">
              Показать все подписки
            </BaseButton>
          </div>
        </div>

        <div v-else class="cv-subs__grid">
          <div
            v-for="announcement in filteredAnnouncements"
            :key="announcement.id"
            class="cv-subs__item"
          >
            <div v-if="announcement.hasChanges" class="cv-subs__badge" :data-type="announcement.priceDrop ? 'price-drop' : announcement.priceUp ? 'price-up' : 'info'">
              <span class="cv-subs__badge-icon" aria-hidden="true">
                <svg v-if="announcement.priceDrop" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <svg v-else-if="announcement.priceUp" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
              </span>
              <span class="cv-subs__badge-text">
                <template v-if="announcement.priceDrop && announcement.oldPrice">
                  Цена {{ formatPrice(announcement.price) }} <s>{{ formatPrice(announcement.oldPrice) }}</s>
                </template>
                <template v-else-if="announcement.priceUp && announcement.oldPrice">
                  Цена {{ formatPrice(announcement.price) }}
                </template>
                <template v-else>Есть изменения</template>
              </span>
            </div>

            <AnnouncementCard
              :announcement="announcement"
              @quick-view="$router.push(`/announcements/${announcement.id}`)"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cv-subs {
  position: relative;
  padding: 20px 0 60px;
}

.cv-subs__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cv-subs__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.cv-subs__header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.cv-subs__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-subs__eyebrow-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvSubsDot 2.2s ease-in-out infinite;
}

@keyframes cvSubsDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-subs__title {
  margin: 0;
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
}

.cv-subs__subtitle {
  margin: 0;
  max-width: 640px;
  font-size: 14.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(220, 210, 195, 0.6);
}

.cv-subs__cta {
  flex-shrink: 0;
}

.cv-subs__info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(201, 169, 97, 0.08), rgba(201, 169, 97, 0.02));
  border: 1px solid rgba(201, 169, 97, 0.22);
  border-left: 3px solid rgba(201, 169, 97, 0.7);
}

.cv-subs__info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #E8D5A0;
  flex-shrink: 0;
  margin-top: 1px;
}

.cv-subs__info-content {
  flex: 1;
  min-width: 0;
}

.cv-subs__info-title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #E8D5A0;
}

.cv-subs__info-text {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.55;
  color: rgba(245, 240, 230, 0.75);
}

.cv-subs__info-text strong {
  color: #E8D5A0;
  font-weight: 700;
}

.cv-subs__info-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.32);
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.22s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

.cv-subs__info-link:hover {
  background: rgba(201, 169, 97, 0.18);
  border-color: rgba(201, 169, 97, 0.5);
  transform: translateY(-1px);
}

.cv-subs__info-link:active {
  transform: translateY(0) scale(0.97);
}

.cv-subs__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.cv-stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 1rem;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.35) 0%, rgba(15, 13, 10, 0.45) 100%),
    linear-gradient(180deg, #14141A 0%, #0E0E12 100%);
  border: 1px solid rgba(201, 169, 97, 0.16);
  overflow: hidden;
  isolation: isolate;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(201, 169, 97, 0.03) inset,
    0 1px 0 rgba(232, 213, 160, 0.04) inset;
}

.cv-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 213, 160, 0.22) 50%, transparent);
}

.cv-stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 1px solid;
}

.cv-stat-card__icon[data-accent="accent"] {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.32);
}

.cv-stat-card__icon[data-accent="warning"] {
  color: #F0C080;
  background: rgba(217, 119, 6, 0.12);
  border-color: rgba(217, 119, 6, 0.32);
}

.cv-stat-card__icon[data-accent="danger"] {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-stat-card__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-stat-card__label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(200, 190, 175, 0.55);
}

.cv-stat-card__value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  color: rgba(245, 240, 230, 0.98);
  font-variant-numeric: tabular-nums;
}

.cv-subs__toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cv-subs__tabs {
  display: flex;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.cv-subs__tabs::-webkit-scrollbar { display: none; }

.cv-subs__tab {
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
  flex-shrink: 0;
}

.cv-subs__tab:hover:not(.cv-subs__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-subs__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow:
    0 4px 16px rgba(201, 169, 97, 0.4),
    0 1px 0 rgba(255, 245, 214, 0.4) inset;
}

.cv-subs__tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-subs__tab-label {
  white-space: nowrap;
}

.cv-subs__tab-count {
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
  transition: all 0.25s ease;
}

.cv-subs__tab--active .cv-subs__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-subs__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.cv-subs__item {
  position: relative;
}

.cv-subs__badge {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.3px;
  border-radius: 999px;
  border: 1px solid;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.cv-subs__badge[data-type="price-drop"] {
  color: #1A1208;
  background: linear-gradient(135deg, #D5E8BE, #A8C088);
  border-color: rgba(184, 206, 168, 0.6);
}

.cv-subs__badge[data-type="price-up"] {
  color: #1A1208;
  background: linear-gradient(135deg, #E8A88A, #B87755);
  border-color: rgba(232, 168, 138, 0.6);
}

.cv-subs__badge[data-type="info"] {
  color: #E8D5A0;
  background: rgba(30, 24, 14, 0.85);
  border-color: rgba(201, 169, 97, 0.45);
}

.cv-subs__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: currentColor;
}

.cv-subs__badge-text s {
  opacity: 0.65;
  text-decoration-thickness: 1.5px;
  margin-left: 4px;
}

.cv-subs__empty {
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

.cv-subs__empty-orb {
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
  animation: cvSubsEmptyOrb 4s ease-in-out infinite;
}

@keyframes cvSubsEmptyOrb {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
}

.cv-subs__empty-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 480px;
  margin: 0 auto;
}

.cv-subs__empty-icon {
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
  animation: cvSubsEmptyFloat 4s ease-in-out infinite;
}

@keyframes cvSubsEmptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.cv-subs__empty-title {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.2px;
  line-height: 1.3;
  color: rgba(245, 240, 230, 0.92);
}

.cv-subs__empty-text {
  margin: 0 0 20px;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.05px;
  line-height: 1.6;
  color: rgba(220, 210, 195, 0.6);
}

.cv-subs__empty-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.cv-subs__empty-link {
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

.cv-subs__empty-link svg {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.cv-subs__empty-link:hover {
  color: #F5E6BC;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.cv-subs__empty-link:hover svg { transform: translateX(3px); }

@media (max-width: 1280px) {
  .cv-subs__container { padding: 0 32px; }
}

@media (max-width: 1024px) {
  .cv-subs__title { font-size: 32px; letter-spacing: -0.7px; }
  .cv-subs__grid { grid-template-columns: repeat(2, 1fr); }
  .cv-subs__stats { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .cv-subs { padding: 12px 0 40px; }
  .cv-subs__container { padding: 0 20px; gap: 18px; }
  .cv-subs__header { gap: 16px; align-items: flex-start; }
  .cv-subs__header-left { width: 100%; }
  .cv-subs__title { font-size: 26px; letter-spacing: -0.5px; }
  .cv-subs__subtitle { font-size: 13.5px; }
  .cv-subs__cta { width: 100%; }

  .cv-subs__info { flex-direction: column; padding: 12px 14px; gap: 10px; }
  .cv-subs__info-link { align-self: flex-start; }

  .cv-subs__stats { grid-template-columns: 1fr; gap: 10px; }
  .cv-stat-card { padding: 16px; gap: 12px; }
  .cv-stat-card__icon { width: 36px; height: 36px; border-radius: 10px; }
  .cv-stat-card__value { font-size: 20px; }
  .cv-stat-card__label { font-size: 9.5px; }

  .cv-subs__tabs { padding: 5px; gap: 4px; }
  .cv-subs__tab { padding: 8px 12px; font-size: 12px; gap: 6px; }
  .cv-subs__tab-count { min-width: 20px; height: 18px; font-size: 10px; padding: 0 6px; }

  .cv-subs__grid { grid-template-columns: 1fr; gap: 14px; }

  .cv-subs__badge { padding: 5px 10px; font-size: 10.5px; top: 10px; left: 10px; }

  .cv-subs__empty { padding: 52px 20px 44px; border-radius: 1rem; }
  .cv-subs__empty-icon { width: 72px; height: 72px; border-radius: 20px; }
  .cv-subs__empty-title { font-size: 17px; }
  .cv-subs__empty-text { font-size: 13px; }
  .cv-subs__empty-actions { flex-direction: column; width: 100%; gap: 12px; }
  .cv-subs__empty-actions > * { width: 100%; }
  .cv-subs__empty-link { justify-content: center; }
}
</style>