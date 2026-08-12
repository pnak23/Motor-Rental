<template>
  <div class="container py-5">
    <nav aria-label="breadcrumb" class="mb-4">
      <ol class="breadcrumb small">
        <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
        <li class="breadcrumb-item"><NuxtLink to="/motorbikes">Motorbikes</NuxtLink></li>
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
          <span v-if="bike.helmetIncluded" class="feature-pill"><i class="bi bi-check-circle me-1" />Helmet included</span>
          <span v-if="bike.phoneHolder" class="feature-pill"><i class="bi bi-check-circle me-1" />Phone holder</span>
          <span v-if="bike.usbCharger" class="feature-pill"><i class="bi bi-check-circle me-1" />USB charger</span>
          <span v-if="bike.goodForLongTrip" class="feature-pill"><i class="bi bi-check-circle me-1" />Great for long trips</span>
        </div>

        <!-- Pricing table -->
        <div class="card p-3 my-4">
          <h3 class="h6 font-display mb-3">Rental Pricing</h3>
          <table class="table table-sm mb-0">
            <tbody>
              <tr>
                <td>1 day</td>
                <td class="text-end price-tag">${{ Number(bike.dailyPrice).toFixed(2) }}</td>
              </tr>
              <tr>
                <td>2–6 days</td>
                <td class="text-end price-tag">${{ Number(bike.dailyPrice).toFixed(2) }}/day</td>
              </tr>
              <tr v-if="bike.weeklyPrice">
                <td>7–29 days</td>
                <td class="text-end price-tag">${{ (Number(bike.weeklyPrice) / 7).toFixed(2) }}/day</td>
              </tr>
              <tr v-if="bike.monthlyPrice">
                <td>30+ days</td>
                <td class="text-end price-tag">${{ (Number(bike.monthlyPrice) / 30).toFixed(2) }}/day</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="related.length" class="mt-5">
          <h3 class="h5 font-display mb-3">You might also like</h3>
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

const route = useRoute()
const bike = await useApi<MotorbikeDetail>(`/api/public/motorbikes/${route.params.slug}`)

const images = computed(() =>
  bike.images.length ? bike.images.map((i) => i.url) : ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200']
)
const related = computed(() => bike.related || [])

const specs = computed(() => [
  { label: 'Engine', value: `${bike.engineCc}cc`, icon: 'bi-speedometer2' },
  { label: 'Transmission', value: bike.transmission.replace(/_/g, '-'), icon: 'bi-gear' },
  { label: 'Fuel', value: bike.fuelType === 'ELECTRIC' ? 'Electric' : 'Gasoline', icon: 'bi-fuel-pump' },
  { label: 'Seats', value: String(bike.seatCapacity || 2), icon: 'bi-person' },
  { label: 'Year', value: String(bike.year || '—'), icon: 'bi-calendar3' },
  { label: 'Color', value: bike.color || '—', icon: 'bi-palette' }
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
