<template>
  <div class="row g-4">
    <div class="col-lg-5">
      <div class="card p-3">
        <h3 class="h6 font-display mb-3">{{ editingId ? 'Edit Banner' : 'Add Banner' }}</h3>
        <form @submit.prevent="save">
          <input v-model="form.title" required placeholder="Title *" class="form-control mb-2" />
          <input v-model="form.subtitle" placeholder="Subtitle" class="form-control mb-2" />
          <input v-model="form.imageUrl" required placeholder="Image URL *" class="form-control mb-2" />
          <input v-model="form.buttonText" placeholder="Button text" class="form-control mb-2" />
          <input v-model="form.buttonUrl" placeholder="Button URL (e.g. /motorbikes)" class="form-control mb-2" />
          <div class="row g-2 mb-2">
            <div class="col-6"><input v-model="form.startDate" type="date" class="form-control" /></div>
            <div class="col-6"><input v-model="form.endDate" type="date" class="form-control" /></div>
          </div>
          <input v-model.number="form.sortOrder" type="number" placeholder="Sort order" class="form-control mb-2" />
          <div class="form-check mb-3">
            <input id="bannerActive" v-model="form.isActive" type="checkbox" class="form-check-input" />
            <label for="bannerActive" class="form-check-label small">Active</label>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-amber">{{ editingId ? 'Update' : 'Add' }} Banner</button>
            <button v-if="editingId" type="button" class="btn btn-outline-secondary" @click="resetForm">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div class="col-lg-7">
      <div class="row g-3">
        <div v-for="b in banners" :key="b.id" class="col-md-6">
          <div class="card overflow-hidden h-100">
            <img :src="b.imageUrl" class="banner-thumb" :alt="b.title" />
            <div class="p-3">
              <p class="fw-600 mb-0">{{ b.title }} <span v-if="!b.isActive" class="badge status-badge status-badge--inactive ms-1">Inactive</span></p>
              <p class="small text-muted mb-2">{{ b.subtitle }}</p>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" @click="edit(b)"><i class="bi bi-pencil" /></button>
                <button class="btn btn-outline-danger" @click="remove(b.id)"><i class="bi bi-trash" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Banners' })

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  buttonText: string | null
  buttonUrl: string | null
  startDate: string | null
  endDate: string | null
  sortOrder: number
  isActive: boolean
}

const toast = useToast()
const banners = ref<Banner[]>(await useApi<Banner[]>('/api/admin/banners'))
const editingId = ref<string | null>(null)

function emptyForm() {
  return {
    title: '',
    subtitle: '',
    imageUrl: '',
    buttonText: '',
    buttonUrl: '',
    startDate: '',
    endDate: '',
    sortOrder: banners.value.length,
    isActive: true
  }
}
const form = reactive(emptyForm())

function resetForm() {
  Object.assign(form, emptyForm())
  editingId.value = null
}
function edit(b: Banner) {
  editingId.value = b.id
  Object.assign(form, {
    title: b.title,
    subtitle: b.subtitle || '',
    imageUrl: b.imageUrl,
    buttonText: b.buttonText || '',
    buttonUrl: b.buttonUrl || '',
    startDate: b.startDate ? b.startDate.slice(0, 10) : '',
    endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    sortOrder: b.sortOrder,
    isActive: b.isActive
  })
}

async function save() {
  try {
    if (editingId.value) {
      const updated = await useApi<Banner>(`/api/admin/banners/${editingId.value}`, { method: 'PUT', body: form })
      banners.value = banners.value.map((b) => (b.id === updated.id ? updated : b))
      toast.success('Banner updated')
    } else {
      const created = await useApi<Banner>('/api/admin/banners', { method: 'POST', body: form })
      banners.value.push(created)
      toast.success('Banner added')
    }
    resetForm()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save banner')
  }
}
async function remove(id: string) {
  if (!confirm('Delete this banner?')) return
  await useApi(`/api/admin/banners/${id}`, { method: 'DELETE' })
  banners.value = banners.value.filter((b) => b.id !== id)
  toast.success('Banner deleted')
}
</script>

<style scoped>
.banner-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
}
</style>
