<template>
  <div class="card bike-card h-100 overflow-hidden">
    <NuxtLink :to="`/motorbikes/${bike.slug}`" class="bike-card__media d-block">
      <img
        :src="bike.image || placeholder"
        :alt="bike.name"
        class="w-100 bike-card__image"
        loading="lazy"
      />
      <span class="bike-card__badge">Available</span>
      <span v-if="bike.isNewBike" class="bike-card__new">New</span>
    </NuxtLink>
    <div class="card-body d-flex flex-column">
      <p class="eyebrow mb-1">{{ bike.brand }}</p>
      <h3 class="h5 font-display mb-2">{{ bike.name }}</h3>

      <ul class="list-unstyled d-flex flex-wrap gap-3 small text-muted my-1">
        <li><i class="bi bi-gear me-1" />{{ formatTransmission(bike.transmission) }}</li>
        <li><i class="bi bi-speedometer2 me-1" />{{ bike.engineCc }}cc</li>
      </ul>

      <div class="mt-auto d-flex align-items-center justify-content-between pt-3">
        <div>
          <span class="small text-muted d-block">From</span>
          <span class="price-tag fs-5">${{ Number(bike.dailyPrice).toFixed(0) }}<span class="fs-6 fw-normal">/day</span></span>
        </div>
        <NuxtLink :to="`/motorbikes/${bike.slug}`" class="btn btn-sm btn-outline-charcoal">View Details</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  }
}>()

const placeholder = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800'

function formatTransmission(t: string) {
  return t.replace(/_/g, '-').replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>
