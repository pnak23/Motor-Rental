<template>
  <div class="admin-dashboard">
    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3"><StatCard label="Total Motorbikes" :value="stats.motorbikes.total" icon="bi-motorcycle" color="charcoal" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Available" :value="stats.motorbikes.available" icon="bi-check-circle" color="success" /></div>
      <div class="col-6 col-lg-3"><StatCard label="Currently Rented" :value="stats.motorbikes.rented" icon="bi-arrow-left-right" color="amber" /></div>
      <div class="col-6 col-lg-3"><StatCard label="In Maintenance" :value="stats.motorbikes.maintenance" icon="bi-tools" color="danger" /></div>
    </div>

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
      <div class="col-lg-6">
        <div class="card dash-card p-3 p-lg-4 h-100">
          <h3 class="h6 font-display dash-card__title mb-3">Rental Status</h3>
          <ul class="list-unstyled mb-0 dash-list">
            <li class="d-flex align-items-center justify-content-between">
              <span><i class="bi bi-circle-fill dash-dot dash-dot--amber me-2" />Active rentals</span>
              <strong class="font-mono">{{ stats.rentals.active }}</strong>
            </li>
            <li class="d-flex align-items-center justify-content-between">
              <span><i class="bi bi-circle-fill dash-dot dash-dot--success me-2" />Completed</span>
              <strong class="font-mono">{{ stats.rentals.completed }}</strong>
            </li>
            <li class="d-flex align-items-center justify-content-between">
              <span><i class="bi bi-circle-fill dash-dot dash-dot--danger me-2" />Cancelled / Rejected</span>
              <strong class="font-mono">{{ stats.rentals.cancelled }}</strong>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card dash-card p-3 p-lg-4 h-100">
          <h3 class="h6 font-display dash-card__title mb-3">Top Performing Motorbikes</h3>
          <ul class="list-unstyled mb-0 dash-list">
            <li v-for="(m, i) in stats.topMotorbikes" :key="m.id" class="d-flex align-items-center justify-content-between">
              <span class="d-flex align-items-center gap-2">
                <span class="dash-rank">{{ i + 1 }}</span>{{ m.name }}
              </span>
              <span class="font-mono small text-muted">${{ m.revenue.toFixed(0) }} &middot; {{ m.rentals }} rentals</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Dashboard' })

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
</style>
