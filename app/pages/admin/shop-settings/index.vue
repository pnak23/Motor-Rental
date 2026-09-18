<template>
  <div>
    <ul class="nav nav-tabs mb-3">
      <li v-for="t in tabs" :key="t.key" class="nav-item">
        <button class="nav-link" :class="{ active: tab === t.key }" @click="tab = t.key">{{ t.label }}</button>
      </li>
    </ul>

    <form @submit.prevent="save">
      <div v-show="tab === 'business'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Shop Info</h3>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small">Shop Name</label><input v-model="form.name" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Logo URL</label><input v-model="form.logoUrl" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Phone</label><input v-model="form.phone" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Email</label><input v-model="form.email" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">Address</label><input v-model="form.address" class="form-control" /></div>
          <div class="col-md-6">
            <label class="form-label small">Province</label>
            <select v-model="form.province" class="form-select">
              <option :value="null">— Not set —</option>
              <option v-for="p in CAMBODIA_PLATE_REGIONS" :key="p.en" :value="p.en">{{ p.en }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-show="tab === 'social'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Messaging</h3>
        <div class="row g-3">
          <div class="col-md-6"><label class="form-label small">Telegram (@username)</label><input v-model="form.telegram" class="form-control" /></div>
          <div class="col-md-6"><label class="form-label small">WhatsApp (with country code)</label><input v-model="form.whatsapp" class="form-control" /></div>
        </div>
      </div>

      <div v-show="tab === 'payments'" class="card p-3 mb-3">
        <h3 class="h6 font-display mb-3">Payment Methods</h3>
        <p class="small text-muted mb-3">
          Shown to customers booking one of your motorbikes. There's no live payment gateway connected —
          customers declare what they paid (with an optional screenshot) and you verify it against your
          own bank / KHQR dashboard before confirming a booking.
        </p>
        <div class="khqr-live-box p-3 mb-3">
          <h4 class="h6 mb-2"><i class="bi bi-qr-code me-1" />Live KHQR (recommended)</h4>
          <p class="small text-muted mb-3">
            Enter your real Bakong account and every booking for your shop automatically gets its own
            KHQR code with the exact amount already filled in — no gateway account needed, works with any
            Cambodian banking app. Leave this blank to fall back to a static QR image below.
          </p>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small">Bakong Account ID</label>
              <input v-model="form.khqrAccountId" class="form-control" placeholder="yourname@bank" />
            </div>
            <div class="col-md-4">
              <label class="form-label small">Merchant / Account Name</label>
              <input v-model="form.khqrMerchantName" class="form-control" />
            </div>
            <div class="col-md-4">
              <label class="form-label small">City</label>
              <input v-model="form.khqrMerchantCity" class="form-control" placeholder="Siem Reap" />
            </div>
          </div>
        </div>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label small">Fallback KHQR Image URL <span class="text-muted">(used only if no Bakong account above)</span></label>
            <input v-model="form.khqrImageUrl" class="form-control" placeholder="https://.../khqr.png" />
          </div>
          <div class="col-md-6">
            <label class="form-label small">KHQR Instructions</label>
            <textarea v-model="form.khqrInstructions" rows="2" class="form-control" placeholder="Scan the QR code with any Cambodian banking app" />
          </div>
          <div class="col-md-6">
            <label class="form-label small">ABA Instructions</label>
            <textarea v-model="form.abaInstructions" rows="2" class="form-control" placeholder="Transfer to ABA account 000 111 222 (NAME)" />
          </div>
          <div class="col-md-6">
            <label class="form-label small">ACLEDA Instructions</label>
            <textarea v-model="form.acledaInstructions" rows="2" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label small">Wing Instructions</label>
            <textarea v-model="form.wingInstructions" rows="2" class="form-control" />
          </div>
          <div class="col-md-6">
            <label class="form-label small">Credit / Debit Card Instructions</label>
            <textarea v-model="form.cardInstructions" rows="2" class="form-control" placeholder="We'll contact you with a secure card payment link" />
          </div>
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
          <div class="col-md-6">
            <label class="form-label small">Late Fee Per Hour ($)</label>
            <input v-model.number="form.lateFeePerHour" type="number" min="0" step="0.5" class="form-control" />
            <p class="form-text small">Charged per hour (rounded up) a motorbike is returned after its scheduled return time. Suggested automatically when marking a booking Returned — still editable on the booking.</p>
          </div>
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
      <p v-if="saved" class="text-success small mt-2 mb-0"><i class="bi bi-check-circle me-1" />Saved.</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Shop Settings' })

const toast = useToast()
const settings = await useApi<Record<string, unknown>>('/api/admin/shop-settings')

const tabs = [
  { key: 'business', label: 'Shop Info' },
  { key: 'social', label: 'Messaging' },
  { key: 'payments', label: 'Payment Methods' },
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
    await useApi('/api/admin/shop-settings', { method: 'PUT', body: form })
    saved.value = true
    toast.success('Settings saved')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save settings')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.khqr-live-box {
  border-radius: var(--radius-md);
  background: rgba(231, 160, 60, 0.08);
  border: 1px solid rgba(231, 160, 60, 0.3);
}
</style>
