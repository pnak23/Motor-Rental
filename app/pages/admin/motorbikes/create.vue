<template>
  <div>
    <form @submit.prevent="submit">
      <MotorbikeFormFields v-model="form" :categories="categories" />

      <div class="alert alert-info small">
        <i class="bi bi-info-circle me-1" />Save the motorbike first, then add photos on the edit page.
      </div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-amber" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" />Create Motorbike
        </button>
        <NuxtLink to="/admin/motorbikes" class="btn btn-outline-secondary">Cancel</NuxtLink>
      </div>
      <p v-if="error" class="text-danger small mt-2">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Add Motorbike' })

interface Category {
  id: string
  name: string
}

const toast = useToast()
const router = useRouter()
const categories = await useApi<Category[]>('/api/admin/categories')

const form = reactive<Record<string, unknown>>({
  name: '',
  categoryId: null,
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  engineCc: 125,
  transmission: 'AUTOMATIC',
  fuelType: 'GASOLINE',
  plateNumber: '',
  color: '',
  seatCapacity: 2,
  fuelConsumption: '',
  description: '',
  dailyPrice: 10,
  weeklyPrice: null,
  monthlyPrice: null,
  deposit: 0,
  deliveryFee: 0,
  minRentalDays: 1,
  maxRentalDays: 60,
  helmetIncluded: true,
  phoneHolder: false,
  usbCharger: false,
  goodForCity: true,
  goodForLongTrip: false,
  isNewBike: false,
  popular: false,
  featured: false,
  status: 'AVAILABLE',
  seoTitle: '',
  seoKeywords: '',
  seoDescription: ''
})

const saving = ref(false)
const error = ref('')

async function submit() {
  saving.value = true
  error.value = ''
  try {
    const created = await useApi<{ id: string }>('/api/admin/motorbikes', { method: 'POST', body: form })
    toast.success('Motorbike created')
    router.push(`/admin/motorbikes/${created.id}/edit`)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create motorbike'
  } finally {
    saving.value = false
  }
}
</script>
