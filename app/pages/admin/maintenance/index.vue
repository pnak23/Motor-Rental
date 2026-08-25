<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Maintenance</h1>
        <p class="admin-page-header__subtitle">Service history and scheduled maintenance for the fleet.</p>
      </div>
      <div class="admin-page-header__actions">
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Log Maintenance</button>
      </div>
    </div>

    <div class="card">
      <div v-if="!records.length" class="admin-empty-state">
        <i class="bi bi-tools" />
        <p>No maintenance records yet</p>
        <p class="small mb-0">Log your first maintenance record.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr><th>Motorbike</th><th>Type</th><th>Date</th><th>Cost</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.id">
              <td>{{ r.motorbikeName }}</td>
              <td>{{ r.type.replace('_', ' ') }}</td>
              <td class="small">{{ formatDate(r.date) }}</td>
              <td class="price-tag">${{ Number(r.cost).toFixed(2) }}</td>
              <td>
                <select :value="r.status" class="form-select form-select-sm" @change="updateStatus(r, ($event.target as HTMLSelectElement).value)">
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </td>
              <td><button class="btn btn-sm btn-outline-danger" @click="remove(r.id)"><i class="bi bi-trash" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal v-model="showModal" title="Log Maintenance">
      <form id="maintenance-form" @submit.prevent="save">
        <select v-model="form.motorbikeId" required class="form-select mb-2">
          <option value="" disabled>Select motorbike *</option>
          <option v-for="m in motorbikes" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
        <select v-model="form.type" class="form-select mb-2">
          <option value="OIL_CHANGE">Oil change</option>
          <option value="TIRE">Tire</option>
          <option value="BRAKE">Brake</option>
          <option value="ENGINE">Engine</option>
          <option value="BATTERY">Battery</option>
          <option value="GENERAL_SERVICE">General service</option>
          <option value="ACCIDENT_REPAIR">Accident repair</option>
        </select>
        <input v-model="form.date" type="date" required class="form-control mb-2" />
        <textarea v-model="form.description" placeholder="Description" rows="2" class="form-control mb-2" />
        <div class="row g-2 mb-2">
          <div class="col-6"><input v-model.number="form.mileage" type="number" placeholder="Mileage" class="form-control" /></div>
          <div class="col-6"><input v-model.number="form.cost" type="number" step="0.01" placeholder="Cost ($)" class="form-control" /></div>
        </div>
        <input v-model="form.garage" placeholder="Garage" class="form-control mb-2" />
        <select v-model="form.status" class="form-select mb-1">
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
        <button type="submit" form="maintenance-form" class="btn btn-amber">Log Record</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Maintenance' })

interface MotorbikeOption {
  id: string
  name: string
}
interface MaintenanceRecord {
  id: string
  motorbikeId: string
  motorbikeName: string
  type: string
  date: string
  cost: string
  status: string
}

const toast = useToast()

const [motorbikesRes, initialRecords] = await Promise.all([
  useApi<{ items: MotorbikeOption[] }>('/api/admin/motorbikes?pageSize=100'),
  useApi<MaintenanceRecord[]>('/api/admin/maintenance')
])
const motorbikes = ref(motorbikesRes.items)
const records = ref(initialRecords)

function emptyForm() {
  return {
    motorbikeId: '',
    type: 'OIL_CHANGE',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    mileage: null as number | null,
    cost: 0,
    garage: '',
    status: 'SCHEDULED'
  }
}
const form = reactive(emptyForm())
const showModal = ref(false)

function openCreate() {
  Object.assign(form, emptyForm())
  showModal.value = true
}

async function save() {
  try {
    const created = await useApi<MaintenanceRecord & { motorbikeName?: string }>('/api/admin/maintenance', { method: 'POST', body: form })
    const bikeName = motorbikes.value.find((m) => m.id === created.motorbikeId)?.name || ''
    records.value.unshift({ ...created, motorbikeName: bikeName })
    Object.assign(form, emptyForm())
    showModal.value = false
    toast.success('Maintenance record logged')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save record')
  }
}

async function updateStatus(r: MaintenanceRecord, status: string) {
  try {
    await useApi(`/api/admin/maintenance/${r.id}`, { method: 'PUT', body: { status } })
    r.status = status
    toast.success('Status updated')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update status')
  }
}

async function remove(id: string) {
  if (!confirm('Delete this maintenance record?')) return
  await useApi(`/api/admin/maintenance/${id}`, { method: 'DELETE' })
  records.value = records.value.filter((r) => r.id !== id)
  toast.success('Record deleted')
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
