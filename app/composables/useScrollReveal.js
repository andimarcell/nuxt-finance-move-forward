import { ref, onMounted, onBeforeUnmount } from 'vue'

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

  onMounted(() => {
    // Safety check for SSR (Nuxt 4 / Nuxt UI 4)
    if (!import.meta.client) return

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

    // Start observing the target element once it's available
    if (target.value) {
      observer.observe(target.value)
    } else {
      // In case ref isn't immediately available (though onMounted usually covers it)
      // we can watch target if needed, but for standard template refs, this is sufficient.
    }
  })

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    target,
    isVisible
  }
}
