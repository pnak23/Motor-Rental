<template>
  <div class="reports-page">
    <!-- Filters -->
    <div class="card p-3 mb-4">
      <div class="d-flex flex-wrap align-items-end gap-3">
        <div class="d-flex gap-2 flex-wrap">
          <button
            v-for="preset in presets"
            :key="preset.key"
            type="button"
            class="btn btn-sm"
            :class="activePreset === preset.key ? 'btn-charcoal' : 'btn-outline-charcoal'"
            @click="applyPreset(preset.key)"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="d-flex align-items-end gap-2 ms-auto">
          <div>
            <label class="form-label small mb-1">From</label>
            <input v-model="from" type="date" class="form-control form-control-sm" @change="activePreset = 'custom'" />
          </div>
          <div>
            <label class="form-label small mb-1">To</label>
            <input v-model="to" type="date" class="form-control form-control-sm" @change="activePreset = 'custom'" />
          </div>
          <button type="button" class="btn btn-sm btn-amber" :disabled="pending" @click="fetchReport">
            <span v-if="pending" class="spinner-border spinner-border-sm me-1" />Apply
          </button>
        </div>
      </div>
      <div class="d-flex gap-2 mt-3 border-top pt-3">
        <span class="small text-muted align-self-center me-1">Export CSV:</span>
        <a :href="exportUrl('bookings')" class="btn btn-sm btn-outline-secondary"><i class="bi bi-download me-1" />Bookings / Revenue</a>
        <a :href="exportUrl('motorbikes')" class="btn btn-sm btn-outline-secondary"><i class="bi bi-download me-1" />Motorbikes</a>
        <a :href="exportUrl('customers')" class="btn btn-sm btn-outline-secondary"><i class="bi bi-download me-1" />Customers</a>
      </div>
    </div>

    <div v-if="pending" class="text-center py-5"><span class="spinner-border" /></div>

    <template v-else-if="report">
      <!-- Revenue -->
      <h2 class="h5 font-display mb-3">Revenue &amp; Financials</h2>
      <div class="row g-3 mb-3">
        <div class="col-6 col-lg-3"><StatCard label="Total Revenue" :value="money(report.revenue.total)" icon="bi-cash-stack" color="success" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Subtotal" :value="money(report.revenue.subtotal)" icon="bi-receipt" color="charcoal" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Discounts Given" :value="money(report.revenue.discount)" icon="bi-tag" color="amber" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Extra Charges" :value="money(report.revenue.additionalCharges)" icon="bi-plus-circle" color="charcoal" /></div>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-lg-8">
          <div class="card dash-card p-3 p-lg-4 h-100">
            <h3 class="h6 font-display dash-card__title mb-3">Revenue Over Time</h3>
            <MiniBarChart v-if="report.revenue.chart.length" :points="report.revenue.chart" />
            <p v-else class="text-muted small mb-0">No revenue in this period.</p>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card dash-card p-3 p-lg-4 h-100">
            <h3 class="h6 font-display dash-card__title mb-3">By Payment Status</h3>
            <ul class="list-unstyled mb-0 dash-list">
              <li v-for="p in report.revenue.byPaymentStatus" :key="p.status" class="d-flex align-items-center justify-content-between">
                <span>{{ p.status }} <span class="text-muted">({{ p.count }})</span></span>
                <strong class="font-mono">{{ money(p.total) }}</strong>
              </li>
              <li v-if="!report.revenue.byPaymentStatus.length" class="text-muted small py-2">No bookings in this period.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bookings -->
      <h2 class="h5 font-display mb-3">Bookings &amp; Rentals</h2>
      <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3"><StatCard label="Total Bookings" :value="report.bookings.total" icon="bi-calendar-check" color="charcoal" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Avg Rental Length" :value="`${report.bookings.avgRentalDays}d`" icon="bi-hourglass-split" color="amber" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Cancellation Rate" :value="`${report.bookings.cancellationRate}%`" icon="bi-x-circle" color="danger" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Paid to Date" :value="money(report.revenue.paidAmount)" icon="bi-wallet2" color="success" /></div>
      </div>
      <div class="card dash-card p-3 p-lg-4 mb-4">
        <h3 class="h6 font-display dash-card__title mb-3">By Status</h3>
        <div class="row g-2">
          <div v-for="s in report.bookings.byStatus" :key="s.status" class="col-6 col-md-4 col-lg-2">
            <div class="status-tile d-flex align-items-center justify-content-between">
              <span class="small">{{ s.status.replace('_', ' ') }}</span>
              <strong class="font-mono">{{ s.count }}</strong>
            </div>
          </div>
          <div v-if="!report.bookings.byStatus.length" class="col-12 text-muted small py-2">No bookings in this period.</div>
        </div>
      </div>

      <!-- Motorbikes -->
      <h2 class="h5 font-display mb-3">Motorbike Performance</h2>
      <div class="card mb-4">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Motorbike</th>
                <th>Brand</th>
                <th class="text-end">Bookings</th>
                <th class="text-end">Revenue</th>
                <th class="text-end">Utilization</th>
                <th class="text-end">Maintenance Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!report.motorbikes.performance.length"><td colspan="6" class="text-center py-4 text-muted">No data for this period</td></tr>
              <tr v-for="m in report.motorbikes.performance" :key="m.id">
                <td class="fw-600">{{ m.name }}</td>
                <td>{{ m.brand }}</td>
                <td class="text-end">{{ m.bookings }}</td>
                <td class="text-end price-tag">{{ money(m.revenue) }}</td>
                <td class="text-end">
                  <div class="utilization-bar">
                    <div class="utilization-bar__fill" :style="{ width: `${m.utilizationPct}%` }" />
                  </div>
                  <span class="small text-muted">{{ m.utilizationPct }}%</span>
                </td>
                <td class="text-end">{{ money(m.maintenanceCost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customers -->
      <h2 class="h5 font-display mb-3">Customers</h2>
      <div class="row g-3 mb-3">
        <div class="col-6 col-lg-3"><StatCard label="New Customers" :value="report.customers.newCustomers" icon="bi-person-plus" color="success" /></div>
        <div class="col-6 col-lg-3"><StatCard label="Returning Customers" :value="report.customers.returningCustomers" icon="bi-person-check" color="charcoal" /></div>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-lg-7">
          <div class="card dash-card p-3 p-lg-4 h-100">
            <h3 class="h6 font-display dash-card__title mb-3">Top Customers</h3>
            <ul class="list-unstyled mb-0 dash-list">
              <li v-for="(c, i) in report.customers.topCustomers" :key="c.id" class="d-flex align-items-center justify-content-between">
                <span class="d-flex align-items-center gap-2"><span class="dash-rank">{{ i + 1 }}</span>{{ c.fullName }}<span class="text-muted small">&middot; {{ c.phone }}</span></span>
                <span class="font-mono small">{{ money(c.totalSpent) }} &middot; {{ c.bookings }} bookings</span>
              </li>
              <li v-if="!report.customers.topCustomers.length" class="text-muted small py-2">No customer activity in this period.</li>
            </ul>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="card dash-card p-3 p-lg-4 h-100">
            <h3 class="h6 font-display dash-card__title mb-3">By Nationality</h3>
            <ul class="list-unstyled mb-0 dash-list">
              <li v-for="n in report.customers.byNationality" :key="n.nationality" class="d-flex align-items-center justify-content-between">
                <span>{{ n.nationality }}</span>
                <strong class="font-mono">{{ n.count }}</strong>
              </li>
              <li v-if="!report.customers.byNationality.length" class="text-muted small py-2">No data for this period.</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Reports' })

interface Report {
  range: { from: string; to: string; bucket: string }
  revenue: {
    subtotal: number
    discount: number
    deliveryFee: number
    additionalCharges: number
    total: number
    paidAmount: number
    bookingCount: number
    chart: { label: string; value: number }[]
    byPaymentStatus: { status: string; count: number; total: number }[]
  }
  bookings: {
    total: number
    byStatus: { status: string; count: number }[]
    avgRentalDays: number
    cancellationRate: number
  }
  motorbikes: {
    performance: {
      id: string
      name: string
      brand: string
      bookings: number
      revenue: number
      bookedDays: number
      utilizationPct: number
      maintenanceCost: number
      maintenanceCount: number
    }[]
  }
  customers: {
    newCustomers: number
    returningCustomers: number
    topCustomers: { id: string; fullName: string; phone: string; bookings: number; totalSpent: number }[]
    byNationality: { nationality: string; count: number }[]
  }
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

const today = new Date()
const presets = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' }
] as const

const activePreset = ref<string>('30d')
const from = ref(toDateInput(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)))
const to = ref(toDateInput(today))

function applyPreset(key: (typeof presets)[number]['key']) {
  activePreset.value = key
  const now = new Date()
  if (key === 'today') {
    from.value = toDateInput(now)
    to.value = toDateInput(now)
  } else if (key === '7d') {
    from.value = toDateInput(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000))
    to.value = toDateInput(now)
  } else if (key === '30d') {
    from.value = toDateInput(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000))
    to.value = toDateInput(now)
  } else if (key === 'month') {
    from.value = toDateInput(new Date(now.getFullYear(), now.getMonth(), 1))
    to.value = toDateInput(now)
  } else if (key === 'year') {
    from.value = toDateInput(new Date(now.getFullYear(), 0, 1))
    to.value = toDateInput(now)
  }
  fetchReport()
}

const report = ref<Report | null>(null)
const pending = ref(true)

async function fetchReport() {
  pending.value = true
  try {
    report.value = await useApi<Report>('/api/admin/reports', { query: { from: from.value, to: to.value } })
  } finally {
    pending.value = false
  }
}

function exportUrl(type: 'bookings' | 'motorbikes' | 'customers') {
  const params = new URLSearchParams({ type, from: from.value, to: to.value })
  return `/api/admin/reports/export?${params.toString()}`
}

function money(n: number) {
  return `$${n.toFixed(2)}`
}

await fetchReport()
</script>

<style scoped>
.dash-card {
  border-radius: var(--radius-lg, 14px);
}
.dash-card__title {
  color: var(--color-charcoal);
  font-weight: 600;
}
.dash-list li {
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.92rem;
}
.dash-list li:last-child {
  border-bottom: none;
}
.dash-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-gray-light);
  color: var(--color-gray-mid);
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}
.utilization-bar {
  display: inline-block;
  width: 80px;
  height: 6px;
  border-radius: 999px;
  background: var(--color-gray-light);
  overflow: hidden;
  vertical-align: middle;
  margin-right: 0.4rem;
}
.utilization-bar__fill {
  height: 100%;
  background: var(--color-amber-deep);
  border-radius: 999px;
}
.status-tile {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm, 8px);
  background: var(--color-gray-light);
  height: 100%;
}
</style>
