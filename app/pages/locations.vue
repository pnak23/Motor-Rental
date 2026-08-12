<template>
  <div>
    <PageHeader
      eyebrow="Find Us"
      title="Rental Locations"
      subtitle="Pick up and return your motorbike at any of these locations around Siem Reap."
    />

    <div class="container py-5">
    <div class="row g-4">
      <div v-for="loc in locations" :key="loc.id" class="col-md-6" v-reveal>
        <div class="card p-4 h-100">
          <div class="d-flex align-items-start gap-3">
            <span class="contact-icon"><i class="bi bi-geo-alt" /></span>
            <div>
              <h3 class="h6 font-display mb-1">{{ loc.name }}</h3>
              <p class="text-muted small mb-1">{{ loc.address }}</p>
              <p v-if="loc.openingTime" class="small mb-1">
                <i class="bi bi-clock me-1" />{{ loc.openingTime }} – {{ loc.closingTime }}
              </p>
              <p v-if="loc.phone" class="small mb-2"><i class="bi bi-telephone me-1" />{{ loc.phone }}</p>
              <a
                v-if="loc.googleMapsUrl"
                :href="loc.googleMapsUrl"
                target="_blank"
                rel="noopener"
                class="btn btn-sm btn-outline-charcoal"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Location {
  id: string
  name: string
  address: string
  openingTime: string | null
  closingTime: string | null
  phone: string | null
  googleMapsUrl: string | null
}
const locations = await useApi<Location[]>('/api/public/locations')
useHead({ title: 'Rental Locations — Siem Reap' })
</script>

<style scoped>
.contact-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-gray-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
