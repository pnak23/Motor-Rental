<template>
  <div class="container py-5">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb small">
        <li class="breadcrumb-item"><NuxtLink to="/">{{ t('motorbikeDetail.home') }}</NuxtLink></li>
        <li class="breadcrumb-item"><NuxtLink to="/motorbikes">{{ t('motorbikeDetail.motorbikes') }}</NuxtLink></li>
        <li class="breadcrumb-item active">{{ bike.name }}</li>
      </ol>
    </nav>

    <div class="row g-5">
      <div class="col-lg-7">
        <ImageGallery :images="images" :alt="bike.name" />

        <div class="mt-4">
          <p class="eyebrow mb-1">{{ bike.brand }} &middot; {{ bike.categoryName }}</p>
          <h1 class="font-display mb-2">{{ bike.name }}</h1>
          <p class="text-muted">{{ bike.description }}</p>
        </div>

        <div class="row g-3 my-3">
          <div class="col-4 col-md-2" v-for="spec in specs" :key="spec.label">
            <div class="spec-box text-center p-2">
              <i class="bi fs-4 text-amber" :class="spec.icon" />
              <p class="small mb-0 mt-1">{{ spec.value }}</p>
              <p class="small text-muted mb-0">{{ spec.label }}</p>
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 my-3">
          <span v-if="bike.helmetIncluded" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.helmetIncluded') }}</span>
          <span v-if="bike.phoneHolder" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.phoneHolder') }}</span>
          <span v-if="bike.usbCharger" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.usbCharger') }}</span>
          <span v-if="bike.goodForLongTrip" class="feature-pill"><i class="bi bi-check-circle me-1" />{{ t('motorbikeDetail.greatForLongTrips') }}</span>
        </div>

        <!-- Pricing table -->
        <div class="card p-3 my-4">
          <h3 class="h6 font-display mb-3">{{ t('motorbikeDetail.rentalPricing') }}</h3>
          <table class="table table-sm mb-0">
            <tbody>
              <tr>
                <td>{{ t('motorbikeDetail.oneDay') }}</td>
                <td class="text-end price-tag">${{ Number(bike.dailyPrice).toFixed(2) }}</td>
              </tr>
              <tr>
                <td>{{ t('motorbikeDetail.days2to6') }}</td>
                <td class="text-end price-tag">${{ Number(bike.dailyPrice).toFixed(2) }}{{ t('motorbikeDetail.perDay') }}</td>
              </tr>
              <tr v-if="bike.weeklyPrice">
                <td>{{ t('motorbikeDetail.days7to29') }}</td>
                <td class="text-end price-tag">${{ (Number(bike.weeklyPrice) / 7).toFixed(2) }}{{ t('motorbikeDetail.perDay') }}</td>
              </tr>
              <tr v-if="bike.monthlyPrice">
                <td>{{ t('motorbikeDetail.days30plus') }}</td>
                <td class="text-end price-tag">${{ (Number(bike.monthlyPrice) / 30).toFixed(2) }}{{ t('motorbikeDetail.perDay') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="related.length" class="mt-5">
          <h3 class="h5 font-display mb-3">{{ t('motorbikeDetail.youMightAlsoLike') }}</h3>
          <div class="row g-3">
            <div v-for="r in related" :key="r.id" class="col-6 col-md-3">
              <MotorbikeCard :bike="{ ...r, brand: bike.brand, engineCc: bike.engineCc, transmission: bike.transmission }" />
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <BookingForm :bike="bike" />
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

const images = computed(() =>
  bike.images.length ? bike.images.map((i) => i.url) : ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200']
)
const related = computed(() => bike.related || [])

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
</script>

<style scoped>
.spec-box {
  background: var(--color-gray-light);
  border-radius: var(--radius-md);
}
.feature-pill {
  background: var(--color-gray-light);
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
}
</style>
