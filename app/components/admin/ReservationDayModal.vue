<template>
  <Teleport to="body">
    <div v-if="modelValue" class="day-modal-backdrop" @click.self="close">
      <div class="day-modal card">
        <div class="day-modal__header d-flex align-items-center justify-content-between p-3 border-bottom">
          <div>
            <h3 class="h5 font-display mb-0">{{ formattedDate }}</h3>
            <p class="small text-muted mb-0">{{ items.length }} {{ items.length === 1 ? 'reservation' : 'reservations' }}</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <NuxtLink :to="newReservationLink" class="btn btn-sm btn-amber"><i class="bi bi-plus-lg me-1" />New Reservation</NuxtLink>
            <button type="button" class="btn-close-modal" aria-label="Close" @click="close"><i class="bi bi-x-lg" /></button>
          </div>
        </div>

        <div class="day-modal__body p-3">
          <div v-if="pending" class="text-center py-4"><span class="spinner-border spinner-border-sm" /></div>

          <div v-else-if="!items.length" class="text-center py-5">
            <i class="bi bi-calendar-x fs-2 text-muted d-block mb-2" />
            <p class="fw-600 mb-1">No reservations</p>
            <p class="text-muted small mb-3">There are no reservations for this date.</p>
            <NuxtLink :to="newReservationLink" class="btn btn-amber btn-sm"><i class="bi bi-plus-lg me-1" />New Reservation</NuxtLink>
          </div>

          <div v-else class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Motor</th>
                  <th>Pickup</th>
                  <th>Return</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th class="text-end">Total</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="b in items" :key="b.id">
                  <td>
                    <p class="fw-600 mb-0">{{ b.customerName }}</p>
                    <p class="small text-muted mb-0">{{ b.customerPhone }}</p>
                  </td>
                  <td class="d-flex align-items-center gap-2">
                    <img v-if="b.motorbikeImage" :src="b.motorbikeImage" class="day-modal__thumb" :alt="b.motorbikeName" />
                    <div v-else class="day-modal__thumb motor-placeholder motor-placeholder--sm"><i class="bi bi-scooter" /></div>
                    <div>
                      <p class="mb-0">{{ b.motorbikeName }}</p>
                      <p class="small text-muted mb-0">{{ b.motorbikePlate || '—' }}</p>
                    </div>
                  </td>
                  <td class="small">{{ formatDateTime(b.pickupDate) }}</td>
                  <td class="small">{{ formatDateTime(b.returnDate) }}</td>
                  <td><StatusBadge :status="b.status" /></td>
                  <td><StatusBadge :status="b.paymentStatus" /></td>
                  <td class="text-end price-tag">${{ Number(b.total).toFixed(2) }}</td>
                  <td class="text-end">
                    <NuxtLink :to="`/admin/bookings/${b.id}`" class="btn btn-sm btn-outline-charcoal">View</NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface DayBooking {
  id: string
  bookingNumber: string
  customerName: string
  customerPhone: string
  motorbikeName: string
  motorbikePlate: string | null
  motorbikeImage: string | null
  pickupDate: string
  returnDate: string
  status: string
  paymentStatus: string
  total: string
  paidAmount: string
  remainingAmount: number
}

const props = defineProps<{ modelValue: boolean; date: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const items = ref<DayBooking[]>([])
const pending = ref(false)

const formattedDate = computed(() => {
  if (!props.date) return ''
  return new Date(props.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})
const newReservationLink = computed(() => (props.date ? `/admin/bookings?new=1&date=${props.date}` : '/admin/bookings?new=1'))

async function load() {
  if (!props.date) return
  pending.value = true
  try {
    items.value = await useApi<DayBooking[]>('/api/admin/bookings/day', { query: { date: props.date } })
  } finally {
    pending.value = false
  }
}

watch(() => [props.modelValue, props.date], ([open]) => {
  if (open) load()
})

function close() {
  emit('update:modelValue', false)
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

defineExpose({ reload: load })
</script>

<style scoped>
.day-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(33, 38, 43, 0.5);
  z-index: 1080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.15s ease;
}
.day-modal {
  width: 100%;
  max-width: 960px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg, 14px);
  overflow: hidden;
  animation: modalIn 0.2s ease;
}
.day-modal__body {
  overflow-y: auto;
}
.day-modal__thumb {
  width: 48px;
  height: 36px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.btn-close-modal {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-mid);
}
.btn-close-modal:hover {
  background: var(--color-gray-light);
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .day-modal-backdrop,
  .day-modal {
    animation: none;
  }
}
</style>
