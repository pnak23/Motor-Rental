export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  const auth = useAuthStore()
  if (!auth.loaded) {
    try {
      await auth.fetchMe()
    } catch {
      auth.user = null
    }
  }
  if (!auth.user) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
