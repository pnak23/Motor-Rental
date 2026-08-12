<template>
  <div class="card p-4 booking-form">
    <div v-if="!confirmation">
      <h3 class="h5 font-display mb-3">Rent This Motorbike</h3>

      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label small text-muted mb-1">Pickup date</label>
          <input v-model="pickupDate" type="date" class="form-control" :min="today" @change="checkAvailability" />
        </div>
        <div class="col-6">
          <label class="form-label small text-muted mb-1">Return date</label>
          <input v-model="returnDate" type="date" class="form-control" :min="pickupDate || today" @change="checkAvailability" />
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label small text-muted mb-1">Pickup location</label>
          <select v-model="pickupLocationId" class="form-select">
            <option value="">Select location</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>
        <div class="col-6">
          <label class="form-label small text-muted mb-1">Return location</label>
          <select v-model="returnLocationId" class="form-select">
            <option value="">Same as pickup</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="quote" class="quote-box p-3 mb-3" :class="quote.available ? 'quote-box--ok' : 'quote-box--warn'">
        <template v-if="quote.available">
          <div class="d-flex justify-content-between small mb-1">
            <span>{{ quote.days }} day(s) &times; ${{ quote.ratePerDay.toFixed(2) }}</span>
            <span>${{ quote.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="Number(bike.deliveryFee) > 0" class="d-flex justify-content-between small mb-1">
            <span>Delivery fee</span>
            <span>${{ Number(bike.deliveryFee).toFixed(2) }}</span>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-content-between fw-600">
            <span>Total</span>
            <span class="price-tag">${{ total.toFixed(2) }}</span>
          </div>
          <div v-if="Number(bike.deposit) > 0" class="small text-muted mt-1">
            + ${{ Number(bike.deposit).toFixed(2) }} refundable deposit at pickup
          </div>
        </template>
        <template v-else>
          <i class="bi bi-exclamation-triangle me-1" />{{ quote.reason }}
        </template>
      </div>

      <form @submit.prevent="submitBooking">
        <h4 class="h6 mt-4 mb-3">Your Information</h4>
        <div class="row g-2">
          <div class="col-12">
            <input v-model="customer.fullName" required type="text" class="form-control mb-2" placeholder="Full name *" />
          </div>
          <div class="col-6">
            <input v-model="customer.phone" required type="tel" class="form-control mb-2" placeholder="Phone *" />
          </div>
          <div class="col-6">
            <input v-model="customer.email" type="email" class="form-control mb-2" placeholder="Email" />
          </div>
          <div class="col-6">
            <input v-model="customer.nationality" type="text" class="form-control mb-2" placeholder="Nationality" />
          </div>
          <div class="col-6">
            <input v-model="customer.telegram" type="text" class="form-control mb-2" placeholder="Telegram (optional)" />
          </div>
          <div class="col-12">
            <textarea v-model="notes" class="form-control mb-2" rows="2" placeholder="Notes (optional)" />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-amber w-100 mt-2"
          :disabled="submitting || !pickupDate || !returnDate || (quote ? !quote.available : false)"
        >
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2" />
          Submit Rental Request
        </button>
        <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
      </form>
    </div>

    <div v-else class="text-center py-3">
      <i class="bi bi-check-circle-fill text-success display-5 mb-3 d-block" />
      <h3 class="h5 font-display">Your rental request has been received.</h3>
      <p class="text-muted mb-3">We'll confirm your booking shortly.</p>
      <div class="text-start bg-gray-light rounded p-3 mb-3">
        <p class="small mb-1"><strong>Booking #:</strong> <span class="font-mono">{{ confirmation.bookingNumber }}</span></p>
        <p class="small mb-1"><strong>Motorbike:</strong> {{ confirmation.motorbikeName }}</p>
        <p class="small mb-1"><strong>Pickup:</strong> {{ formatDate(confirmation.pickupDate) }}</p>
        <p class="small mb-1"><strong>Return:</strong> {{ formatDate(confirmation.returnDate) }}</p>
        <p class="small mb-0"><strong>Total:</strong> ${{ confirmation.total.toFixed(2) }}</p>
      </div>
      <div class="d-flex flex-column gap-2">
        <a v-if="telegramLink" :href="telegramLink" target="_blank" rel="noopener" class="btn btn-outline-charcoal">
          <i class="bi bi-telegram me-2" />Contact us on Telegram
        </a>
        <a v-if="whatsappLink" :href="whatsappLink" target="_blank" rel="noopener" class="btn btn-outline-charcoal">
          <i class="bi bi-whatsapp me-2" />Contact us on WhatsApp
        </a>
        <a v-if="settings?.phone" :href="`tel:${settings.phone}`" class="btn btn-outline-charcoal">
          <i class="bi bi-telephone me-2" />Call us
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  bike: {
    id: string
    dailyPrice: string | number
    deliveryFee: string | number
    deposit: string | number
  }
}>()

interface Location {
  id: string
  name: string
}
interface Quote {
  available: boolean
  reason: string | null
  days: number
  ratePerDay: number
  subtotal: number
}
interface Confirmation {
  bookingNumber: string
  motorbikeName: string
  pickupDate: string
  returnDate: string
  total: number
}

const toast = useToast()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const today = new Date().toISOString().slice(0, 10)
const pickupDate = ref('')
const returnDate = ref('')
const pickupLocationId = ref('')
const returnLocationId = ref('')
const notes = ref('')
const customer = reactive({ fullName: '', phone: '', email: '', nationality: '', telegram: '' })

const locations = ref<Location[]>([])
const quote = ref<Quote | null>(null)
const submitting = ref(false)
const error = ref('')
const confirmation = ref<Confirmation | null>(null)

onMounted(async () => {
  try {
    locations.value = await useApi<Location[]>('/api/public/locations')
  } catch {
    locations.value = []
  }
})

const total = computed(() => {
  if (!quote.value) return 0
  return quote.value.subtotal + Number(props.bike.deliveryFee || 0)
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null
async function checkAvailability() {
  quote.value = null
  if (!pickupDate.value || !returnDate.value) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      quote.value = await useApi<Quote>('/api/public/motorbikes/availability', {
        method: 'POST',
        body: { motorbikeId: props.bike.id, pickupDate: pickupDate.value, returnDate: returnDate.value }
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not check availability'
    }
  }, 300)
}

watch([pickupDate, returnDate], checkAvailability)

async function submitBooking() {
  error.value = ''
  if (quote.value && !quote.value.available) return
  submitting.value = true
  try {
    confirmation.value = await useApi<Confirmation>('/api/public/bookings', {
      method: 'POST',
      body: {
        motorbikeId: props.bike.id,
        pickupDate: pickupDate.value,
        returnDate: returnDate.value,
        pickupLocationId: pickupLocationId.value || null,
        returnLocationId: returnLocationId.value || null,
        customer,
        notes: notes.value
      }
    })
    toast.success('Booking request submitted!')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const telegramLink = computed(() => {
  const t = settings.value?.telegram?.replace('@', '')
  return t ? `https://t.me/${t}` : null
})
const whatsappLink = computed(() => {
  const w = settings.value?.whatsapp?.replace(/\D/g, '')
  return w ? `https://wa.me/${w}` : null
})
</script>

<style scoped>
.booking-form {
  position: sticky;
  top: 90px;
}
.quote-box {
  border-radius: var(--radius-md);
  background: var(--color-gray-light);
}
.quote-box--warn {
  background: #fbe9e5;
  color: #a3341c;
}
</style>
