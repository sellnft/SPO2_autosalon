import { ref, computed, watch } from 'vue'

/**
 * Composable для пагинации.
 *
 * @param {Object}  [options={}]
 * @param {number}  [options.initialPage=1]
 * @param {number}  [options.perPage=20]
 * @param {number}  [options.total=0]
 * @param {number}  [options.siblingCount=1] — соседей слева/справа в pages
 * @param {Function}[options.onChange] — callback(page) при смене страницы
 * @returns {Object}
 */
export function usePagination(options = {}) {
  const {
    initialPage = 1,
    perPage = 20,
    total = 0,
    siblingCount = 1,
    onChange
  } = options

  // === Стейт ===
  const currentPage = ref(Math.max(1, initialPage))
  const totalItems = ref(Math.max(0, total))
  const itemsPerPage = ref(Math.max(1, perPage)) // защита от 0

  // === Вычисляемые ===
  const totalPages = computed(() => {
    // Минимум 1 страница, даже если данных нет — чтобы UI был консистентным
    return Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value))
  })

  const hasNext = computed(() => currentPage.value < totalPages.value)
  const hasPrev = computed(() => currentPage.value > 1)
  const isFirst = computed(() => currentPage.value === 1)
  const isLast = computed(() => currentPage.value === totalPages.value)

  const rangeStart = computed(() =>
    totalItems.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage.value + 1
  )

  const rangeEnd = computed(() =>
    Math.min(currentPage.value * itemsPerPage.value, totalItems.value)
  )

  const isEmpty = computed(() => totalItems.value === 0)

  const offset = computed(() => (currentPage.value - 1) * itemsPerPage.value)

  /**
   * Список страниц для рендера пагинатора.
   * Содержит числа и строки '...' для ellipsis.
   * Пример: [1, '...', 5, 6, 7, '...', 100]
   */
  const pages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const siblings = Math.max(0, siblingCount)

    // Если страниц мало — показываем все
    const totalNumbers = siblings * 2 + 5 // first + last + current + 2*siblings + 2 ellipsis
    if (total <= totalNumbers) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }

    const leftSibling = Math.max(current - siblings, 1)
    const rightSibling = Math.min(current + siblings, total)

    const showLeftEllipsis = leftSibling > 2
    const showRightEllipsis = rightSibling < total - 1

    const result = []

    // Первая страница всегда
    result.push(1)

    if (showLeftEllipsis) {
      result.push('...')
    } else {
      // Добавляем страницы между 1 и leftSibling
      for (let i = 2; i < leftSibling; i++) result.push(i)
    }

    // Страницы вокруг текущей
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== total) result.push(i)
    }

    if (showRightEllipsis) {
      result.push('...')
    } else {
      for (let i = rightSibling + 1; i < total; i++) result.push(i)
    }

    // Последняя страница всегда
    if (total > 1) result.push(total)

    return result
  })

  // === Действия ===
  function goTo(page, opts = {}) {
    // Приведение к числу
    const target = Number(page)
    if (Number.isNaN(target)) return false

    // Ограничение диапазоном
    const clamped = Math.min(Math.max(1, target), totalPages.value)

    if (clamped === currentPage.value) return false

    currentPage.value = clamped

    if (!opts.silent && typeof onChange === 'function') {
      onChange(clamped)
    }

    return true
  }

  function next(opts = {}) {
    if (hasNext.value) return goTo(currentPage.value + 1, opts)
    return false
  }

  function prev(opts = {}) {
    if (hasPrev.value) return goTo(currentPage.value - 1, opts)
    return false
  }

  function goToFirst(opts = {}) {
    return goTo(1, opts)
  }

  function goToLast(opts = {}) {
    return goTo(totalPages.value, opts)
  }

  /**
   * Сброс на первую страницу.
   * @param {Object} [opts]
   * @param {boolean} [opts.keepTotal=true] — оставить totalItems
   * @param {number}  [opts.newTotal] — установить новый total
   */
  function reset(opts = {}) {
    const { keepTotal = true, newTotal } = opts

    currentPage.value = 1
    if (!keepTotal && newTotal !== undefined) {
      totalItems.value = newTotal
    }

    if (typeof onChange === 'function') {
      onChange(1)
    }
  }

  /**
   * Установить общее количество (после запроса).
   * Если текущая страница > totalPages — автокорректируется.
   */
  function setTotal(value, opts = {}) {
    totalItems.value = Math.max(0, Number(value) || 0)

    // Автокоррекция если данных стало меньше
    if (currentPage.value > totalPages.value) {
      const newPage = totalPages.value
      currentPage.value = newPage
      if (!opts.silent && typeof onChange === 'function') {
        onChange(newPage)
      }
    }
  }

  /**
   * Установить размер страницы.
   */
  function setPerPage(value, opts = {}) {
    const newPerPage = Math.max(1, Number(value) || 1)
    if (newPerPage === itemsPerPage.value) return

    itemsPerPage.value = newPerPage

    // Пересчёт текущей страницы, чтобы не потерять позицию
    // (опционально: можно просто сбросить на 1)
    if (!opts.keepPosition) {
      currentPage.value = 1
    } else {
      currentPage.value = Math.min(currentPage.value, totalPages.value)
    }

    if (!opts.silent && typeof onChange === 'function') {
      onChange(currentPage.value)
    }
  }

  // Авто-коррекция при изменении totalItems или itemsPerPage извне
  watch([totalItems, itemsPerPage], () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
  })

  return {
    // Стейт
    currentPage,
    totalItems,
    itemsPerPage,

    // Computed
    totalPages,
    hasNext,
    hasPrev,
    isFirst,
    isLast,
    isEmpty,
    rangeStart,
    rangeEnd,
    offset,
    pages,

    // Действия
    goTo,
    next,
    prev,
    goToFirst,
    goToLast,
    reset,
    setTotal,
    setPerPage
  }
}