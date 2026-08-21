<template>
  <div>
    <div class="d-flex gap-2 justify-content-between mb-3">
      <div class="d-flex gap-2">
        <input v-model="search" class="form-control" placeholder="Search by name, phone, booking #..." style="width: 280px" />
        <select v-model="status" class="form-select" style="width: 180px">
          <option value="">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
        </select>
      </div>
      <NuxtLink to="/admin/bookings/create" class="btn btn-amber"><i class="bi bi-plus-lg me-1" />New Booking</NuxtLink>
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
