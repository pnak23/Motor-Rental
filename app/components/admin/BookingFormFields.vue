<template>
  <form id="booking-form" @submit.prevent="submit">
    <div class="card p-3 p-md-4 mb-3">
      <h3 class="h6 font-display mb-3">Motorbike &amp; Dates</h3>
      <div class="row g-3">
        <div class="col-md-12">
          <label class="form-label small">Motorbike</label>
          <select v-model="form.motorbikeId" class="form-select" required>
            <option value="" disabled>Select a motorbike…</option>
            <option v-for="m in motorbikes" :key="m.id" :value="m.id" :disabled="m.status === 'MAINTENANCE' || m.status === 'INACTIVE'">
              {{ m.name }} — ${{ Number(m.dailyPrice).toFixed(0) }}/day
              <template v-if="m.status !== 'AVAILABLE'"> ({{ m.status.toLowerCase() }})</template>
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Pickup Date</label>
          <input v-model="form.pickupDate" type="date" class="form-control" required />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Pickup Time</label>
          <input v-model="form.pickupTime" type="time" class="form-control" required />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Return Date</label>
          <input v-model="form.returnDate" type="date" class="form-control" required />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Return Time</label>
          <input v-model="form.returnTime" type="time" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Pickup Location</label>
          <select v-model="form.pickupLocationId" class="form-select">
            <option value="">No preference</option>
            <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Return Location</label>
          <select v-model="form.returnLocationId" class="form-select">
            <option value="">No preference</option>
            <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="quote" class="quote-box p-3 mt-3" :class="quote.available ? 'quote-box--ok' : 'quote-box--warn'">
        <template v-if="quote.available">
          <div class="d-flex justify-content-between small mb-1">
            <span v-if="quote.isHalfDay">Half-day rate</span>
            <span v-else>{{ quote.days }} day(s) &times; ${{ quote.ratePerDay.toFixed(2) }}</span>
            <span>${{ quote.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="selectedMotorbike && Number(selectedMotorbike.deliveryFee) > 0" class="d-flex justify-content-between small mb-1">
            <span>Delivery Fee</span>
            <span>${{ Number(selectedMotorbike.deliveryFee).toFixed(2) }}</span>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-content-between fw-600">
            <span>Estimated Total</span>
            <span class="price-tag">${{ estimatedTotal.toFixed(2) }}</span>
          </div>
          <div v-if="selectedMotorbike && Number(selectedMotorbike.deposit) > 0" class="small text-muted mt-1">
            Plus a ${{ Number(selectedMotorbike.deposit).toFixed(2) }} refundable deposit
          </div>
        </template>
        <template v-else>
          <p class="fw-600 mb-1"><i class="bi bi-exclamation-triangle me-1" />Motor unavailable</p>
          <p class="small mb-0">{{ quote.reason }}</p>
          <p v-if="quote.conflict" class="small mb-0 mt-1">
            {{ selectedMotorbike?.name }} is already reserved from<br />
            <strong>{{ formatConflictDate(quote.conflict.pickupDate) }}</strong> to <strong>{{ formatConflictDate(quote.conflict.returnDate) }}</strong>
          </p>
        </template>
      </div>
      <p v-else-if="checkingQuote" class="small text-muted mt-3 mb-0"><span class="spinner-border spinner-border-sm me-1" />Checking availability &amp; price…</p>
    </div>

    <div class="card p-3 p-md-4 mb-3">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h3 class="h6 font-display mb-0">Customer</h3>
        <div class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn"
            :class="customerMode === 'existing' ? 'btn-charcoal' : 'btn-outline-charcoal'"
            @click="customerMode = 'existing'"
          >
            Existing
          </button>
          <button
            type="button"
            class="btn"
            :class="customerMode === 'new' ? 'btn-charcoal' : 'btn-outline-charcoal'"
            @click="customerMode = 'new'"
          >
            New
          </button>
        </div>
      </div>

      <div v-if="customerMode === 'existing'">
        <div v-if="selectedCustomer" class="selected-customer d-flex align-items-center justify-content-between p-2 mb-2">
          <div>
            <p class="fw-600 mb-0">{{ selectedCustomer.fullName }}</p>
            <p class="small text-muted mb-0">{{ selectedCustomer.phone }}<span v-if="selectedCustomer.email"> &middot; {{ selectedCustomer.email }}</span></p>
          </div>
          <button type="button" class="btn btn-sm btn-outline-secondary" @click="selectedCustomer = null">Change</button>
        </div>
        <template v-else>
          <input v-model="customerSearch" class="form-control mb-2" placeholder="Search by name or phone…" />
          <ul v-if="customerResults.length" class="list-unstyled customer-results mb-0">
            <li v-for="c in customerResults" :key="c.id" class="customer-result" @click="selectedCustomer = c">
              <span class="fw-600">{{ c.fullName }}</span>
              <span class="small text-muted ms-2">{{ c.phone }}</span>
            </li>
          </ul>
          <p v-else-if="customerSearch.length >= 2 && !searching" class="small text-muted mb-0">No customers found for "{{ customerSearch }}"</p>
        </template>
      </div>

      <div v-else class="row g-3">
        <div class="col-md-6">
          <label class="form-label small">Full Name</label>
          <input v-model="newCustomer.fullName" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Phone</label>
          <input v-model="newCustomer.phone" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Email</label>
          <input v-model="newCustomer.email" type="email" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Nationality</label>
          <input v-model="newCustomer.nationality" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">ID Type</label>
          <select v-model="newCustomer.idType" class="form-select">
            <option value="">—</option>
            <option value="ID_CARD">ID Card</option>
            <option value="PASSPORT">Passport</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small">ID / Passport #</label>
          <input v-model="newCustomer.passportId" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Telegram</label>
          <input v-model="newCustomer.telegram" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">WhatsApp</label>
          <input v-model="newCustomer.whatsapp" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label small">ID / Passport Photo</label>
          <input ref="fileInputEl" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="form-control" @change="onFileChange" />
          <p class="small text-muted mt-1 mb-0">Optional — a photo of the customer's ID card or passport.</p>
          <div v-if="idDocumentPreview" class="id-preview mt-2">
            <img :src="idDocumentPreview" alt="" class="id-preview__img" />
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="removeFile">Remove</button>
          </div>
          <p v-if="fileError" class="text-danger small mt-2 mb-0">{{ fileError }}</p>
        </div>
      </div>
    </div>

    <div class="card p-3 p-md-4">
      <h3 class="h6 font-display mb-3">Pricing &amp; Status</h3>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label small">Booking Status</label>
          <select v-model="form.status" class="form-select">
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PICKED_UP">Active (Picked Up)</option>
            <option value="RETURNED">Completed (Returned)</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Payment Status</label>
          <select v-model="form.paymentStatus" class="form-select">
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Paid Amount ($)</label>
          <input v-model.number="form.paidAmount" type="number" step="0.01" min="0" class="form-control" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Payment Method</label>
          <select v-model="form.paymentMethod" class="form-select">
            <option value="">—</option>
            <option value="CASH">Cash</option>
            <option value="KHQR">KHQR</option>
            <option value="ABA">ABA</option>
            <option value="ACLEDA">ACLEDA</option>
            <option value="WING">Wing</option>
            <option value="CARD">Card</option>
          </select>
        </div>
        <div v-if="form.paymentMethod !== 'CASH'" class="col-md-4">
          <label class="form-label small">Transaction Reference</label>
          <input v-model="form.paymentReference" class="form-control" placeholder="Optional" />
        </div>
        <div v-if="depositWarning" class="col-12">
          <p class="text-danger small mb-0"><i class="bi bi-exclamation-triangle me-1" />{{ depositWarning }}</p>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Discount ($)</label>
          <input v-model.number="form.discount" type="number" step="0.01" min="0" class="form-control" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Additional Charges ($)</label>
          <input v-model.number="form.additionalCharges" type="number" step="0.01" min="0" class="form-control" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Deposit ($) <span class="text-muted">— leave blank to use the bike's default</span></label>
          <input v-model.number="form.deposit" type="number" step="0.01" min="0" class="form-control" />
        </div>
        <div class="col-md-6">
          <div class="remaining-box p-2">
            <span class="small text-muted d-block">Remaining Amount</span>
            <span class="fs-5 price-tag">${{ remainingAmount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label small">Notes</label>
          <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Optional internal note" />
        </div>
      </div>
    </div>
    <p v-if="submitError" class="text-danger small mt-3 mb-0">{{ submitError }}</p>
  </form>
</template>

<script setup lang="ts">
interface MotorbikeOption {
  id: string
  name: string
  dailyPrice: string
  deliveryFee: string
  deposit: string
  status: string
}
interface LocationOption {
  id: string
  name: string
}
interface CustomerOption {
  id: string
  fullName: string
  phone: string
  email: string | null
}
interface Quote {
  available: boolean
  reason: string | null
  days: number
  ratePerDay: number
  subtotal: number
  isHalfDay: boolean
  conflict: { pickupDate: string; returnDate: string } | null
}

const props = defineProps<{ initialDate?: string }>()
const emit = defineEmits<{ created: [{ id: string }]; submitting: [boolean] }>()

const toast = useToast()

const motorbikes = ref<MotorbikeOption[]>([])
const locations = ref<LocationOption[]>([])

const [motorbikeRes, locationRes] = await Promise.all([
  useApi<{ items: MotorbikeOption[] }>('/api/admin/motorbikes', { query: { pageSize: 100, sort: 'name' } }),
  useApi<LocationOption[]>('/api/admin/locations')
])
motorbikes.value = motorbikeRes.items
locations.value = locationRes

const customerMode = ref<'existing' | 'new'>('existing')
const customerSearch = ref('')
const customerResults = ref<CustomerOption[]>([])
const selectedCustomer = ref<CustomerOption | null>(null)
const searching = ref(false)

let debounce: ReturnType<typeof setTimeout> | null = null
watch(customerSearch, (val) => {
  if (debounce) clearTimeout(debounce)
  if (val.trim().length < 2) {
    customerResults.value = []
    return
  }
  debounce = setTimeout(async () => {
    searching.value = true
    try {
      const res = await useApi<{ items: CustomerOption[] }>('/api/admin/customers', { query: { search: val, pageSize: 6 } })
      customerResults.value = res.items
    } finally {
      searching.value = false
    }
  }, 300)
})

const newCustomer = reactive({
  fullName: '',
  phone: '',
  email: '',
  nationality: '',
  idType: '',
  passportId: '',
  telegram: '',
  whatsapp: ''
})

const initialDate = props.initialDate || ''

const form = reactive({
  motorbikeId: '',
  pickupDate: initialDate,
  pickupTime: '09:00',
  returnDate: initialDate,
  returnTime: '17:00',
  pickupLocationId: '',
  returnLocationId: '',
  status: 'CONFIRMED',
  paymentStatus: 'UNPAID',
  paymentMethod: '',
  paymentReference: '',
  paidAmount: 0,
  discount: 0,
  additionalCharges: 0,
  deposit: null as number | null,
  notes: ''
})

const selectedMotorbike = computed(() => motorbikes.value.find((m) => m.id === form.motorbikeId) || null)
const pickupDateTime = computed(() => (form.pickupDate && form.pickupTime ? `${form.pickupDate}T${form.pickupTime}:00` : ''))
const returnDateTime = computed(() => (form.returnDate && form.returnTime ? `${form.returnDate}T${form.returnTime}:00` : ''))

const quote = ref<Quote | null>(null)
const checkingQuote = ref(false)
const estimatedTotal = computed(() => {
  if (!quote.value || !quote.value.available) return 0
  const deliveryFee = Number(selectedMotorbike.value?.deliveryFee || 0)
  return Math.max(0, quote.value.subtotal - (form.discount || 0) + deliveryFee + (form.additionalCharges || 0))
})

let quoteDebounce: ReturnType<typeof setTimeout> | null = null
async function checkQuote() {
  quote.value = null
  if (!form.motorbikeId || !pickupDateTime.value || !returnDateTime.value) return
  if (quoteDebounce) clearTimeout(quoteDebounce)
  quoteDebounce = setTimeout(async () => {
    checkingQuote.value = true
    try {
      quote.value = await useApi<Quote>('/api/public/motorbikes/availability', {
        method: 'POST',
        body: { motorbikeId: form.motorbikeId, pickupDate: pickupDateTime.value, returnDate: returnDateTime.value }
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not check availability')
    } finally {
      checkingQuote.value = false
    }
  }, 300)
}
watch([() => form.motorbikeId, pickupDateTime, returnDateTime], checkQuote)
watch(
  () => form.paymentMethod,
  (m) => {
    if (m === 'CASH') form.paymentReference = ''
  }
)

const remainingAmount = computed(() => Math.max(0, estimatedTotal.value - (form.paidAmount || 0)))

const requiredDeposit = computed(() => Math.round(estimatedTotal.value * 0.5 * 100) / 100)
const depositWarning = computed(() => {
  if (['PENDING', 'CANCELLED'].includes(form.status)) return ''
  if (!quote.value?.available) return ''
  if ((form.paidAmount || 0) < requiredDeposit.value - 0.01) {
    return `At least $${requiredDeposit.value.toFixed(2)} (50% of the total) must be paid before this booking can be ${form.status.toLowerCase().replace('_', ' ')}.`
  }
  return ''
})

function formatConflictDate(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const MAX_ID_DOCUMENT_BYTES = 8 * 1024 * 1024
const ALLOWED_ID_DOCUMENT_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const fileInputEl = ref<HTMLInputElement | null>(null)
const idDocumentFile = ref<File | null>(null)
const idDocumentPreview = ref('')
const fileError = ref('')

function onFileChange(e: Event) {
  fileError.value = ''
  const file = (e.target as HTMLInputElement).files?.[0] || null
  if (!file) return
  if (!ALLOWED_ID_DOCUMENT_TYPES.has(file.type)) {
    fileError.value = 'Please upload a JPG, PNG, or WebP image'
    removeFile()
    return
  }
  if (file.size > MAX_ID_DOCUMENT_BYTES) {
    fileError.value = 'File must be smaller than 8MB'
    removeFile()
    return
  }
  idDocumentFile.value = file
  idDocumentPreview.value = URL.createObjectURL(file)
}

function removeFile() {
  idDocumentFile.value = null
  if (idDocumentPreview.value) URL.revokeObjectURL(idDocumentPreview.value)
  idDocumentPreview.value = ''
  if (fileInputEl.value) fileInputEl.value.value = ''
}

const submitError = ref('')

async function submit() {
  submitError.value = ''
  if (customerMode.value === 'existing' && !selectedCustomer.value) {
    toast.error('Select an existing customer, or switch to "New" to add one')
    return
  }
  if (customerMode.value === 'new' && (!newCustomer.fullName || !newCustomer.phone)) {
    toast.error('Enter the customer\'s name and phone number')
    return
  }

  if (quote.value && !quote.value.available) {
    toast.error('This motorbike is not available for the selected dates')
    return
  }

  if (depositWarning.value) {
    toast.error(depositWarning.value)
    return
  }

  emit('submitting', true)
  try {
    const formData = new FormData()
    formData.append('motorbikeId', form.motorbikeId)
    formData.append('pickupDate', pickupDateTime.value)
    formData.append('returnDate', returnDateTime.value)
    if (form.pickupLocationId) formData.append('pickupLocationId', form.pickupLocationId)
    if (form.returnLocationId) formData.append('returnLocationId', form.returnLocationId)
    formData.append('status', form.status)
    formData.append('paymentStatus', form.paymentStatus)
    if (form.paymentMethod) formData.append('paymentMethod', form.paymentMethod)
    if (form.paymentReference) formData.append('paymentReference', form.paymentReference)
    formData.append('paidAmount', String(form.paidAmount || 0))
    formData.append('discount', String(form.discount || 0))
    formData.append('additionalCharges', String(form.additionalCharges || 0))
    if (form.deposit !== null && form.deposit !== undefined && !Number.isNaN(form.deposit)) {
      formData.append('deposit', String(form.deposit))
    }
    if (form.notes) formData.append('notes', form.notes)

    if (customerMode.value === 'existing') {
      formData.append('customerId', selectedCustomer.value!.id)
    } else {
      formData.append('customerFullName', newCustomer.fullName)
      formData.append('customerPhone', newCustomer.phone)
      if (newCustomer.email) formData.append('customerEmail', newCustomer.email)
      if (newCustomer.nationality) formData.append('customerNationality', newCustomer.nationality)
      if (newCustomer.idType) formData.append('customerIdType', newCustomer.idType)
      if (newCustomer.passportId) formData.append('customerPassportId', newCustomer.passportId)
      if (newCustomer.telegram) formData.append('customerTelegram', newCustomer.telegram)
      if (newCustomer.whatsapp) formData.append('customerWhatsapp', newCustomer.whatsapp)
      if (idDocumentFile.value) formData.append('idDocument', idDocumentFile.value)
    }

    const booking = await useApi<{ id: string }>('/api/admin/bookings', { method: 'POST', body: formData })
    toast.success('Booking created')
    emit('created', booking)
  } catch (e) {
    submitError.value = e instanceof Error ? e.message : 'Could not create booking'
    toast.error(submitError.value)
  } finally {
    emit('submitting', false)
  }
}

defineExpose({ submit })
</script>

<style scoped>
.selected-customer {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-gray-light);
}
.customer-results {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.customer-result {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}
.customer-result:last-child {
  border-bottom: none;
}
.customer-result:hover {
  background: var(--color-gray-light);
}
.quote-box {
  border-radius: var(--radius-md);
  background: var(--color-gray-light);
}
.quote-box--warn {
  background: #fbe9e5;
  color: #a3341c;
}
.id-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.id-preview__img {
  width: 90px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.remaining-box {
  border-radius: var(--radius-sm);
  background: var(--color-gray-light);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
