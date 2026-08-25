<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Locations</h1>
        <p class="admin-page-header__subtitle">Pickup &amp; drop-off points shown to customers.</p>
      </div>
      <div class="admin-page-header__actions">
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add Location</button>
      </div>
    </div>

    <div class="card">
      <div v-if="!locations.length" class="admin-empty-state">
        <i class="bi bi-geo-alt" />
        <p>No locations yet</p>
        <p class="small mb-0">Add your first pickup or drop-off location.</p>
      </div>
      <ul v-else class="list-group list-group-flush">
        <li v-for="loc in locations" :key="loc.id" class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <p class="fw-600 mb-0">{{ loc.name }} <span v-if="!loc.isActive" class="badge status-badge status-badge--inactive ms-1">Inactive</span></p>
            <p class="small text-muted mb-0">{{ loc.address }}</p>
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" @click="edit(loc)"><i class="bi bi-pencil" /></button>
            <button class="btn btn-outline-danger" @click="remove(loc.id)"><i class="bi bi-trash" /></button>
          </div>
        </li>
      </ul>
    </div>

    <AdminModal v-model="showModal" :title="editingId ? 'Edit Location' : 'Add Location'">
      <form id="location-form" @submit.prevent="save">
        <input v-model="form.name" required placeholder="Name *" class="form-control mb-2" />
        <input v-model="form.address" required placeholder="Address *" class="form-control mb-2" />
        <textarea v-model="form.description" placeholder="Description" rows="2" class="form-control mb-2" />
        <input v-model="form.googleMapsUrl" placeholder="Google Maps URL" class="form-control mb-2" />
        <div class="row g-2 mb-2">
          <div class="col-6"><input v-model.number="form.latitude" type="number" step="0.0001" placeholder="Latitude" class="form-control" /></div>
          <div class="col-6"><input v-model.number="form.longitude" type="number" step="0.0001" placeholder="Longitude" class="form-control" /></div>
        </div>
        <input v-model="form.phone" placeholder="Phone" class="form-control mb-2" />
        <div class="row g-2 mb-2">
          <div class="col-6"><input v-model="form.openingTime" placeholder="Opening (07:00)" class="form-control" /></div>
          <div class="col-6"><input v-model="form.closingTime" placeholder="Closing (20:00)" class="form-control" /></div>
        </div>
        <div class="form-check mb-1">
          <input id="locActive" v-model="form.isActive" type="checkbox" class="form-check-input" />
          <label for="locActive" class="form-check-label small">Active</label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
        <button type="submit" form="location-form" class="btn btn-amber">{{ editingId ? 'Update' : 'Add' }} Location</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Locations' })

interface Location {
  id: string
  name: string
  address: string
  description: string | null
  googleMapsUrl: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  openingTime: string | null
  closingTime: string | null
  isActive: boolean
}

const toast = useToast()
const locations = ref<Location[]>(await useApi<Location[]>('/api/admin/locations'))
const editingId = ref<string | null>(null)
const showModal = ref(false)

function emptyForm() {
  return {
    name: '',
    address: '',
    description: '',
    googleMapsUrl: '',
    latitude: null as number | null,
    longitude: null as number | null,
    phone: '',
    openingTime: '',
    closingTime: '',
    isActive: true
  }
}
const form = reactive(emptyForm())

function resetForm() {
  Object.assign(form, emptyForm())
  editingId.value = null
}

function openCreate() {
  resetForm()
  showModal.value = true
}

function edit(loc: Location) {
  editingId.value = loc.id
  showModal.value = true
  Object.assign(form, {
    name: loc.name,
    address: loc.address,
    description: loc.description || '',
    googleMapsUrl: loc.googleMapsUrl || '',
    latitude: loc.latitude,
    longitude: loc.longitude,
    phone: loc.phone || '',
    openingTime: loc.openingTime || '',
    closingTime: loc.closingTime || '',
    isActive: loc.isActive
  })
}

async function save() {
  try {
    if (editingId.value) {
      const updated = await useApi<Location>(`/api/admin/locations/${editingId.value}`, { method: 'PUT', body: form })
      locations.value = locations.value.map((l) => (l.id === updated.id ? updated : l))
      toast.success('Location updated')
    } else {
      const created = await useApi<Location>('/api/admin/locations', { method: 'POST', body: form })
      locations.value.push(created)
      toast.success('Location added')
    }
    showModal.value = false
    resetForm()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save location')
  }
}

async function remove(id: string) {
  if (!confirm('Delete this location?')) return
  await useApi(`/api/admin/locations/${id}`, { method: 'DELETE' })
  locations.value = locations.value.filter((l) => l.id !== id)
  toast.success('Location deleted')
}
</script>
