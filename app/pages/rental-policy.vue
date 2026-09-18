<template>
  <div>
    <PageHeader :eyebrow="t('rentalPolicy.pleaseRead')" :title="t('rentalPolicy.title')" :subtitle="t('rentalPolicy.subtitle')" />

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div v-if="pending" class="d-flex flex-column gap-3">
            <div v-for="i in 2" :key="i" class="skeleton" style="height: 88px; border-radius: var(--radius-lg)" />
          </div>

          <div v-else-if="shops.length === 0" class="text-center py-5" v-reveal>
            <i class="bi bi-shop fs-1 text-gold d-block mb-2" />
            <p class="text-muted">{{ t('shops.noShops') }}</p>
          </div>

          <div v-else class="accordion policy-accordion" id="policyAccordion">
            <div v-for="(shop, i) in shops" :key="shop.id" class="accordion-item" v-reveal :class="`reveal-delay-${i % 4}`">
              <h2 class="accordion-header">
                <button
                  class="accordion-button policy-accordion__button"
                  :class="{ collapsed: i !== 0 }"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#shop-policy-${i}`"
                >
                  <span class="policy-accordion__avatar">
                    <img v-if="shop.logoUrl" :src="shop.logoUrl" :alt="shop.name" />
                    <span v-else>{{ initials(shop.name) }}</span>
                  </span>
                  <span class="flex-grow-1 text-start">
                    <span class="d-block fw-600">{{ shop.name }}</span>
                    <span v-if="shop.address" class="d-block small text-muted">{{ shop.address }}</span>
                  </span>
                </button>
              </h2>
              <div :id="`shop-policy-${i}`" class="accordion-collapse collapse" :class="{ show: i === 0 }" data-bs-parent="#policyAccordion">
                <div class="accordion-body">
                  <ShopPolicyList :shop="shop" />
                  <NuxtLink :to="`/shops/${shop.slug}`" class="btn btn-outline-charcoal btn-sm mt-2">
                    {{ t('shopInfoCard.viewShop') }}<i class="bi bi-arrow-right ms-1" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface ShopPolicy {
  id: string
  slug: string
  name: string
  logoUrl?: string | null
  address?: string | null
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

useHead({ title: 'Rental Policy — RideNow' })

const shops = ref<ShopPolicy[]>([])
const pending = ref(true)

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

try {
  shops.value = await useApi<ShopPolicy[]>('/api/public/shops')
} finally {
  pending.value = false
}
</script>

<style scoped>
.policy-accordion .accordion-item {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border-color: var(--color-border);
  margin-bottom: 1rem;
}
.policy-accordion .accordion-item:last-child {
  margin-bottom: 0;
}
.policy-accordion__button {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}
.policy-accordion__avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-white, #fff);
  border: 2px solid var(--color-white, #fff);
  box-shadow: 0 0 0 2px var(--color-gold, #d4af37);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.policy-accordion__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
