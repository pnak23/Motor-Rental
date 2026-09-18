<template>
  <div>
    <p class="small text-muted mb-3">
      Platform-wide branding shown across the whole marketplace site. Your shop's own contact info,
      payment account, and policies are managed separately under <NuxtLink to="/admin/shop-settings">Shop Settings</NuxtLink>.
    </p>
    <ul class="nav nav-tabs mb-3">
      <li v-for="t in tabs" :key="t.key" class="nav-item">
        <button class="nav-link" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </li>
    </ul>

    <form @submit.prevent="save">
      <div v-show="tab === 'business'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Business Info</h3>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small">Business Name</label><input v-model="form.businessName" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Currency</label>
            <select v-model="form.currency" class="form-select"><option value="USD">USD</option><option value="KHR">KHR</option></select>
          </div>
          <div class="col-md-6"><label class="form-label small">Logo URL</label><input v-model="form.logoUrl" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Favicon URL</label><input v-model="form.faviconUrl" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Description</label><textarea v-model="form.description" rows="2" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Footer Text</label><textarea v-model="form.footerText" rows="2" class="form-control" /></div>
          <div class="col-12">
            <div class="form-check">
              <input id="emailNotificationsEnabled" v-model="form.emailNotificationsEnabled" type="checkbox" class="form-check-input" />
              <label class="form-check-label small" for="emailNotificationsEnabled">
                Send email notifications platform-wide (booking confirmations, status updates, and reminders to
                customers; new-booking alerts to each shop's own email address)
              </label>
            </div>
            <p class="form-text small">
              Emails only send once an SMTP server is configured (SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASSWORD environment
              variables). Until then they're logged to the server console instead.
            </p>
          </div>
        </div>
      </div>

      <div v-show="tab === 'social'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Social Media</h3>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small">Facebook URL</label><input v-model="form.facebook" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Instagram URL</label><input v-model="form.instagram" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">TikTok URL</label><input v-model="form.tiktok" class="form-control" /></div>
        </div>
      </div>

      <div v-show="tab === 'homepage'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Homepage</h3>
        <div class="row g-3">
          <div class="col-12"><label class="form-label small">Hero Title</label><input v-model="form.heroTitle" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Hero Subtitle</label><input v-model="form.heroSubtitle" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Hero Image URL</label><input v-model="form.heroImage" class="form-control" /></div>
        </div>
      </div>

      <div v-show="tab === 'about'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">About Page</h3>
        <div class="row g-3">
          <div class="col-12"><label class="form-label small">Title</label><input v-model="form.aboutTitle" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Description</label><textarea v-model="form.aboutDescription" rows="2" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Our Story</label><textarea v-model="form.aboutStory" rows="3" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Our Mission</label><textarea v-model="form.aboutMission" rows="2" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Why Choose Us</label><textarea v-model="form.aboutWhyChooseUs" rows="2" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Image URL</label><input v-model="form.aboutImage" class="form-control" /></div>
        </div>
      </div>

      <button type="submit" class="btn btn-amber" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-2" />Save Settings
      </button>
      <p v-if="saved" class="text-success small mt-2 mb-0"><i class="bi bi-check-circle me-1" />Saved — the public site now reflects these changes.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth', function () {
    const auth = useAuthStore()
    if (auth.user && (auth.user.shopId || auth.user.role !== 'SUPER_ADMIN')) {
      return navigateTo('/admin')
    }
  }],
  title: 'Platform Branding'
})

const toast = useToast()
const settings = await useApi<Record<string, unknown>>('/api/admin/settings')

const tabs = [
  { key: 'business', label: 'Business Info' },
  { key: 'social', label: 'Social Media' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'about', label: 'About' }
]
const tab = ref('business')

const form = reactive({ ...settings })
const saving = ref(false)
const saved = ref(false)

async function save() {
  saving.value = true
  saved.value = false
  try {
    await useApi('/api/admin/settings', { method: 'PUT', body: form })
    saved.value = true
    toast.success('Settings saved')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save settings')
  } finally {
    saving.value = false
  }
}
</script>
