<template>
  <div>
    <PageHeader :eyebrow="t('contact.getInTouch')" :title="`${t('contact.titlePrefix')} ${settings?.businessName || t('contact.titleFallback')}`" />

    <div class="container py-5">
    <div class="row g-5">
      <div class="col-lg-5" v-reveal>
        <div class="card p-4 mb-3">
          <h3 class="h6 font-display mb-3">{{ t('contact.reachUsDirectly') }}</h3>
          <ul class="list-unstyled d-flex flex-column gap-3 mb-0">
            <li v-if="settings?.phone" class="d-flex align-items-center gap-3">
              <span class="contact-icon"><i class="bi bi-telephone" /></span>
              <a :href="`tel:${settings.phone}`" class="text-decoration-none">{{ settings.phone }}</a>
            </li>
            <li v-if="settings?.email" class="d-flex align-items-center gap-3">
              <span class="contact-icon"><i class="bi bi-envelope" /></span>
              <a :href="`mailto:${settings.email}`" class="text-decoration-none">{{ settings.email }}</a>
            </li>
            <li v-if="settings?.address" class="d-flex align-items-center gap-3">
              <span class="contact-icon"><i class="bi bi-geo-alt" /></span>
              <span>{{ settings.address }}</span>
            </li>
            <li v-if="telegramLink" class="d-flex align-items-center gap-3">
              <span class="contact-icon"><i class="bi bi-telegram" /></span>
              <a :href="telegramLink" target="_blank" rel="noopener" class="text-decoration-none">{{ t('contact.chatOnTelegram') }}</a>
            </li>
            <li v-if="whatsappLink" class="d-flex align-items-center gap-3">
              <span class="contact-icon"><i class="bi bi-whatsapp" /></span>
              <a :href="whatsappLink" target="_blank" rel="noopener" class="text-decoration-none">{{ t('contact.chatOnWhatsapp') }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-lg-7" v-reveal>
        <div class="card p-4">
          <h3 class="h6 font-display mb-3">{{ t('contact.sendUsMessage') }}</h3>
          <form @submit.prevent="submit">
            <div class="row g-2">
              <div class="col-md-6"><input v-model="form.name" required class="form-control mb-2" :placeholder="t('contact.namePlaceholder')" /></div>
              <div class="col-md-6"><input v-model="form.email" required type="email" class="form-control mb-2" :placeholder="t('contact.emailPlaceholder')" /></div>
              <div class="col-12"><input v-model="form.phone" class="form-control mb-2" :placeholder="t('contact.phonePlaceholder')" /></div>
              <div class="col-12"><textarea v-model="form.message" required rows="4" class="form-control mb-2" :placeholder="t('contact.messagePlaceholder')" /></div>
            </div>
            <button type="submit" class="btn btn-amber" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" />{{ t('contact.sendMessage') }}
            </button>
            <p v-if="sent" class="text-success small mt-2 mb-0"><i class="bi bi-check-circle me-1" />{{ t('contact.messageSent') }}</p>
            <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const settingsStore = useSettingsStore()
await settingsStore.load()
const settings = computed(() => settingsStore.settings)
useHead({ title: 'Contact Us — ' + (settings.value?.businessName || 'Angkor Wheels Rental') })

const telegramLink = computed(() => {
  const t = settings.value?.telegram?.replace('@', '')
  return t ? `https://t.me/${t}` : null
})
const whatsappLink = computed(() => {
  const w = settings.value?.whatsapp?.replace(/\D/g, '')
  return w ? `https://wa.me/${w}` : null
})

const form = reactive({ name: '', email: '', phone: '', message: '' })
const submitting = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    await useApi('/api/public/contact', { method: 'POST', body: form })
    sent.value = true
    form.name = ''
    form.email = ''
    form.phone = ''
    form.message = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('contact.errorDefault')
  } finally {
    submitting.value = false
  }
}
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
