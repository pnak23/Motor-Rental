// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/i18n'],
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
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json', language: 'en-US' },
      { code: 'km', name: 'ខ្មែរ', file: 'km.json', language: 'km-KH' }
    ],
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3001'
    }
  },
  nitro: {
    errorHandler: '~~/server/error-handler',
    experimental: {
      // allow larger multipart bodies for image uploads
    }
  },
  routeRules: {
    '/admin/**': { ssr: false }
  }
})
