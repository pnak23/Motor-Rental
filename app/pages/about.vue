<template>
  <div>
    <PageHeader eyebrow="Our Story" :title="settings?.aboutTitle || 'About Us'" />

    <section class="section bg-cream">
      <div class="container">
        <div class="row g-5 align-items-center mb-5">
          <div class="col-lg-6" v-reveal>
            <img
              :src="settings?.aboutImage || 'https://images.unsplash.com/photo-1596178060810-72660ee8d859?w=1000'"
              class="img-fluid rounded-4 about-hero-img"
              alt="Our team"
            />
          </div>
          <div class="col-lg-6" v-reveal>
            <p class="text-muted fs-5">{{ settings?.aboutDescription }}</p>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-4" v-reveal>
            <div class="card p-4 h-100">
              <i class="bi bi-book fs-2 text-amber mb-2" />
              <h3 class="h6 font-display">Our Story</h3>
              <p class="text-muted small mb-0">{{ settings?.aboutStory }}</p>
            </div>
          </div>
          <div class="col-md-4" v-reveal>
            <div class="card p-4 h-100">
              <i class="bi bi-bullseye fs-2 text-amber mb-2" />
              <h3 class="h6 font-display">Our Mission</h3>
              <p class="text-muted small mb-0">{{ settings?.aboutMission }}</p>
            </div>
          </div>
          <div class="col-md-4" v-reveal>
            <div class="card p-4 h-100">
              <i class="bi bi-award fs-2 text-amber mb-2" />
              <h3 class="h6 font-display">Why Choose Us</h3>
              <p class="text-muted small mb-0">{{ settings?.aboutWhyChooseUs }}</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-5">
          <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg">Browse Our Motorbikes</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()
await settingsStore.load()
const settings = computed(() => settingsStore.settings)
useHead({ title: 'About Us — ' + (settings.value?.businessName || 'Angkor Wheels Rental') })
</script>

<style scoped>
.about-hero-img {
  box-shadow: 0 20px 40px rgba(51, 40, 31, 0.18);
}
</style>
