import { ref, watch, onUnmounted, getCurrentInstance } from 'vue'

/**
 * Debounce-значение: возвращает ref, который обновляется
 * после паузы в изменениях исходного value.
 *
 * @param {import('vue').Ref} value — исходный ref
 * @param {number|Object} [options=300] — delay или объект настроек
 * @param {number}  [options.delay=300]
 * @param {boolean} [options.immediate=false] — применить значение сразу (leading edge)
 * @param {number}  [options.maxWait] — максимум, сколько можно ждать без апдейта
 * @returns {import('vue').Ref & { cancel: () => void, flush: () => void }}
 */
export function useDebounce(value, options = 300) {
  const opts = typeof options === 'number' ? { delay: options } : options
  const { delay = 300, immediate = false, maxWait } = opts

  const debouncedValue = ref(value.value)

  let timer = null
  let maxTimer = null
  let lastPendingValue

  function clearTimers() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (maxTimer) {
      clearTimeout(maxTimer)
      maxTimer = null
    }
  }

  function apply(value) {
    debouncedValue.value = value
    lastPendingValue = undefined
    clearTimers()
  }

  function cancel() {
    clearTimers()
    lastPendingValue = undefined
  }

  function flush() {
    if (lastPendingValue !== undefined) {
      apply(lastPendingValue)
    }
  }

  watch(value, (newValue) => {
    lastPendingValue = newValue

    if (immediate) {
      apply(newValue)
      return
    }

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => apply(newValue), delay)

    // maxWait — гарантия обновления, даже если значения сыпятся
    if (maxWait != null && !maxTimer) {
      maxTimer = setTimeout(() => {
        if (lastPendingValue !== undefined) {
          apply(lastPendingValue)
        }
      }, maxWait)
    }
  })

  // Очистка только если есть активный компонент
  if (getCurrentInstance()) {
    onUnmounted(clearTimers)
  }

  // Приклеиваем методы к ref
  debouncedValue.cancel = cancel
  debouncedValue.flush = flush

  return debouncedValue
}

/**
 * Debounce-функция: возвращает обёртку над fn.
 * Возвращает промис с результатом последнего вызова.
 *
 * У обёртки есть методы:
 * - .cancel() — отменить запланированный вызов
 * - .flush()  — форсировать вызов немедленно
 *
 * @param {Function} fn
 * @param {number|Object} [options=300]
 * @param {number}  [options.delay=300]
 * @param {boolean} [options.immediate=false] — вызвать сразу + дебаунсить хвост
 * @param {number}  [options.maxWait]
 * @returns {Function & { cancel: () => void, flush: () => any }}
 */
export function useDebounceFn(fn, options = 300) {
  const opts = typeof options === 'number' ? { delay: options } : options
  const { delay = 300, immediate = false, maxWait } = opts

  let timer = null
  let maxTimer = null
  let lastArgs = null
  let lastResolve = null
  let lastReject = null

  function clearTimers() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (maxTimer) {
      clearTimeout(maxTimer)
      maxTimer = null
    }
  }

  function invoke() {
    if (!lastArgs) return
    const args = lastArgs
    const resolve = lastResolve
    const reject = lastReject

    lastArgs = null
    lastResolve = null
    lastReject = null
    clearTimers()

    try {
      const result = fn(...args)
      // Поддерживаем async fn
      if (result && typeof result.then === 'function') {
        result.then(resolve, reject)
      } else {
        resolve?.(result)
      }
    } catch (err) {
      reject?.(err)
    }
  }

  function debounced(...args) {
    lastArgs = args

    // immediate: если таймера нет — вызываем сразу
    if (immediate && !timer && !maxTimer) {
      return new Promise((resolve, reject) => {
        lastResolve = resolve
        lastReject = reject
        invoke()
      })
    }

    if (timer) clearTimeout(timer)
    timer = setTimeout(invoke, delay)

    if (maxWait != null && !maxTimer) {
      maxTimer = setTimeout(invoke, maxWait)
    }

    // Возвращаем промис — если кто-то хочет дождаться
    return new Promise((resolve, reject) => {
      lastResolve = resolve
      lastReject = reject
    })
  }

  function cancel() {
    clearTimers()
    lastArgs = null
    lastResolve = null
    lastReject = null
  }

  function flush() {
    if (lastArgs) invoke()
  }

  // Приклеиваем методы
  debounced.cancel = cancel
  debounced.flush = flush

  // Автоочистка при unmount
  if (getCurrentInstance()) {
    onUnmounted(cancel)
  }

  return debounced
}