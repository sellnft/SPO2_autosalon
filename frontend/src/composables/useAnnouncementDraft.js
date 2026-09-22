import { ref, onUnmounted } from 'vue'

const STORAGE_KEY = 'announcement_draft'
const AUTOSAVE_DELAY = 1000
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 дней
const SCHEMA_VERSION = 1

/**
 * Composable для работы с черновиком объявления в localStorage.
 * - Автосохранение с debounce
 * - Проверка TTL (черновик живёт 7 дней)
 * - Версионирование схемы
 * - Безопасность при SSR / отключённом localStorage
 */
export function useAnnouncementDraft() {
  const draft = ref(null)
  let saveTimeout = null

  /** Безопасный доступ к localStorage (SSR-guard) */
  function getStorage() {
    if (typeof window === 'undefined') return null
    try {
      // Проверка что localStorage доступен (приватный режим Safari и т.п.)
      const testKey = '__cv_test__'
      window.localStorage.setItem(testKey, '1')
      window.localStorage.removeItem(testKey)
      return window.localStorage
    } catch {
      return null
    }
  }

  /** Внутренний парсинг с TTL-проверкой и версионированием */
  function parseDraft(raw) {
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)

      // Проверка структуры обёртки
      if (!parsed || typeof parsed !== 'object') return null
      if (!('version' in parsed) || !('data' in parsed)) return null

      // Проверка версии схемы
      if (parsed.version !== SCHEMA_VERSION) return null

      // Проверка TTL
      if (parsed.savedAt && Date.now() - parsed.savedAt > DRAFT_TTL) {
        clearDraft()
        return null
      }

      return parsed.data
    } catch {
      return null
    }
  }

  /** Загрузить черновик из localStorage */
  function loadDraft() {
    const storage = getStorage()
    if (!storage) return null

    const data = parseDraft(storage.getItem(STORAGE_KEY))
    draft.value = data
    return data
  }

  /** Сохранить черновик в localStorage */
  function saveDraft(data) {
    const storage = getStorage()
    if (!storage) return

    try {
      const payload = {
        version: SCHEMA_VERSION,
        savedAt: Date.now(),
        data
      }
      storage.setItem(STORAGE_KEY, JSON.stringify(payload))
      draft.value = data
    } catch (err) {
      // QuotaExceededError и др. — не валим UI
      console.warn('[useAnnouncementDraft] save failed:', err?.message || err)
    }
  }

  /** Удалить черновик */
  function clearDraft() {
    const storage = getStorage()
    if (storage) {
      try {
        storage.removeItem(STORAGE_KEY)
      } catch {
        /* no-op */
      }
    }
    draft.value = null
  }

  /** Debounced автосохранение */
  function autoSave(data) {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveDraft(data)
      saveTimeout = null
    }, AUTOSAVE_DELAY)
  }

  /** Отменить отложенное сохранение (например, при закрытии формы) */
  function cancelAutoSave() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }
  }

  /** Есть ли сохранённый черновик (без парсинга) */
  function hasDraft() {
    const storage = getStorage()
    if (!storage) return false
    return storage.getItem(STORAGE_KEY) !== null
  }

  /** Метаданные черновика — когда сохранён, какая версия */
  function getDraftMeta() {
    const storage = getStorage()
    if (!storage) return null

    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return null

      const parsed = JSON.parse(raw)
      return {
        version: parsed.version,
        savedAt: parsed.savedAt,
        ageMs: parsed.savedAt ? Date.now() - parsed.savedAt : null
      }
    } catch {
      return null
    }
  }

  // Очистка таймера при unmount компонента — предотвращает утечку памяти
  onUnmounted(() => {
    cancelAutoSave()
  })

  return {
    draft,
    loadDraft,
    saveDraft,
    clearDraft,
    autoSave,
    cancelAutoSave,
    hasDraft,
    getDraftMeta
  }
}