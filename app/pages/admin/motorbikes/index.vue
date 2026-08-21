<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex gap-2">
        <input v-model="search" class="form-control" placeholder="Search motorbikes..." style="width: 240px" />
        <select v-model="status" class="form-select" style="width: 160px">
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      <NuxtLink to="/admin/motorbikes/create" class="btn btn-amber"><i class="bi bi-plus-lg me-1" />Add Motorbike</NuxtLink>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand / Model</th>
              <th>Plate</th>
              <th>Color</th>
              <th>Key</th>
              <th>CC</th>
              <th>Transmission</th>
              <th>Daily Price</th>
              <th>Status</th>
              <th>Featured</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pending"><td colspan="12" class="text-center py-4"><span class="spinner-border spinner-border-sm" /></td></tr>
            <tr v-else-if="items.length === 0"><td colspan="12" class="text-center py-4 text-muted">No motorbikes found</td></tr>
            <tr v-for="m in items" :key="m.id">
              <td><img :src="m.primaryImage || placeholder" class="table-thumb" :alt="m.name" /></td>
              <td class="fw-600">{{ m.name }}</td>
              <td>{{ m.brand }} / {{ m.model }}</td>
              <td class="font-mono small">{{ m.plateNumber || '—' }}</td>
              <td>{{ m.color || '—' }}</td>
              <td>
                <span class="key-badge" :class="m.keyType === 'SMART_KEY' ? 'key-badge--smart' : 'key-badge--normal'">
                  <i class="bi" :class="m.keyType === 'SMART_KEY' ? 'bi-key-fill' : 'bi-key'" />
                  {{ m.keyType === 'SMART_KEY' ? 'Smart' : 'Normal' }}
                </span>
              </td>
              <td>{{ m.engineCc }}cc</td>
              <td>{{ m.transmission.replace('_', '-') }}</td>
              <td class="price-tag">${{ Number(m.dailyPrice).toFixed(2) }}</td>
              <td><StatusBadge :status="m.status" /></td>
              <td><i v-if="m.featured" class="bi bi-star-fill text-amber" /></td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <NuxtLink :to="`/motorbikes/${m.slug}`" target="_blank" class="btn btn-outline-secondary" title="View on site"><i class="bi bi-eye" /></NuxtLink>
                  <NuxtLink :to="`/admin/motorbikes/${m.id}/edit`" class="btn btn-outline-secondary" title="Edit"><i class="bi bi-pencil" /></NuxtLink>
                  <button class="btn btn-outline-secondary" title="Toggle active" @click="toggleActive(m)">
                    <i class="bi" :class="m.status === 'INACTIVE' ? 'bi-toggle-off' : 'bi-toggle-on'" />
                  </button>
                  <button class="btn btn-outline-danger" title="Delete" @click="askDelete(m)"><i class="bi bi-trash" /></button>
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
      title="Delete motorbike?"
      :message="`This will permanently delete ${toDelete?.name}. This cannot be undone.`"
      confirm-text="Delete"
      danger
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Motorbikes' })

interface MotorbikeRow {
  id: string
  name: string
  slug: string
  brand: string
  model: string
  plateNumber: string | null
  color: string | null
  keyType: string
  engineCc: number
  transmission: string
  dailyPrice: string
  status: string
  featured: boolean
  primaryImage: string | null
}

const toast = useToast()
const placeholder = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200'

const search = ref('')
const status = ref('')
const page = ref(1)
const items = ref<MotorbikeRow[]>([])
const total = ref(0)
const totalPages = ref(1)
const pending = ref(true)

const showDelete = ref(false)
const toDelete = ref<MotorbikeRow | null>(null)

async function fetchList() {
  pending.value = true
  try {
    const query: Record<string, string | number> = { page: page.value, pageSize: 15 }
    if (search.value) query.search = search.value
    if (status.value) query.status = status.value
    const res = await useApi<{ items: MotorbikeRow[]; total: number; totalPages: number }>('/api/admin/motorbikes', { query })
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

async function toggleActive(m: MotorbikeRow) {
  const newStatus = m.status === 'INACTIVE' ? 'AVAILABLE' : 'INACTIVE'
  try {
    await useApi(`/api/admin/motorbikes/${m.id}`, { method: 'PUT', body: { status: newStatus } })
    toast.success(`${m.name} is now ${newStatus === 'INACTIVE' ? 'inactive' : 'available'}`)
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update status')
  }
}

function askDelete(m: MotorbikeRow) {
  toDelete.value = m
  showDelete.value = true
}
async function confirmDelete() {
  if (!toDelete.value) return
  try {
    await useApi(`/api/admin/motorbikes/${toDelete.value.id}`, { method: 'DELETE' })
    toast.success('Motorbike deleted')
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not delete motorbike')
  }
}
</script>

<style scoped>
.table-thumb {
  width: 56px;
  height: 42px;
  object-fit: cover;
  border-radius: 6px;
}
.key-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
}
.key-badge--smart {
  background: rgba(231, 160, 60, 0.15);
  color: var(--color-amber-deep);
}
.key-badge--normal {
  background: var(--color-gray-light);
  color: var(--color-gray-mid);
}
</style>
