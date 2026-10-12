<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import { useToastStore } from '@/stores/toast'
import NotificationList from '@/components/notifications/NotificationList.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

defineOptions({ name: 'NotificationsPage' })

const router = useRouter()
const notificationsStore = useNotificationsStore()
const toastStore = useToastStore()

/* ============================================================
 *  Состояние страницы
 * ============================================================ */
const activeTab = ref('all')      // 'all' | 'unread'
const search = ref('')
const page = ref(1)
const perPage = 20
const showClearAllModal = ref(false)

/* ============================================================
 *  Store-биндинги
 * ============================================================ */
const allNotifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const totalCount = computed(() => notificationsStore.total || allNotifications.value.length)
const loading = computed(() => notificationsStore.loading)
const loadingMore = computed(() => notificationsStore.loadingMore)
const mutating = computed(() => notificationsStore.mutating)
const storeError = computed(() => notificationsStore.error)

const hasMore = computed(() => allNotifications.value.length < totalCount.value)

/* ============================================================
 *  Фильтрация (клиентская)
 * ============================================================ */
const filteredNotifications = computed(() => {
  let list = allNotifications.value

  if (activeTab.value === 'unread') {
    list = list.filter(n => !n.read)
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter(n => {
      const title = String(n.title || '').toLowerCase()
      const text = String(n.message || n.text || '').toLowerCase()
      return title.includes(q) || text.includes(q)
    })
  }

  return list
})

const isFiltering = computed(() =>
  activeTab.value !== 'all' || search.value.trim().length > 0
)

/* ============================================================
 *  Загрузка
 * ============================================================ */
async function load({ reset = false } = {}) {
  if (reset) page.value = 1

  try {
    await notificationsStore.fetchNotifications(
      { page: page.value, perPage },
      { append: !reset && page.value > 1 }
    )
  } catch (err) {
    // error уже в сторе
  }
}

function loadMore() {
  if (loadingMore.value || loading.value || !hasMore.value) return
  page.value += 1
  load()
}

/* ============================================================
 *  Действия
 * ============================================================ */
async function handleItemClick(notification) {
  // NotificationItem уже сам делает markAsRead и router.push,
  // потому что manual=false в List. Здесь — только для логов/аналитики.
}

async function handleMarkRead(notification) {
  try {
    await notificationsStore.markAsRead(notification.id)
  } catch (err) {
    toastStore.error('Не удалось отметить уведомление')
  }
}

async function handleDelete(notification) {
  try {
    await notificationsStore.deleteNotification(notification.id)
    toastStore.success('Уведомление удалено')
  } catch (err) {
    toastStore.error('Не удалось удалить уведомление')
  }
}

async function markAllAsRead() {
  if (!unreadCount.value) return
  try {
    await notificationsStore.markAllAsRead()
    toastStore.success('Все уведомления прочитаны')
  } catch (err) {
    toastStore.error('Не удалось отметить все уведомления')
  }
}

async function clearAll() {
  try {
    await notificationsStore.clearAll()
    showClearAllModal.value = false
    page.value = 1
    toastStore.success('Все уведомления удалены')
  } catch (err) {
    toastStore.error('Не удалось очистить уведомления')
  }
}

function goToSettings() {
  router.push({ name: 'notification-settings' })
}

function resetFilters() {
  activeTab.value = 'all'
  search.value = ''
}

/* ============================================================
 *  Lifecycle
 * ============================================================ */
onMounted(() => {
  // Грузим только если стор ещё пуст, чтобы не дублировать запросы
  if (!allNotifications.value.length) {
    load({ reset: true })
  } else {
    // На случай, если unreadCount устарел
    notificationsStore.fetchUnreadCount?.()
  }
})
</script>

<template>
  <div class="cv-nf">
    <header class="cv-nf__header">
      <div class="cv-nf__header-left">
        <span class="cv-nf__eyebrow">
          <span class="cv-nf__eyebrow-dot" aria-hidden="true"></span>
          Личный кабинет · Уведомления
        </span>
        <h1 class="cv-nf__title">Уведомления</h1>
        <p class="cv-nf__subtitle">
          <template v-if="unreadCount">
            <strong>{{ unreadCount }}</strong> непрочитанных из {{ totalCount }}
          </template>
          <template v-else-if="totalCount">Всё прочитано · {{ totalCount }} всего</template>
          <template v-else>Здесь будут появляться важные события</template>
        </p>
      </div>

      <div class="cv-nf__actions">
        <BaseButton
          v-if="unreadCount"
          variant="outline"
          size="sm"
          :disabled="mutating"
          @click="markAllAsRead"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8.5l5 5L20 2.5"/>
          </svg>
          Прочитать все
        </BaseButton>

        <BaseButton
          v-if="totalCount"
          variant="ghost"
          size="sm"
          :disabled="mutating"
          @click="showClearAllModal = true"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
          Очистить всё
        </BaseButton>

        <BaseButton variant="ghost" size="sm" @click="goToSettings">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
          </svg>
          Настройки
        </BaseButton>
      </div>
    </header>

    <!-- TOOLBAR -->
    <section class="cv-nf__toolbar">
      <div class="cv-nf__tabs">
        <button
          type="button"
          class="cv-nf__tab"
          :class="{ 'cv-nf__tab--active': activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          Все
          <span class="cv-nf__tab-count">{{ totalCount }}</span>
        </button>
        <button
          type="button"
          class="cv-nf__tab"
          :class="{ 'cv-nf__tab--active': activeTab === 'unread' }"
          @click="activeTab = 'unread'"
        >
          Непрочитанные
          <span
            class="cv-nf__tab-count"
            :class="{ 'cv-nf__tab-count--accent': unreadCount > 0 }"
          >
            {{ unreadCount }}
          </span>
        </button>
      </div>

      <div class="cv-nf__search">
        <span class="cv-nf__search-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"/>
            <path d="M20 20l-3.5-3.5"/>
          </svg>
        </span>
        <input
          v-model="search"
          type="text"
          class="cv-nf__search-input"
          placeholder="Поиск по уведомлениям..."
        />
        <button
          v-if="search"
          type="button"
          class="cv-nf__search-clear"
          aria-label="Очистить"
          @click="search = ''"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4l8 8M12 4l-8 8"/>
          </svg>
        </button>
      </div>
    </section>

    <!-- ERROR -->
    <section v-if="storeError && !loading" class="cv-nf__error">
      <span class="cv-nf__error-icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 8v5M12 17h.01"/>
        </svg>
      </span>
      <div class="cv-nf__error-body">
        <p class="cv-nf__error-title">Не удалось загрузить уведомления</p>
        <p class="cv-nf__error-text">{{ storeError }}</p>
      </div>
      <BaseButton variant="outline" size="sm" @click="load({ reset: true })">
        Повторить
      </BaseButton>
    </section>

    <!-- LOADING -->
    <div v-else-if="loading && !allNotifications.length" class="cv-nf__list">
      <div v-for="i in 5" :key="i" class="cv-nf__skeleton"></div>
    </div>

    <!-- EMPTY -->
    <div v-else-if="!filteredNotifications.length" class="cv-nf__empty">
      <span class="cv-nf__empty-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </span>
      <p class="cv-nf__empty-title">
        <template v-if="isFiltering">Ничего не найдено</template>
        <template v-else>Уведомлений пока нет</template>
      </p>
      <p class="cv-nf__empty-hint">
        <template v-if="isFiltering">Попробуйте изменить фильтр или запрос</template>
        <template v-else>Как только появятся события — они отобразятся здесь</template>
      </p>
      <BaseButton v-if="isFiltering" variant="outline" size="sm" @click="resetFilters">
        Сбросить фильтры
      </BaseButton>
    </div>

    <!-- LIST -->
    <template v-else>
      <NotificationList
        :notifications="filteredNotifications"
        :actions="true"
        :manual="false"
        :hide-header="true"
        :show-empty="false"
        @mark-read="handleMarkRead"
        @delete="handleDelete"
      />

      <div v-if="hasMore" class="cv-nf__more">
        <BaseButton
          variant="outline"
          :loading="loadingMore"
          @click="loadMore"
        >
          <svg v-if="!loadingMore" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Загрузить ещё
        </BaseButton>
      </div>
    </template>

    <!-- CONFIRM CLEAR ALL -->
    <ConfirmModal
      v-model="showClearAllModal"
      title="Очистить все уведомления?"
      message="Действие необратимо — все уведомления будут удалены из вашего аккаунта."
      confirm-text="Очистить"
      variant="danger"
      @confirm="clearAll"
    />
  </div>
</template>

<style scoped>
.cv-nf {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cv-nf__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.cv-nf__header-left { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

.cv-nf__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.85);
}

.cv-nf__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F5E6BC, #C9A961);
  box-shadow: 0 0 10px rgba(201, 169, 97, 0.8);
  animation: cvNfDot 2.2s ease-in-out infinite;
}

@keyframes cvNfDot {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.cv-nf__title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: rgba(245, 240, 230, 0.98);
}

.cv-nf__subtitle {
  margin: 0;
  font-size: 13.5px;
  color: rgba(220, 210, 195, 0.6);
}

.cv-nf__subtitle strong { color: #E8D5A0; font-weight: 800; }

.cv-nf__actions {
  display: inline-flex;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.cv-nf__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.cv-nf__tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(201, 169, 97, 0.14);
}

.cv-nf__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 650;
  color: rgba(220, 210, 195, 0.65);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.cv-nf__tab:hover:not(.cv-nf__tab--active) {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.08);
}

.cv-nf__tab--active {
  color: #1A1208;
  background: linear-gradient(135deg, #F5E6BC 0%, #C9A961 55%, #8B6F3F 100%);
  border-color: rgba(232, 213, 160, 0.5);
  box-shadow: 0 4px 16px rgba(201, 169, 97, 0.4);
}

.cv-nf__tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 6px;
  font-size: 10.5px;
  font-weight: 800;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.cv-nf__tab--active .cv-nf__tab-count {
  color: #1A1208;
  background: rgba(255, 245, 214, 0.5);
  border-color: rgba(255, 245, 214, 0.4);
}

.cv-nf__tab-count--accent {
  color: #E8D5A0;
  background: rgba(201, 169, 97, 0.14);
  border-color: rgba(201, 169, 97, 0.3);
}

.cv-nf__search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 240px;
  flex: 1;
  max-width: 340px;
  padding: 9px 12px 9px 14px;
  background:
    linear-gradient(180deg, rgba(28, 24, 18, 0.5), rgba(15, 13, 10, 0.6)),
    linear-gradient(180deg, #16161C 0%, #101014 100%);
  border: 1.5px solid rgba(201, 169, 97, 0.2);
  border-radius: 11px;
  transition: all 0.22s ease;
}

.cv-nf__search:focus-within {
  border-color: rgba(201, 169, 97, 0.55);
  box-shadow:
    0 0 0 3px rgba(201, 169, 97, 0.1),
    0 0 24px rgba(201, 169, 97, 0.1);
}

.cv-nf__search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(201, 169, 97, 0.65);
  flex-shrink: 0;
}

.cv-nf__search-input {
  flex: 1;
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: rgba(245, 240, 230, 0.95);
  background: transparent;
  border: none;
  outline: none;
}

.cv-nf__search-input::placeholder { color: rgba(200, 190, 175, 0.45); }

.cv-nf__search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: rgba(200, 190, 175, 0.5);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.cv-nf__search-clear:hover {
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border-color: rgba(184, 119, 85, 0.35);
}

.cv-nf__error {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(184, 119, 85, 0.1), rgba(184, 119, 85, 0.02));
  border: 1px solid rgba(184, 119, 85, 0.32);
}

.cv-nf__error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 11px;
  color: #E8A88A;
  background: rgba(184, 119, 85, 0.15);
  border: 1px solid rgba(184, 119, 85, 0.35);
}

.cv-nf__error-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cv-nf__error-title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.95);
}

.cv-nf__error-text {
  margin: 0;
  font-size: 12px;
  color: rgba(200, 190, 175, 0.6);
}

.cv-nf__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-nf__skeleton {
  height: 84px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  overflow: hidden;
}

.cv-nf__skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 97, 0.08) 50%, transparent);
  animation: cvNfShimmer 1.8s ease-in-out infinite;
}

@keyframes cvNfShimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.cv-nf__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 24px;
  text-align: center;
  border-radius: 16px;
  border: 1px dashed rgba(201, 169, 97, 0.16);
}

.cv-nf__empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  color: rgba(201, 169, 97, 0.55);
  background: rgba(201, 169, 97, 0.06);
  border: 1px solid rgba(201, 169, 97, 0.18);
  margin-bottom: 6px;
}

.cv-nf__empty-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: rgba(245, 240, 230, 0.85);
}

.cv-nf__empty-hint {
  margin: 0 0 6px;
  font-size: 12.5px;
  color: rgba(200, 190, 175, 0.5);
}

.cv-nf__more {
  display: flex;
  justify-content: center;
  padding: 8px 0 0;
}

@media (max-width: 1024px) {
  .cv-nf { padding: 32px 24px 60px; }
  .cv-nf__title { font-size: 26px; }
}

@media (max-width: 768px) {
  .cv-nf { padding: 20px 16px 60px; gap: 16px; }
  .cv-nf__title { font-size: 24px; }
  .cv-nf__actions { width: 100%; }
  .cv-nf__actions > * { flex: 1; justify-content: center; }
  .cv-nf__toolbar { flex-direction: column; align-items: stretch; }
  .cv-nf__tabs { width: 100%; }
  .cv-nf__tab { flex: 1; justify-content: center; }
  .cv-nf__search { max-width: none; }
}
</style>