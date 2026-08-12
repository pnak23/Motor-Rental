export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AdminUser | null,
    loaded: false
  }),
  actions: {
    async fetchMe() {
      const user = await useApi<AdminUser | null>('/api/auth/me')
      this.user = user
      this.loaded = true
      return user
    },
    async login(email: string, password: string) {
      const user = await useApi<AdminUser>('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      this.user = user
      this.loaded = true
      return user
    },
    async logout() {
      await useApi('/api/auth/logout', { method: 'POST' })
      this.user = null
    }
  }
})
