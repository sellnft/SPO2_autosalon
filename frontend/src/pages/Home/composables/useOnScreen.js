import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Одноразовый IntersectionObserver:
 * возвращает ref элемента и ref isVisible (срабатывает один раз).
 */
export function useOnScreen({ threshold = 0.3 } = {}) {
  const element = ref(null)
  const isVisible = ref(false)
  let observer = null

  onMounted(() => {
    if (!element.value || typeof IntersectionObserver === 'undefined') {
      isVisible.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isVisible.value) {
          isVisible.value = true
          observer?.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(element.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { element, isVisible }
}