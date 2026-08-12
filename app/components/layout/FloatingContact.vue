<template>
  <div class="floating-contact d-flex flex-column gap-2">
    <a v-if="whatsappLink" :href="whatsappLink" target="_blank" rel="noopener" class="fab fab--whatsapp" aria-label="Chat on WhatsApp">
      <i class="bi bi-whatsapp" />
    </a>
    <a v-if="telegramLink" :href="telegramLink" target="_blank" rel="noopener" class="fab fab--telegram" aria-label="Chat on Telegram">
      <i class="bi bi-telegram" />
    </a>
    <a v-if="settings?.phone" :href="`tel:${settings.phone}`" class="fab fab--phone" aria-label="Call us">
      <i class="bi bi-telephone-fill" />
    </a>
  </div>
</template>

<script setup lang="ts">
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const telegramLink = computed(() => {
  const t = settings.value?.telegram?.replace('@', '')
  return t ? `https://t.me/${t}` : null
})
const whatsappLink = computed(() => {
  const w = settings.value?.whatsapp?.replace(/\D/g, '')
  return w ? `https://wa.me/${w}` : null
})
</script>

<style scoped>
.floating-contact {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 1040;
}
.fab {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #fff;
  box-shadow: 0 6px 18px rgba(33, 38, 43, 0.28);
  transition: transform 0.15s ease;
}
.fab:hover {
  transform: translateY(-2px);
  color: #fff;
}
.fab--whatsapp {
  background: #25d366;
}
.fab--telegram {
  background: #229ed9;
}
.fab--phone {
  background: var(--color-charcoal);
}
</style>
