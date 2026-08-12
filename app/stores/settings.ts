export interface BusinessSettings {
  id: string
  businessName: string
  logoUrl: string | null
  faviconUrl: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  telegram: string | null
  whatsapp: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  currency: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string | null
  aboutTitle: string | null
  aboutDescription: string | null
  aboutStory: string | null
  aboutMission: string | null
  aboutWhyChooseUs: string | null
  aboutImage: string | null
  footerText: string | null
  minRentalDays: number
  maxRentalDays: number
  depositPolicy: string | null
  fuelPolicy: string | null
  lateReturnPolicy: string | null
  damagePolicy: string | null
  cancellationPolicy: string | null
  accidentPolicy: string | null
  trafficViolationPolicy: string | null
  helmetPolicy: string | null
  minimumAge: number | null
  requiredDocuments: string | null
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as BusinessSettings | null
  }),
  actions: {
    async load() {
      if (this.settings) return this.settings
      this.settings = await useApi<BusinessSettings>('/api/public/settings')
      return this.settings
    }
  }
})
