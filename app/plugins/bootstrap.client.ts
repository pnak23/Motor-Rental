export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    import('bootstrap/dist/js/bootstrap.bundle.min.js')
  }
})
