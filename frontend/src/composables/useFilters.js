import { ref, computed, watch, readonly } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Хелпер: значение считается «пустым» (не активным фильтром).
 * Пустое: '', null, undefined, пустой массив, false, 0 (опционально).
 */
function isEmpty(value, { zeroIsEmpty = false } = {}) {
  if (value === '' || value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0
  if (value === false) return true
  if (zeroIsEmpty && value === 0) return true
  return false
}

/** Преобразовать значение для URL — массивы в CSV, объекты в JSON */
function serialize(value) {
  if (Array.isArray(value)) return value.join(',')
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return value
}

/** Обратное преобразование из URL */
function deserialize(value, initial) {
  if (value === undefined) return undefined

  // Если изначально был массив — парсим CSV
  if (Array.isArray(initial)) {
    if (Array.isArray(value)) return value.flatMap(v => v.split(','))
    return String(value).split(',').filter(Boolean)
  }

  // Число
  if (typeof initial === 'number') {
    const num = Number(value)
    return Number.isNaN(num) ? initial : num
  }

  // Boolean
  if (typeof initial === 'boolean') {
    return value === 'true' || value === true
  }

  // Массив query-параметров (если ?a=1&a=2)
  if (Array.isArray(value)) return value[0]

  return value
}

/**
 * Composable для управления фильтрами с синхронизацией с URL.
 *
 * @param {Object}  [initialFilters={}] — начальные значения (дефолты)
 * @param {Object}  [options={}]
 * @param {boolean} [options.syncWithUrl=false] — синхронизировать с query
 * @param {string}  [options.routePath] — путь для replace (по умолчанию — текущий)
 * @param {number}  [options.debounce=0] — мс, задержка перед syncToUrl
 * @param {boolean} [options.zeroIsEmpty=false] — считать 0 пустым значением
 * @returns {Object}
 */
export function useFilters(initialFilters = {}, options = {}) {
  const {
    syncWithUrl = false,
    routePath,
    debounce = 0,
    zeroIsEmpty = false
  } = options

  const router = useRouter()
  const route = useRoute()

  // Копия дефолтов — чтобы resetFilters не зависел от мутаций снаружи
  const defaults = JSON.parse(JSON.stringify(initialFilters))

  // === Инициализация из URL (если syncWithUrl) ===
  function readFromUrl() {
    const next = { ...defaults }
    if (!syncWithUrl) return next

    Object.keys(defaults).forEach(key => {
      const parsed = deserialize(route.query[key], defaults[key])
      if (parsed !== undefined) {
        next[key] = parsed
      }
    })
    return next
  }

  const filters = ref(readFromUrl())

  // === Активные фильтры ===
  const activeCount = computed(() =>
    Object.values(filters.value).filter(v =>
      !isEmpty(v, { zeroIsEmpty })
    ).length
  )

  const isActive = computed(() => activeCount.value > 0)

  // === Синхронизация в URL ===
  let syncTimer = null

  function buildQuery() {
    const query = {}
    Object.entries(filters.value).forEach(([key, value]) => {
      if (!isEmpty(value, { zeroIsEmpty })) {
        query[key] = serialize(value)
      }
    })
    return query
  }

  function syncToUrl() {
    if (!syncWithUrl) return

    const query = buildQuery()
    const target = routePath || route.path

    router.replace({ path: target, query }).catch(() => {
      // Игнорируем NavigationDuplicated и подобное
    })
  }

  function scheduleSyncToUrl() {
    if (!syncWithUrl) return
    if (!debounce) return syncToUrl()

    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(syncToUrl, debounce)
  }

  // === Двусторонняя синхронизация при навигации браузера (back/forward) ===
  if (syncWithUrl) {
    watch(
      () => route.query,
      (newQuery, oldQuery) => {
        // Пропускаем если это наша же запись (иначе цикл)
        if (JSON.stringify(newQuery) === JSON.stringify(buildQuery())) return
        filters.value = readFromUrl()
      },
      { deep: true }
    )
  }

  // === Управление ===
  function updateFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
    scheduleSyncToUrl()
  }

  function setFilter(key, value) {
    filters.value = { ...filters.value, [key]: value }
    scheduleSyncToUrl()
  }

  function toggleFilterValue(key, value) {
    const current = filters.value[key]
    if (Array.isArray(current)) {
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      setFilter(key, next)
    } else {
      setFilter(key, current === value ? defaults[key] : value)
    }
  }

  function resetFilters() {
    filters.value = { ...defaults }
    scheduleSyncToUrl()
  }

  function removeFilter(key) {
    setFilter(key, defaults[key] ?? '')
  }

  return {
    filters,
    activeCount,
    isActive,
    updateFilters,
    setFilter,
    toggleFilterValue,
    resetFilters,
    removeFilter
  }
}