<template>
  <div class="admin-dashboard">
    <!-- Greeting -->
    <div class="dash-hero p-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div>
        <p class="eyebrow mb-1">{{ todayLabel }}</p>
        <h2 class="h3 font-display mb-1">{{ greeting }}, {{ firstName }}</h2>
        <p class="text-muted mb-0">Here's how Angkor Wheels Rental is doing today.</p>
      </div>
      <div class="d-flex gap-2">
        <NuxtLink to="/admin/bookings?new=1" class="btn btn-charcoal"><i class="bi bi-plus-lg me-1" />New Booking</NuxtLink>
        <NuxtLink to="/admin/motorbikes?new=1" class="btn btn-outline-light"><i class="bi bi-motorcycle me-1" />Add Motorbike</NuxtLink>
      </div>
    </div>

    <p class="dash-section-label mb-2">Fleet Overview</p>
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3"><StatCard label="Total Motorbikes" :value="stats.motorbikes.total" icon="bi-motorcycle" color="charcoal" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Available" :value="stats.motorbikes.available" icon="bi-check-circle" color="success" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Currently Rented" :value="stats.motorbikes.rented" icon="bi-arrow-left-right" color="amber" /></div>
      <div class="col-6 col-lg-3"><StatCard label="In Maintenance" :value="stats.motorbikes.maintenance" icon="bi-tools" color="danger" /></div>
    </div>

    <p class="dash-section-label mb-2">Bookings &amp; Revenue</p>
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3"><StatCard label="Pending Bookings" :value="stats.pendingBookings" icon="bi-hourglass-split" color="amber" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Today's Revenue" :value="`$${stats.revenue.today.toFixed(0)}`" icon="bi-cash-coin" color="success" /></div>
      <div class="col-6 col-lg-3"><StatCard label="This Week" :value="`$${stats.revenue.week.toFixed(0)}`" icon="bi-calendar-week" color="charcoal" /></div>
      <div class="col-6 col-lg-3"><StatCard label="This Month" :value="`$${stats.revenue.month.toFixed(0)}`" icon="bi-calendar-month" color="charcoal" /></div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card dash-card p-3 p-lg-4 h-100">
          <h3 class="h6 font-display dash-card__title mb-3">Revenue by Month</h3>
          <MiniBarChart :points="revenuePoints" />
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card dash-card p-3 p-lg-4 h-100">
          <h3 class="h6 font-display dash-card__title mb-3">Bookings by Month</h3>
          <MiniBarChart :points="bookingPoints" />
        </div>
      </div>
    </div>

    <div class="row g-3 mt-1">
      <div class="col-lg-5">
        <div class="card dash-card p-3 p-lg-4 h-100">
          <h3 class="h6 font-display dash-card__title mb-3">Booking Status Breakdown</h3>
          <div v-if="totalStatusCount === 0" class="text-muted small py-4 text-center">No bookings yet</div>
          <div v-else class="d-flex align-items-center gap-4 flex-wrap flex-sm-nowrap">
            <div class="donut-wrap flex-shrink-0">
              <div class="donut" :style="{ background: donutGradient }">
                <div class="donut__hole">
                  <span class="fs-4 font-mono fw-600">{{ totalStatusCount }}</span>
                  <span class="small text-muted">total</span>
                </div>
              </div>
            </div>
            <ul class="list-unstyled mb-0 dash-list flex-grow-1 w-100">
              <li v-for="s in statusSegments" :key="s.status" class="d-flex align-items-center justify-content-between">
                <span><i class="bi bi-circle-fill dash-dot me-2" :style="{ color: s.color }" />{{ s.label }}</span>
                <span class="font-mono small">{{ s.count }} <span class="text-muted">({{ s.pct }}%)</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="card dash-card p-3 p-lg-4 h-100">
          <h3 class="h6 font-display dash-card__title mb-3">Top Performing Motorbikes</h3>
          <div v-if="!stats.topMotorbikes.length" class="text-muted small py-4 text-center">No rental data yet</div>
          <ul v-else class="list-unstyled mb-0 dash-list">
            <li v-for="(m, i) in stats.topMotorbikes" :key="m.id">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="d-flex align-items-center gap-2 min-width-0">
                  <span class="dash-rank" :class="`dash-rank--${i}`">{{ i + 1 }}</span>
                  <span class="text-truncate">{{ m.name }}</span>
                </span>
                <span class="font-mono small text-muted flex-shrink-0 ms-2">${{ m.revenue.toFixed(0) }} &middot; {{ m.rentals }} rentals</span>
              </div>
              <div class="revenue-track">
                <div class="revenue-bar" :style="{ width: mounted ? `${topRevenueMax > 0 ? (m.revenue / topRevenueMax) * 100 : 0}%` : '0%' }" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth', function (to) {
    const auth = useAuthStore()
    // Platform-level super admins have no shop, so the shop stats dashboard
    // (which requires a shopId) doesn't apply to them.
    if (auth.user && !auth.user.shopId && to.path === '/admin') {
      return navigateTo('/admin/platform/shops')
    }
  }],
  title: 'Dashboard'
})

interface Stats {
  motorbikes: { total: number; available: number; rented: number; maintenance: number }
  pendingBookings: number
  revenue: { today: number; week: number; month: number; year: number }
  rentals: { total: number; active: number; completed: number; cancelled: number }
  charts: {
    revenueByMonth: { month: string; total: number }[]
    bookingsByMonth: { month: string; count: number }[]
    statusDistribution: { status: string; count: number }[]
  }
  topMotorbikes: { id: string; name: string; rentals: number; revenue: number }[]
}

const stats = await useApi<Stats>('/api/admin/dashboard/stats')

const revenuePoints = computed(() => stats.charts.revenueByMonth.map((r) => ({ label: r.month.slice(5), value: r.total })))
const bookingPoints = computed(() => stats.charts.bookingsByMonth.map((r) => ({ label: r.month.slice(5), value: r.count })))

const auth = useAuthStore()
const firstName = computed(() => (auth.user?.name || 'there').split(' ')[0])
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})
const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const mounted = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

const topRevenueMax = computed(() => Math.max(1, ...stats.topMotorbikes.map((m) => m.revenue)))

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: '#e0a83c' },
  CONFIRMED: { label: 'Confirmed', color: '#3577c9' },
  PICKED_UP: { label: 'Active', color: '#3f8c5f' },
  RETURNED: { label: 'Completed', color: '#8b8f94' },
  CANCELLED: { label: 'Cancelled', color: '#c1462f' },
  REJECTED: { label: 'Rejected', color: '#a3341c' }
}

const totalStatusCount = computed(() => stats.charts.statusDistribution.reduce((sum, s) => sum + s.count, 0))

const statusSegments = computed(() => {
  const total = totalStatusCount.value || 1
  return stats.charts.statusDistribution
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((s) => {
      const meta = STATUS_META[s.status] || { label: s.status, color: '#8b8f94' }
      return { status: s.status, label: meta.label, color: meta.color, count: s.count, pct: Math.round((s.count / total) * 100) }
    })
})

const donutGradient = computed(() => {
  const total = totalStatusCount.value
  if (total === 0) return 'var(--color-gray-light)'
  let cursor = 0
  const stops = statusSegments.value.map((s) => {
    const start = (cursor / total) * 360
    cursor += s.count
    const end = (cursor / total) * 360
    return `${s.color} ${start}deg ${end}deg`
  })
  return `conic-gradient(${stops.join(', ')})`
})
</script>

<style scoped>
.dash-hero {
  border-radius: var(--radius-lg, 14px);
  background: linear-gradient(135deg, var(--btn-charcoal-bg) 0%, #2c333a 100%);
  color: #fff;
}
.dash-hero .eyebrow {
  color: var(--color-amber);
}
.dash-hero .text-muted {
  color: rgba(255, 255, 255, 0.65) !important;
}
.dash-section-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-gray-mid);
}
.dash-card {
  border-radius: var(--radius-lg, 14px);
}
.dash-card__title {
  color: var(--color-charcoal);
  font-weight: 600;
}
.dash-list li {
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.92rem;
}
.dash-list li:last-child {
  border-bottom: none;
}
.dash-dot {
  font-size: 0.45rem;
  vertical-align: 0.1em;
}
.dash-dot--amber {
  color: var(--color-amber-deep);
}
.dash-dot--success {
  color: var(--color-success);
}
.dash-dot--danger {
  color: var(--color-danger);
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
.dash-rank--0 {
  background: #f5d78e;
  color: #7a5a10;
}
.dash-rank--1 {
  background: #dcdfe2;
  color: #4a4f54;
}
.dash-rank--2 {
  background: #e6c6a8;
  color: #6b4321;
}
.min-width-0 {
  min-width: 0;
}
.revenue-track {
  height: 6px;
  border-radius: 999px;
  background: var(--color-gray-light);
  overflow: hidden;
}
.revenue-bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--color-amber) 0%, var(--color-amber-deep) 100%);
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.donut-wrap {
  width: 130px;
  height: 130px;
}
.donut {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.4s ease;
}
.donut__hole {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--color-white, #fff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px var(--color-border);
}
</style>
