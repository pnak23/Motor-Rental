<template>
  <div class="res-calendar card p-3 p-md-4">
    <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="cal-nav-btn" aria-label="Previous month" @click="goPrev">
          <i class="bi bi-chevron-left" />
        </button>
        <h2 class="h5 font-display mb-0 cal-title">{{ monthLabel }}</h2>
        <button type="button" class="cal-nav-btn" aria-label="Next month" @click="goNext">
          <i class="bi bi-chevron-right" />
        </button>
      </div>
      <button type="button" class="btn btn-sm btn-outline-charcoal" @click="goToday">Today</button>
    </div>

    <div v-if="pending" class="cal-skeleton">
      <div v-for="i in 35" :key="i" class="cal-skeleton__cell" />
    </div>

    <!-- Desktop / tablet: month grid -->
    <div v-else class="cal-grid d-none d-md-block">
      <div class="cal-grid__weekdays">
        <span v-for="w in weekdayLabels" :key="w">{{ w }}</span>
      </div>
      <div class="cal-grid__days">
        <button
          v-for="cell in cells"
          :key="cell.key"
          type="button"
          class="cal-day"
          :class="{
            'cal-day--outside': !cell.inMonth,
            'cal-day--today': cell.isToday,
            'cal-day--has-bookings': cell.data && cell.data.total > 0
          }"
          @click="$emit('select-date', cell.iso)"
        >
          <span class="cal-day__num">{{ cell.day }}</span>
          <div v-if="cell.data && cell.data.total > 0" class="cal-day__info">
            <span class="cal-day__count">{{ cell.data.total }} {{ cell.data.total === 1 ? 'booking' : 'bookings' }}</span>
            <div class="cal-day__dots">
              <span v-if="cell.data.pending" class="cal-dot cal-dot--pending" :title="`${cell.data.pending} pending`" />
              <span v-if="cell.data.confirmed" class="cal-dot cal-dot--confirmed" :title="`${cell.data.confirmed} confirmed`" />
              <span v-if="cell.data.active" class="cal-dot cal-dot--active" :title="`${cell.data.active} active rental`" />
              <span v-if="cell.data.returned" class="cal-dot cal-dot--returned" :title="`${cell.data.returned} returned`" />
              <span v-if="cell.data.cancelled" class="cal-dot cal-dot--cancelled" :title="`${cell.data.cancelled} cancelled`" />
            </div>
            <span v-if="cell.data.returning" class="cal-day__returning"><i class="bi bi-arrow-return-left" /> {{ cell.data.returning }} returning</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile: compact agenda list -->
    <div v-if="!pending" class="cal-agenda d-md-none">
      <p v-if="!agendaDays.length" class="text-muted small text-center py-4 mb-0">No reservations this month.</p>
      <button
        v-for="day in agendaDays"
        :key="day.iso"
        type="button"
        class="cal-agenda__item"
        :class="{ 'cal-agenda__item--today': day.isToday }"
        @click="$emit('select-date', day.iso)"
      >
        <div class="cal-agenda__date">
          <span class="cal-agenda__weekday">{{ day.weekday }}</span>
          <span class="cal-agenda__daynum">{{ day.day }}</span>
        </div>
        <div class="cal-agenda__meta">
          <span class="fw-600">{{ day.data.total }} {{ day.data.total === 1 ? 'reservation' : 'reservations' }}</span>
          <div class="cal-day__dots">
            <span v-if="day.data.pending" class="cal-dot cal-dot--pending" />
            <span v-if="day.data.confirmed" class="cal-dot cal-dot--confirmed" />
            <span v-if="day.data.active" class="cal-dot cal-dot--active" />
            <span v-if="day.data.returned" class="cal-dot cal-dot--returned" />
            <span v-if="day.data.cancelled" class="cal-dot cal-dot--cancelled" />
          </div>
        </div>
        <i class="bi bi-chevron-right cal-agenda__chevron" />
      </button>
    </div>

    <div class="cal-legend d-flex flex-wrap gap-3 mt-3 pt-3 border-top">
      <span class="cal-legend__item"><span class="cal-dot cal-dot--pending" /> Pending</span>
      <span class="cal-legend__item"><span class="cal-dot cal-dot--confirmed" /> Confirmed</span>
      <span class="cal-legend__item"><span class="cal-dot cal-dot--active" /> Active Rental</span>
      <span class="cal-legend__item"><span class="cal-dot cal-dot--returned" /> Returned</span>
      <span class="cal-legend__item"><span class="cal-dot cal-dot--cancelled" /> Cancelled</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface CalendarDay {
  date: string
  total: number
  pending: number
  confirmed: number
  active: number
  returned: number
  cancelled: number
  returning: number
}

const props = defineProps<{
  year: number
  month: number // 0-indexed
  data: CalendarDay[]
  pending: boolean
}>()
const emit = defineEmits<{ 'select-date': [string]; 'change-month': [{ year: number; month: number }] }>()

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthLabel = computed(() => {
  return new Date(props.year, props.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function toIso(y: number, m: number, d: number) {
  const dt = new Date(y, m, d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

const dataByDate = computed(() => {
  const map = new Map<string, CalendarDay>()
  for (const d of props.data) map.set(d.date, d)
  return map
})

const todayIso = computed(() => {
  const t = new Date()
  return toIso(t.getFullYear(), t.getMonth(), t.getDate())
})

const cells = computed(() => {
  const first = new Date(props.year, props.month, 1)
  // Monday-first grid: JS getDay() is 0=Sun..6=Sat, shift so Mon=0.
  const firstWeekday = (first.getDay() + 6) % 7
  const daysInMonth = new Date(props.year, props.month + 1, 0).getDate()
  const daysInPrevMonth = new Date(props.year, props.month, 0).getDate()

  const list: { key: string; iso: string; day: number; inMonth: boolean; isToday: boolean; data: CalendarDay | undefined }[] = []

  for (let i = 0; i < firstWeekday; i++) {
    const day = daysInPrevMonth - firstWeekday + 1 + i
    const m = props.month - 1
    const y = m < 0 ? props.year - 1 : props.year
    const mm = m < 0 ? 11 : m
    const iso = toIso(y, mm, day)
    list.push({ key: `p${day}`, iso, day, inMonth: false, isToday: iso === todayIso.value, data: dataByDate.value.get(iso) })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toIso(props.year, props.month, day)
    list.push({ key: `c${day}`, iso, day, inMonth: true, isToday: iso === todayIso.value, data: dataByDate.value.get(iso) })
  }
  let nextDay = 1
  while (list.length % 7 !== 0 || list.length < 35) {
    const m = props.month + 1
    const y = m > 11 ? props.year + 1 : props.year
    const mm = m > 11 ? 0 : m
    const iso = toIso(y, mm, nextDay)
    list.push({ key: `n${nextDay}`, iso, day: nextDay, inMonth: false, isToday: iso === todayIso.value, data: dataByDate.value.get(iso) })
    nextDay++
    if (list.length >= 42) break
  }
  return list
})

const agendaDays = computed(() =>
  cells.value
    .filter((c) => c.inMonth && c.data && c.data.total > 0)
    .map((c) => ({
      iso: c.iso,
      day: c.day,
      isToday: c.isToday,
      weekday: new Date(c.iso).toLocaleDateString('en-US', { weekday: 'short' }),
      data: c.data as CalendarDay
    }))
)

function goPrev() {
  const m = props.month - 1
  emit('change-month', m < 0 ? { year: props.year - 1, month: 11 } : { year: props.year, month: m })
}
function goNext() {
  const m = props.month + 1
  emit('change-month', m > 11 ? { year: props.year + 1, month: 0 } : { year: props.year, month: m })
}
function goToday() {
  const t = new Date()
  emit('change-month', { year: t.getFullYear(), month: t.getMonth() })
}
</script>

<style scoped>
.res-calendar {
  border-radius: var(--radius-lg, 14px);
}
.cal-nav-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: var(--color-charcoal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}
.cal-nav-btn:hover {
  background: var(--color-gray-light);
  border-color: var(--color-amber);
}
.cal-title {
  min-width: 180px;
  text-align: center;
}

.cal-grid__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-gray-mid);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.5rem;
}
.cal-grid__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.cal-day {
  aspect-ratio: 1 / 0.85;
  min-height: 84px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm, 8px);
  background: var(--color-white);
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.1s ease;
}
.cal-day:hover {
  border-color: var(--color-amber);
  box-shadow: 0 6px 14px rgba(231, 160, 60, 0.15);
  transform: translateY(-1px);
}
.cal-day--outside {
  background: var(--color-gray-light);
  opacity: 0.55;
}
.cal-day--today {
  border-color: var(--color-amber-deep);
  border-width: 1.5px;
  background: rgba(231, 160, 60, 0.06);
}
.cal-day--today .cal-day__num {
  color: var(--color-amber-deep);
}
.cal-day--has-bookings {
  border-color: rgba(33, 38, 43, 0.18);
}
.cal-day__num {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-charcoal);
}
.cal-day__info {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}
.cal-day__count {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-charcoal);
}
.cal-day__dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}
.cal-day__returning {
  font-size: 0.62rem;
  color: var(--color-amber-deep);
  display: flex;
  align-items: center;
  gap: 2px;
}

.cal-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.cal-dot--pending {
  background: #d19a2e;
}
.cal-dot--confirmed {
  background: #2f7dcf;
}
.cal-dot--active {
  background: #2f9e57;
}
.cal-dot--returned {
  background: #8a8a8a;
}
.cal-dot--cancelled {
  background: #c1462f;
}

.cal-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: var(--color-gray-mid);
}

/* ── Mobile agenda ── */
.cal-agenda__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.5rem;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  text-align: left;
}
.cal-agenda__item:last-child {
  border-bottom: none;
}
.cal-agenda__item--today .cal-agenda__daynum {
  color: var(--color-amber-deep);
}
.cal-agenda__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 44px;
  flex-shrink: 0;
}
.cal-agenda__weekday {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--color-gray-mid);
}
.cal-agenda__daynum {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-charcoal);
}
.cal-agenda__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.cal-agenda__chevron {
  color: var(--color-gray-mid);
}

/* ── Skeleton loading ── */
.cal-skeleton {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.cal-skeleton__cell {
  min-height: 84px;
  border-radius: var(--radius-sm, 8px);
  background: linear-gradient(90deg, var(--color-gray-light) 25%, #e7e4dd 37%, var(--color-gray-light) 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@media (prefers-reduced-motion: reduce) {
  .cal-skeleton__cell {
    animation: none;
  }
}
</style>
