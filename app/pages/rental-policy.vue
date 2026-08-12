<template>
  <div>
    <PageHeader eyebrow="Please Read" title="Rental Policy" />

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card p-4 mb-3" v-reveal>
            <h3 class="h6 font-display mb-2"><i class="bi bi-person-check me-2 text-amber" />Eligibility</h3>
            <p class="text-muted mb-1">Minimum age: {{ settings?.minimumAge || 18 }} years old</p>
            <p class="text-muted mb-0">{{ settings?.requiredDocuments }}</p>
          </div>

          <div v-for="policy in policies" :key="policy.title" class="card p-4 mb-3" v-reveal>
            <h3 class="h6 font-display mb-2"><i class="me-2 text-amber" :class="policy.icon" />{{ policy.title }}</h3>
            <p class="text-muted mb-0">{{ policy.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()
await settingsStore.load()
const settings = computed(() => settingsStore.settings)
useHead({ title: 'Rental Policy — ' + (settings.value?.businessName || 'Angkor Wheels Rental') })

const policies = computed(() => [
  { title: 'Deposit', icon: 'bi-cash-stack', text: settings.value?.depositPolicy },
  { title: 'Fuel Policy', icon: 'bi-fuel-pump', text: settings.value?.fuelPolicy },
  { title: 'Late Return', icon: 'bi-clock-history', text: settings.value?.lateReturnPolicy },
  { title: 'Damage Policy', icon: 'bi-shield-exclamation', text: settings.value?.damagePolicy },
  { title: 'Cancellation Policy', icon: 'bi-x-circle', text: settings.value?.cancellationPolicy },
  { title: 'Accident Policy', icon: 'bi-cone-striped', text: settings.value?.accidentPolicy },
  { title: 'Traffic Violations', icon: 'bi-sign-stop', text: settings.value?.trafficViolationPolicy },
  { title: 'Helmet Policy', icon: 'bi-shield-check', text: settings.value?.helmetPolicy }
].filter((p) => p.text))
</script>
