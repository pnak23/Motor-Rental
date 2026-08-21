<template>
  <div>
    <div class="card p-3 mb-3">
      <h3 class="h6 font-display mb-3">Basic Information</h3>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label small">Name *</label>
          <input v-model="form.name" required class="form-control" placeholder="Honda Click" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">Category</label>
          <select v-model="form.categoryId" class="form-select">
            <option :value="null">None</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small">Brand *</label>
          <input v-model="form.brand" required class="form-control" placeholder="Honda" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Model *</label>
          <input v-model="form.model" required class="form-control" placeholder="Click 125i" />
        </div>
        <div class="col-md-4">
          <label class="form-label small">Year</label>
          <input v-model.number="form.year" type="number" class="form-control" placeholder="2024" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Engine CC *</label>
          <input v-model.number="form.engineCc" type="number" required class="form-control" placeholder="125" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Transmission</label>
          <select v-model="form.transmission" class="form-select">
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
            <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Fuel Type</label>
          <select v-model="form.fuelType" class="form-select">
            <option value="GASOLINE">Gasoline</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Plate Number</label>
          <input v-model="form.plateNumber" class="form-control" placeholder="1A-2345" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Color</label>
          <input v-model="form.color" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Key Type</label>
          <select v-model="form.keyType" class="form-select">
            <option value="NORMAL_KEY">Normal Key</option>
            <option value="SMART_KEY">Smart Key</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small">Seat Capacity</label>
          <input v-model.number="form.seatCapacity" type="number" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Fuel Consumption</label>
          <input v-model="form.fuelConsumption" class="form-control" placeholder="~2L/100km" />
        </div>
        <div class="col-12">
          <label class="form-label small">Description</label>
          <textarea v-model="form.description" rows="3" class="form-control" />
        </div>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <h3 class="h6 font-display mb-3">Rental Information</h3>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label small">Daily Price ($) *</label>
          <input v-model.number="form.dailyPrice" type="number" step="0.01" required class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Weekly Price ($)</label>
          <input v-model.number="form.weeklyPrice" type="number" step="0.01" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Monthly Price ($)</label>
          <input v-model.number="form.monthlyPrice" type="number" step="0.01" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Deposit ($)</label>
          <input v-model.number="form.deposit" type="number" step="0.01" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Delivery Fee ($)</label>
          <input v-model.number="form.deliveryFee" type="number" step="0.01" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Min Rental Days</label>
          <input v-model.number="form.minRentalDays" type="number" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label small">Max Rental Days</label>
          <input v-model.number="form.maxRentalDays" type="number" class="form-control" />
        </div>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <h3 class="h6 font-display mb-3">Features</h3>
      <div class="row g-2">
        <div class="col-6 col-md-3" v-for="f in featureFlags" :key="f.key">
          <div class="form-check">
            <input :id="f.key" v-model="(form as any)[f.key]" class="form-check-input" type="checkbox" />
            <label class="form-check-label small" :for="f.key">{{ f.label }}</label>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <h3 class="h6 font-display mb-3">Status</h3>
      <select v-model="form.status" class="form-select" style="max-width: 240px">
        <option value="AVAILABLE">Available</option>
        <option value="RENTED">Rented</option>
        <option value="MAINTENANCE">Maintenance</option>
        <option value="INACTIVE">Inactive</option>
      </select>
    </div>

    <div class="card p-3 mb-3">
      <h3 class="h6 font-display mb-3">SEO</h3>
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label small">SEO Title</label>
          <input v-model="form.seoTitle" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label small">SEO Keywords</label>
          <input v-model="form.seoKeywords" class="form-control" />
        </div>
        <div class="col-12">
          <label class="form-label small">SEO Description</label>
          <textarea v-model="form.seoDescription" rows="2" class="form-control" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string
  name: string
}
defineProps<{ categories: Category[] }>()
const form = defineModel<Record<string, unknown>>({ required: true })

const featureFlags = [
  { key: 'helmetIncluded', label: 'Helmet included' },
  { key: 'phoneHolder', label: 'Phone holder' },
  { key: 'usbCharger', label: 'USB charger' },
  { key: 'goodForCity', label: 'Good for city' },
  { key: 'goodForLongTrip', label: 'Good for long trip' },
  { key: 'isNewBike', label: 'New motorbike' },
  { key: 'popular', label: 'Popular' },
  { key: 'featured', label: 'Featured' }
]
</script>
