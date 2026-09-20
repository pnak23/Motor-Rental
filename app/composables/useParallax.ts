/**
 * Client-only, rAF-throttled scroll offset. Returns a static 0 (no-op) when
 * the user has prefers-reduced-motion enabled, or during SSR.
 *
 * @param strength multiplier applied to scrollY — small (0.02–0.08) for a
 *   subtle drift, used to derive a `translateY` in the caller's template.
 */
export function useParallax(strength = 0.05) {
  const offset = ref(0)

  if (import.meta.client) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion) {
      let ticking = false
      const onScroll = () => {
        if (ticking) return
        ticking = true
        requestAnimationFrame(() => {
          offset.value = window.scrollY * strength
          ticking = false
        })
      }
      onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
      onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
    }
  }

  return offset
}
