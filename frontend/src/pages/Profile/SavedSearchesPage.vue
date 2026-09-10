<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import { useToastStore } from '@/stores/toast'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import { formatDate } from '@/utils/formatDate'

const router = useRouter()
const subscriptionsStore = useSubscriptionsStore()
const toastStore = useToastStore()

const loading = ref(true)
const showDeleteModal = ref(false)
const searchToDelete = ref(null)

onMounted(async () => {
  try {
    await subscriptionsStore.fetchSavedSearches()
  } finally {
    loading.value = false
  }
})

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
</script>

<template>
  <div class="saved-searches-page">
    <div class="container">
      <Breadcrumbs />
      
      <div class="saved-searches-page__header">
        <h1 class="saved-searches-page__title">Сохранённые поиски</h1>
        <p class="saved-searches-page__count">
          {{ subscriptionsStore.savedSearches.length }} поисков
        </p>
      </div>
      
      <EmptyState
        v-if="!loading && !subscriptionsStore.savedSearches.length"
        icon="search"
        title="Нет сохранённых поисков"
        description="Сохраняйте параметры поиска, чтобы быстро возвращаться к ним"
        action-text="Найти автомобиль"
        action-link="/announcements"
      />
      
      <div v-else class="saved-searches-page__list">
        <article
          v-for="search in subscriptionsStore.savedSearches"
          :key="search.id"
          class="saved-search"
        >
          <div class="saved-search__content">
            <h3 class="saved-search__name">{{ search.name }}</h3>
            
            <div class="saved-search__filters">
              <span v-if="search.filters.brand" class="saved-search__filter">
                {{ search.filters.brand }}
              </span>
              <span v-if="search.filters.model" class="saved-search__filter">
                {{ search.filters.model }}
              </span>
              <span v-if="search.filters.priceTo" class="saved-search__filter">
                до {{ Number(search.filters.priceTo).toLocaleString('ru-RU') }} ₽
              </span>
              <span v-if="search.filters.yearFrom" class="saved-search__filter">
                от {{ search.filters.yearFrom }} г.
              </span>
              <span v-if="search.filters.bodyType" class="saved-search__filter">
                {{ search.filters.bodyType }}
              </span>
            </div>
            
            <p class="saved-search__date">
              Создан: {{ formatDate(search.createdAt, 'short') }}
            </p>
          </div>
          
          <div class="saved-search__actions">
            <BaseButton size="sm" @click="applySearch(search)">
              Показать
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="confirmDelete(search)"
            >
              Удалить
            </BaseButton>
          </div>
        </article>
      </div>
    </div>
    
    <ConfirmModal
      v-model="showDeleteModal"
      title="Удалить поиск?"
      message="Вы уверены, что хотите удалить этот сохранённый поиск?"
      confirm-text="Удалить"
      @confirm="handleDelete"
    />
  </div>
</template>

<style scoped>
.saved-searches-page {
  padding: 20px 0 40px;
}

.saved-searches-page__header {
  margin-bottom: 32px;
}

.saved-searches-page__title {
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
}

.saved-searches-page__count {
  font-size: 14px;
  color: #6B7280;
}

.saved-searches-page__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saved-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.saved-search:hover {
  border-color: #0A84FF;
}

.saved-search__content {
  flex: 1;
  min-width: 0;
}

.saved-search__name {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.saved-search__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.saved-search__filter {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #0A84FF;
  background: #F0F7FF;
  border-radius: 6px;
}

.saved-search__date {
  font-size: 12px;
  color: #9CA3AF;
}

.saved-search__actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 640px) {
  .saved-search {
    flex-direction: column;
    align-items: stretch;
  }
  
  .saved-search__actions {
    justify-content: flex-end;
  }
}
</style>