<template>
  <div class="card bike-card h-100 overflow-hidden">
    <NuxtLink :to="`/motorbikes/${bike.slug}`" class="bike-card__media d-block">
      <img
        v-if="bike.image && !imgError"
        :src="bike.image"
        :alt="bike.name"
        class="w-100 bike-card__image"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-else class="w-100 bike-card__image motor-placeholder motor-placeholder--lg">
        <i class="bi bi-scooter" />
      </div>
      <span class="bike-card__badge">{{ t('motorbikeCard.available') }}</span>
      <span v-if="bike.isNewBike" class="bike-card__new">{{ t('motorbikeCard.new') }}</span>
    </NuxtLink>
    <div class="card-body d-flex flex-column">
      <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
        <p class="eyebrow mb-0">{{ bike.brand }}</p>
        <span v-if="bike.categoryName" class="bike-card__category">{{ bike.categoryName }}</span>
      </div>
      <h3 class="h5 font-display mb-1">{{ bike.name }}</h3>
      <NuxtLink
        v-if="bike.shopName"
        :to="bike.shopSlug ? `/shops/${bike.shopSlug}` : '/shops'"
        class="small text-muted mb-2 d-flex align-items-center gap-1 bike-card__shop text-decoration-none"
        @click.stop
      >
        <i class="bi bi-shop" />{{ bike.shopName }}
      </NuxtLink>

      <ul class="list-unstyled d-flex flex-wrap gap-2 gap-sm-3 small text-muted my-1 bike-card__specs">
        <li><i class="bi bi-gear me-1" />{{ formatTransmission(bike.transmission) }}</li>
        <li><i class="bi bi-speedometer2 me-1" />{{ bike.engineCc }}cc</li>
      </ul>

      <div class="mt-auto d-flex flex-wrap align-items-center justify-content-between gap-2 pt-3">
        <div>
          <span class="small text-muted d-block">{{ t('motorbikeCard.from') }}</span>
          <span class="price-tag fs-5">${{ Number(bike.dailyPrice).toFixed(0) }}<span class="fs-6 fw-normal">{{ t('motorbikeCard.perDay') }}</span></span>
        </div>
        <NuxtLink :to="`/motorbikes/${bike.slug}`" class="btn btn-sm btn-outline-charcoal bike-card__cta">{{ t('motorbikeCard.viewDetails') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
defineProps<{
  bike: {
    id: string
    name: string
    slug: string
    brand: string
    engineCc: number
    transmission: string
    dailyPrice: string | number
    isNewBike?: boolean
    image?: string | null
    shopName?: string | null
    shopSlug?: string | null
    categoryName?: string | null
  }
}>()

const imgError = ref(false)

function formatTransmission(t: string) {
  return t.replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<style scoped>
.bike-card__specs li {
  white-space: nowrap;
}
.bike-card__cta {
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}
.bike-card:hover .bike-card__cta {
  background-color: var(--color-amber-deep, var(--color-gold-deep));
  border-color: var(--color-amber-deep, var(--color-gold-deep));
  color: var(--text-on-dark, #fff);
}
.bike-card__shop {
  transition: color 0.2s ease;
}
.bike-card__shop:hover {
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.bike-card__category {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  background: var(--color-gray-light);
  color: var(--color-forest, var(--color-charcoal));
  white-space: nowrap;
}
</style>
