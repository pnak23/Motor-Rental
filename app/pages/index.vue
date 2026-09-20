<template>
  <div>
    <!-- Hero -->
    <section class="hero position-relative overflow-hidden">
      <div class="hero__blob hero__blob--a" />
      <div class="hero__blob hero__blob--b" />
      <div class="container position-relative py-5">
        <div class="row align-items-center min-vh-hero g-5">
          <div class="col-lg-6 text-white">
            <p class="eyebrow text-gold-light mb-3 hero-fade-in">{{ t('home.heroLocation') }}</p>
            <h1 class="hero__title font-display mb-4 hero-fade-in-1">
              {{ settings?.heroTitle || t('home.heroTitleDefault') }}
            </h1>
            <p class="fs-5 text-white-75 mb-4 hero-fade-in-2" style="max-width: 34rem">
              {{ settings?.heroSubtitle || t('home.heroSubtitleDefault') }}
            </p>
            <div class="d-flex flex-wrap gap-3 hero-fade-in-3">
              <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg rounded-pill px-4 btn-shine">{{ t('home.exploreMotorbikes') }}</NuxtLink>
              <NuxtLink to="/shops" class="btn btn-lg btn-outline-cream rounded-pill px-4">{{ t('home.bookNow') }}</NuxtLink>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="hero__visual hero-fade-in-2">
              <div class="hero__frame" :style="{ transform: heroParallax }">
                <img :src="heroImageUrl" alt="" class="hero__photo" loading="eager" />
              </div>
              <RouteMotif class="hero__route route-draw" v-reveal :style="{ transform: heroMotifParallax }" />
              <span class="hero__pin pin-pulse" :style="{ transform: heroMotifParallax }">
                <i class="bi bi-geo-alt-fill" />
              </span>
              <div class="hero__badge" :style="{ transform: heroMotifParallax }">
                <span class="hero__badge-icon"><MotorbikeMotif /></span>
                <span class="hero__badge-text">{{ t('home.heroLocation') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hero__scroll-cue d-none d-md-flex hero-fade-in-3">
        <span />
      </div>
    </section>

    <!-- Quick facts -->
    <section class="section-tight bg-cream">
      <div class="container">
        <div class="row g-3 g-md-4 text-center">
          <div
            v-for="(fact, i) in quickFacts"
            :key="fact.labelKey"
            class="col-6 col-md-3"
            v-reveal
            :class="`reveal-delay-${i % 4}`"
          >
            <div class="fact-card h-100">
              <span class="fact-card__icon"><i class="bi" :class="fact.icon" /></span>
              <p class="fw-600 mb-0 mt-2">{{ t(fact.labelKey) }}</p>
            </div>
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
            <NuxtLink v-if="banner.buttonUrl" :to="banner.buttonUrl" class="btn btn-amber">{{ banner.buttonText || t('common.learnMore') }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Find Your Ride -->
    <section class="section bg-white find-ride">
      <div class="container">
        <div class="text-center mb-4" v-reveal>
          <p class="eyebrow mb-1">{{ t('home.findRide.eyebrow') }}</p>
          <h2 class="font-display">{{ t('home.findRide.title') }}</h2>
          <p class="text-muted fs-5 mx-auto find-ride__subtitle mt-2">{{ t('home.findRide.subtitle') }}</p>
        </div>

        <div v-if="rideCategories.length" class="d-flex flex-wrap justify-content-center gap-2 mb-4" v-reveal>
          <NuxtLink to="/motorbikes" class="filter-pill active">{{ t('home.findRide.all') }}</NuxtLink>
          <NuxtLink
            v-for="c in rideCategories"
            :key="c.id"
            :to="{ path: '/motorbikes', query: { category: c.slug } }"
            class="filter-pill"
          >{{ c.name }}</NuxtLink>
        </div>

        <div class="row g-4">
          <div v-for="(bike, i) in rideBikes" :key="bike.id" class="col-6 col-md-4" v-reveal :class="`reveal-delay-${i % 4}`">
            <MotorbikeCard :bike="bike" />
          </div>
        </div>

        <div class="text-center mt-4" v-reveal>
          <NuxtLink to="/motorbikes" class="btn btn-charcoal btn-lg btn-shine">{{ t('home.findRide.viewAll') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Shops -->
    <section class="section bg-cream">
      <div class="container">
        <div class="d-flex align-items-end justify-content-between mb-4" v-reveal>
          <div>
            <p class="eyebrow mb-1">{{ t('shops.eyebrow') }}</p>
            <h2 class="font-display">{{ t('home.ourShops') }}</h2>
          </div>
          <NuxtLink to="/shops" class="d-none d-md-inline-block text-decoration-none fw-600 link-underline-grow">
            {{ t('common.viewAll') }} <i class="bi bi-arrow-right ms-1" />
          </NuxtLink>
        </div>

        <div class="shop-slider-wrap position-relative" v-reveal>
          <button v-if="shops.length > 3" class="shop-slider-nav shop-slider-nav--prev" @click="scrollShops(-1)">
            <i class="bi bi-chevron-left" />
          </button>
          <div ref="shopSliderEl" class="shop-slider">
            <div v-for="shop in shops" :key="shop.id" class="shop-slider__item">
              <ShopCard :shop="shop" />
            </div>
          </div>
          <button v-if="shops.length > 3" class="shop-slider-nav shop-slider-nav--next" @click="scrollShops(1)">
            <i class="bi bi-chevron-right" />
          </button>
        </div>

        <div class="text-center mt-4 d-md-none">
          <NuxtLink to="/shops" class="btn btn-outline-charcoal">{{ t('home.viewAllShops') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Why choose us -->
    <section class="section bg-warm-sand position-relative overflow-hidden">
      <div class="why-choose__decor" />
      <div class="container position-relative">
        <div class="text-center mb-5" v-reveal>
          <p class="eyebrow mb-1">{{ t('home.whyChooseUsEyebrow') }}</p>
          <h2 class="font-display">{{ t('home.whyRideWithUs') }}</h2>
          <div class="khmer-divider text-brown mt-3">
            <span class="khmer-divider__mark" />
          </div>
        </div>
        <div class="row g-3 g-md-4">
          <div
            v-for="(item, i) in whyChooseUs"
            :key="item.titleKey"
            class="col-6 col-md-4 col-lg-2"
            v-reveal
            :class="`reveal-delay-${i % 4}`"
          >
            <div class="why-item text-center h-100">
              <span class="why-item__icon"><i class="bi" :class="item.icon" /></span>
              <p class="fw-600 small mb-0 mt-2">{{ t(item.titleKey) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Travel story -->
    <section class="section bg-white">
      <div class="container">
        <div class="row align-items-center g-4 g-lg-5">
          <div class="col-lg-6" v-reveal>
            <div class="travel-story__frame">
              <img
                :src="settings?.aboutImage || 'https://images.unsplash.com/photo-1596178060810-72660ee8d859?w=1000'"
                alt="Riding through Siem Reap countryside"
                class="img-fluid rounded-4 travel-story__img"
              />
            </div>
          </div>
          <div class="col-lg-6" v-reveal>
            <p class="eyebrow mb-2">{{ t('home.beyondTemples') }}</p>
            <h2 class="font-display mb-3">{{ settings?.aboutTitle || t('home.exploreBeyondTemplesDefault') }}</h2>
            <p class="text-muted fs-5 mb-4">
              {{ settings?.aboutWhyChooseUs || settings?.aboutDescription || t('home.aboutDescDefault') }}
            </p>
            <NuxtLink to="/about" class="btn btn-charcoal btn-lg btn-shine">{{ t('home.startYourJourney') }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Your Ride. Your Route. -->
    <section class="section bg-forest text-white position-relative overflow-hidden journey">
      <MotorbikeMotif class="journey__bg-motif journey__bg-motif--a" />
      <MotorbikeMotif class="journey__bg-motif journey__bg-motif--b" />
      <div class="container position-relative">
        <div class="text-center mb-5" v-reveal>
          <p class="eyebrow text-gold-light mb-1">{{ t('home.journey.eyebrow') }}</p>
          <h2 class="font-display">{{ t('home.journey.title') }}</h2>
          <p class="mt-2 mb-0 mx-auto journey__subtitle" style="opacity: 0.82">{{ t('home.journey.subtitle') }}</p>
        </div>

        <div class="journey__stepper" v-reveal>
          <div v-for="stop in journeyStops" :key="stop" class="journey__stop">
            <span class="journey__dot"><i class="bi bi-geo-alt-fill" /></span>
            <span class="journey__label">{{ t(stop) }}</span>
          </div>
          <span class="journey__marker"><i class="bi bi-scooter" /></span>
        </div>
      </div>
    </section>

    <!-- FAQ teaser -->
    <section class="section bg-cream">
      <div class="container">
        <div class="row justify-content-between align-items-end mb-4" v-reveal>
          <div class="col-lg-6">
            <p class="eyebrow mb-1">{{ t('home.goodToKnow') }}</p>
            <h2 class="font-display">{{ t('home.faqTitle') }}</h2>
          </div>
        </div>
        <div class="row g-3">
          <div
            v-for="(faq, i) in faqs.slice(0, 4)"
            :key="faq.id"
            class="col-md-6"
            v-reveal
            :class="`reveal-delay-${i % 4}`"
          >
            <div class="card faq-card p-3 p-md-4 h-100">
              <p class="fw-600 mb-1">{{ faq.question }}</p>
              <p class="text-muted small mb-0">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <NuxtLink to="/faq" class="btn btn-outline-charcoal">{{ t('home.viewAllFaqs') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Booking CTA -->
    <section class="cta position-relative overflow-hidden bg-forest text-center">
      <div class="cta__glow" />
      <TempleSilhouette class="cta__silhouette cta__silhouette--top" />
      <TempleSilhouette class="cta__silhouette cta__silhouette--bottom" />
      <MotorbikeMotif class="cta__motif" v-reveal />
      <div class="container position-relative py-5" v-reveal>
        <p class="eyebrow text-gold-light mb-2">{{ t('home.readyWhenYouAre') }}</p>
        <h2 class="font-display display-6 mb-3">{{ t('home.readyToExplore') }}</h2>
        <p class="fs-5 mb-4" style="opacity: 0.85">{{ t('home.adventureStarts') }}</p>
        <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg px-5 btn-shine">{{ t('home.browseMotorbikes') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const settingsStore = useSettingsStore()
await settingsStore.load()
const settings = computed(() => settingsStore.settings)

interface Shop {
  id: string
  slug: string
  name: string
  logoUrl?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  motorbikeCount: number
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
interface RideBike {
  id: string
  name: string
  slug: string
  brand: string
  engineCc: number
  transmission: string
  dailyPrice: string
  isNewBike?: boolean
  image?: string | null
  shopName?: string | null
  shopSlug?: string | null
  categoryName?: string | null
  categorySlug?: string | null
}
interface Category {
  id: string
  name: string
  slug: string
}
interface MotorbikesResponse {
  items: RideBike[]
  total: number
  filters: { brands: string[]; categories: Category[] }
}

const [shops, banners, faqs, rideRes] = await Promise.all([
  useApi<Shop[]>('/api/public/shops'),
  useApi<Banner[]>('/api/public/banners'),
  useApi<Faq[]>('/api/public/faqs'),
  useApi<MotorbikesResponse>('/api/public/motorbikes', { query: { pageSize: 6, sort: 'popular' } })
])

const rideBikes = rideRes.items
const rideCategories = rideRes.filters.categories.slice(0, 5)

const shopSliderEl = ref<HTMLElement | null>(null)
function scrollShops(dir: 1 | -1) {
  shopSliderEl.value?.scrollBy({ left: dir * 320, behavior: 'smooth' })
}

const heroImageUrl = computed(() => settings.value?.heroImage || 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1800')

const heroOffset = useParallax(0.06)
const heroMotifOffset = useParallax(0.03)
const heroParallax = computed(() => `translateY(${Math.min(heroOffset.value, 46)}px)`)
const heroMotifParallax = computed(() => `translateY(${Math.min(heroMotifOffset.value, 22)}px)`)

const quickFacts = [
  { icon: 'bi-motorcycle', labelKey: 'home.quickFacts.availableMotorbikes' },
  { icon: 'bi-tag', labelKey: 'home.quickFacts.affordablePrices' },
  { icon: 'bi-phone', labelKey: 'home.quickFacts.easyBooking' },
  { icon: 'bi-headset', labelKey: 'home.quickFacts.localSupport' }
]

const whyChooseUs = [
  { icon: 'bi-shield-check', titleKey: 'home.whyChooseUs.reliableMotorbikes' },
  { icon: 'bi-cash-coin', titleKey: 'home.whyChooseUs.fairLocalPrices' },
  { icon: 'bi-phone-vibrate', titleKey: 'home.whyChooseUs.easyBooking' },
  { icon: 'bi-geo-alt', titleKey: 'home.whyChooseUs.localSupport' },
  { icon: 'bi-shield-plus', titleKey: 'home.whyChooseUs.helmetIncluded' },
  { icon: 'bi-building', titleKey: 'home.whyChooseUs.hotelDelivery' }
]

const journeyStops = [
  'home.journey.siemReap',
  'home.journey.angkorWat',
  'home.journey.bayon',
  'home.journey.taProhm',
  'home.journey.countryside'
]

useHead({ title: settings.value?.businessName ? `${settings.value.businessName} — Motorbike Rental in Cambodia` : 'RideNow — Motorbike Rental in Cambodia' })
</script>

<style scoped>
.hero {
  min-height: 92vh;
  display: flex;
  align-items: stretch;
  background-color: var(--color-forest);
}
.min-vh-hero {
  min-height: 74vh;
}
.hero__blob {
  position: absolute;
  border-radius: 50%;
  background-color: var(--color-gold, #d4af37);
  filter: blur(90px);
  opacity: 0.16;
  pointer-events: none;
}
.hero__blob--a {
  width: 380px;
  height: 380px;
  top: -80px;
  left: -100px;
}
.hero__blob--b {
  width: 320px;
  height: 320px;
  bottom: -100px;
  right: 5%;
  opacity: 0.1;
}
.hero__title {
  font-size: clamp(2.1rem, 5vw, 3.6rem);
  line-height: 1.08;
}
.text-white-75 {
  color: rgba(255, 255, 255, 0.82);
}
.text-gold-light {
  color: var(--color-gold, #d4af37);
}

/* ── Hero visual composition ── */
.hero__visual {
  position: relative;
  max-width: 480px;
  margin: 0 auto;
}
.hero__frame {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px solid rgba(212, 175, 55, 0.55);
  box-shadow: 0 30px 60px rgba(15, 20, 16, 0.45);
  will-change: transform;
}
.hero__photo {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
.hero__route {
  position: absolute;
  width: 96px;
  height: 78px;
  top: -30px;
  left: -34px;
  color: var(--color-gold, #d4af37);
  opacity: 0.85;
  pointer-events: none;
}
.hero__pin {
  position: absolute;
  top: 14px;
  right: -14px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-forest);
  border: 2px solid var(--color-gold, #d4af37);
  color: var(--color-gold, #d4af37);
  font-size: 1.05rem;
}
.hero__badge {
  position: absolute;
  left: 1.25rem;
  bottom: -1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1rem 0.55rem 0.55rem;
  border-radius: 999px;
  background: var(--color-cream, #f7f2e8);
  box-shadow: 0 12px 26px rgba(15, 20, 16, 0.28);
}
.hero__badge-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-forest);
  color: var(--color-gold, #d4af37);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}
.hero__badge-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-forest);
  white-space: nowrap;
}
.hero__scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  z-index: 2;
  width: 26px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
}
.hero__scroll-cue span {
  width: 4px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-gold, #d4af37);
  animation: scrollCue 1.8s ease-in-out infinite;
}
@keyframes scrollCue {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  70% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(14px);
    opacity: 0;
  }
}

/* ── Staggered hero fade-in ── */
.hero-fade-in,
.hero-fade-in-1,
.hero-fade-in-2,
.hero-fade-in-3 {
  animation: heroFadeUp 0.9s ease both;
}
.hero-fade-in-1 {
  animation-delay: 0.1s;
}
.hero-fade-in-2 {
  animation-delay: 0.22s;
}
.hero-fade-in-3 {
  animation-delay: 0.34s;
}
@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ── Shine sweep on primary buttons ── */
.btn-shine {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.btn-shine::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 40%;
  background: linear-gradient(115deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
}
.btn-shine:hover::after {
  left: 120%;
}

/* ── Underline-grow link ── */
.link-underline-grow {
  position: relative;
}
.link-underline-grow::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.25s ease;
}
.link-underline-grow:hover::after {
  width: 100%;
}

.banner-card {
  border-radius: var(--radius-lg);
  background: var(--color-forest, var(--color-charcoal));
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.banner-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(38, 58, 46, 0.18);
}
.banner-card__img {
  width: 100%;
  max-width: 260px;
  height: 180px;
  object-fit: cover;
}
@media (max-width: 767.98px) {
  .banner-card__img {
    max-width: 100%;
    height: 200px;
  }
}

/* ── Find Your Ride ── */
.find-ride__subtitle {
  max-width: 34rem;
}

/* ── Shops slider ── */
.shop-slider-wrap {
  position: relative;
}
.shop-slider {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding: 0.25rem;
  scrollbar-width: none;
}
.shop-slider::-webkit-scrollbar {
  display: none;
}
.shop-slider__item {
  flex: 0 0 280px;
  scroll-snap-align: start;
}
@media (max-width: 575.98px) {
  .shop-slider__item {
    /* leave a peek of the next card so it's visually obvious the row scrolls */
    flex: 0 0 82%;
  }
}
.shop-slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white, #fff);
  box-shadow: 0 8px 20px rgba(38, 58, 46, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-forest, var(--color-charcoal));
  transition:
    color 0.2s ease,
    box-shadow 0.2s ease;
}
.shop-slider-nav:hover {
  color: var(--color-amber-deep, var(--color-gold-deep));
  box-shadow: 0 10px 24px rgba(38, 58, 46, 0.18);
}
.shop-slider-nav--prev {
  left: 0.25rem;
}
.shop-slider-nav--next {
  right: 0.25rem;
}
@media (max-width: 767.98px) {
  .shop-slider-nav {
    display: none;
  }
}

/* ── Quick fact cards ── */
.fact-card {
  padding: 1.25rem 0.75rem;
  border-radius: var(--radius-lg);
  background: var(--color-white, #fff);
  border: 1px solid var(--color-border);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.fact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px rgba(38, 58, 46, 0.1);
}
.fact-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.14);
  color: var(--color-amber-deep, var(--color-gold-deep));
  font-size: 1.35rem;
  transition: transform 0.25s ease;
}
.fact-card:hover .fact-card__icon {
  transform: scale(1.12) rotate(-6deg);
}

/* ── Why choose us ── */
.why-choose__decor {
  position: absolute;
  inset: -10% -5%;
  background: radial-gradient(45% 45% at 85% 15%, rgba(212, 175, 55, 0.16), transparent 70%);
  pointer-events: none;
}
.why-item {
  padding: 0.75rem 0.5rem;
  border-radius: var(--radius-md);
  transition: transform 0.25s ease;
}
.why-item:hover {
  transform: translateY(-3px);
}
.why-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(64, 90, 61, 0.12);
  color: var(--color-forest);
  font-size: 1.25rem;
  transition:
    transform 0.25s ease,
    background 0.25s ease;
}
.why-item:hover .why-item__icon {
  transform: scale(1.1);
  background: rgba(64, 90, 61, 0.2);
}

/* ── Travel story image frame ── */
.travel-story__frame {
  position: relative;
}
.travel-story__frame::before {
  content: '';
  position: absolute;
  inset: 14px -14px -14px 14px;
  border: 2px solid var(--color-gold, #d4af37);
  border-radius: var(--radius-lg);
  opacity: 0.45;
  z-index: -1;
}
.travel-story__img {
  box-shadow: 0 20px 40px rgba(51, 40, 31, 0.18);
  transition: transform 0.4s ease;
}
.travel-story__frame:hover .travel-story__img {
  transform: translateY(-4px);
}

/* ── Your Ride. Your Route. journey ── */
.journey {
  padding: 5.5rem 0;
}
.journey__subtitle {
  max-width: 34rem;
}
svg.journey__bg-motif {
  position: absolute;
  width: 220px;
  height: auto;
  color: var(--color-gold, #d4af37);
  opacity: 0.06;
  pointer-events: none;
}
.journey__bg-motif--a {
  top: 6%;
  left: -40px;
  transform: rotate(-8deg);
}
.journey__bg-motif--b {
  bottom: 4%;
  right: -30px;
  transform: scaleX(-1) rotate(-6deg);
}
.journey__stepper {
  position: relative;
  max-width: 420px;
  margin: 0 auto;
}
.journey__stepper::before {
  content: '';
  position: absolute;
  left: 22px;
  top: 22px;
  bottom: 22px;
  width: 2px;
  background: rgba(212, 175, 55, 0.28);
}
.journey__stepper::after {
  content: '';
  position: absolute;
  left: 22px;
  top: 22px;
  width: 2px;
  height: 0;
  background: var(--color-gold, #d4af37);
  transition: height 1.5s ease;
}
.journey__stepper.is-visible::after {
  height: calc(100% - 44px);
}
.journey__stop {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 0;
}
.journey__dot {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-forest);
  border: 2px solid var(--color-gold, #d4af37);
  color: var(--color-gold, #d4af37);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.journey__label {
  font-weight: 600;
  opacity: 0.92;
}
.journey__marker {
  position: absolute;
  left: 22px;
  top: 0;
  transform: translate(-50%, -50%);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-gold, #d4af37);
  color: var(--color-forest);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  opacity: 0;
}
.journey__stepper.is-visible .journey__marker {
  opacity: 1;
  animation: journeyMarker 1.6s ease-in-out 0.3s 1 both;
}
@keyframes journeyMarker {
  0% {
    top: 22px;
  }
  100% {
    top: calc(100% - 22px);
  }
}

/* ── FAQ cards ── */
.faq-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.faq-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgba(51, 40, 31, 0.08);
  border-color: var(--color-gold, #d4af37);
}

.cta {
  padding: 4rem 0;
}
.cta__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 60% at 50% 0%, rgba(212, 175, 55, 0.18), transparent 70%);
  pointer-events: none;
}
.cta__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  height: 60px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.06;
}
.cta__silhouette--top {
  top: 0;
  transform: scaleY(-1);
}
.cta__silhouette--bottom {
  bottom: 0;
}
svg.cta__motif {
  position: absolute;
  width: 160px;
  height: auto;
  bottom: 14%;
  left: -180px;
  color: var(--color-gold, #d4af37);
  opacity: 0.14;
  transition: transform 1.4s ease;
}
.cta__motif.is-visible {
  transform: translateX(340px);
}

/* ── Responsive tuning ── */
@media (max-width: 767.98px) {
  .min-vh-hero {
    min-height: 0;
  }
  .hero {
    min-height: 0;
    padding: 2.5rem 0 3.5rem;
  }
  .hero__visual {
    max-width: 320px;
    margin-top: 2.5rem;
  }
  .cta {
    padding: 3rem 0;
  }
  .section {
    padding: 3rem 0;
  }
  .journey {
    padding: 3.5rem 0;
  }
}
@media (min-width: 768px) and (max-width: 1199.98px) {
  .hero__title {
    font-size: clamp(2.4rem, 5.5vw, 3.4rem);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero__scroll-cue span,
  .hero-fade-in,
  .hero-fade-in-1,
  .hero-fade-in-2,
  .hero-fade-in-3 {
    animation: none !important;
  }
  .hero__frame,
  .hero__route,
  .hero__pin,
  .hero__badge {
    transform: none !important;
  }
}
</style>
