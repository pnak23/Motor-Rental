<template>
  <div>
    <PageHeader eyebrow="Our Fleet" title="Browse Motorbikes" :subtitle="`${total} motorbikes available in Siem Reap`" />

    <div class="container py-5">
    <div class="row g-4">
      <!-- Filters -->
      <div class="col-lg-3">
        <div class="card p-3">
          <label class="form-label small fw-600">Search</label>
          <input v-model="search" type="text" class="form-control mb-3" placeholder="Name, brand, model..." />

          <label class="form-label small fw-600">Category</label>
          <select v-model="category" class="form-select mb-3">
            <option value="">All categories</option>
            <option v-for="c in filters?.categories" :key="c.id" :value="c.slug">{{ c.name }}</option>
          </select>

          <label class="form-label small fw-600">Brand</label>
          <select v-model="brand" class="form-select mb-3">
            <option value="">All brands</option>
            <option v-for="b in filters?.brands" :key="b" :value="b">{{ b }}</option>
          </select>

          <label class="form-label small fw-600">Transmission</label>
          <select v-model="transmission" class="form-select mb-3">
            <option value="">Any</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
            <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
          </select>

          <label class="form-label small fw-600">Max daily price</label>
          <input v-model.number="maxPrice" type="range" min="5" max="50" step="1" class="form-range mb-1" />
          <p class="small text-muted">Up to ${{ maxPrice }}/day</p>

          <button class="btn btn-outline-charcoal btn-sm mt-2" @click="resetFilters">Reset filters</button>
        </div>
      </div>

      <!-- Results -->
      <div class="col-lg-9">
        <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
          <span class="text-muted small">Showing {{ items.length }} of {{ total }}</span>
          <select v-model="sort" class="form-select form-select-sm w-auto">
            <option value="popular">Most popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div v-if="pending" class="row g-4">
          <div v-for="i in 6" :key="i" class="col-md-6 col-xl-4">
            <div class="skeleton" style="height: 320px; border-radius: var(--radius-md)" />
          </div>
        </div>

        <div v-else-if="items.length === 0" class="text-center py-5">
          <i class="bi bi-emoji-frown fs-1 text-muted d-block mb-2" />
          <p class="text-muted">No motorbikes match your filters. Try adjusting your search.</p>
        </div>

        <div v-else class="row g-4">
          <div v-for="bike in items" :key="bike.id" class="col-md-6 col-xl-4">
            <MotorbikeCard :bike="bike" />
          </div>
        </div>

        <div class="d-flex justify-content-center mt-4">
          <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Bike {
  id: string
  name: string
  slug: string
  brand: string
  engineCc: number
  transmission: string
  dailyPrice: string
  isNewBike?: boolean
  image?: string | null
}
interface Category {
  id: string
  name: string
  slug: string
}
interface MotorbikesResponse {
  items: Bike[]
  total: number
  page: number
  totalPages: number
  filters: { brands: string[]; categories: Category[] }
}

useHead({ title: 'Browse Motorbikes — Siem Reap Rentals' })

const route = useRoute()
const router = useRouter()

const search = ref((route.query.search as string) || '')
const category = ref((route.query.category as string) || '')
const brand = ref((route.query.brand as string) || '')
const transmission = ref((route.query.transmission as string) || '')
const maxPrice = ref(Number(route.query.maxPrice) || 30)
const sort = ref((route.query.sort as string) || 'popular')
const page = ref(Number(route.query.page) || 1)

const items = ref<Bike[]>([])
const total = ref(0)
const totalPages = ref(1)
const filters = ref<{ brands: string[]; categories: Category[] } | null>(null)
const pending = ref(true)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchMotorbikes() {
  pending.value = true
  try {
    const query: Record<string, string | number> = { page: page.value, pageSize: 12, sort: sort.value }
    if (search.value) query.search = search.value
    if (category.value) query.category = category.value
    if (brand.value) query.brand = brand.value
    if (transmission.value) query.transmission = transmission.value
    if (maxPrice.value) query.maxPrice = maxPrice.value

    router.replace({ query: query as Record<string, string> })

    const res = await useApi<MotorbikesResponse>('/api/public/motorbikes', { query })
    items.value = res.items
    total.value = res.total
    totalPages.value = res.totalPages
    filters.value = res.filters
  } finally {
    pending.value = false
  }
}

function resetFilters() {
  search.value = ''
  category.value = ''
  brand.value = ''
  transmission.value = ''
  maxPrice.value = 30
  page.value = 1
}

watch([category, brand, transmission, maxPrice, sort], () => {
  page.value = 1
  fetchMotorbikes()
})
watch(page, fetchMotorbikes)
watch(search, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    page.value = 1
    fetchMotorbikes()
  }, 350)
})

await fetchMotorbikes()
</script>
