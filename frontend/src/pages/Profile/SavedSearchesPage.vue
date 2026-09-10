<script setup>
import { ref, onMounted } from 'vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const subscriptionsStore = useSubscriptionsStore()
const loading = ref(true)

onMounted(async () => {
  try {
    await subscriptionsStore.fetchSavedSearches()
  } finally {
    loading.value = false
  }
})

async function deleteSearch(id) {
  await subscriptionsStore.deleteSavedSearch(id)
}
</script>

<template>
  <div class="saved-searches-page">
    <div class="container">
      <h1 class="saved-searches-page__title">Сохранённые поиски</h1>
      
      <EmptyState
        v-if="!loading && !subscriptionsStore.savedSearches.length"
        icon="search"
        title="Нет сохранённых поисков"
        description="Сохраняйте поиски, чтобы быстро находить нужные автомобили"
        action-text="Найти автомобиль"
        action-link="/announcements"
      />
      
      <div v-else class="saved-searches-page__list">
        <div
          v-for="search in subscriptionsStore.savedSearches"
          :key="search.id"
          class="saved-search"
        >
          <div class="saved-search__info">
            <h3 class="saved-search__name">{{ search.name }}</h3>
            <div class="saved-search__filters">
              <span v-if="search.filters.brand" class="saved-search__filter">
                {{ search.filters.brand }}
              </span>
              <span v-if="search.filters.priceTo" class="saved-search__filter">
                до {{ search.filters.priceTo }} ₽
              </span>
              <span v-if="search.filters.yearFrom" class="saved-search__filter">
                от {{ search.filters.yearFrom }} года
              </span>
            </div>
          </div>
          
          <div class="saved-search__actions">
            <BaseButton
              variant="outline"
              size="sm"
              @click="$router.push({ path: '/announcements', query: search.filters })"
            >
              Показать
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="deleteSearch(search.id)"
            >
              Удалить
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.saved-searches-page {
  padding: 40px 0;
}

.saved-searches-page__title {
  margin-bottom: 32px;
  font-size: 32px;
  font-weight: 700;
}

.saved-searches-page__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border-radius: 12px;
}

.saved-search__name {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.saved-search__filters {
  display: flex;
  gap: 8px;
}

.saved-search__filter {
  padding: 4px 8px;
  font-size: 12px;
  color: #0A84FF;
  background: #F0F7FF;
  border-radius: 4px;
}

.saved-search__actions {
  display: flex;
  gap: 8px;
}
</style>