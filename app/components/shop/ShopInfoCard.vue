<template>
  <div class="card shop-info-card p-3 p-md-4">
    <p class="eyebrow mb-3">{{ t('shopInfoCard.aboutThisShop') }}</p>

    <div class="d-flex align-items-center gap-3 mb-3">
      <NuxtLink :to="`/shops/${shop.shopSlug}`" class="shop-info-card__avatar flex-shrink-0">
        <img v-if="shop.shopLogoUrl" :src="shop.shopLogoUrl" :alt="shop.shopName || ''" />
        <span v-else>{{ initials }}</span>
      </NuxtLink>
      <div class="flex-grow-1 min-w-0">
        <NuxtLink :to="`/shops/${shop.shopSlug}`" class="shop-info-card__name text-decoration-none d-block">{{ shop.shopName }}</NuxtLink>
        <span v-if="shop.shopProvince" class="shop-info-card__province mb-1"><i class="bi bi-geo-alt-fill me-1" />{{ shop.shopProvince }}</span>
        <p v-if="shop.shopMotorbikeCount != null" class="small text-muted mb-0">
          <i class="bi bi-motorcycle me-1" />{{ t('shopInfoCard.motorbikesAvailable', { count: shop.shopMotorbikeCount }) }}
        </p>
      </div>
    </div>

    <p v-if="shop.shopAddress" class="small text-muted mb-1 d-flex align-items-start gap-2">
      <i class="bi bi-geo-alt text-gold mt-1" />{{ shop.shopAddress }}
    </p>
    <p v-if="shop.shopPhone" class="small text-muted mb-3 d-flex align-items-center gap-2">
      <i class="bi bi-telephone text-gold" />{{ shop.shopPhone }}
    </p>

    <div v-if="shop.shopTelegram || shop.shopWhatsapp" class="d-flex gap-2 mb-3">
      <a v-if="shop.shopTelegram" :href="shop.shopTelegram" target="_blank" rel="noopener" class="shop-info-card__contact">
        <i class="bi bi-telegram" />Telegram
      </a>
      <a v-if="shop.shopWhatsapp" :href="shop.shopWhatsapp" target="_blank" rel="noopener" class="shop-info-card__contact">
        <i class="bi bi-whatsapp" />WhatsApp
      </a>
    </div>

    <div v-if="mapEmbedUrl" class="shop-info-card__map">
      <iframe :src="mapEmbedUrl" width="100%" height="140" style="border: 0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" :title="`${shop.shopName} location`" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  shop: {
    shopSlug?: string | null
    shopName?: string | null
    shopAddress?: string | null
    shopProvince?: string | null
    shopPhone?: string | null
    shopLogoUrl?: string | null
    shopTelegram?: string | null
    shopWhatsapp?: string | null
    shopMotorbikeCount?: number | null
  }
}>()

const initials = computed(() =>
  (props.shop.shopName || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)

const mapEmbedUrl = computed(() => {
  if (!props.shop.shopAddress) return ''
  return `https://maps.google.com/maps?q=${encodeURIComponent(props.shop.shopAddress)}&z=15&output=embed`
})
</script>

<style scoped>
.shop-info-card {
  border-radius: var(--radius-lg);
}
.min-w-0 {
  min-width: 0;
}
.shop-info-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-white, #fff);
  border: 2px solid var(--color-white, #fff);
  box-shadow: 0 0 0 2px var(--color-gold, #d4af37);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 600;
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.shop-info-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shop-info-card__name {
  font-weight: 600;
  color: var(--color-charcoal);
  font-size: 1.05rem;
  transition: color 0.2s ease;
}
.shop-info-card__name:hover {
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.shop-info-card__province {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  margin: 0.2rem 0;
  border-radius: 999px;
  background: var(--color-gray-light);
  color: var(--color-forest, var(--color-charcoal));
}
.shop-info-card__contact {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: var(--color-gray-light);
  color: var(--color-charcoal);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}
.shop-info-card__contact:hover {
  background: rgba(212, 175, 55, 0.18);
  color: var(--color-amber-deep, var(--color-gold-deep));
}
.shop-info-card__map {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.shop-info-card__map iframe {
  display: block;
}
</style>
