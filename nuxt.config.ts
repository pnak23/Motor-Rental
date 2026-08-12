// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  // Every template references components by their bare filename
  // (<SiteHeader>, <StatCard>, <MiniBarChart>, ...) regardless of which
  // subfolder they live in, so disable Nuxt's default directory-prefixed
  // auto-import naming to match.
  components: [{ path: '~/components', pathPrefix: false }],
  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    '~/assets/scss/main.scss'
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Angkor Wheels Rental — Motorbike Rental in Siem Reap',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Reliable, affordable motorbike rental in Siem Reap, Cambodia. Automatic scooters and manual bikes for exploring Angkor and beyond.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/images/favicon.svg' }
      ]
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3001'
    }
  },
  nitro: {
    experimental: {
      // allow larger multipart bodies for image uploads
    }
  },
  routeRules: {
    '/admin/**': { ssr: false }
  }
})
