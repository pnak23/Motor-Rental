<template>
  <NuxtLink :to="`/shops/${shop.slug}`" class="shop-card h-100 text-decoration-none d-block">
    <div class="shop-card__cover">
      <div class="shop-card__glow" />
      <TempleSilhouette class="shop-card__silhouette" />
    </div>
    <div class="shop-card__avatar">
      <img v-if="shop.logoUrl" :src="shop.logoUrl" :alt="shop.name" />
      <span v-else>{{ initials }}</span>
    </div>
    <div class="shop-card__body">
      <h3 class="h5 font-display mb-1 text-center">{{ shop.name }}</h3>
      <p v-if="shop.province" class="text-center mb-2">
        <span class="shop-card__province"><span class="shop-card__pin"><i class="bi bi-geo-alt-fill" /></span>{{ shop.province }}</span>
      </p>
      <p v-if="shop.address" class="small text-muted text-center mb-1 shop-card__line">
        <i class="bi bi-geo-alt text-gold" />{{ shop.address }}
      </p>
      <p v-if="shop.phone" class="small text-muted text-center mb-0 shop-card__line">
        <i class="bi bi-telephone text-gold" />{{ shop.phone }}
      </p>

      <div class="shop-card__footer mt-auto">
        <span class="shop-card__badge"><i class="bi bi-motorcycle me-1" />{{ t('shops.motorbikesAvailable', { count: shop.motorbikeCount }) }}</span>
        <span class="shop-card__cta">{{ t('shops.viewMotorbikes') }}<i class="bi bi-arrow-right ms-1" /></span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  shop: {
    id: string
    slug: string
    name: string
    logoUrl?: string | null
    address?: string | null
    province?: string | null
    phone?: string | null
    email?: string | null
    motorbikeCount: number
  }
}>()

const initials = computed(() =>
  props.shop.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
</script>

<style scoped>
.shop-card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--color-white, #fff);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}
.shop-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 36px rgba(38, 58, 46, 0.14);
  border-color: var(--color-gold, #d4af37);
}
.shop-card__cover {
  position: relative;
  flex-shrink: 0;
  height: 84px;
  background: linear-gradient(135deg, var(--color-forest, #263a2e), var(--color-jungle, #405a3d));
  overflow: hidden;
}
.shop-card__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 80% at 30% 0%, rgba(212, 175, 55, 0.32), transparent 70%);
}
.shop-card__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 32px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.1;
}
.shop-card__avatar {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  margin: -36px auto 0;
  border-radius: 50%;
  background: var(--color-white, #fff);
  border: 3px solid var(--color-white, #fff);
  box-shadow: 0 0 0 2px var(--color-gold, #d4af37);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--font-display, inherit);
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.shop-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shop-card__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1.25rem 1.25rem;
}
.shop-card__line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.shop-card__footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-border);
}
.shop-card__badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.14);
  color: var(--color-amber-deep, var(--color-gold-deep));
  white-space: nowrap;
}
.shop-card__province {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--color-gray-light);
  color: var(--color-forest, var(--color-charcoal));
}
.shop-card__pin {
  position: relative;
  display: inline-flex;
  margin-right: 0.3rem;
}
.shop-card__pin::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--color-gold, #d4af37);
  opacity: 0;
}
.shop-card:hover .shop-card__pin::before {
  animation: shopPinPulse 1.3s ease-out 2;
}
@keyframes shopPinPulse {
  0% {
    transform: scale(0.5);
    opacity: 0.45;
  }
  100% {
    transform: scale(1.9);
    opacity: 0;
  }
}
.shop-card__cta {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-forest, var(--color-charcoal));
  white-space: nowrap;
  transition: color 0.2s ease;
}
.shop-card:hover .shop-card__cta {
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.shop-card:hover .shop-card__cta i {
  transform: translateX(3px);
}
.shop-card__cta i {
  display: inline-block;
  transition: transform 0.2s ease;
}
</style>
