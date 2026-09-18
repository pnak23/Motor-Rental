<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Banners</h1>
        <p class="admin-page-header__subtitle">Promotional banners shown on the public homepage.</p>
      </div>
      <div class="admin-page-header__actions">
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add Banner</button>
      </div>
    </div>

    <div v-if="!banners.length" class="card admin-empty-state">
      <i class="bi bi-images" />
      <p>No banners yet</p>
      <p class="small mb-0">Add a promotional banner for the homepage.</p>
    </div>
    <div v-else class="row g-3">
      <div v-for="b in banners" :key="b.id" class="col-md-6 col-xl-4">
        <div class="card card-hover overflow-hidden h-100">
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

    <AdminModal v-model="showModal" :title="editingId ? 'Edit Banner' : 'Add Banner'">
      <form id="banner-form" @submit.prevent="save">
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
        <div class="form-check mb-1">
          <input id="bannerActive" v-model="form.isActive" type="checkbox" class="form-check-input" />
          <label for="bannerActive" class="form-check-label small">Active</label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
        <button type="submit" form="banner-form" class="btn btn-amber">{{ editingId ? 'Update' : 'Add' }} Banner</button>
      </template>
    </AdminModal>
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
  title: 'Banners'
})

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
const showModal = ref(false)

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
function openCreate() {
  resetForm()
  showModal.value = true
}
function edit(b: Banner) {
  editingId.value = b.id
  showModal.value = true
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
    showModal.value = false
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
