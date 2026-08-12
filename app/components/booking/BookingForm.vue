<template>
  <div class="card p-4 booking-form">
    <div v-if="!confirmation">
      <h3 class="h5 font-display mb-3">{{ t('bookingForm.rentThisMotorbike') }}</h3>

      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.pickupDate') }}</label>
          <input v-model="pickupDate" type="date" class="form-control" :min="today" @change="checkAvailability" />
        </div>
        <div class="col-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.returnDate') }}</label>
          <input v-model="returnDate" type="date" class="form-control" :min="pickupDate || today" @change="checkAvailability" />
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.pickupLocation') }}</label>
          <select v-model="pickupLocationId" class="form-select">
            <option value="">{{ t('bookingForm.selectLocation') }}</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>
        <div class="col-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.returnLocation') }}</label>
          <select v-model="returnLocationId" class="form-select">
            <option value="">{{ t('bookingForm.sameAsPickup') }}</option>
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
            <span>{{ t('bookingForm.deliveryFee') }}</span>
            <span>${{ Number(bike.deliveryFee).toFixed(2) }}</span>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-content-between fw-600">
            <span>{{ t('bookingForm.total') }}</span>
            <span class="price-tag">${{ total.toFixed(2) }}</span>
          </div>
          <div v-if="Number(bike.deposit) > 0" class="small text-muted mt-1">
            {{ t('bookingForm.refundableDeposit', { amount: Number(bike.deposit).toFixed(2) }) }}
          </div>
        </template>
        <template v-else>
          <i class="bi bi-exclamation-triangle me-1" />{{ quote.reason }}
        </template>
      </div>

      <form @submit.prevent="submitBooking">
        <h4 class="h6 mt-4 mb-3">{{ t('bookingForm.yourInformation') }}</h4>
        <div class="row g-2">
          <div class="col-12">
            <input v-model="customer.fullName" required type="text" class="form-control mb-2" :placeholder="t('bookingForm.fullName')" />
          </div>
          <div class="col-6">
            <input v-model="customer.phone" required type="tel" class="form-control mb-2" :placeholder="t('bookingForm.phone')" />
          </div>
          <div class="col-6">
            <input v-model="customer.email" type="email" class="form-control mb-2" :placeholder="t('bookingForm.email')" />
          </div>
          <div class="col-6">
            <input v-model="customer.nationality" type="text" class="form-control mb-2" :placeholder="t('bookingForm.nationality')" />
          </div>
          <div class="col-6">
            <input v-model="customer.telegram" type="text" class="form-control mb-2" :placeholder="t('bookingForm.telegramOptional')" />
          </div>

          <div class="col-6">
            <select v-model="customer.idType" class="form-select mb-2">
              <option value="">{{ t('bookingForm.idType') }}</option>
              <option value="ID_CARD">{{ t('bookingForm.idCard') }}</option>
              <option value="PASSPORT">{{ t('bookingForm.passport') }}</option>
            </select>
          </div>
          <div class="col-6">
            <input v-model="customer.passportId" type="text" class="form-control mb-2" :placeholder="t('bookingForm.idNumberPlaceholder')" />
          </div>
          <div class="col-12">
            <label class="form-label small text-muted mb-1">{{ t('bookingForm.uploadDocument') }}</label>
            <input ref="fileInputEl" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="form-control mb-1" @change="onFileChange" />
            <p class="small text-muted mb-2">{{ t('bookingForm.uploadDocumentHint') }}</p>
            <div v-if="idDocumentPreview" class="id-preview mb-2">
              <img :src="idDocumentPreview" alt="" class="id-preview__img" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="removeFile">{{ t('bookingForm.removeFile') }}</button>
            </div>
            <p v-if="fileError" class="text-danger small mb-2">{{ fileError }}</p>
          </div>

          <div class="col-12">
            <textarea v-model="notes" class="form-control mb-2" rows="2" :placeholder="t('bookingForm.notesOptional')" />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-amber w-100 mt-2"
          :disabled="submitting || !pickupDate || !returnDate || (quote ? !quote.available : false)"
        >
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2" />
          {{ t('bookingForm.submitRentalRequest') }}
        </button>
        <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
      </form>
    </div>

    <div v-else class="text-center py-3">
      <i class="bi bi-check-circle-fill text-success display-5 mb-3 d-block" />
      <h3 class="h5 font-display">{{ t('bookingForm.requestReceived') }}</h3>
      <p class="text-muted mb-3">{{ t('bookingForm.willConfirmShortly') }}</p>

      <div class="receipt-print text-start bg-gray-light rounded p-3 mb-3">
        <div class="text-center mb-3">
          <p class="fw-600 mb-0">{{ settings?.businessName || 'Angkor Wheels Rental' }}</p>
          <p class="small text-muted mb-0">{{ t('bookingForm.receiptTitle') }}</p>
        </div>
        <p class="small mb-1"><strong>{{ t('bookingForm.bookingNumber') }}</strong> <span class="font-mono">{{ confirmation.bookingNumber }}</span></p>
        <p class="small mb-1"><strong>{{ t('bookingForm.customerName') }}</strong> {{ customer.fullName }}</p>
        <p class="small mb-1"><strong>{{ t('bookingForm.phone') }}</strong> {{ customer.phone }}</p>
        <p class="small mb-1"><strong>{{ t('bookingForm.motorbike') }}</strong> {{ confirmation.motorbikeName }}</p>
        <p class="small mb-1"><strong>{{ t('bookingForm.pickup') }}</strong> {{ formatDate(confirmation.pickupDate) }}<span v-if="pickupLocationName"> &middot; {{ pickupLocationName }}</span></p>
        <p class="small mb-1"><strong>{{ t('bookingForm.return') }}</strong> {{ formatDate(confirmation.returnDate) }}<span v-if="returnLocationName"> &middot; {{ returnLocationName }}</span></p>
        <hr class="my-2" />
        <div v-if="quote?.available" class="d-flex justify-content-between small mb-1">
          <span>{{ quote.days }} {{ t('common.day') }} &times; ${{ quote.ratePerDay.toFixed(2) }}</span>
          <span>${{ quote.subtotal.toFixed(2) }}</span>
        </div>
        <div v-if="Number(bike.deliveryFee) > 0" class="d-flex justify-content-between small mb-1">
          <span>{{ t('bookingForm.deliveryFee') }}</span>
          <span>${{ Number(bike.deliveryFee).toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-content-between fw-600">
          <span>{{ t('bookingForm.total2') }}</span>
          <span class="price-tag">${{ confirmation.total.toFixed(2) }}</span>
        </div>
        <p v-if="Number(bike.deposit) > 0" class="small text-muted mt-1 mb-0">
          {{ t('bookingForm.refundableDeposit', { amount: Number(bike.deposit).toFixed(2) }) }}
        </p>
        <p class="small text-muted mt-3 mb-0">{{ t('bookingForm.printedOn') }} {{ formatDateTime(printedAt) }}</p>
      </div>

      <div class="d-flex flex-column gap-2">
        <button type="button" class="btn btn-charcoal" @click="printReceipt">
          <i class="bi bi-printer me-2" />{{ t('bookingForm.printReceipt') }}
        </button>
        <a v-if="telegramLink" :href="telegramLink" target="_blank" rel="noopener" class="btn btn-outline-charcoal">
          <i class="bi bi-telegram me-2" />{{ t('bookingForm.contactUsTelegram') }}
        </a>
        <a v-if="whatsappLink" :href="whatsappLink" target="_blank" rel="noopener" class="btn btn-outline-charcoal">
          <i class="bi bi-whatsapp me-2" />{{ t('bookingForm.contactUsWhatsapp') }}
        </a>
        <a v-if="settings?.phone" :href="`tel:${settings.phone}`" class="btn btn-outline-charcoal">
          <i class="bi bi-telephone me-2" />{{ t('bookingForm.callUs') }}
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

const { t, locale } = useI18n()
const toast = useToast()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const today = new Date().toISOString().slice(0, 10)
const pickupDate = ref('')
const returnDate = ref('')
const pickupLocationId = ref('')
const returnLocationId = ref('')
const notes = ref('')
const customer = reactive({ fullName: '', phone: '', email: '', nationality: '', telegram: '', idType: '', passportId: '' })

const locations = ref<Location[]>([])
const quote = ref<Quote | null>(null)
const submitting = ref(false)
const error = ref('')
const confirmation = ref<Confirmation | null>(null)
const printedAt = ref<Date | null>(null)

const pickupLocationName = computed(() => locations.value.find((l) => l.id === pickupLocationId.value)?.name || '')
const returnLocationName = computed(() => locations.value.find((l) => l.id === returnLocationId.value)?.name || '')

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
    fileError.value = t('bookingForm.invalidFileType')
    removeFile()
    return
  }
  if (file.size > MAX_ID_DOCUMENT_BYTES) {
    fileError.value = t('bookingForm.fileTooLarge')
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
      error.value = e instanceof Error ? e.message : t('bookingForm.couldNotCheckAvailability')
    }
  }, 300)
}

watch([pickupDate, returnDate], checkAvailability)

async function submitBooking() {
  error.value = ''
  if (quote.value && !quote.value.available) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('motorbikeId', props.bike.id)
    formData.append('pickupDate', pickupDate.value)
    formData.append('returnDate', returnDate.value)
    if (pickupLocationId.value) formData.append('pickupLocationId', pickupLocationId.value)
    if (returnLocationId.value) formData.append('returnLocationId', returnLocationId.value)
    formData.append('customerFullName', customer.fullName)
    formData.append('customerPhone', customer.phone)
    if (customer.email) formData.append('customerEmail', customer.email)
    if (customer.nationality) formData.append('customerNationality', customer.nationality)
    if (customer.idType) formData.append('customerIdType', customer.idType)
    if (customer.passportId) formData.append('customerPassportId', customer.passportId)
    if (customer.telegram) formData.append('customerTelegram', customer.telegram)
    if (notes.value) formData.append('notes', notes.value)
    if (idDocumentFile.value) formData.append('idDocument', idDocumentFile.value)

    confirmation.value = await useApi<Confirmation>('/api/public/bookings', {
      method: 'POST',
      body: formData
    })
    printedAt.value = new Date()
    toast.success(t('bookingForm.bookingSubmitted'))
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('bookingForm.somethingWentWrong')
  } finally {
    submitting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatDateTime(d: Date | null) {
  if (!d) return ''
  return d.toLocaleString(locale.value, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function printReceipt() {
  window.print()
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
</style>

<style>
/* Printing the booking receipt: hide everything on the page except the
   receipt block itself (header, footer, sidebar, action buttons, ...). */
@media print {
  body * {
    visibility: hidden;
  }
  .receipt-print,
  .receipt-print * {
    visibility: visible;
  }
  .receipt-print {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-shadow: none !important;
  }
}
</style>
