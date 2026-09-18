<template>
  <div class="card p-4 booking-form">
    <div v-if="!confirmation">
      <h3 class="h5 font-display mb-3">{{ t('bookingForm.rentThisMotorbike') }}</h3>

      <div class="row g-2 mb-2">
        <div class="col-12 col-sm-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.pickupDate') }}</label>
          <input v-model="pickupDate" type="date" class="form-control" :min="today" @change="checkAvailability" />
        </div>
        <div class="col-12 col-sm-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.pickupTime') }}</label>
          <input v-model="pickupTime" type="time" class="form-control" @change="checkAvailability" />
        </div>
      </div>
      <div class="row g-2 mb-3">
        <div class="col-12 col-sm-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.returnDate') }}</label>
          <input v-model="returnDate" type="date" class="form-control" :min="pickupDate || today" @change="checkAvailability" />
        </div>
        <div class="col-12 col-sm-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.returnTime') }}</label>
          <input v-model="returnTime" type="time" class="form-control" @change="checkAvailability" />
        </div>
      </div>
      <p class="small text-muted mb-3"><i class="bi bi-info-circle me-1" />{{ t('bookingForm.halfDayHint') }}</p>

      <div class="row g-2 mb-3">
        <div class="col-12 col-sm-6">
          <label class="form-label small text-muted mb-1">{{ t('bookingForm.pickupLocation') }}</label>
          <select v-model="pickupLocationId" class="form-select">
            <option value="">{{ t('bookingForm.selectLocation') }}</option>
            <option v-for="loc in locations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
          </select>
        </div>
        <div class="col-12 col-sm-6">
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
            <span v-if="quote.isHalfDay">{{ t('bookingForm.halfDayRate') }}</span>
            <span v-else>{{ quote.days }} day(s) &times; ${{ quote.ratePerDay.toFixed(2) }}</span>
            <span>${{ quote.subtotal.toFixed(2) }}</span>
          </div>
          <div v-if="Number(bike.deliveryFee) > 0" class="d-flex justify-content-between small mb-1">
            <span>{{ t('bookingForm.deliveryFee') }}</span>
            <span>${{ Number(bike.deliveryFee).toFixed(2) }}</span>
          </div>
          <hr class="my-2" />
          <div class="d-flex justify-content-between fw-600">
            <span>{{ t('bookingForm.total') }}</span>
            <span class="price-tag">${{ quote.total.toFixed(2) }}</span>
          </div>
          <div v-if="Number(bike.deposit) > 0" class="small text-muted mt-1">
            {{ t('bookingForm.refundableDeposit', { amount: Number(bike.deposit).toFixed(2) }) }}
          </div>
          <div class="deposit-callout mt-2 p-2">
            <i class="bi bi-shield-check me-1" />
            {{ t('bookingForm.depositRequired', { amount: quote.requiredDeposit.toFixed(2) }) }}
          </div>
        </template>
        <template v-else>
          <p class="fw-600 mb-1"><i class="bi bi-exclamation-triangle me-1" />{{ t('bookingForm.unavailableTitle') }}</p>
          <p class="small mb-0">{{ quote.reason }}</p>
          <p v-if="quote.conflict" class="small mb-0 mt-1">
            {{ t('bookingForm.reservedUntil', { date: formatDateTime(quote.conflict.returnDate) }) }}
          </p>
        </template>
      </div>

      <form @submit.prevent="submitBooking">
        <h4 class="h6 mt-4 mb-3">{{ t('bookingForm.yourInformation') }}</h4>
        <div class="row g-2">
          <div class="col-12">
            <input v-model="customer.fullName" required type="text" class="form-control mb-2" :placeholder="t('bookingForm.fullName')" />
          </div>
          <div class="col-12 col-sm-6">
            <input v-model="customer.phone" required type="tel" class="form-control mb-2" :placeholder="t('bookingForm.phone')" />
          </div>
          <div class="col-12 col-sm-6">
            <input v-model="customer.email" type="email" class="form-control mb-2" :placeholder="t('bookingForm.email')" />
          </div>
          <div class="col-12 col-sm-6">
            <input v-model="customer.nationality" type="text" class="form-control mb-2" :placeholder="t('bookingForm.nationality')" />
          </div>
          <div class="col-12 col-sm-6">
            <input v-model="customer.telegram" type="text" class="form-control mb-2" :placeholder="t('bookingForm.telegramOptional')" />
          </div>

          <div class="col-12 col-sm-6">
            <select v-model="customer.idType" class="form-select mb-2">
              <option value="">{{ t('bookingForm.idType') }}</option>
              <option value="ID_CARD">{{ t('bookingForm.idCard') }}</option>
              <option value="PASSPORT">{{ t('bookingForm.passport') }}</option>
            </select>
          </div>
          <div class="col-12 col-sm-6">
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
        </div>

        <h4 class="h6 mt-4 mb-3">{{ t('bookingForm.paymentTitle') }}</h4>
        <div class="row g-2">
          <div class="col-12">
            <div class="payment-method-grid">
              <button
                v-for="m in paymentMethods"
                :key="m.value"
                type="button"
                class="payment-method-btn"
                :class="{ active: paymentMethod === m.value }"
                @click="paymentMethod = m.value"
              >
                <i class="bi" :class="m.icon" />
                <span>{{ m.label }}</span>
              </button>
            </div>
          </div>

          <div v-if="paymentMethod === 'CARD'" class="col-12">
            <div class="payment-instructions p-3 mt-2">
              <p class="small mb-0">{{ props.bike.shopCardInstructions || t('bookingForm.noInstructionsYet') }}</p>
            </div>
          </div>

          <div v-else-if="isBankMethod" class="col-12">
            <div class="payment-instructions p-3 mt-2">
              <!-- Mobile + ABA: try to jump straight into the ABA app -->
              <a
                v-if="isMobile && paymentMethod === 'ABA' && khqr.available && khqr.abaDeepLink"
                :href="khqr.abaDeepLink"
                class="btn btn-charcoal w-100 mb-3"
              >
                <i class="bi bi-box-arrow-up-right me-2" />{{ t('bookingForm.openAbaApp') }}
              </a>

              <template v-if="khqrLoading">
                <p class="small text-muted mb-0"><span class="spinner-border spinner-border-sm me-1" />{{ t('bookingForm.generatingQr') }}</p>
              </template>
              <template v-else-if="khqr.available">
                <img :src="khqr.qrImage" alt="KHQR" class="khqr-image mb-2" />
                <p class="small mb-0">
                  {{ isMobile ? t('bookingForm.scanWithAppMobile') : t('bookingForm.scanWithAppDesktop') }}
                </p>
              </template>
              <template v-else>
                <img v-if="paymentMethod === 'KHQR' && props.bike.shopKhqrImageUrl" :src="props.bike.shopKhqrImageUrl" alt="KHQR" class="khqr-image mb-2" />
                <p class="small mb-0">{{ currentInstructions || t('bookingForm.noInstructionsYet') }}</p>
              </template>
            </div>
          </div>

          <div class="col-12 col-sm-6">
            <label class="form-label small text-muted mb-1">{{ t('bookingForm.amountPaid') }}</label>
            <input v-model.number="paidAmount" type="number" step="0.01" min="0" class="form-control" />
          </div>
          <div class="col-12 col-sm-6">
            <label class="form-label small text-muted mb-1">{{ t('bookingForm.transactionRef') }}</label>
            <input v-model="paymentReference" type="text" class="form-control" :placeholder="t('bookingForm.transactionRefPlaceholder')" />
          </div>
          <div class="col-12">
            <label class="form-label small text-muted mb-1">{{ t('bookingForm.uploadPaymentProof') }}</label>
            <input ref="proofInputEl" type="file" accept="image/jpeg,image/jpg,image/png,image/webp" class="form-control mb-1" @change="onProofChange" />
            <div v-if="paymentProofPreview" class="id-preview mb-1">
              <img :src="paymentProofPreview" alt="" class="id-preview__img" />
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="removeProof">{{ t('bookingForm.removeFile') }}</button>
            </div>
            <p v-if="proofError" class="text-danger small mb-0">{{ proofError }}</p>
          </div>
          <div v-if="quote?.available && paidAmount < quote.requiredDeposit - 0.01" class="col-12">
            <p class="text-danger small mb-0">{{ t('bookingForm.depositTooLow', { amount: quote.requiredDeposit.toFixed(2) }) }}</p>
          </div>

          <div class="col-12 mt-2">
            <textarea v-model="notes" class="form-control mb-2" rows="2" :placeholder="t('bookingForm.notesOptional')" />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-amber w-100 mt-2"
          :disabled="submitting || !canSubmit"
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
          <p class="fw-600 mb-0">{{ props.bike.shopName || 'Your shop' }}</p>
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
          <span v-if="quote.isHalfDay">{{ t('bookingForm.halfDayRate') }}</span>
          <span v-else>{{ quote.days }} {{ t('common.day') }} &times; ${{ quote.ratePerDay.toFixed(2) }}</span>
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
        <div class="d-flex justify-content-between small mt-1">
          <span>{{ t('bookingForm.amountPaid') }}</span>
          <span>${{ confirmation.paidAmount.toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-content-between small">
          <span>{{ t('bookingForm.remaining') }}</span>
          <span>${{ Math.max(0, confirmation.total - confirmation.paidAmount).toFixed(2) }}</span>
        </div>
        <p v-if="Number(bike.deposit) > 0" class="small text-muted mt-1 mb-0">
          {{ t('bookingForm.refundableDeposit', { amount: Number(bike.deposit).toFixed(2) }) }}
        </p>
        <p class="small text-muted mt-3 mb-0">{{ t('bookingForm.printedOn') }} {{ formatDateTime2(printedAt) }}</p>
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
        <a v-if="props.bike.shopPhone" :href="`tel:${props.bike.shopPhone}`" class="btn btn-outline-charcoal">
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
    shopName?: string | null
    shopPhone?: string | null
    shopTelegram?: string | null
    shopWhatsapp?: string | null
    shopKhqrImageUrl?: string | null
    shopKhqrInstructions?: string | null
    shopAbaInstructions?: string | null
    shopAcledaInstructions?: string | null
    shopWingInstructions?: string | null
    shopCardInstructions?: string | null
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
  isHalfDay: boolean
  total: number
  requiredDeposit: number
  conflict: { pickupDate: string; returnDate: string } | null
}
interface Confirmation {
  bookingNumber: string
  motorbikeName: string
  pickupDate: string
  returnDate: string
  total: number
  paidAmount: number
  paymentStatus: string
}

const { t, locale } = useI18n()
const toast = useToast()

const today = new Date().toISOString().slice(0, 10)
const pickupDate = ref('')
const pickupTime = ref('09:00')
const returnDate = ref('')
const returnTime = ref('17:00')
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

const MAX_FILE_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const fileInputEl = ref<HTMLInputElement | null>(null)
const idDocumentFile = ref<File | null>(null)
const idDocumentPreview = ref('')
const fileError = ref('')

function onFileChange(e: Event) {
  fileError.value = ''
  const file = (e.target as HTMLInputElement).files?.[0] || null
  if (!file) return
  if (!ALLOWED_TYPES.has(file.type)) {
    fileError.value = t('bookingForm.invalidFileType')
    removeFile()
    return
  }
  if (file.size > MAX_FILE_BYTES) {
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

// ── Payment ──
const paymentMethods = [
  { value: 'KHQR', label: 'KHQR', icon: 'bi-qr-code' },
  { value: 'ABA', label: 'ABA', icon: 'bi-bank' },
  { value: 'ACLEDA', label: 'ACLEDA', icon: 'bi-bank2' },
  { value: 'WING', label: 'Wing', icon: 'bi-phone' },
  { value: 'CARD', label: 'Card', icon: 'bi-credit-card' }
]
const paymentMethod = ref('')
const paymentReference = ref('')
const paidAmount = ref(0)
const proofInputEl = ref<HTMLInputElement | null>(null)
const paymentProofFile = ref<File | null>(null)
const paymentProofPreview = ref('')
const proofError = ref('')

function onProofChange(e: Event) {
  proofError.value = ''
  const file = (e.target as HTMLInputElement).files?.[0] || null
  if (!file) return
  if (!ALLOWED_TYPES.has(file.type)) {
    proofError.value = t('bookingForm.invalidFileType')
    removeProof()
    return
  }
  if (file.size > MAX_FILE_BYTES) {
    proofError.value = t('bookingForm.fileTooLarge')
    removeProof()
    return
  }
  paymentProofFile.value = file
  paymentProofPreview.value = URL.createObjectURL(file)
}
function removeProof() {
  paymentProofFile.value = null
  if (paymentProofPreview.value) URL.revokeObjectURL(paymentProofPreview.value)
  paymentProofPreview.value = ''
  if (proofInputEl.value) proofInputEl.value.value = ''
}

const isBankMethod = computed(() => ['KHQR', 'ABA', 'ACLEDA', 'WING'].includes(paymentMethod.value))

// KHQR/ABA/ACLEDA/Wing can all be paid by scanning the same universal KHQR
// code; only ABA additionally has a documented app-open deep link, so that's
// the only method that gets a mobile "jump into the app" shortcut.
const isMobile = ref(false)
onMounted(() => {
  isMobile.value = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
})

interface KhqrResult {
  available: boolean
  qrImage?: string
  abaDeepLink?: string
}
const khqr = ref<KhqrResult>({ available: false })
const khqrLoading = ref(false)

let khqrDebounce: ReturnType<typeof setTimeout> | null = null
async function refreshKhqr() {
  khqr.value = { available: false }
  if (!isBankMethod.value || !paidAmount.value || paidAmount.value <= 0) return
  if (khqrDebounce) clearTimeout(khqrDebounce)
  khqrDebounce = setTimeout(async () => {
    khqrLoading.value = true
    try {
      khqr.value = await useApi<KhqrResult>('/api/public/payments/khqr', {
        method: 'POST',
        body: { motorbikeId: props.bike.id, amount: paidAmount.value, reference: customer.phone || undefined }
      })
    } catch {
      khqr.value = { available: false }
    } finally {
      khqrLoading.value = false
    }
  }, 500)
}
watch([paymentMethod, paidAmount], refreshKhqr)

const currentInstructions = computed(() => {
  switch (paymentMethod.value) {
    case 'KHQR':
      return props.bike.shopKhqrInstructions
    case 'ABA':
      return props.bike.shopAbaInstructions
    case 'ACLEDA':
      return props.bike.shopAcledaInstructions
    case 'WING':
      return props.bike.shopWingInstructions
    case 'CARD':
      return props.bike.shopCardInstructions
    default:
      return ''
  }
})

onMounted(async () => {
  try {
    locations.value = await useApi<Location[]>('/api/public/locations', { query: { motorbikeId: props.bike.id } })
  } catch {
    locations.value = []
  }
})

// Whenever the quote updates, default the amount to the required 50%
// deposit so customers don't have to do the math themselves.
watch(quote, (q) => {
  if (q?.available) paidAmount.value = q.requiredDeposit
})

const canSubmit = computed(() => {
  if (!pickupDate.value || !returnDate.value || !paymentMethod.value) return false
  if (quote.value && !quote.value.available) return false
  if (quote.value && paidAmount.value < quote.value.requiredDeposit - 0.01) return false
  return true
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
        body: {
          motorbikeId: props.bike.id,
          pickupDate: `${pickupDate.value}T${pickupTime.value}:00`,
          returnDate: `${returnDate.value}T${returnTime.value}:00`
        }
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : t('bookingForm.couldNotCheckAvailability')
    }
  }, 300)
}

watch([pickupDate, pickupTime, returnDate, returnTime], checkAvailability)

async function submitBooking() {
  error.value = ''
  if (quote.value && !quote.value.available) return
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('motorbikeId', props.bike.id)
    formData.append('pickupDate', `${pickupDate.value}T${pickupTime.value}:00`)
    formData.append('returnDate', `${returnDate.value}T${returnTime.value}:00`)
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

    formData.append('paymentMethod', paymentMethod.value)
    formData.append('paidAmount', String(paidAmount.value || 0))
    if (paymentReference.value) formData.append('paymentReference', paymentReference.value)
    if (paymentProofFile.value) formData.append('paymentProof', paymentProofFile.value)

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
function formatDateTime(d: string) {
  return new Date(d).toLocaleString(locale.value, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatDateTime2(d: Date | null) {
  if (!d) return ''
  return d.toLocaleString(locale.value, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function printReceipt() {
  window.print()
}

const telegramLink = computed(() => {
  const t = props.bike.shopTelegram?.replace('@', '')
  return t ? `https://t.me/${t}` : null
})
const whatsappLink = computed(() => {
  const w = props.bike.shopWhatsapp?.replace(/\D/g, '')
  return w ? `https://wa.me/${w}` : null
})
</script>

<style scoped>
@media (min-width: 992px) {
  .booking-form {
    position: sticky;
    top: 90px;
  }
}
.quote-box {
  border-radius: var(--radius-md);
  background: var(--color-gray-light);
}
.quote-box--warn {
  background: #fbe9e5;
  color: #a3341c;
}
.deposit-callout {
  border-radius: var(--radius-sm);
  background: rgba(212, 175, 55, 0.14);
  color: var(--color-brown, #5a4a2e);
  font-size: 0.85rem;
  font-weight: 600;
}
.id-preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.id-preview__img {
  width: 90px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.payment-method-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}
.payment-method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.6rem 0.25rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-white);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-charcoal);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.payment-method-btn i {
  font-size: 1.1rem;
}
.payment-method-btn:hover {
  border-color: var(--color-amber);
}
.payment-method-btn.active {
  border-color: var(--color-amber-deep);
  background: rgba(231, 160, 60, 0.14);
  color: var(--color-amber-deep);
}
.payment-instructions {
  border-radius: var(--radius-sm);
  background: var(--color-gray-light);
}
.khqr-image {
  max-width: 220px;
  width: 100%;
  display: block;
  border-radius: var(--radius-sm);
  background: var(--color-white);
  padding: 0.5rem;
  border: 1px solid var(--color-border);
}
@media (max-width: 480px) {
  .payment-method-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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
