import { ref, onUnmounted } from 'vue'

/**
 * Плавно анимирует число от 0 до end.
 * Возвращает реактивный объект { value } и метод start().
 */
export function useCountUp(end, { duration = 1400 } = {}) {
  const value = ref(0)
  let rafId = 0

  function start() {
    const startTime = performance.now()
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      value.value = Math.round(end * eased)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId)
  })

  return { value, start }
}