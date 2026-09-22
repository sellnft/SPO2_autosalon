import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/* ============================================================
 *  Константы
 * ============================================================ */

/** Допустимые типы тостов */
const ToastType = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
})

const DEFAULT_DURATION = 5000
const MAX_TOASTS = 5

/* ============================================================
 *  Утилиты
 * ============================================================ */

/** Стабильный id, устойчивый к HMR */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useToastStore = defineStore('toast', () => {
  /* ============================================================
   *  STATE
   * ============================================================ */

  const toasts = ref([])

  /** Таймеры по id (для pause/resume/remove) */
  const timers = new Map()

  /** Время окончания у каждого тоста (для resume) */
  const endsAt = new Map()

  /* ============================================================
   *  GETTERS
   * ============================================================ */

  const count = computed(() => toasts.value.length)
  const hasToasts = computed(() => toasts.value.length > 0)
  const hasErrors = computed(() =>
    toasts.value.some(t => t.type === ToastType.ERROR)
  )

  /* ============================================================
   *  ВНУТРЕННИЕ
   * ============================================================ */

  function clearTimer(id) {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    endsAt.delete(id)
  }

  function scheduleRemove(id, duration) {
    clearTimer(id)

    if (!duration || duration <= 0) return // sticky

    endsAt.set(id, Date.now() + duration)
    const timer = setTimeout(() => remove(id), duration)
    timers.set(id, timer)
  }

  /**
   * Проверка на дубликат — тот же тип + то же сообщение.
   * Если найден — обновляем его (сбрасываем таймер, ставим в конец).
   */
  function findDuplicate(type, message) {
    return toasts.value.find(
      t => t.type === type && t.message === message
    )
  }

  /** Обрезать до MAX_TOASTS (удаляем самые старые) */
  function enforceMaxToasts() {
    if (toasts.value.length <= MAX_TOASTS) return

    const excess = toasts.value.length - MAX_TOASTS
    const removed = toasts.value.slice(0, excess)
    removed.forEach(t => clearTimer(t.id))
    toasts.value = toasts.value.slice(excess)
  }

  /* ============================================================
   *  PUBLIC API
   * ============================================================ */

  /**
   * Показать тост.
   * @param {Object} options
   * @param {string} [options.type='info'] — 'success' | 'error' | 'warning' | 'info' | 'loading'
   * @param {string} [options.title]
   * @param {string} [options.message]
   * @param {number} [options.duration=5000] — 0 = не закрывать автоматически
   * @param {Array<{label, onClick, variant?}>} [options.actions] — кнопки действий
   * @param {boolean} [options.deduplicate=true] — не плодить одинаковые
   * @param {boolean} [options.sticky=false] — синоним duration: 0
   * @returns {string} id тоста
   */
  function show(options = {}) {
    const {
      type = ToastType.INFO,
      title = '',
      message = '',
      duration = DEFAULT_DURATION,
      actions = null,
      deduplicate = true,
      sticky = false
    } = options

    // Валидация типа — если опечатка, ставим info
    const safeType = Object.values(ToastType).includes(type)
      ? type
      : ToastType.INFO

    // Дедупликация
    if (deduplicate && message) {
      const dup = findDuplicate(safeType, message)
      if (dup) {
        clearTimer(dup.id)
        // Перемещаем в конец — свежий поверх старых
        toasts.value = [
          ...toasts.value.filter(t => t.id !== dup.id),
          { ...dup, createdAt: Date.now() }
        ]
        const finalDuration = sticky ? 0 : duration
        scheduleRemove(dup.id, finalDuration)
        return dup.id
      }
    }

    const id = generateId()
    const finalDuration = sticky ? 0 : duration

    toasts.value = [
      ...toasts.value,
      {
        id,
        type: safeType,
        title,
        message,
        duration: finalDuration,
        actions,
        createdAt: Date.now(),
        paused: false
      }
    ]

    enforceMaxToasts()
    scheduleRemove(id, finalDuration)

    return id
  }

  /* ---------- Shorthands ---------- */

  function success(message, title = '', opts = {}) {
    return show({ type: ToastType.SUCCESS, message, title, ...opts })
  }

  function error(message, title = '', opts = {}) {
    // Ошибки по умолчанию не дедуплицируем — важно видеть все
    return show({
      type: ToastType.ERROR,
      message,
      title,
      deduplicate: false,
      ...opts
    })
  }

  function warning(message, title = '', opts = {}) {
    return show({ type: ToastType.WARNING, message, title, ...opts })
  }

  function info(message, title = '', opts = {}) {
    return show({ type: ToastType.INFO, message, title, ...opts })
  }

  /**
   * Показать загрузочный тост (sticky). Вернёт id, чтобы потом
   * закрыть через `resolve` / `reject`.
   */
  function loading(message, title = '') {
    return show({
      type: ToastType.LOADING,
      message,
      title,
      sticky: true,
      deduplicate: false
    })
  }

  /** Превратить loading-тост в success */
  function resolveLoading(id, message = '', title = '') {
    update(id, {
      type: ToastType.SUCCESS,
      message: message || undefined,
      title: title || undefined
    })
    // Пере-планируем закрытие
    scheduleRemove(id, 3000)
  }

  /** Превратить loading-тост в error */
  function rejectLoading(id, message = '', title = '') {
    update(id, {
      type: ToastType.ERROR,
      message: message || undefined,
      title: title || undefined
    })
    scheduleRemove(id, 5000)
  }

  /* ---------- Update / Remove ---------- */

  /**
   * Обновить существующий тост (например, во время загрузки).
   */
  function update(id, patch) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx === -1) return false

    toasts.value = [
      ...toasts.value.slice(0, idx),
      { ...toasts.value[idx], ...patch },
      ...toasts.value.slice(idx + 1)
    ]
    return true
  }

  function remove(id) {
    clearTimer(id)
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function clear() {
    timers.forEach(timer => clearTimeout(timer))
    timers.clear()
    endsAt.clear()
    toasts.value = []
  }

  /**
   * Удалить все тосты указанного типа.
   */
  function clearByType(type) {
    const toRemove = toasts.value.filter(t => t.type === type)
    toRemove.forEach(t => clearTimer(t.id))
    toasts.value = toasts.value.filter(t => t.type !== type)
  }

  /* ---------- Pause / Resume (при hover) ---------- */

  /**
   * Приостановить автозакрытие (обычно на mouseenter).
   */
  function pause(id) {
    const ends = endsAt.get(id)
    if (!ends) return // sticky или уже пауза

    const remaining = Math.max(0, ends - Date.now())

    clearTimer(id)
    update(id, { paused: true, remaining })

    // Сохраняем remaining, чтобы resume мог восстановить
    endsAt.set(id, remaining)
  }

  /**
   * Возобновить автозакрытие (обычно на mouseleave).
   */
  function resume(id) {
    const remaining = endsAt.get(id)
    if (!remaining) return

    const ends = typeof remaining === 'number'
      ? remaining
      : remaining - Date.now()

    if (ends <= 0) {
      remove(id)
      return
    }

    update(id, { paused: false })
    scheduleRemove(id, ends)
  }

  /* ============================================================
   *  EXPORT
   * ============================================================ */

  return {
    // State
    toasts,

    // Getters
    count,
    hasToasts,
    hasErrors,

    // Core
    show,
    update,
    remove,
    clear,

    // Shorthands
    success,
    error,
    warning,
    info,
    loading,
    resolveLoading,
    rejectLoading,

    // Bulk
    clearByType,

    // Hover UX
    pause,
    resume
  }
})