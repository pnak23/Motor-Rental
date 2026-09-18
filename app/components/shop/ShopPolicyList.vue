<template>
  <div v-if="layout === 'grid'" class="row g-3">
    <div v-for="item in items" :key="item.title" class="col-sm-6 col-lg-4">
      <div class="policy-tile h-100 p-3">
        <span class="policy-item__icon mb-2"><i class="bi" :class="item.icon" /></span>
        <h3 class="small fw-600 mb-1">{{ item.title }}</h3>
        <p class="text-muted small mb-0">{{ item.text }}</p>
      </div>
    </div>
  </div>

  <div v-else>
    <div v-for="item in items" :key="item.title" class="policy-item">
      <span class="policy-item__icon"><i class="bi" :class="item.icon" /></span>
      <div>
        <h3 class="small fw-600 mb-1">{{ item.title }}</h3>
        <p class="text-muted small mb-0">{{ item.text }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  shop: {
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
  }
  layout?: 'list' | 'grid'
}>()

const items = computed(() =>
  [
    { title: t('rentalPolicy.eligibility'), icon: 'bi-person-check', text: t('rentalPolicy.minimumAge', { age: props.shop.minimumAge || 18 }) },
    { title: t('rentalPolicy.requiredDocuments'), icon: 'bi-file-earmark-text', text: props.shop.requiredDocuments },
    { title: t('rentalPolicy.deposit'), icon: 'bi-cash-stack', text: props.shop.depositPolicy },
    { title: t('rentalPolicy.fuelPolicy'), icon: 'bi-fuel-pump', text: props.shop.fuelPolicy },
    { title: t('rentalPolicy.lateReturn'), icon: 'bi-clock-history', text: props.shop.lateReturnPolicy },
    { title: t('rentalPolicy.damagePolicy'), icon: 'bi-shield-exclamation', text: props.shop.damagePolicy },
    { title: t('rentalPolicy.cancellationPolicy'), icon: 'bi-x-circle', text: props.shop.cancellationPolicy },
    { title: t('rentalPolicy.accidentPolicy'), icon: 'bi-cone-striped', text: props.shop.accidentPolicy },
    { title: t('rentalPolicy.trafficViolations'), icon: 'bi-sign-stop', text: props.shop.trafficViolationPolicy },
    { title: t('rentalPolicy.helmetPolicy'), icon: 'bi-shield-check', text: props.shop.helmetPolicy }
  ].filter((p) => p.text)
)
</script>

<style scoped>
.policy-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}
.policy-item:last-child {
  margin-bottom: 0;
}
.policy-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.14);
  color: var(--color-amber-deep, var(--color-gold-deep));
  font-size: 0.95rem;
}
.policy-tile {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-white, #fff);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.policy-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(38, 58, 46, 0.08);
}
.policy-tile .policy-item__icon {
  margin-bottom: 0.5rem;
}
</style>
