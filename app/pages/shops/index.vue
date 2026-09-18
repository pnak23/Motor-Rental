<template>
  <div>
    <PageHeader :eyebrow="t('shops.eyebrow')" :title="t('shops.title')" :subtitle="t('shops.subtitle')" />

    <div class="container py-5">
      <div class="row justify-content-center mb-5 g-2">
        <div class="col-md-6 col-lg-5">
          <div class="search-input">
            <i class="bi bi-search" />
            <input v-model="search" type="text" class="form-control" :placeholder="t('shops.searchPlaceholder')" />
          </div>
        </div>
        <div class="col-md-4 col-lg-3">
          <select v-model="province" class="form-select">
            <option value="">{{ t('shops.allProvinces') }}</option>
            <option v-for="p in CAMBODIA_PLATE_REGIONS" :key="p.en" :value="p.en">{{ p.en }}</option>
          </select>
        </div>
      </div>

      <div v-if="pending" class="row g-4">
        <div v-for="i in 6" :key="i" class="col-md-6 col-xl-4">
          <div class="skeleton" style="height: 280px; border-radius: var(--radius-lg)" />
        </div>
      </div>

      <div v-else-if="shops.length === 0" class="text-center py-5" v-reveal>
        <i class="bi bi-shop fs-1 text-gold d-block mb-2" />
        <p class="text-muted">{{ t('shops.noShops') }}</p>
      </div>

      <div v-else class="row g-4 pt-3">
        <div v-for="(shop, i) in shops" :key="shop.id" class="col-md-6 col-xl-4" v-reveal :class="`reveal-delay-${i % 4}`">
          <ShopCard :shop="shop" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Shop {
  id: string
  slug: string
  name: string
  logoUrl?: string | null
  address?: string | null
  province?: string | null
  phone?: string | null
  email?: string | null
  motorbikeCount: number
}

useHead({ title: 'Shops — Browse by Shop' })

const search = ref('')
const province = ref('')
const shops = ref<Shop[]>([])
const pending = ref(true)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchShops() {
  pending.value = true
  try {
    const query: Record<string, string> = {}
    if (search.value) query.search = search.value
    if (province.value) query.province = province.value
    shops.value = await useApi<Shop[]>('/api/public/shops', { query })
  } finally {
    pending.value = false
  }
}

watch(search, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchShops, 350)
})
watch(province, fetchShops)

await fetchShops()
</script>

<style scoped>
.search-input {
  position: relative;
}
.search-input i {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-mid);
  font-size: 0.9rem;
}
.search-input .form-control {
  padding-left: 2.1rem;
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}
</style>
