<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Shops</h1>
        <p class="admin-page-header__subtitle">Every independently owned shop on the platform.</p>
      </div>
      <div class="admin-page-header__actions">
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add Shop</button>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <div class="d-flex flex-wrap gap-2">
        <input v-model="search" class="form-control" placeholder="Search name, slug, or owner email..." style="width: 260px" />
        <select v-model="status" class="form-select" style="width: 170px">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending Approval</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select v-model="sort" class="form-select" style="width: 170px">
          <option value="createdAt">Newest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="lastActivity">Last activity</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div v-if="pending" class="text-center py-5">
        <span class="spinner-border" />
        <p class="mb-0 mt-2 text-muted">Loading shops…</p>
      </div>
      <div v-else-if="error" class="admin-empty-state">
        <i class="bi bi-exclamation-triangle" />
        <p>{{ error }}</p>
        <button class="btn btn-sm btn-outline-secondary" @click="fetchList">Retry</button>
      </div>
      <div v-else-if="!shops.length" class="admin-empty-state">
        <i class="bi bi-shop" />
        <p>No shops found</p>
        <p class="small mb-0">Try a different search or filter, or add the first shop.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Shop</th>
              <th>Owner</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last activity</th>
              <th class="text-end">Users</th>
              <th class="text-end">Bookings</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shop in shops" :key="shop.id">
              <td>
                <p class="fw-600 mb-0">{{ shop.name }}</p>
                <p class="small text-muted mb-0">{{ shop.slug }}</p>
              </td>
              <td>
                <p class="mb-0">{{ shop.ownerName || '—' }}</p>
                <p class="small text-muted mb-0">{{ shop.ownerEmail || '—' }}</p>
              </td>
              <td class="small text-muted">
                <p class="mb-0">{{ shop.email || 'no email' }}</p>
                <p class="mb-0">{{ shop.phone || 'no phone' }}</p>
              </td>
              <td><StatusBadge :status="shop.status" /></td>
              <td class="small text-muted">{{ formatDate(shop.createdAt) }}</td>
              <td class="small text-muted">{{ shop.lastActivity ? formatDate(shop.lastActivity) : 'never' }}</td>
              <td class="text-end font-mono">{{ shop.userCount }}</td>
              <td class="text-end font-mono">{{ shop.bookingCount }}</td>
              <td class="text-end">
                <div class="d-flex justify-content-end gap-1">
                  <NuxtLink :to="`/admin/shops/${shop.id}`" class="btn btn-sm btn-charcoal">Manage Shop</NuxtLink>
                  <button class="btn btn-sm btn-outline-secondary" @click="edit(shop)"><i class="bi bi-pencil" /></button>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots" />
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li v-if="shop.status !== 'ACTIVE'">
                        <button class="dropdown-item" @click="setStatus(shop, 'ACTIVE')"><i class="bi bi-play-circle me-2" />Activate</button>
                      </li>
                      <li v-if="shop.status !== 'SUSPENDED'">
                        <button class="dropdown-item" @click="askSuspend(shop)"><i class="bi bi-pause-circle me-2" />Suspend</button>
                      </li>
                      <li v-if="shop.status !== 'CLOSED'">
                        <button class="dropdown-item text-danger" @click="askClose(shop)"><i class="bi bi-x-circle me-2" />Close</button>
                      </li>
                    </ul>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!pending && !error && shops.length" class="p-3 d-flex justify-content-between align-items-center">
        <span class="small text-muted">{{ total }} total</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
      </div>
    </div>

    <AdminModal v-model="showEditModal" title="Edit Shop">
      <form id="shop-edit-form" @submit.prevent="saveEdit">
        <input v-model="editForm.name" required placeholder="Shop name *" class="form-control mb-2" />
        <input v-model="editForm.phone" placeholder="Phone" class="form-control mb-2" />
        <input v-model="editForm.email" placeholder="Email" class="form-control mb-2" />
        <input v-model="editForm.address" placeholder="Address" class="form-control mb-2" />
        <p class="small text-muted mb-0">For full shop details, use "Manage Shop" instead.</p>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showEditModal = false">Cancel</button>
        <button type="submit" form="shop-edit-form" class="btn btn-amber">Update Shop</button>
      </template>
    </AdminModal>

    <AdminModal v-model="showCreateModal" title="Add Shop">
      <form id="shop-create-form" @submit.prevent="saveCreate">
        <h3 class="h6 font-display mb-2">Shop</h3>
        <input v-model="createForm.name" required placeholder="Shop name *" class="form-control mb-2" />
        <input v-model="createForm.slug" placeholder="URL slug (auto-generated if blank)" class="form-control mb-2" />
        <input v-model="createForm.phone" placeholder="Phone" class="form-control mb-2" />
        <input v-model="createForm.email" placeholder="Email" class="form-control mb-2" />
        <input v-model="createForm.address" placeholder="Address" class="form-control mb-2" />
        <select v-model="createForm.province" class="form-select mb-3">
          <option value="">Province — not set</option>
          <option v-for="p in CAMBODIA_PLATE_REGIONS" :key="p.en" :value="p.en">{{ p.en }}</option>
        </select>
        <h3 class="h6 font-display mb-2">Owner account</h3>
        <input v-model="createForm.ownerName" required placeholder="Owner name *" class="form-control mb-2" />
        <input v-model="createForm.ownerEmail" required type="email" placeholder="Owner email *" class="form-control mb-2" />
        <input v-model="createForm.ownerPassword" required type="password" minlength="8" placeholder="Owner password (min 8 chars) *" class="form-control mb-2" />
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showCreateModal = false">Cancel</button>
        <button type="submit" form="shop-create-form" class="btn btn-amber">Create Shop</button>
      </template>
    </AdminModal>

    <ConfirmActionModal
      v-model="showSuspendModal"
      title="Suspend shop"
      :message="`Suspend ${toSuspend?.name}? Its motorbikes will be hidden from the public site until reactivated.`"
      confirm-text="Suspend"
      danger
      require-reason
      @confirm="confirmSuspend"
    />
    <ConfirmActionModal
      v-model="showCloseModal"
      title="Close shop"
      :message="`This shop will be permanently hidden from the public site.`"
      confirm-text="Close Shop"
      danger
      :require-text="toClose?.name"
      @confirm="confirmClose"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Shops' })

interface Shop {
  id: string
  slug: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  isActive: boolean
  status: string
  createdAt: string
  lastActivity: string | null
  ownerName: string | null
  ownerEmail: string | null
  userCount: number
  bookingCount: number
}

const toast = useToast()

const search = ref('')
const status = ref('')
const sort = ref('createdAt')
const page = ref(1)
const shops = ref<Shop[]>([])
const total = ref(0)
const totalPages = ref(1)
const pending = ref(true)
const error = ref('')

async function fetchList() {
  pending.value = true
  error.value = ''
  try {
    const query: Record<string, string | number> = { page: page.value, pageSize: 20, sort: sort.value }
    if (search.value) query.search = search.value
    if (status.value) query.status = status.value
    const res = await useApi<{ items: Shop[]; total: number; totalPages: number }>('/api/admin/platform/shops', { query })
    shops.value = res.items
    total.value = res.total
    totalPages.value = res.totalPages
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load shops'
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
watch([status, sort, page], fetchList)
await fetchList()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const showEditModal = ref(false)
const editingId = ref<string | null>(null)
const editForm = reactive({ name: '', phone: '', email: '', address: '' })

function edit(shop: Shop) {
  editingId.value = shop.id
  editForm.name = shop.name
  editForm.phone = shop.phone || ''
  editForm.email = shop.email || ''
  editForm.address = shop.address || ''
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingId.value) return
  try {
    await useApi(`/api/admin/platform/shops/${editingId.value}`, { method: 'PUT', body: editForm })
    showEditModal.value = false
    toast.success('Shop updated')
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update shop')
  }
}

async function setStatus(shop: Shop, newStatus: string, reason?: string) {
  try {
    await useApi(`/api/admin/platform/shops/${shop.id}/status`, { method: 'PUT', body: { status: newStatus, reason } })
    toast.success(`Shop set to ${newStatus.toLowerCase()}`)
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update shop status')
  }
}

const showSuspendModal = ref(false)
const toSuspend = ref<Shop | null>(null)
function askSuspend(shop: Shop) {
  toSuspend.value = shop
  showSuspendModal.value = true
}
function confirmSuspend(payload: { reason?: string }) {
  if (toSuspend.value) setStatus(toSuspend.value, 'SUSPENDED', payload.reason)
}

const showCloseModal = ref(false)
const toClose = ref<Shop | null>(null)
function askClose(shop: Shop) {
  toClose.value = shop
  showCloseModal.value = true
}
function confirmClose() {
  if (toClose.value) setStatus(toClose.value, 'CLOSED')
}

const showCreateModal = ref(false)
function emptyCreateForm() {
  return { name: '', slug: '', phone: '', email: '', address: '', province: '', ownerName: '', ownerEmail: '', ownerPassword: '' }
}
const createForm = reactive(emptyCreateForm())

function openCreate() {
  Object.assign(createForm, emptyCreateForm())
  showCreateModal.value = true
}

async function saveCreate() {
  try {
    const body: Record<string, unknown> = { ...createForm }
    if (!body.slug) delete body.slug
    await useApi('/api/admin/platform/shops', { method: 'POST', body })
    showCreateModal.value = false
    toast.success('Shop created')
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not create shop')
  }
}
</script>
