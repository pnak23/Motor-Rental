<template>
  <div class="row g-4">
    <div class="col-lg-4">
      <div class="card p-3">
        <h3 class="h6 font-display mb-3">Profile</h3>
        <form @submit.prevent="save">
          <div class="mb-2">
            <label class="form-label small">Full Name</label>
            <input v-model="form.fullName" class="form-control form-control-sm" />
          </div>
          <div class="mb-2">
            <label class="form-label small">Phone</label>
            <input v-model="form.phone" class="form-control form-control-sm" />
          </div>
          <div class="mb-2">
            <label class="form-label small">Email</label>
            <input v-model="form.email" class="form-control form-control-sm" />
          </div>
          <div class="mb-2">
            <label class="form-label small">Nationality</label>
            <input v-model="form.nationality" class="form-control form-control-sm" />
          </div>
          <div class="mb-2">
            <label class="form-label small">ID Type</label>
            <select v-model="form.idType" class="form-select form-select-sm">
              <option :value="null">—</option>
              <option value="ID_CARD">ID Card</option>
              <option value="PASSPORT">Passport</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label small">ID / Passport #</label>
            <input v-model="form.passportId" class="form-control form-control-sm" />
          </div>
          <div v-if="customer.idDocumentUrl" class="mb-2">
            <label class="form-label small d-block">ID Document</label>
            <a :href="customer.idDocumentUrl" target="_blank" rel="noopener">
              <img :src="customer.idDocumentUrl" alt="ID document" class="id-document-thumb" />
            </a>
          </div>
          <div class="mb-2">
            <label class="form-label small">Notes</label>
            <textarea v-model="form.notes" rows="3" class="form-control form-control-sm" />
          </div>
          <div class="form-check mb-3">
            <input id="blocked" v-model="form.isBlocked" type="checkbox" class="form-check-input" />
            <label for="blocked" class="form-check-label small">Blocked</label>
          </div>
          <button type="submit" class="btn btn-amber btn-sm w-100">Save Changes</button>
        </form>
      </div>
    </div>

    <div class="col-lg-8">
      <div class="row g-3 mb-3">
        <div class="col-4"><StatCard label="Total Rentals" :value="customer.bookings.length" icon="bi-calendar-check" color="charcoal" /></div>
        <div class="col-4"><StatCard label="Total Revenue" :value="`$${totalRevenue.toFixed(0)}`" icon="bi-cash-coin" color="success" /></div>
        <div class="col-4"><StatCard label="Active Rental" :value="activeRental ? 'Yes' : 'No'" icon="bi-motorcycle" color="amber" /></div>
      </div>

      <div class="card">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr><th>Booking #</th><th>Motorbike</th><th>Pickup</th><th>Return</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr v-for="b in customer.bookings" :key="b.id">
                <td class="font-mono small">{{ b.bookingNumber }}</td>
                <td>{{ b.motorbikeName }}</td>
                <td class="small">{{ formatDate(b.pickupDate) }}</td>
                <td class="small">{{ formatDate(b.returnDate) }}</td>
                <td class="price-tag">${{ Number(b.total).toFixed(2) }}</td>
                <td><StatusBadge :status="b.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Customer Profile' })

interface CustomerDetail {
  id: string
  fullName: string
  phone: string
  email: string | null
  nationality: string | null
  idType: string | null
  passportId: string | null
  idDocumentUrl: string | null
  notes: string | null
  isBlocked: boolean
  bookings: { id: string; bookingNumber: string; motorbikeName: string; pickupDate: string; returnDate: string; total: string; status: string }[]
}

const route = useRoute()
const toast = useToast()
const id = route.params.id as string

const customer = await useApi<CustomerDetail>(`/api/admin/customers/${id}`)

const form = reactive({
  fullName: customer.fullName,
  phone: customer.phone,
  email: customer.email,
  nationality: customer.nationality,
  idType: customer.idType,
  passportId: customer.passportId,
  notes: customer.notes,
  isBlocked: customer.isBlocked
})

const totalRevenue = computed(() =>
  customer.bookings
    .filter((b) => !['CANCELLED', 'REJECTED'].includes(b.status))
    .reduce((sum, b) => sum + Number(b.total), 0)
)
const activeRental = computed(() => customer.bookings.some((b) => ['PENDING', 'CONFIRMED', 'PICKED_UP'].includes(b.status)))

async function save() {
  try {
    await useApi(`/api/admin/customers/${id}`, { method: 'PUT', body: form })
    toast.success('Customer updated')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save changes')
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.id-document-thumb {
  max-width: 220px;
  max-height: 150px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
</style>
