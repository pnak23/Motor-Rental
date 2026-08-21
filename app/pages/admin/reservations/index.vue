<template>
  <div class="reservations-page">
    <!-- KPIs -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3"><StatCard label="Today's Reservations" :value="summary?.todayReservations ?? '—'" icon="bi-calendar-event" color="amber" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Active Rentals" :value="summary?.activeRentals ?? '—'" icon="bi-scooter" color="success" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Returning Today" :value="summary?.returningToday ?? '—'" icon="bi-arrow-return-left" color="charcoal" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Available Motors" :value="summary?.availableMotors ?? '—'" icon="bi-check-circle" color="success" /></div>
    </div>
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3"><StatCard label="Upcoming This Week" :value="summary?.upcomingThisWeek ?? '—'" icon="bi-calendar-week" color="amber" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Pending Approval" :value="summary?.pendingCount ?? '—'" icon="bi-hourglass-split" color="danger" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Unpaid / Partial" :value="summary?.unpaidCustomers ?? '—'" icon="bi-cash-coin" color="danger" /></div>
    </div>

    <!-- Toolbar -->
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <NuxtLink to="/admin/bookings/create" class="btn btn-amber"><i class="bi bi-plus-lg me-1" />New Reservation</NuxtLink>
      <div class="view-toggle">
        <button type="button" class="view-toggle__btn" :class="{ active: view === 'calendar' }" @click="setView('calendar')">
          <i class="bi bi-calendar3 me-1" />Calendar
        </button>
        <button type="button" class="view-toggle__btn" :class="{ active: view === 'table' }" @click="setView('table')">
          <i class="bi bi-table me-1" />Table
        </button>
      </div>
    </div>

    <!-- Calendar view -->
    <div v-if="view === 'calendar'">
      <ReservationCalendar
        :year="calYear"
        :month="calMonth"
        :data="calendarData"
        :pending="calendarPending"
        @change-month="onChangeMonth"
        @select-date="openDay"
      />
    </div>

    <!-- Table view -->
    <div v-else>
      <div class="card p-3 mb-3 filter-bar">
        <div class="row g-2">
          <div class="col-md-2">
            <input v-model="search" class="form-control" placeholder="Search reservations..." />
          </div>
          <div class="col-md-2">
            <select v-model="statusFilter" class="form-select">
              <option value="">All statuses</option>
              <option v-for="s in statuses" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="paymentFilter" class="form-select">
              <option value="">All payments</option>
              <option v-for="p in paymentStatuses" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="motorbikeFilter" class="form-select">
              <option value="">All motors</option>
              <option v-for="m in motorbikes" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <input v-model="fromFilter" type="date" class="form-control" title="From date" />
          </div>
          <div class="col-md-2">
            <input v-model="toFilter" type="date" class="form-control" title="To date" />
          </div>
        </div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="sortable" @click="toggleSort('bookingNumber')">ID <i class="bi" :class="sortIcon('bookingNumber')" /></th>
                <th>Customer</th>
                <th>Motor</th>
                <th class="sortable" @click="toggleSort('pickupDate')">Pickup <i class="bi" :class="sortIcon('pickupDate')" /></th>
                <th class="sortable" @click="toggleSort('returnDate')">Return <i class="bi" :class="sortIcon('returnDate')" /></th>
                <th class="sortable" @click="toggleSort('total')">Total <i class="bi" :class="sortIcon('total')" /></th>
                <th>Status</th>
                <th>Payment</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pending"><td colspan="9" class="text-center py-4"><span class="spinner-border spinner-border-sm" /></td></tr>
              <tr v-else-if="items.length === 0"><td colspan="9" class="text-center py-4 text-muted">No reservations found</td></tr>
              <tr v-for="b in items" :key="b.id">
                <td class="font-mono small">{{ b.bookingNumber }}</td>
                <td>{{ b.customerName }}<br /><span class="text-muted small">{{ b.customerPhone }}</span></td>
                <td>{{ b.motorbikeName }}</td>
                <td class="small">{{ formatDateTime(b.pickupDate) }}</td>
                <td class="small">{{ formatDateTime(b.returnDate) }}</td>
                <td class="price-tag">${{ Number(b.total).toFixed(2) }}</td>
                <td><StatusBadge :status="b.status" /></td>
                <td><StatusBadge :status="b.paymentStatus" /></td>
                <td class="text-end">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-charcoal dropdown-toggle" data-bs-toggle="dropdown">Actions</button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li><NuxtLink class="dropdown-item" :to="`/admin/bookings/${b.id}`"><i class="bi bi-eye me-2" />View / Edit</NuxtLink></li>
                      <li v-if="b.status !== 'CONFIRMED'"><button class="dropdown-item" @click="quickStatus(b, 'CONFIRMED')"><i class="bi bi-check-circle me-2" />Mark as Confirmed</button></li>
                      <li v-if="b.status !== 'PICKED_UP'"><button class="dropdown-item" @click="quickStatus(b, 'PICKED_UP')"><i class="bi bi-scooter me-2" />Mark as Picked Up</button></li>
                      <li v-if="b.status !== 'RETURNED'"><button class="dropdown-item" @click="quickStatus(b, 'RETURNED')"><i class="bi bi-arrow-return-left me-2" />Mark as Returned</button></li>
                      <li><hr class="dropdown-divider" /></li>
                      <li v-if="b.status !== 'CANCELLED'"><button class="dropdown-item text-danger" @click="askCancel(b)"><i class="bi bi-x-circle me-2" />Cancel</button></li>
                      <li><button class="dropdown-item text-danger" @click="askDelete(b)"><i class="bi bi-trash me-2" />Delete</button></li>
                    </ul>
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
    </div>

    <ReservationDayModal v-model="dayModalOpen" :date="selectedDate" />

    <ConfirmModal
      v-model="showCancel"
      title="Cancel reservation?"
      :message="`This will mark booking ${toCancel?.bookingNumber} as cancelled.`"
      confirm-text="Cancel Booking"
      danger
      @confirm="confirmCancel"
    />
    <ConfirmModal
      v-model="showDelete"
      title="Delete reservation?"
      :message="`This will permanently delete booking ${toDelete?.bookingNumber}. This cannot be undone.`"
      confirm-text="Delete"
      danger
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Reservations' })

interface Summary {
  todayReservations: number
  activeRentals: number
  returningToday: number
  availableMotors: number
  upcomingThisWeek: number
  pendingCount: number
  unpaidCustomers: number
}
interface CalendarDay {
  date: string
  total: number
  pending: number
  confirmed: number
  active: number
  returned: number
  cancelled: number
  returning: number
}
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
  paymentStatus: string
}
interface MotorbikeOption {
  id: string
  name: string
}

const toast = useToast()

const VIEW_KEY = 'admin-reservations-view'
const view = ref<'calendar' | 'table'>('calendar')
onMounted(() => {
  const saved = localStorage.getItem(VIEW_KEY)
  if (saved === 'calendar' || saved === 'table') view.value = saved
})
function setView(v: 'calendar' | 'table') {
  view.value = v
  localStorage.setItem(VIEW_KEY, v)
  if (v === 'table') fetchList()
}

const statuses = ['PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'REJECTED']
const paymentStatuses = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED']

// ── KPI summary ──
const summary = ref<Summary | null>(null)
async function fetchSummary() {
  summary.value = await useApi<Summary>('/api/admin/bookings/summary')
}

// ── Motorbikes for the filter dropdown ──
const motorbikes = ref<MotorbikeOption[]>([])

// ── Calendar ──
const today = new Date()
const calYear = ref(today.getFullYear())
const calMonth = ref(today.getMonth())
const calendarData = ref<CalendarDay[]>([])
const calendarPending = ref(true)

function monthRange(year: number, month: number) {
  const from = new Date(year, month, 1)
  const to = new Date(year, month + 1, 0)
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from: fmt(from), to: fmt(to) }
}

async function fetchCalendar() {
  calendarPending.value = true
  try {
    const { from, to } = monthRange(calYear.value, calMonth.value)
    calendarData.value = await useApi<CalendarDay[]>('/api/admin/bookings/calendar', { query: { from, to } })
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not load calendar')
  } finally {
    calendarPending.value = false
  }
}
function onChangeMonth(v: { year: number; month: number }) {
  calYear.value = v.year
  calMonth.value = v.month
  fetchCalendar()
}

const dayModalOpen = ref(false)
const selectedDate = ref<string | null>(null)
function openDay(iso: string) {
  selectedDate.value = iso
  dayModalOpen.value = true
}

// ── Table view ──
const search = ref('')
const statusFilter = ref('')
const paymentFilter = ref('')
const motorbikeFilter = ref('')
const fromFilter = ref('')
const toFilter = ref('')
const sortBy = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const items = ref<BookingRow[]>([])
const total = ref(0)
const totalPages = ref(1)
const pending = ref(true)

function toggleSort(col: string) {
  if (sortBy.value === col) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col
    sortDir.value = 'asc'
  }
  fetchList()
}
function sortIcon(col: string) {
  if (sortBy.value !== col) return 'bi-arrow-down-up text-muted opacity-50'
  return sortDir.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

async function fetchList() {
  pending.value = true
  try {
    const query: Record<string, string | number> = { page: page.value, pageSize: 15, sortBy: sortBy.value, sortDir: sortDir.value }
    if (search.value) query.search = search.value
    if (statusFilter.value) query.status = statusFilter.value
    if (paymentFilter.value) query.paymentStatus = paymentFilter.value
    if (motorbikeFilter.value) query.motorbikeId = motorbikeFilter.value
    if (fromFilter.value) query.from = fromFilter.value
    if (toFilter.value) query.to = toFilter.value
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
watch([statusFilter, paymentFilter, motorbikeFilter, fromFilter, toFilter, page], fetchList)

// ── Quick actions ──
async function quickStatus(b: BookingRow, status: string) {
  try {
    await useApi(`/api/admin/bookings/${b.id}/status`, { method: 'PUT', body: { status } })
    toast.success(`Booking ${b.bookingNumber} marked as ${status.replace('_', ' ').toLowerCase()}`)
    fetchList()
    fetchSummary()
    if (view.value === 'calendar') fetchCalendar()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update status')
  }
}

const showCancel = ref(false)
const toCancel = ref<BookingRow | null>(null)
function askCancel(b: BookingRow) {
  toCancel.value = b
  showCancel.value = true
}
async function confirmCancel() {
  if (!toCancel.value) return
  await quickStatus(toCancel.value, 'CANCELLED')
}

const showDelete = ref(false)
const toDelete = ref<BookingRow | null>(null)
function askDelete(b: BookingRow) {
  toDelete.value = b
  showDelete.value = true
}
async function confirmDelete() {
  if (!toDelete.value) return
  try {
    await useApi(`/api/admin/bookings/${toDelete.value.id}`, { method: 'DELETE' })
    toast.success('Reservation deleted')
    fetchList()
    fetchSummary()
    if (view.value === 'calendar') fetchCalendar()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not delete reservation')
  }
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Initial load ──
const savedView = typeof localStorage !== 'undefined' ? localStorage.getItem(VIEW_KEY) : null
if (savedView === 'table') view.value = 'table'

const [motorbikeRes] = await Promise.all([
  useApi<{ items: MotorbikeOption[] }>('/api/admin/motorbikes', { query: { pageSize: 100, sort: 'name' } }),
  fetchSummary(),
  view.value === 'calendar' ? fetchCalendar() : fetchList()
])
motorbikes.value = motorbikeRes.items
</script>

<style scoped>
.view-toggle {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 3px;
  background: var(--color-white);
}
.view-toggle__btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-gray-mid);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.view-toggle__btn.active {
  background: var(--color-charcoal);
  color: #fff;
}
.filter-bar {
  position: sticky;
  top: 0;
  z-index: 2;
}
th.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
th.sortable:hover {
  color: var(--color-amber-deep);
}
</style>
