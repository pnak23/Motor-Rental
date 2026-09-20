<template>
  <div>
    <section class="shop-hero bg-forest text-white position-relative overflow-hidden">
      <div class="shop-hero__glow" />
      <TempleSilhouette class="shop-hero__silhouette" />
      <div class="container position-relative py-5">
        <NuxtLink to="/shops" class="text-white-50 small d-inline-flex align-items-center gap-1 mb-4 link-underline-grow">
          <i class="bi bi-arrow-left" />{{ t('shops.backToShops') }}
        </NuxtLink>
        <div class="d-flex flex-wrap align-items-center gap-4">
          <div class="shop-hero__avatar">
            <img v-if="shop.logoUrl" :src="shop.logoUrl" :alt="shop.name" />
            <span v-else>{{ initials(shop.name) }}</span>
          </div>
          <div>
            <p class="eyebrow text-gold-light mb-2">{{ t('shops.eyebrow') }}</p>
            <h1 class="font-display display-6 mb-2">{{ shop.name }}</h1>
            <span class="shop-hero__badge mb-1"><i class="bi bi-motorcycle me-1" />{{ t('shops.motorbikesAvailable', { count: shop.motorbikeCount }) }}</span>
          </div>
        </div>

        <div class="shop-hero__contacts mt-4">
          <span v-if="shop.province" class="shop-hero__chip"><i class="bi bi-map" />{{ shop.province }}</span>
          <span v-if="shop.address" class="shop-hero__chip"><i class="bi bi-geo-alt" />{{ shop.address }}</span>
          <a v-if="shop.phone" :href="`tel:${shop.phone}`" class="shop-hero__chip"><i class="bi bi-telephone" />{{ shop.phone }}</a>
          <a v-if="shop.telegram" :href="shop.telegram" target="_blank" rel="noopener" class="shop-hero__chip"><i class="bi bi-telegram" />Telegram</a>
          <a v-if="shop.whatsapp" :href="shop.whatsapp" target="_blank" rel="noopener" class="shop-hero__chip"><i class="bi bi-whatsapp" />WhatsApp</a>
        </div>
      </div>
    </section>

    <div class="container py-5">
      <div class="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-4" v-reveal>
        <span class="text-muted small">{{ t('motorbikes.showing', { shown: items.length, total }) }}</span>
        <select v-model="sort" class="form-select form-select-sm w-auto">
          <option value="popular">{{ t('motorbikes.mostPopular') }}</option>
          <option value="price_asc">{{ t('motorbikes.priceLowHigh') }}</option>
          <option value="price_desc">{{ t('motorbikes.priceHighLow') }}</option>
          <option value="newest">{{ t('motorbikes.newest') }}</option>
        </select>
      </div>

      <div v-if="pending" class="row g-4">
        <div v-for="i in 6" :key="i" class="col-md-6 col-xl-4">
          <div class="skeleton" style="height: 320px; border-radius: var(--radius-lg)" />
        </div>
      </div>

      <div v-else-if="items.length === 0" class="text-center py-5" v-reveal>
        <i class="bi bi-emoji-frown fs-1 text-gold d-block mb-2" />
        <p class="text-muted">{{ t('motorbikes.noMatch') }}</p>
      </div>

      <TransitionGroup v-else tag="div" name="filter-fade" class="row g-4">
        <div v-for="(bike, i) in items" :key="bike.id" class="col-md-6 col-xl-4" v-reveal :class="`reveal-delay-${i % 4}`">
          <MotorbikeCard :bike="bike" />
        </div>
      </TransitionGroup>

      <div class="d-flex justify-content-center mt-5">
        <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
      </div>

      <!-- Rental policies -->
      <div class="mt-5 pt-3" v-reveal>
        <h2 class="h5 font-display mb-3"><i class="bi bi-shield-check text-gold me-2" />{{ t('shops.rentalPolicies') }}</h2>
        <ShopPolicyList :shop="shop" layout="grid" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const slug = route.params.slug as string

interface ShopDetail {
  id: string
  slug: string
  name: string
  logoUrl?: string | null
  address?: string | null
  province?: string | null
  phone?: string | null
  email?: string | null
  telegram?: string | null
  whatsapp?: string | null
  minimumAge?: number | null
  requiredDocuments?: string | null
  depositPolicy?: string | null
  fuelPolicy?: string | null
  lateReturnPolicy?: string | null
  damagePolicy?: string | null
  cancellationPolicy?: string | null
  accidentPolicy?: string | null
  trafficViolationPolicy?: string | null
  helmetPolicy?: string | null
  motorbikeCount: number
}
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
interface MotorbikesResponse {
  items: Bike[]
  total: number
  page: number
  totalPages: number
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const shop = await useApi<ShopDetail>(`/api/public/shops/${slug}`)

useHead({ title: `${shop.name} — Browse Motorbikes` })

const sort = ref('popular')
const page = ref(1)
const items = ref<Bike[]>([])
const total = ref(0)
const totalPages = ref(1)
const pending = ref(true)

async function fetchMotorbikes() {
  pending.value = true
  try {
    const res = await useApi<MotorbikesResponse>('/api/public/motorbikes', {
      query: { shop: slug, page: page.value, pageSize: 12, sort: sort.value }
    })
    items.value = res.items
    total.value = res.total
    totalPages.value = res.totalPages
  } finally {
    pending.value = false
  }
}

watch(sort, () => {
  page.value = 1
  fetchMotorbikes()
})
watch(page, fetchMotorbikes)

await fetchMotorbikes()
</script>

<style scoped>
.shop-hero {
  padding-top: 1rem;
}
.shop-hero__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(50% 70% at 15% 10%, rgba(212, 175, 55, 0.24), transparent 70%);
  pointer-events: none;
}
.shop-hero__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 40px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.07;
}
.text-gold-light {
  color: var(--color-gold, #d4af37);
}
.link-underline-grow {
  position: relative;
}
.link-underline-grow::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.25s ease;
}
.link-underline-grow:hover::after {
  width: 100%;
}
.shop-hero__avatar {
  position: relative;
  z-index: 1;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: var(--color-white, #fff);
  border: 3px solid var(--color-white, #fff);
  box-shadow: 0 0 0 3px var(--color-gold, #d4af37);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-family: var(--font-display, inherit);
  font-weight: 600;
  font-size: 1.6rem;
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.shop-hero__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shop-hero__badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.18);
  color: var(--color-gold, #d4af37);
}
.shop-hero__contacts {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}
.shop-hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}
.shop-hero__chip:hover {
  background: rgba(212, 175, 55, 0.16);
  border-color: var(--color-gold, #d4af37);
  color: #fff;
}

</style>
