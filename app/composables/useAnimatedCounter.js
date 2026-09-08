import { ref, watch, onBeforeUnmount } from 'vue'

/**
 * Composable to create a counting animation from one number to another.
 * Optimized for performance using requestAnimationFrame.
 *
 * @param {Ref|ComputedRef} targetRef - The target value to animate towards.
 * @param {Object} options - Animation options.
 * @param {number} options.duration - Animation duration in milliseconds.
 * @returns {{ animatedValue: Ref<number> }}
 */
export function useAnimatedCounter(targetRef, options = { duration: 800 }) {
  // Initialize animatedValue with the current target value to avoid
  // a "0 to X" animation on the first component mount.
  const animatedValue = ref(targetRef.value)
  let animationFrameId = null

  const animate = (startTime) => {
    const duration = options.duration
    const startValue = animatedValue.value
    const endValue = targetRef.value

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing: easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      animatedValue.value = startValue + (endValue - startValue) * easedProgress

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        // Final value to avoid floating point residue
        animatedValue.value = endValue
        animationFrameId = null
      }
    }

    animationFrameId = requestAnimationFrame(step)
  }

  // Watch targetRef for changes.
  // immediate: false ensures we don't animate on the first mount.
  watch(targetRef, (newVal) => {
    if (!import.meta.client) return

    // Cancel any existing animation to prevent flickering or jumps
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animatedValue.value = newVal
      return
    }

    animate()
  }, { immediate: false })

  onBeforeUnmount(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  return {
    animatedValue
  }
}
