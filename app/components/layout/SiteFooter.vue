<template>
  <footer class="bg-charcoal pt-5 pb-4 mt-auto position-relative footer-site">
    <TempleSilhouette class="footer-site__silhouette" />
    <div class="container position-relative">
      <div class="row g-4">
        <div class="col-lg-4">
          <h5 class="font-display mb-3">{{ settings?.businessName || 'Angkor Wheels Rental' }}</h5>
          <p class="text-white-50 mb-3">
            {{ settings?.footerText || settings?.description || 'Reliable motorbike rental in Siem Reap, Cambodia.' }}
          </p>
          <div class="d-flex gap-3 fs-5">
            <a v-if="settings?.facebook" :href="settings.facebook" target="_blank" rel="noopener" aria-label="Facebook"><i class="bi bi-facebook" /></a>
            <a v-if="settings?.instagram" :href="settings.instagram" target="_blank" rel="noopener" aria-label="Instagram"><i class="bi bi-instagram" /></a>
            <a v-if="settings?.tiktok" :href="settings.tiktok" target="_blank" rel="noopener" aria-label="TikTok"><i class="bi bi-tiktok" /></a>
            <a v-if="settings?.telegram" :href="telegramLink" target="_blank" rel="noopener" aria-label="Telegram"><i class="bi bi-telegram" /></a>
            <a v-if="settings?.whatsapp" :href="whatsappLink" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp" /></a>
          </div>
        </div>

        <div class="col-6 col-lg-2">
          <h6 class="text-white mb-3">Quick Links</h6>
          <ul class="list-unstyled d-flex flex-column gap-2">
            <li><NuxtLink to="/motorbikes" class="text-white-50">Motorbikes</NuxtLink></li>
            <li><NuxtLink to="/about" class="text-white-50">About Us</NuxtLink></li>
            <li><NuxtLink to="/rental-policy" class="text-white-50">Rental Policy</NuxtLink></li>
            <li><NuxtLink to="/faq" class="text-white-50">FAQ</NuxtLink></li>
          </ul>
        </div>

        <div class="col-6 col-lg-3">
          <h6 class="text-white mb-3">Locations</h6>
          <ul class="list-unstyled d-flex flex-column gap-2">
            <li><NuxtLink to="/locations" class="text-white-50">All rental locations</NuxtLink></li>
            <li><NuxtLink to="/contact" class="text-white-50">Contact us</NuxtLink></li>
          </ul>
        </div>

        <div class="col-lg-3">
          <h6 class="text-white mb-3">Contact</h6>
          <ul class="list-unstyled d-flex flex-column gap-2 text-white-50">
            <li v-if="settings?.phone"><i class="bi bi-telephone me-2" />{{ settings.phone }}</li>
            <li v-if="settings?.email"><i class="bi bi-envelope me-2" />{{ settings.email }}</li>
            <li v-if="settings?.address"><i class="bi bi-geo-alt me-2" />{{ settings.address }}</li>
          </ul>
        </div>
      </div>

      <div class="khmer-divider text-gold my-4">
        <span class="khmer-divider__mark" />
      </div>
      <p class="text-white-50 small mb-0 text-center">
        &copy; {{ new Date().getFullYear() }} {{ settings?.businessName || 'Angkor Wheels Rental' }}. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const telegramLink = computed(() => {
  const t = settings.value?.telegram?.replace('@', '')
  return t ? `https://t.me/${t}` : '#'
})
const whatsappLink = computed(() => {
  const w = settings.value?.whatsapp?.replace(/\D/g, '')
  return w ? `https://wa.me/${w}` : '#'
})
</script>

<style scoped>
.footer-site__silhouette {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 46px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.05;
}
</style>
