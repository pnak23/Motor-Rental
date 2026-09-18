<template>
  <div class="card bike-card h-100 overflow-hidden">
    <NuxtLink :to="`/motorbikes/${bike.slug}`" class="bike-card__media d-block">
      <img
        :src="bike.image || placeholder"
        :alt="bike.name"
        class="w-100 bike-card__image"
        loading="lazy"
      />
      <span class="bike-card__badge">{{ t('motorbikeCard.available') }}</span>
      <span v-if="bike.isNewBike" class="bike-card__new">{{ t('motorbikeCard.new') }}</span>
    </NuxtLink>
    <div class="card-body d-flex flex-column">
      <p class="eyebrow mb-1">{{ bike.brand }}</p>
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
  }
}>()

const placeholder = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'

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
}
.bike-card__shop {
  transition: color 0.2s ease;
}
.bike-card__shop:hover {
  color: var(--color-amber-deep, var(--color-gold-deep));
}
</style>
