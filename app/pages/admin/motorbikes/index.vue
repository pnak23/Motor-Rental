<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Motorbikes</h1>
        <p class="admin-page-header__subtitle">{{ total }} motorbikes in your fleet.</p>
      </div>
      <div class="admin-page-header__actions">
        <input v-model="search" class="form-control" placeholder="Search motorbikes..." style="width: 220px" />
        <select v-model="status" class="form-select" style="width: 160px">
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RENTED">Rented</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add Motorbike</button>
      </div>
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
              <td class="font-mono small">{{ formatPlate(m.plateProvince, m.plateNumber) || '—' }}</td>
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
                  <button class="btn btn-outline-secondary" title="Edit" @click="openEdit(m)"><i class="bi bi-pencil" /></button>
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

    <AdminModal
      v-model="showModal"
      :title="editingId ? 'Edit Motorbike' : 'Add Motorbike'"
      :subtitle="editingId ? undefined : 'Save the motorbike first, then add photos and pricing rules.'"
      size="xl"
      :loading="modalLoading"
    >
      <MotorbikeImageManager v-if="editingId" v-model="images" :motorbike-id="editingId" />
      <PricingRulesManager v-if="editingId" v-model="pricingRules" :motorbike-id="editingId" />

      <form id="motorbike-form" @submit.prevent="submit">
        <MotorbikeFormFields v-model="form" :categories="categories" />
      </form>
      <p v-if="formError" class="text-danger small mb-0">{{ formError }}</p>

      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showModal = false">{{ editingId ? 'Close' : 'Cancel' }}</button>
        <button type="submit" form="motorbike-form" class="btn btn-amber" :disabled="saving">
          <span v-if="saving" class="spinner-border spinner-border-sm me-2" />{{ editingId ? 'Save Changes' : 'Create Motorbike' }}
        </button>
      </template>
    </AdminModal>
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
  plateProvince: string | null
  color: string | null
  keyType: string
  engineCc: number
  transmission: string
  dailyPrice: string
  status: string
  featured: boolean
  primaryImage: string | null
}
interface Category {
  id: string
  name: string
}
interface MImage {
  id: string
  url: string
  isPrimary: boolean
}
interface Rule {
  id: string
  name: string
  type: string
  minDays: number
  maxDays: number | null
  pricePerDay: string
}
interface MotorbikeDetail {
  id: string
  name: string
  categoryId: string | null
  brand: string
  model: string
  year: number | null
  engineCc: number
  transmission: string
  fuelType: string
  plateNumber: string | null
  plateProvince: string | null
  color: string | null
  keyType: string
  seatCapacity: number | null
  fuelConsumption: string | null
  description: string | null
  dailyPrice: string
  weeklyPrice: string | null
  monthlyPrice: string | null
  deposit: string
  deliveryFee: string
  minRentalDays: number
  maxRentalDays: number
  helmetIncluded: boolean
  phoneHolder: boolean
  usbCharger: boolean
  goodForCity: boolean
  goodForLongTrip: boolean
  isNewBike: boolean
  popular: boolean
  featured: boolean
  status: string
  seoTitle: string | null
  seoKeywords: string | null
  seoDescription: string | null
  images: MImage[]
  pricingRules: Rule[]
}

const toast = useToast()
const route = useRoute()
const router = useRouter()
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

const categories = await useApi<Category[]>('/api/admin/categories')

const showModal = ref(false)
const modalLoading = ref(false)
const editingId = ref<string | null>(null)
const images = ref<MImage[]>([])
const pricingRules = ref<Rule[]>([])
const saving = ref(false)
const formError = ref('')

function emptyForm() {
  return {
    name: '',
    categoryId: null,
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    engineCc: 125,
    transmission: 'AUTOMATIC',
    fuelType: 'GASOLINE',
    plateNumber: '',
    plateProvince: null,
    color: '',
    keyType: 'NORMAL_KEY',
    seatCapacity: 2,
    fuelConsumption: '',
    description: '',
    dailyPrice: 10,
    weeklyPrice: null,
    monthlyPrice: null,
    deposit: 0,
    deliveryFee: 0,
    minRentalDays: 1,
    maxRentalDays: 60,
    helmetIncluded: true,
    phoneHolder: false,
    usbCharger: false,
    goodForCity: true,
    goodForLongTrip: false,
    isNewBike: false,
    popular: false,
    featured: false,
    status: 'AVAILABLE',
    seoTitle: '',
    seoKeywords: '',
    seoDescription: ''
  }
}
const form = reactive<Record<string, unknown>>(emptyForm())

function openCreate() {
  editingId.value = null
  images.value = []
  pricingRules.value = []
  formError.value = ''
  Object.assign(form, emptyForm())
  showModal.value = true
}

async function openEdit(m: MotorbikeRow) {
  editingId.value = m.id
  formError.value = ''
  showModal.value = true
  modalLoading.value = true
  try {
    const bike = await useApi<MotorbikeDetail>(`/api/admin/motorbikes/${m.id}`)
    images.value = bike.images
    pricingRules.value = bike.pricingRules
    Object.assign(form, {
      name: bike.name,
      categoryId: bike.categoryId,
      brand: bike.brand,
      model: bike.model,
      year: bike.year,
      engineCc: bike.engineCc,
      transmission: bike.transmission,
      fuelType: bike.fuelType,
      plateNumber: bike.plateNumber,
      plateProvince: bike.plateProvince,
      color: bike.color,
      keyType: bike.keyType,
      seatCapacity: bike.seatCapacity,
      fuelConsumption: bike.fuelConsumption,
      description: bike.description,
      dailyPrice: Number(bike.dailyPrice),
      weeklyPrice: bike.weeklyPrice ? Number(bike.weeklyPrice) : null,
      monthlyPrice: bike.monthlyPrice ? Number(bike.monthlyPrice) : null,
      deposit: Number(bike.deposit),
      deliveryFee: Number(bike.deliveryFee),
      minRentalDays: bike.minRentalDays,
      maxRentalDays: bike.maxRentalDays,
      helmetIncluded: bike.helmetIncluded,
      phoneHolder: bike.phoneHolder,
      usbCharger: bike.usbCharger,
      goodForCity: bike.goodForCity,
      goodForLongTrip: bike.goodForLongTrip,
      isNewBike: bike.isNewBike,
      popular: bike.popular,
      featured: bike.featured,
      status: bike.status,
      seoTitle: bike.seoTitle,
      seoKeywords: bike.seoKeywords,
      seoDescription: bike.seoDescription
    })
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Could not load motorbike'
  } finally {
    modalLoading.value = false
  }
}

async function submit() {
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await useApi(`/api/admin/motorbikes/${editingId.value}`, { method: 'PUT', body: form })
      toast.success('Motorbike updated')
    } else {
      const created = await useApi<{ id: string }>('/api/admin/motorbikes', { method: 'POST', body: form })
      toast.success('Motorbike created — you can now add photos and pricing rules below')
      editingId.value = created.id
    }
    fetchList()
  } catch (e) {
    formError.value = e instanceof Error ? e.message : 'Could not save motorbike'
  } finally {
    saving.value = false
  }
}

if (route.query.new) {
  openCreate()
  router.replace({ query: { ...route.query, new: undefined } })
}

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
