export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  /** NULL for a platform-level super admin; otherwise the shop this user belongs to. */
  shopId: string | null
  shopName: string | null
  /** True while a platform super admin is accessing this session's shop as this user. */
  impersonating?: boolean
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
    async login(email: string, password: string, remember = false) {
      const user = await useApi<AdminUser>('/api/auth/login', {
        method: 'POST',
        body: { email, password, remember }
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
