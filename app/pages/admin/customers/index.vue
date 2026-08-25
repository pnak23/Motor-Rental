<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Customers</h1>
        <p class="admin-page-header__subtitle">{{ total }} customers on record.</p>
      </div>
      <div class="admin-page-header__actions">
        <input v-model="search" class="form-control" placeholder="Search by name, phone, email..." style="width: 280px" />
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Bookings</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending"><td colspan="7" class="text-center py-4"><span class="spinner-border spinner-border-sm" /></td></tr>
            <tr v-else-if="items.length === 0"><td colspan="7" class="text-center py-4 text-muted">No customers found</td></tr>
            <tr v-for="c in items" :key="c.id">
              <td class="fw-600">{{ c.fullName }}</td>
              <td>{{ c.phone }}</td>
              <td>{{ c.email || '—' }}</td>
              <td>{{ c.totalBookings }}</td>
              <td class="price-tag">${{ Number(c.totalSpent).toFixed(2) }}</td>
              <td><span v-if="c.isBlocked" class="badge status-badge status-badge--cancelled">Blocked</span><span v-else class="badge status-badge status-badge--available">Active</span></td>
              <td class="text-end"><NuxtLink :to="`/admin/customers/${c.id}`" class="btn btn-sm btn-outline-charcoal">View</NuxtLink></td>
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
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Customers' })

interface CustomerRow {
  id: string
  fullName: string
  phone: string
  email: string | null
  totalBookings: number
  totalSpent: string
  isBlocked: boolean
}

const search = ref('')
const page = ref(1)
const items = ref<CustomerRow[]>([])
const total = ref(0)
const totalPages = ref(1)
const pending = ref(true)

async function fetchList() {
  pending.value = true
  try {
    const query: Record<string, string | number> = { page: page.value, pageSize: 20 }
    if (search.value) query.search = search.value
    const res = await useApi<{ items: CustomerRow[]; total: number; totalPages: number }>('/api/admin/customers', { query })
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
watch(page, fetchList)

await fetchList()
</script>
