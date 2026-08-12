<template>
  <div>
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
          <div class="col-md-6"><label class="form-label small">Phone</label><input v-model="form.phone" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Email</label><input v-model="form.email" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Address</label><input v-model="form.address" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Description</label><textarea v-model="form.description" rows="2" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Footer Text</label><textarea v-model="form.footerText" rows="2" class="form-control" /></div>
        </div>
      </div>

      <div v-show="tab === 'social'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Social Media &amp; Messaging</h3>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small">Telegram (@username)</label><input v-model="form.telegram" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">WhatsApp (with country code)</label><input v-model="form.whatsapp" class="form-control" /></div>
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

      <div v-show="tab === 'policy'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Rental Policy</h3>
        <div class="row g-3">
          <div class="col-md-4"><label class="form-label small">Minimum Age</label><input v-model.number="form.minimumAge" type="number" class="form-control" /></div>
          <div class="col-md-4"><label class="form-label small">Min Rental Days</label><input v-model.number="form.minRentalDays" type="number" class="form-control" /></div>
          <div class="col-md-4"><label class="form-label small">Max Rental Days</label><input v-model.number="form.maxRentalDays" type="number" class="form-control" /></div>
          <div class="col-12"><label class="form-label small">Required Documents</label><textarea v-model="form.requiredDocuments" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Deposit Policy</label><textarea v-model="form.depositPolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Fuel Policy</label><textarea v-model="form.fuelPolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Late Return Policy</label><textarea v-model="form.lateReturnPolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Damage Policy</label><textarea v-model="form.damagePolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Cancellation Policy</label><textarea v-model="form.cancellationPolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Accident Policy</label><textarea v-model="form.accidentPolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Traffic Violation Policy</label><textarea v-model="form.trafficViolationPolicy" rows="2" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Helmet Policy</label><textarea v-model="form.helmetPolicy" rows="2" class="form-control" /></div>
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
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Content & Policies' })

const toast = useToast()
const settings = await useApi<Record<string, unknown>>('/api/admin/settings')

const tabs = [
  { key: 'business', label: 'Business Info' },
  { key: 'social', label: 'Social Media' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'about', label: 'About' },
  { key: 'policy', label: 'Rental Policy' }
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
