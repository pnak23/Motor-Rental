<template>
  <div class="row g-4">
    <div class="col-lg-8">
      <div class="card p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p class="text-muted small mb-1">Booking #</p>
            <h2 class="font-mono h5 mb-0">{{ booking.bookingNumber }}</h2>
          </div>
          <StatusBadge :status="booking.status" />
        </div>

        <h3 class="h6 font-display mb-2">Customer</h3>
        <div class="row small mb-3">
          <div class="col-6"><strong>Name:</strong> {{ booking.customer.fullName }}</div>
          <div class="col-6"><strong>Phone:</strong> {{ booking.customer.phone }}</div>
          <div class="col-6"><strong>Email:</strong> {{ booking.customer.email || '—' }}</div>
          <div class="col-6"><strong>Nationality:</strong> {{ booking.customer.nationality || '—' }}</div>
          <div class="col-6"><strong>Telegram:</strong> {{ booking.customer.telegram || '—' }}</div>
          <div class="col-6"><strong>WhatsApp:</strong> {{ booking.customer.whatsapp || '—' }}</div>
        </div>

        <h3 class="h6 font-display mb-2">Rental</h3>
        <div class="row small mb-3">
          <div class="col-6"><strong>Motorbike:</strong> {{ booking.motorbike.name }}</div>
          <div class="col-6"><strong>Daily Price:</strong> ${{ Number(booking.motorbike.dailyPrice).toFixed(2) }}</div>
          <div class="col-6"><strong>Pickup:</strong> {{ formatDate(booking.pickupDate) }}</div>
          <div class="col-6"><strong>Return:</strong> {{ formatDate(booking.returnDate) }}</div>
          <div class="col-6"><strong>Pickup Location:</strong> {{ booking.pickupLocationName || '—' }}</div>
          <div class="col-6"><strong>Return Location:</strong> {{ booking.returnLocationName || '—' }}</div>
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
          </tbody>
        </table>

        <h3 class="h6 font-display mb-2">Notes</h3>
        <p class="small text-muted">{{ booking.notes || 'No notes' }}</p>

        <h3 class="h6 font-display mb-2 mt-2">Adjust Booking</h3>
        <form class="row g-2 align-items-end" @submit.prevent="saveEdits">
          <div class="col-md-3">
            <label class="form-label small">Discount ($)</label>
            <input v-model.number="edits.discount" type="number" step="0.01" class="form-control form-control-sm" />
          </div>
          <div class="col-md-3">
            <label class="form-label small">Additional Charges ($)</label>
            <input v-model.number="edits.additionalCharges" type="number" step="0.01" class="form-control form-control-sm" />
          </div>
          <div class="col-md-3">
            <label class="form-label small">Deposit ($)</label>
            <input v-model.number="edits.deposit" type="number" step="0.01" class="form-control form-control-sm" />
          </div>
          <div class="col-md-3">
            <button type="submit" class="btn btn-sm btn-charcoal w-100">Save</button>
          </div>
        </form>
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
  subtotal: string
  discount: string
  deliveryFee: string
  additionalCharges: string
  deposit: string
  total: string
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
  }
  motorbike: { name: string; dailyPrice: string }
  timeline: { id: string; status: string; note: string | null; createdAt: string; changedByName: string | null }[]
}

const route = useRoute()
const toast = useToast()
const id = route.params.id as string

const booking = ref<BookingDetail>(await useApi<BookingDetail>(`/api/admin/bookings/${id}`))

const statuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'REJECTED']
const newStatus = ref(booking.value.status)
const statusNote = ref('')
const updating = ref(false)

const edits = reactive({
  discount: Number(booking.value.discount),
  additionalCharges: Number(booking.value.additionalCharges),
  deposit: Number(booking.value.deposit)
})

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
    await useApi(`/api/admin/bookings/${id}`, { method: 'PUT', body: edits })
    toast.success('Booking updated')
    await refresh()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save changes')
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
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
</style>
