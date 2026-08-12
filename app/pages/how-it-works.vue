<template>
  <div>
    <PageHeader eyebrow="Simple &amp; Fast" title="How It Works" subtitle="From browsing to riding, here's what to expect." />

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div v-for="(step, i) in steps" :key="step.title" class="step-row d-flex gap-4" v-reveal>
            <div class="step-marker d-flex flex-column align-items-center">
              <span class="step-number">{{ i + 1 }}</span>
              <span v-if="i < steps.length - 1" class="step-line" />
            </div>
            <div class="pb-5">
              <h3 class="h6 font-display mb-1">{{ step.title }}</h3>
              <p class="text-muted mb-0">{{ step.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-3">
        <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg">Start Browsing</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'How It Works — Motorbike Rental Siem Reap' })

const steps = [
  { title: 'Browse motorbikes', text: 'Explore our fleet of scooters and manual bikes, filtered by category, price, or transmission.' },
  { title: 'Pick your dates', text: 'Choose your pickup and return dates directly on the motorbike page — we check availability instantly.' },
  { title: 'Enter your details', text: 'Fill in your name, phone, and a few quick details so we can confirm your rental.' },
  { title: 'Get instant confirmation', text: 'You\u2019ll receive a booking number right away, plus direct Telegram/WhatsApp/phone contact for any questions.' },
  { title: 'We review & confirm', text: 'Our team reviews your request and confirms it, usually within minutes during business hours.' },
  { title: 'Pick up & ride', text: 'Collect your motorbike (or have it delivered to your hotel) and start exploring Siem Reap.' },
  { title: 'Return & done', text: 'Return the motorbike at the end of your rental — your deposit is refunded on the spot.' }
]
</script>

<style scoped>
.step-marker {
  width: 40px;
}
.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-charcoal);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 600;
  flex-shrink: 0;
}
.step-line {
  flex-grow: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 0.4rem;
}
</style>
