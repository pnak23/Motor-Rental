<template>
  <div>
    <!-- Hero -->
    <section class="hero position-relative overflow-hidden">
      <div class="hero__bg hero__bg--pan" :style="heroImageStyle" />
      <div class="hero__overlay" />
      <div class="hero__glow" />
      <div class="container position-relative py-5">
        <div class="row align-items-center min-vh-hero">
          <div class="col-lg-8 text-white">
            <p class="eyebrow text-gold-light mb-3 hero-fade-in">{{ t('home.heroLocation') }}</p>
            <h1 class="hero__title font-display mb-4 hero-fade-in-1">
              {{ settings?.heroTitle || t('home.heroTitleDefault') }}
            </h1>
            <p class="fs-5 text-white-75 mb-4 hero-fade-in-2" style="max-width: 36rem">
              {{ settings?.heroSubtitle || t('home.heroSubtitleDefault') }}
            </p>
            <div class="d-flex flex-wrap gap-3 hero-fade-in-3">
              <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg px-4 btn-shine">{{ t('home.exploreMotorbikes') }}</NuxtLink>
              <NuxtLink to="/motorbikes" class="btn btn-lg btn-outline-cream px-4">{{ t('home.bookNow') }}</NuxtLink>
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

    <!-- Featured motorbikes -->
    <section class="section bg-white">
      <div class="container">
        <div class="d-flex align-items-end justify-content-between mb-4" v-reveal>
          <div>
            <p class="eyebrow mb-1">{{ t('home.ourFleet') }}</p>
            <h2 class="font-display">{{ t('home.featuredMotorbikes') }}</h2>
          </div>
          <NuxtLink to="/motorbikes" class="d-none d-md-inline-block text-decoration-none fw-600 link-underline-grow">
            {{ t('common.viewAll') }} <i class="bi bi-arrow-right ms-1" />
          </NuxtLink>
        </div>
        <div class="row g-3 g-md-4">
          <div
            v-for="(bike, i) in featured"
            :key="bike.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
            v-reveal
            :class="`reveal-delay-${i % 4}`"
          >
            <MotorbikeCard :bike="bike" />
          </div>
        </div>
        <div class="text-center mt-4 d-md-none">
          <NuxtLink to="/motorbikes" class="btn btn-outline-charcoal">{{ t('common.viewAllMotorbikes') }}</NuxtLink>
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
    <section class="section bg-cream">
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

    <!-- FAQ teaser -->
    <section class="section bg-white">
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
      <TempleSilhouette class="cta__silhouette" />
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

useHead({ title: settings.value?.businessName ? `${settings.value.businessName} — Motorbike Rental Siem Reap` : 'Motorbike Rental Siem Reap' })
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
}
.min-vh-hero {
  min-height: 70vh;
}
.hero__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}
.hero__bg--pan {
  animation: heroPan 18s ease-in-out infinite alternate;
}
@keyframes heroPan {
  from {
    transform: scale(1.06) translate(0, 0);
  }
  to {
    transform: scale(1.14) translate(-1.5%, -1%);
  }
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(38, 30, 20, 0.35) 0%, rgba(33, 26, 18, 0.55) 55%, rgba(24, 19, 13, 0.82) 100%);
}
.hero__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 50% at 30% 20%, rgba(212, 175, 55, 0.22), transparent 70%);
  z-index: 1;
  pointer-events: none;
}
.hero__title {
  font-size: clamp(2.1rem, 6vw, 4rem);
  line-height: 1.08;
}
.text-white-75 {
  color: rgba(255, 255, 255, 0.82);
}
.text-gold-light {
  color: var(--color-gold, #d4af37);
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
  top: 0;
  height: 60px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.06;
  transform: scaleY(-1);
}

/* ── Responsive tuning ── */
@media (max-width: 767.98px) {
  .min-vh-hero {
    min-height: 62vh;
  }
  .hero {
    min-height: 88vh;
  }
  .cta {
    padding: 3rem 0;
  }
  .section {
    padding: 3rem 0;
  }
}
@media (min-width: 768px) and (max-width: 1199.98px) {
  .hero__title {
    font-size: clamp(2.4rem, 5.5vw, 3.4rem);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero__bg--pan,
  .hero__scroll-cue span,
  .hero-fade-in,
  .hero-fade-in-1,
  .hero-fade-in-2,
  .hero-fade-in-3 {
    animation: none !important;
  }
}
</style>
