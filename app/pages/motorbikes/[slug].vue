<template>
  <div class="container py-5">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb small">
        <li class="breadcrumb-item"><NuxtLink to="/">{{ t('motorbikeDetail.home') }}</NuxtLink></li>
        <li class="breadcrumb-item">
          <NuxtLink :to="bike.shopSlug ? `/shops/${bike.shopSlug}` : '/motorbikes'">
            {{ bike.shopSlug ? bike.shopName : t('motorbikeDetail.motorbikes') }}
          </NuxtLink>
        </li>
        <li class="breadcrumb-item active">{{ bike.name }}</li>
      </ol>
    </nav>

    <div class="row g-5">
      <div class="col-lg-7">
        <div v-reveal>
          <ImageGallery :images="images" :alt="bike.name" />
        </div>

        <div class="mt-4" v-reveal>
          <p class="eyebrow mb-1">{{ bike.brand }} &middot; {{ bike.categoryName }}</p>
          <h1 class="font-display mb-2">{{ bike.name }}</h1>
          <p class="quick-specs text-muted mb-3">
            {{ formatTransmission(bike.transmission) }} &middot; {{ bike.engineCc }}cc &middot; {{ t('motorbikeDetail.seatsCount', { count: bike.seatCapacity || 2 }) }}
          </p>
          <div class="d-flex flex-wrap align-items-center gap-3 mb-3">
            <span class="price-tag fs-2">${{ Number(bike.dailyPrice).toFixed(0) }}<span class="fs-6 fw-normal text-muted">{{ t('motorbikeDetail.perDay') }}</span></span>
            <span class="availability-badge"><i class="bi bi-check-circle-fill me-1" />{{ t('motorbikeDetail.availableNow') }}</span>
          </div>
          <button type="button" class="btn btn-amber btn-lg btn-shine d-lg-none mb-3" @click="scrollToBooking">
            <i class="bi bi-calendar-check me-2" />{{ t('motorbikeDetail.reserveThisBike') }}
          </button>
          <p class="text-muted">{{ bike.description }}</p>
        </div>

        <div class="row g-3 my-3" v-reveal>
          <div class="col-6 col-sm-4 col-md-2" v-for="spec in specs" :key="spec.label">
            <div class="spec-box text-center p-3">
              <div class="spec-box__icon mx-auto mb-2"><i class="bi" :class="spec.icon" /></div>
              <p class="small fw-600 mb-0">{{ spec.value }}</p>
              <p class="small text-muted mb-0">{{ spec.label }}</p>
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 my-3" v-reveal>
          <span v-if="bike.helmetIncluded" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.helmetIncluded') }}</span>
          <span v-if="bike.phoneHolder" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.phoneHolder') }}</span>
          <span v-if="bike.usbCharger" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.usbCharger') }}</span>
          <span v-if="bike.goodForLongTrip" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.greatForLongTrips') }}</span>
        </div>

        <!-- Pricing tiers -->
        <div class="my-4" v-reveal>
          <h3 class="h6 font-display mb-3">{{ t('motorbikeDetail.rentalPricing') }}</h3>
          <div class="row g-2">
            <div class="col-6 col-md-3" v-for="tier in priceTiers" :key="tier.label">
              <div class="price-tier text-center p-3" :class="{ 'price-tier--active': tier.active }">
                <p class="small text-muted mb-1">{{ tier.label }}</p>
                <p class="price-tag fs-5 mb-0">${{ tier.value }}</p>
                <p class="small text-muted mb-0">{{ t('motorbikeDetail.perDay') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="related.length" class="mt-5" v-reveal>
          <h3 class="h5 font-display mb-3">{{ t('motorbikeDetail.youMightAlsoLike') }}</h3>
          <div class="row g-3">
            <div v-for="r in related" :key="r.id" class="col-6 col-md-3">
              <MotorbikeCard :bike="{ ...r, brand: bike.brand, engineCc: bike.engineCc, transmission: bike.transmission }" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div id="booking-form" class="booking-sticky d-flex flex-column gap-3">
          <ShopInfoCard v-if="bike.shopSlug" :shop="bike" />
          <BookingForm :bike="bike" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MotorbikeDetail {
  id: string
  name: string
  slug: string
  brand: string
  model: string
  shopId?: string
  shopSlug?: string | null
  shopName?: string | null
  shopAddress?: string | null
  shopPhone?: string | null
  shopLogoUrl?: string | null
  shopTelegram?: string | null
  shopWhatsapp?: string | null
  shopMotorbikeCount?: number | null
  shopKhqrImageUrl?: string | null
  shopKhqrInstructions?: string | null
  shopAbaInstructions?: string | null
  shopAcledaInstructions?: string | null
  shopWingInstructions?: string | null
  shopCardInstructions?: string | null
  year: number | null
  engineCc: number
  transmission: string
  fuelType: string
  color: string | null
  keyType: string
  seatCapacity: number | null
  fuelConsumption: string | null
  description: string | null
  dailyPrice: string
  weeklyPrice: string | null
  monthlyPrice: string | null
  deposit: string
  deliveryFee: string
  helmetIncluded: boolean
  phoneHolder: boolean
  usbCharger: boolean
  goodForLongTrip: boolean
  categoryName: string | null
  seoTitle: string | null
  seoDescription: string | null
  images: { id: string; url: string; isPrimary: boolean }[]
  related: { id: string; name: string; slug: string; dailyPrice: string; image: string | null }[]
}

const { t } = useI18n()
const route = useRoute()
const bike = await useApi<MotorbikeDetail>(`/api/public/motorbikes/${route.params.slug}`)

const images = computed(() => bike.images.map((i) => i.url))
const related = computed(() => bike.related || [])

const priceTiers = computed(() => {
  const tiers = [
    { label: t('motorbikeDetail.oneDay'), value: Number(bike.dailyPrice).toFixed(0), active: true },
    { label: t('motorbikeDetail.days2to6'), value: Number(bike.dailyPrice).toFixed(0), active: false }
  ]
  if (bike.weeklyPrice) tiers.push({ label: t('motorbikeDetail.days7to29'), value: (Number(bike.weeklyPrice) / 7).toFixed(0), active: false })
  if (bike.monthlyPrice) tiers.push({ label: t('motorbikeDetail.days30plus'), value: (Number(bike.monthlyPrice) / 30).toFixed(0), active: false })
  return tiers
})

const specs = computed(() => [
  { label: t('motorbikeDetail.engine'), value: `${bike.engineCc}cc`, icon: 'bi-speedometer2' },
  { label: t('motorbikeDetail.transmission'), value: bike.transmission.replace(/_/g, '-'), icon: 'bi-gear' },
  { label: t('motorbikeDetail.fuel'), value: bike.fuelType === 'ELECTRIC' ? t('motorbikeDetail.electric') : t('motorbikeDetail.gasoline'), icon: 'bi-fuel-pump' },
  { label: t('motorbikeDetail.seats'), value: String(bike.seatCapacity || 2), icon: 'bi-person' },
  { label: t('motorbikeDetail.year'), value: String(bike.year || '—'), icon: 'bi-calendar3' },
  { label: t('motorbikeDetail.color'), value: bike.color || '—', icon: 'bi-palette' },
  {
    label: t('motorbikeDetail.keyType'),
    value: bike.keyType === 'SMART_KEY' ? t('motorbikeDetail.smartKey') : t('motorbikeDetail.normalKey'),
    icon: 'bi-key'
  }
])

useHead({
  title: bike.seoTitle || `${bike.name} — Rent in Siem Reap`,
  meta: [{ name: 'description', content: bike.seoDescription || bike.description || '' }]
})

function formatTransmission(value: string) {
  return value.replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())
}

function scrollToBooking() {
  document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.quick-specs {
  font-weight: 500;
}
.availability-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgba(63, 140, 95, 0.12);
  color: var(--color-success);
  font-size: 0.85rem;
  font-weight: 600;
}
.spec-box {
  background: var(--color-gray-light);
  border-radius: var(--radius-md);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.spec-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(38, 58, 46, 0.08);
}
.spec-box__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-offwhite, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-amber-deep);
  font-size: 1.1rem;
}
.feature-pill {
  background: var(--color-gray-light);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
}
.price-tier {
  background: var(--color-gray-light);
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.price-tier--active {
  background: var(--color-offwhite, #fff);
  border-color: var(--color-amber-deep);
  box-shadow: 0 8px 20px rgba(38, 58, 46, 0.1);
}
.price-tier:hover {
  transform: translateY(-2px);
}
@media (min-width: 992px) {
  .booking-sticky {
    position: sticky;
    top: 1.5rem;
  }
}
</style>
