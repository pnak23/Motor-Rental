<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Bookings</h1>
        <p class="admin-page-header__subtitle">{{ total }} bookings on record.</p>
      </div>
      <div class="admin-page-header__actions">
        <input v-model="search" class="form-control" placeholder="Search by name, phone, booking #..." style="width: 260px" />
        <select v-model="status" class="form-select" style="width: 180px">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
        </select>
        <button class="btn btn-amber" @click="showCreateModal = true"><i class="bi bi-plus-lg me-1" />New Booking</button>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Booking #</th>
              <th>Customer</th>
              <th>Motorbike</th>
              <th>Pickup</th>
              <th>Return</th>
              <th>Total</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending"><td colspan="8" class="text-center py-4"><span class="spinner-border spinner-border-sm" /></td></tr>
            <tr v-else-if="items.length === 0"><td colspan="8" class="text-center py-4 text-muted">No bookings found</td></tr>
            <tr v-for="b in items" :key="b.id">
              <td class="font-mono small">{{ b.bookingNumber }}</td>
              <td>{{ b.customerName }}<br /><span class="text-muted small">{{ b.customerPhone }}</span></td>
              <td>{{ b.motorbikeName }}</td>
              <td class="small">{{ formatDate(b.pickupDate) }}</td>
              <td class="small">{{ formatDate(b.returnDate) }}</td>
              <td class="price-tag">${{ Number(b.total).toFixed(2) }}</td>
              <td><StatusBadge :status="b.status" /></td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <NuxtLink :to="`/admin/bookings/${b.id}`" class="btn btn-outline-charcoal">View</NuxtLink>
                  <button class="btn btn-outline-danger" title="Delete" @click="askDelete(b)"><i class="bi bi-trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-3 d-flex justify-content-between align-items-center">
        <span class="small text-muted">{{ total }} total</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
      </div>
    </div>

    <ConfirmModal
      v-model="showDelete"
      title="Delete booking?"
      :message="`This will permanently delete booking ${toDelete?.bookingNumber}. This cannot be undone.`"
      confirm-text="Delete"
      danger
      @confirm="confirmDelete"
    />

    <AdminModal v-model="showCreateModal" title="New Booking" size="xl">
      <BookingFormFields ref="bookingFormRef" :initial-date="prefillDate" @created="onCreated" @submitting="creating = $event" />
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showCreateModal = false">Cancel</button>
        <button type="button" class="btn btn-amber" :disabled="creating" @click="bookingFormRef?.submit()">
          <span v-if="creating" class="spinner-border spinner-border-sm me-2" />Create Booking
        </button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Bookings' })

interface BookingRow {
  id: string
  bookingNumber: string
  customerName: string
  customerPhone: string
  motorbikeName: string
  pickupDate: string
  returnDate: string
  total: string
  status: string
}

const statuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'REJECTED']

const toast = useToast()
const route = useRoute()
const router = useRouter()

const showCreateModal = ref(false)
const creating = ref(false)
const bookingFormRef = ref<{ submit: () => void } | null>(null)
const prefillDate = (route.query.date as string) || ''

if (route.query.new) {
  showCreateModal.value = true
  router.replace({ query: { ...route.query, new: undefined } })
}

function onCreated() {
  showCreateModal.value = false
  fetchList()
}

const search = ref('')
const status = ref('')
const page = ref(1)
const items = ref<BookingRow[]>([])
const total = ref(0)
const totalPages = ref(1)
const pending = ref(true)

const showDelete = ref(false)
const toDelete = ref<BookingRow | null>(null)

async function fetchList() {
  pending.value = true
  try {
    const query: Record<string, string | number> = { page: page.value, pageSize: 15 }
    if (search.value) query.search = search.value
    if (status.value) query.status = status.value
    const res = await useApi<{ items: BookingRow[]; total: number; totalPages: number }>('/api/admin/bookings', { query })
    items.value = res.items
    total.value = res.total
    totalPages.value = res.totalPages
  } finally {
    pending.value = false
  }
}

let debounce: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => {
    page.value = 1
    fetchList()
  }, 350)
})
watch([status, page], fetchList)

await fetchList()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function askDelete(b: BookingRow) {
  toDelete.value = b
  showDelete.value = true
}
async function confirmDelete() {
  if (!toDelete.value) return
  try {
    await useApi(`/api/admin/bookings/${toDelete.value.id}`, { method: 'DELETE' })
    toast.success('Booking deleted')
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not delete booking')
  }
}
</script>
