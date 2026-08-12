<template>
  <div>
    <!-- Hero -->
    <section class="hero position-relative overflow-hidden">
      <div class="hero__bg" :style="heroImageStyle" />
      <div class="hero__overlay" />
      <div class="container position-relative py-5">
        <div class="row align-items-center min-vh-hero">
          <div class="col-lg-8 text-white">
            <p class="eyebrow text-gold-light mb-3 hero-fade-in">Siem Reap, Cambodia</p>
            <h1 class="hero__title font-display mb-4 hero-fade-in">
              {{ settings?.heroTitle || 'Explore Siem Reap on Two Wheels' }}
            </h1>
            <p class="fs-5 text-white-75 mb-4 hero-fade-in-delay" style="max-width: 36rem">
              {{ settings?.heroSubtitle || 'Discover Angkor, countryside roads, temples and hidden places at your own pace.' }}
            </p>
            <div class="d-flex flex-wrap gap-3 hero-fade-in-delay">
              <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg px-4">Explore Motorbikes</NuxtLink>
              <NuxtLink to="/motorbikes" class="btn btn-lg btn-outline-cream px-4">Book Now</NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <RouteMotif class="hero__motif d-none d-md-block" />
      <TempleSilhouette class="hero__silhouette" />
    </section>

    <!-- Quick facts -->
    <section class="section-tight bg-cream">
      <div class="container">
        <div class="row g-4 text-center">
          <div v-for="fact in quickFacts" :key="fact.label" class="col-6 col-lg-3" v-reveal>
            <i class="bi fs-2 text-amber" :class="fact.icon" />
            <p class="fw-600 mb-0 mt-2">{{ fact.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Banner -->
    <section v-if="banners.length" class="section-tight bg-offwhite">
      <div class="container">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="banner-card d-flex flex-column flex-md-row align-items-center overflow-hidden"
          v-reveal
        >
          <img :src="banner.imageUrl" :alt="banner.title" class="banner-card__img" />
          <div class="p-4 text-white">
            <h3 class="font-display h4">{{ banner.title }}</h3>
            <p class="text-white-75 mb-3">{{ banner.subtitle }}</p>
            <NuxtLink v-if="banner.buttonUrl" :to="banner.buttonUrl" class="btn btn-amber">{{ banner.buttonText || 'Learn more' }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured motorbikes -->
    <section class="section bg-white">
      <div class="container">
        <div class="d-flex align-items-end justify-content-between mb-4" v-reveal>
          <div>
            <p class="eyebrow mb-1">Our Fleet</p>
            <h2 class="font-display">Featured Motorbikes</h2>
          </div>
          <NuxtLink to="/motorbikes" class="d-none d-md-inline-block text-decoration-none fw-600">
            View all <i class="bi bi-arrow-right ms-1" />
          </NuxtLink>
        </div>
        <div class="row g-4">
          <div v-for="bike in featured" :key="bike.id" class="col-6 col-lg-3">
            <MotorbikeCard :bike="bike" />
          </div>
        </div>
        <div class="text-center mt-4 d-md-none">
          <NuxtLink to="/motorbikes" class="btn btn-outline-charcoal">View all motorbikes</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Why choose us -->
    <section class="section bg-warm-sand">
      <div class="container">
        <div class="text-center mb-5" v-reveal>
          <p class="eyebrow mb-1">A Local Siem Reap Business</p>
          <h2 class="font-display">Why Ride With Us</h2>
          <div class="khmer-divider text-brown mt-3">
            <span class="khmer-divider__mark" />
          </div>
        </div>
        <div class="row g-4">
          <div v-for="item in whyChooseUs" :key="item.title" class="col-6 col-lg-2" v-reveal>
            <div class="why-item text-center">
              <i class="bi fs-3 text-forest" :class="item.icon" />
              <p class="fw-600 small mb-0 mt-2">{{ item.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Travel story -->
    <section class="section bg-cream">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6" v-reveal>
            <img
              :src="settings?.aboutImage || 'https://images.unsplash.com/photo-1596178060810-72660ee8d859?w=1000'"
              alt="Riding through Siem Reap countryside"
              class="img-fluid rounded-4 travel-story__img"
            />
          </div>
          <div class="col-lg-6" v-reveal>
            <p class="eyebrow mb-2">Beyond the Temples</p>
            <h2 class="font-display mb-3">{{ settings?.aboutTitle || 'Explore Beyond the Temples' }}</h2>
            <p class="text-muted fs-5 mb-4">
              {{ settings?.aboutWhyChooseUs || settings?.aboutDescription || 'Ride through Siem Reap, discover local roads, countryside and hidden places at your own pace.' }}
            </p>
            <NuxtLink to="/about" class="btn btn-charcoal btn-lg">Start Your Journey</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ teaser -->
    <section class="section bg-white">
      <div class="container">
        <div class="row justify-content-between align-items-end mb-4" v-reveal>
          <div class="col-lg-6">
            <p class="eyebrow mb-1">Good to Know</p>
            <h2 class="font-display">Frequently Asked Questions</h2>
          </div>
        </div>
        <div class="row g-3">
          <div v-for="faq in faqs.slice(0, 4)" :key="faq.id" class="col-md-6" v-reveal>
            <div class="card p-3 h-100">
              <p class="fw-600 mb-1">{{ faq.question }}</p>
              <p class="text-muted small mb-0">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <NuxtLink to="/faq" class="btn btn-outline-charcoal">View all FAQs</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Booking CTA -->
    <section class="cta position-relative overflow-hidden bg-forest text-center">
      <TempleSilhouette class="cta__silhouette" />
      <div class="container position-relative py-5" v-reveal>
        <p class="eyebrow text-gold-light mb-2">Ready When You Are</p>
        <h2 class="font-display display-6 mb-3">Ready to Explore Siem Reap?</h2>
        <p class="fs-5 mb-4" style="opacity: 0.85">Your adventure starts here.</p>
        <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg px-5">Browse Motorbikes</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()
await settingsStore.load()
const settings = computed(() => settingsStore.settings)

interface Bike {
  id: string
  name: string
  slug: string
  brand: string
  engineCc: number
  transmission: string
  dailyPrice: string
  isNewBike?: boolean
  image?: string | null
}
interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  buttonText?: string
  buttonUrl?: string
}
interface Faq {
  id: string
  question: string
  answer: string
}

const [{ items: featured }, banners, faqs] = await Promise.all([
  useApi<{ items: Bike[] }>('/api/public/motorbikes?pageSize=4&sort=popular'),
  useApi<Banner[]>('/api/public/banners'),
  useApi<Faq[]>('/api/public/faqs')
])

const heroImageStyle = computed(() => {
  const img = settings.value?.heroImage || 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1800'
  return { backgroundImage: `url(${img})` }
})

const quickFacts = [
  { icon: 'bi-motorcycle', label: 'Available Motorbikes' },
  { icon: 'bi-tag', label: 'Affordable Prices' },
  { icon: 'bi-phone', label: 'Easy Booking' },
  { icon: 'bi-headset', label: 'Local Support' }
]

const whyChooseUs = [
  { icon: 'bi-shield-check', title: 'Reliable Motorbikes' },
  { icon: 'bi-cash-coin', title: 'Fair Local Prices' },
  { icon: 'bi-phone-vibrate', title: 'Easy Booking' },
  { icon: 'bi-geo-alt', title: 'Local Siem Reap Support' },
  { icon: 'bi-shield-plus', title: 'Helmet Included' },
  { icon: 'bi-building', title: 'Hotel Delivery' }
]

useHead({ title: settings.value?.businessName ? `${settings.value.businessName} — Motorbike Rental Siem Reap` : 'Motorbike Rental Siem Reap' })
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}
.min-vh-hero {
  min-height: 78vh;
}
.hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(38, 30, 20, 0.35) 0%, rgba(33, 26, 18, 0.55) 55%, rgba(24, 19, 13, 0.82) 100%);
}
.hero__title {
  font-size: clamp(2.4rem, 5vw, 4rem);
  line-height: 1.08;
}
.text-white-75 {
  color: rgba(255, 255, 255, 0.82);
}
.text-gold-light {
  color: var(--color-gold, #d4af37);
}
.hero__motif {
  position: absolute;
  right: -40px;
  bottom: 60px;
  width: 320px;
  opacity: 0.35;
  z-index: 1;
}
.hero__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 70px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.9;
  z-index: 1;
}
.banner-card {
  border-radius: var(--radius-lg);
  background: var(--color-forest, var(--color-charcoal));
}
.banner-card__img {
  width: 100%;
  max-width: 260px;
  height: 180px;
  object-fit: cover;
}
.why-item {
  padding: 0.5rem;
}
.travel-story__img {
  box-shadow: 0 20px 40px rgba(51, 40, 31, 0.18);
}
.cta {
  padding: 5rem 0;
}
.cta__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 60px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.06;
  transform: scaleY(-1);
}
</style>
