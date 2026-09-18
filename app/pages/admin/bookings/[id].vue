<template>
  <div class="row g-4">
    <div class="col-lg-8">
      <div class="card p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p class="text-muted small mb-1">Booking #</p>
            <h2 class="font-mono h5 mb-0">{{ booking.bookingNumber }}</h2>
          </div>
          <div class="d-flex align-items-center gap-2">
            <StatusBadge :status="booking.status" />
            <button class="btn btn-sm btn-outline-secondary" @click="showEditModal = true"><i class="bi bi-pencil me-1" />Edit Booking</button>
          </div>
        </div>

        <h3 class="h6 font-display mb-2">Customer</h3>
        <div class="row small mb-3">
          <div class="col-6"><strong>Name:</strong> {{ booking.customer.fullName }}</div>
          <div class="col-6"><strong>Phone:</strong> {{ booking.customer.phone }}</div>
          <div class="col-6"><strong>Email:</strong> {{ booking.customer.email || '—' }}</div>
          <div class="col-6"><strong>Nationality:</strong> {{ booking.customer.nationality || '—' }}</div>
          <div class="col-6"><strong>Telegram:</strong> {{ booking.customer.telegram || '—' }}</div>
          <div class="col-6"><strong>WhatsApp:</strong> {{ booking.customer.whatsapp || '—' }}</div>
          <div class="col-6">
            <strong>ID Type:</strong> {{ booking.customer.idType ? booking.customer.idType.replace('_', ' ') : '—' }}
          </div>
          <div class="col-6"><strong>ID / Passport #:</strong> {{ booking.customer.passportId || '—' }}</div>
          <div v-if="booking.customer.idDocumentUrl" class="col-12 mt-2">
            <strong class="d-block mb-1">ID Document:</strong>
            <a :href="booking.customer.idDocumentUrl" target="_blank" rel="noopener">
              <img :src="booking.customer.idDocumentUrl" alt="ID document" class="id-document-thumb" />
            </a>
          </div>
        </div>

        <h3 class="h6 font-display mb-2">Rental</h3>
        <div class="d-flex gap-3 align-items-start mb-3">
          <img v-if="booking.motorbike.image" :src="booking.motorbike.image" :alt="booking.motorbike.name" class="motorbike-thumb" />
          <div v-else class="motorbike-thumb motor-placeholder motor-placeholder--sm"><i class="bi bi-scooter" /></div>
          <div class="row small flex-grow-1">
            <div class="col-6"><strong>Motorbike:</strong> {{ booking.motorbike.name }}</div>
            <div class="col-6"><strong>Plate:</strong> {{ formatPlate(booking.motorbike.plateProvince, booking.motorbike.plateNumber) || '—' }}</div>
            <div class="col-6"><strong>Daily Price:</strong> ${{ Number(booking.motorbike.dailyPrice).toFixed(2) }}</div>
            <div class="col-6"><strong>Pickup:</strong> {{ formatDateTime(booking.pickupDate) }}</div>
            <div class="col-6"><strong>Return:</strong> {{ formatDateTime(booking.returnDate) }}</div>
            <div class="col-6"><strong>Pickup Location:</strong> {{ booking.pickupLocationName || '—' }}</div>
            <div class="col-6"><strong>Return Location:</strong> {{ booking.returnLocationName || '—' }}</div>
          </div>
        </div>

        <h3 class="h6 font-display mb-2">Financial</h3>
        <table class="table table-sm small mb-3">
          <tbody>
            <tr><td>Subtotal</td><td class="text-end">${{ Number(booking.subtotal).toFixed(2) }}</td></tr>
            <tr><td>Discount</td><td class="text-end">-${{ Number(booking.discount).toFixed(2) }}</td></tr>
            <tr><td>Delivery Fee</td><td class="text-end">${{ Number(booking.deliveryFee).toFixed(2) }}</td></tr>
            <tr><td>Additional Charges</td><td class="text-end">${{ Number(booking.additionalCharges).toFixed(2) }}</td></tr>
            <tr class="fw-600"><td>Total</td><td class="text-end price-tag">${{ Number(booking.total).toFixed(2) }}</td></tr>
            <tr><td>Deposit</td><td class="text-end">${{ Number(booking.deposit).toFixed(2) }}</td></tr>
            <tr><td>Paid</td><td class="text-end">${{ Number(booking.paidAmount).toFixed(2) }}</td></tr>
            <tr class="fw-600"><td>Remaining</td><td class="text-end price-tag">${{ remainingAmount.toFixed(2) }}</td></tr>
            <tr v-if="Number(booking.lateFeeAmount) > 0"><td>Late Fee</td><td class="text-end text-danger">${{ Number(booking.lateFeeAmount).toFixed(2) }}</td></tr>
            <tr v-if="Number(booking.depositRefundedAmount) > 0"><td>Deposit Refunded</td><td class="text-end">${{ Number(booking.depositRefundedAmount).toFixed(2) }}</td></tr>
            <tr v-if="booking.actualReturnAt"><td>Actual Return</td><td class="text-end">{{ formatDateTime(booking.actualReturnAt) }}</td></tr>
            <tr><td>Payment Status</td><td class="text-end"><StatusBadge :status="booking.paymentStatus" /></td></tr>
            <tr v-if="booking.paymentMethod"><td>Payment Method</td><td class="text-end">{{ booking.paymentMethod }}</td></tr>
            <tr v-if="booking.paymentReference"><td>Transaction Ref</td><td class="text-end font-mono">{{ booking.paymentReference }}</td></tr>
          </tbody>
        </table>

        <div v-if="booking.paymentProofUrl" class="mb-3">
          <strong class="d-block small mb-1">Payment Proof:</strong>
          <a :href="booking.paymentProofUrl" target="_blank" rel="noopener">
            <img :src="booking.paymentProofUrl" alt="Payment proof" class="id-document-thumb" />
          </a>
        </div>

        <h3 class="h6 font-display mb-2">Notes</h3>
        <p class="small text-muted">{{ booking.notes || 'No notes' }}</p>

        <div class="d-flex justify-content-end mt-2">
          <button type="button" class="btn btn-sm btn-outline-danger" @click="showDelete = true">
            <i class="bi bi-trash me-1" />Delete Booking
          </button>
        </div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Update Status</h3>
        <select v-model="newStatus" class="form-select mb-2">
          <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
        </select>
        <textarea v-model="statusNote" class="form-control form-control-sm mb-2" rows="2" placeholder="Note (optional)" />
        <button class="btn btn-amber w-100" :disabled="updating" @click="updateStatus">
          <span v-if="updating" class="spinner-border spinner-border-sm me-2" />Update Status
        </button>
      </div>

      <div class="card p-3">
        <h3 class="h6 font-display mb-3">Timeline</h3>
        <ul class="list-unstyled timeline mb-0">
          <li v-for="t in booking.timeline" :key="t.id" class="mb-3">
            <p class="small mb-0"><strong>{{ t.status.replace('_', ' ') }}</strong></p>
            <p class="small text-muted mb-0">{{ formatDateTime(t.createdAt) }} <span v-if="t.changedByName">&middot; {{ t.changedByName }}</span></p>
            <p v-if="t.note" class="small mb-0">{{ t.note }}</p>
          </li>
        </ul>
      </div>
    </div>

    <ConfirmModal
      v-model="showDelete"
      title="Delete booking?"
      :message="`This will permanently delete booking ${booking.bookingNumber}. This cannot be undone.`"
      confirm-text="Delete"
      danger
      @confirm="confirmDelete"
    />

    <AdminModal v-model="showEditModal" title="Edit Booking" size="lg">
      <form id="edit-booking-form" class="row g-2" @submit.prevent="saveEdits">
        <div class="col-md-6">
          <label class="form-label small">Motorbike</label>
          <select v-model="edits.motorbikeId" class="form-select form-select-sm">
            <option v-for="m in motorbikes" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Pickup Date</label>
          <input v-model="edits.pickupDate" type="date" class="form-control form-control-sm" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Pickup Time</label>
          <input v-model="edits.pickupTime" type="time" class="form-control form-control-sm" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Return Date</label>
          <input v-model="edits.returnDate" type="date" class="form-control form-control-sm" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Return Time</label>
          <input v-model="edits.returnTime" type="time" class="form-control form-control-sm" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Pickup Location</label>
          <select v-model="edits.pickupLocationId" class="form-select form-select-sm">
            <option value="">No preference</option>
            <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Return Location</label>
          <select v-model="edits.returnLocationId" class="form-select form-select-sm">
            <option value="">No preference</option>
            <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Discount ($)</label>
          <input v-model.number="edits.discount" type="number" step="0.01" class="form-control form-control-sm" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Additional Charges ($)</label>
          <input v-model.number="edits.additionalCharges" type="number" step="0.01" class="form-control form-control-sm" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Deposit ($)</label>
          <input v-model.number="edits.deposit" type="number" step="0.01" class="form-control form-control-sm" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Payment Status</label>
          <select v-model="edits.paymentStatus" class="form-select form-select-sm">
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Paid Amount ($)</label>
          <input v-model.number="edits.paidAmount" type="number" step="0.01" class="form-control form-control-sm" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Payment Method</label>
          <select v-model="edits.paymentMethod" class="form-select form-select-sm">
            <option value="">—</option>
            <option value="CASH">Cash</option>
            <option value="KHQR">KHQR</option>
            <option value="ABA">ABA</option>
            <option value="ACLEDA">ACLEDA</option>
            <option value="WING">Wing</option>
            <option value="CARD">Card</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small">Transaction Reference</label>
          <input v-model="edits.paymentReference" class="form-control form-control-sm" />
        </div>
        <div class="col-12">
          <label class="form-label small">Notes</label>
          <textarea v-model="edits.notes" class="form-control form-control-sm" rows="2" />
        </div>

        <div class="col-12 mt-2">
          <h3 class="h6 font-display mb-2">Return &amp; Deposit</h3>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Actual Return Time</label>
          <input v-model="edits.actualReturnAt" type="datetime-local" class="form-control form-control-sm" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Late Fee ($)</label>
          <input v-model.number="edits.lateFeeAmount" type="number" min="0" step="0.01" class="form-control form-control-sm" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Deposit Refunded ($)</label>
          <input v-model.number="edits.depositRefundedAmount" type="number" min="0" step="0.01" class="form-control form-control-sm" />
          <p v-if="booking.depositRefundedAt" class="form-text small mb-0">Refunded {{ formatDateTime(booking.depositRefundedAt) }}</p>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showEditModal = false">Cancel</button>
        <button type="submit" form="edit-booking-form" class="btn btn-amber">Save Changes</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Booking Detail' })

interface BookingDetail {
  id: string
  bookingNumber: string
  status: string
  pickupDate: string
  returnDate: string
  pickupLocationId: string | null
  returnLocationId: string | null
  subtotal: string
  discount: string
  deliveryFee: string
  additionalCharges: string
  deposit: string
  total: string
  paymentStatus: string
  paymentMethod: string | null
  paymentReference: string | null
  paymentProofUrl: string | null
  paidAmount: string
  actualReturnAt: string | null
  lateFeeAmount: string
  depositRefundedAmount: string
  depositRefundedAt: string | null
  notes: string | null
  pickupLocationName: string | null
  returnLocationName: string | null
  customer: {
    fullName: string
    phone: string
    email: string | null
    nationality: string | null
    telegram: string | null
    whatsapp: string | null
    idType: string | null
    passportId: string | null
    idDocumentUrl: string | null
  }
  motorbike: { id: string; name: string; dailyPrice: string; plateNumber: string | null; plateProvince: string | null; image: string | null }
  timeline: { id: string; status: string; note: string | null; createdAt: string; changedByName: string | null }[]
}
interface MotorbikeOption {
  id: string
  name: string
}
interface LocationOption {
  id: string
  name: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = route.params.id as string

const [bookingData, motorbikeRes, locations] = await Promise.all([
  useApi<BookingDetail>(`/api/admin/bookings/${id}`),
  useApi<{ items: MotorbikeOption[] }>('/api/admin/motorbikes', { query: { pageSize: 100, sort: 'name' } }),
  useApi<LocationOption[]>('/api/admin/locations')
])
const booking = ref<BookingDetail>(bookingData)
const motorbikes = motorbikeRes.items

const statuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'REJECTED']
const newStatus = ref(booking.value.status)
const statusNote = ref('')
const updating = ref(false)
const showDelete = ref(false)
const deleting = ref(false)
const showEditModal = ref(false)

function toDateInput(d: string) {
  return new Date(d).toISOString().slice(0, 10)
}
function toTimeInput(d: string) {
  return new Date(d).toTimeString().slice(0, 5)
}
/** Local-time value for a `datetime-local` input (unlike toDateInput above,
 *  which uses the UTC calendar day — fine for a bare date, but wrong here
 *  since this also carries a time-of-day). */
function toDateTimeInput(d: string) {
  const date = new Date(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const edits = reactive({
  motorbikeId: booking.value.motorbike.id,
  pickupDate: toDateInput(booking.value.pickupDate),
  pickupTime: toTimeInput(booking.value.pickupDate),
  returnDate: toDateInput(booking.value.returnDate),
  returnTime: toTimeInput(booking.value.returnDate),
  pickupLocationId: booking.value.pickupLocationId || '',
  returnLocationId: booking.value.returnLocationId || '',
  discount: Number(booking.value.discount),
  additionalCharges: Number(booking.value.additionalCharges),
  deposit: Number(booking.value.deposit),
  paymentStatus: booking.value.paymentStatus,
  paymentMethod: booking.value.paymentMethod || '',
  paymentReference: booking.value.paymentReference || '',
  paidAmount: Number(booking.value.paidAmount),
  actualReturnAt: booking.value.actualReturnAt ? toDateTimeInput(booking.value.actualReturnAt) : '',
  lateFeeAmount: Number(booking.value.lateFeeAmount),
  depositRefundedAmount: Number(booking.value.depositRefundedAmount),
  notes: booking.value.notes || ''
})

const remainingAmount = computed(() => Math.max(0, Number(booking.value.total) - Number(booking.value.paidAmount)))

async function refresh() {
  booking.value = await useApi<BookingDetail>(`/api/admin/bookings/${id}`)
}

async function updateStatus() {
  updating.value = true
  try {
    await useApi(`/api/admin/bookings/${id}/status`, { method: 'PUT', body: { status: newStatus.value, note: statusNote.value } })
    toast.success('Status updated')
    statusNote.value = ''
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update status')
  } finally {
    updating.value = false
  }
}

async function saveEdits() {
  try {
    await useApi(`/api/admin/bookings/${id}`, {
      method: 'PUT',
      body: {
        motorbikeId: edits.motorbikeId,
        pickupDate: `${edits.pickupDate}T${edits.pickupTime}:00`,
        returnDate: `${edits.returnDate}T${edits.returnTime}:00`,
        pickupLocationId: edits.pickupLocationId || null,
        returnLocationId: edits.returnLocationId || null,
        discount: edits.discount,
        additionalCharges: edits.additionalCharges,
        deposit: edits.deposit,
        paymentStatus: edits.paymentStatus,
        paymentMethod: edits.paymentMethod || null,
        paymentReference: edits.paymentReference || null,
        paidAmount: edits.paidAmount,
        notes: edits.notes || null,
        actualReturnAt: edits.actualReturnAt || null,
        lateFeeAmount: edits.lateFeeAmount,
        depositRefundedAmount: edits.depositRefundedAmount
      }
    })
    toast.success('Booking updated')
    showEditModal.value = false
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save changes')
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await useApi(`/api/admin/bookings/${id}`, { method: 'DELETE' })
    toast.success('Booking deleted')
    router.push('/admin/bookings')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not delete booking')
  } finally {
    deleting.value = false
  }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.timeline li {
  border-left: 2px solid var(--color-border);
  padding-left: 0.75rem;
}
.id-document-thumb {
  max-width: 220px;
  max-height: 150px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
.motorbike-thumb {
  width: 96px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}
</style>
