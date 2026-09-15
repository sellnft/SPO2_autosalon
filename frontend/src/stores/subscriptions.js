import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { subscriptionsApi } from '@/services/api/subscriptionsApi'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const subscriptions = ref([])
  const savedSearches = ref([])
  const loading = ref(false)
  const error = ref(null)

  const subscriptionsCount = computed(() => subscriptions.value.length)
  const savedSearchesCount = computed(() => savedSearches.value.length)
  const subscribedIds = computed(() => subscriptions.value.map(s => s.announcementId))

  async function fetchSubscriptions() {
    loading.value = true
    error.value = null
    try {
      subscriptions.value = await subscriptionsApi.getSubscriptions()
      return subscriptions.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSavedSearches() {
    loading.value = true
    error.value = null
    try {
      savedSearches.value = await subscriptionsApi.getSavedSearches()
      return savedSearches.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function subscribe(announcementId) {
    try {
      const subscription = await subscriptionsApi.subscribe(announcementId)
      subscriptions.value.push(subscription)
      return subscription
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function unsubscribe(announcementId) {
    try {
      await subscriptionsApi.unsubscribe(announcementId)
      subscriptions.value = subscriptions.value.filter(
        s => s.announcementId !== Number(announcementId)
      )
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function saveSearch(searchData) {
    try {
      const search = await subscriptionsApi.saveSearch(searchData)
      savedSearches.value.push(search)
      return search
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deleteSavedSearch(searchId) {
    try {
      await subscriptionsApi.deleteSavedSearch(searchId)
      savedSearches.value = savedSearches.value.filter(
        s => s.id !== Number(searchId)
      )
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function isSubscribed(announcementId) {
    return subscriptions.value.some(s => s.announcementId === Number(announcementId))
  }

  function reset() {
    subscriptions.value = []
    savedSearches.value = []
    error.value = null
  }

  return {
    subscriptions,
    savedSearches,
    loading,
    error,
    subscriptionsCount,
    savedSearchesCount,
    subscribedIds,
    fetchSubscriptions,
    fetchSavedSearches,
    subscribe,
    unsubscribe,
    saveSearch,
    deleteSavedSearch,
    isSubscribed,
    reset
  }
})