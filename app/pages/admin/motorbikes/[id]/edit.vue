<template>
  <div>
    <MotorbikeImageManager v-model="images" :motorbike-id="motorbikeId" />
    <PricingRulesManager v-model="pricingRules" :motorbike-id="motorbikeId" />

    <form @submit.prevent="submit">
      <MotorbikeFormFields v-model="form" :categories="categories" />

      <div class="d-flex gap-2 mb-5">
        <button type="submit" class="btn btn-amber" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" />Save Changes
        </button>
        <NuxtLink to="/admin/motorbikes" class="btn btn-outline-secondary">Back to List</NuxtLink>
      </div>
      <p v-if="error" class="text-danger small">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Edit Motorbike' })

interface Category {
  id: string
  name: string
}
interface MImage {
  id: string
  url: string
  isPrimary: boolean
}
interface Rule {
  id: string
  name: string
  type: string
  minDays: number
  maxDays: number | null
  pricePerDay: string
}
interface MotorbikeDetail {
  id: string
  name: string
  categoryId: string | null
  brand: string
  model: string
  year: number | null
  engineCc: number
  transmission: string
  fuelType: string
  plateNumber: string | null
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
  minRentalDays: number
  maxRentalDays: number
  helmetIncluded: boolean
  phoneHolder: boolean
  usbCharger: boolean
  goodForCity: boolean
  goodForLongTrip: boolean
  isNewBike: boolean
  popular: boolean
  featured: boolean
  status: string
  seoTitle: string | null
  seoKeywords: string | null
  seoDescription: string | null
  images: MImage[]
  pricingRules: Rule[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const motorbikeId = route.params.id as string

const [bike, categories] = await Promise.all([
  useApi<MotorbikeDetail>(`/api/admin/motorbikes/${motorbikeId}`),
  useApi<Category[]>('/api/admin/categories')
])

const images = ref<MImage[]>(bike.images)
const pricingRules = ref<Rule[]>(bike.pricingRules)

const form = reactive<Record<string, unknown>>({
  name: bike.name,
  categoryId: bike.categoryId,
  brand: bike.brand,
  model: bike.model,
  year: bike.year,
  engineCc: bike.engineCc,
  transmission: bike.transmission,
  fuelType: bike.fuelType,
  plateNumber: bike.plateNumber,
  color: bike.color,
  keyType: bike.keyType,
  seatCapacity: bike.seatCapacity,
  fuelConsumption: bike.fuelConsumption,
  description: bike.description,
  dailyPrice: Number(bike.dailyPrice),
  weeklyPrice: bike.weeklyPrice ? Number(bike.weeklyPrice) : null,
  monthlyPrice: bike.monthlyPrice ? Number(bike.monthlyPrice) : null,
  deposit: Number(bike.deposit),
  deliveryFee: Number(bike.deliveryFee),
  minRentalDays: bike.minRentalDays,
  maxRentalDays: bike.maxRentalDays,
  helmetIncluded: bike.helmetIncluded,
  phoneHolder: bike.phoneHolder,
  usbCharger: bike.usbCharger,
  goodForCity: bike.goodForCity,
  goodForLongTrip: bike.goodForLongTrip,
  isNewBike: bike.isNewBike,
  popular: bike.popular,
  featured: bike.featured,
  status: bike.status,
  seoTitle: bike.seoTitle,
  seoKeywords: bike.seoKeywords,
  seoDescription: bike.seoDescription
})

const saving = ref(false)
const error = ref('')

async function submit() {
  saving.value = true
  error.value = ''
  try {
    await useApi(`/api/admin/motorbikes/${motorbikeId}`, { method: 'PUT', body: form })
    toast.success('Motorbike updated')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not save changes'
  } finally {
    saving.value = false
  }
}
void router
</script>
