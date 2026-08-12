// Registers `v-reveal`: adds `.is-visible` to an element once it scrolls
// into view, working with the `.reveal` fade/rise CSS in main.scss.
// Must be a universal (non-client-only) plugin so Vue's SSR renderer has
// a directive definition to call `getSSRProps` on — the actual
// IntersectionObserver wiring only ever runs in the browser.
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null
  if (import.meta.client) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 }
    )
  }

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps() {
      return { class: 'reveal' }
    },
    mounted(el: HTMLElement) {
      el.classList.add('reveal')
      observer?.observe(el)
    }
  })
})
