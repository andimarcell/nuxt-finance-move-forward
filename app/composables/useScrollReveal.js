import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * Composable to reveal elements when they enter the viewport.
 * Uses native IntersectionObserver for performance and zero dependencies.
 *
 * @param {Object} options - Observer options
 * @param {number} options.threshold - Percentage of target visibility to trigger (0.0 to 1.0)
 * @param {string} options.rootMargin - Margin around the root to offset trigger point
 * @returns {{ target: Ref, isVisible: Ref<boolean> }}
 */
export function useScrollReveal(options = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }) {
  const target = ref(null)
  const isVisible = ref(false)
  let observer = null

  onMounted(async () => {
    // Safety check for SSR (Nuxt 4 / Nuxt UI 4)
    if (!import.meta.client) return

    // Respect user's motion preference (accessibility)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isVisible.value = true
      return
    }

    // Wait for DOM to be fully rendered to ensure target.value is populated
    await nextTick()

    // Safety exit if target element is not found in DOM
    if (!target.value) {
      isVisible.value = true // fail-safe: jangan sembunyikan konten selamanya
      return
    }

    // Fallback if IntersectionObserver is not supported in the browser
    if (!('IntersectionObserver' in window)) {
      isVisible.value = true
      return
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          // Unobserve immediately after triggering to optimize performance (one-time animation)
          if (target.value) {
            observer.unobserve(target.value)
          }
        }
      })
    }, options)

    // Start observing the target element
    try {
      observer.observe(target.value)
    } catch (e) {
      console.error('[useScrollReveal] Failed to observe target:', e)
      isVisible.value = true // Fallback to visible so content isn't hidden forever
    }
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    target,
    isVisible
  }
}
