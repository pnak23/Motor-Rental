<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">FAQ</h1>
        <p class="admin-page-header__subtitle">Frequently asked questions shown to customers.</p>
      </div>
      <div class="admin-page-header__actions">
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add FAQ</button>
      </div>
    </div>

    <div class="card">
      <div v-if="!faqs.length" class="admin-empty-state">
        <i class="bi bi-question-circle" />
        <p>No FAQs yet</p>
        <p class="small mb-0">Add your first frequently asked question.</p>
      </div>
      <ul v-else class="list-group list-group-flush">
        <li v-for="faq in faqs" :key="faq.id" class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <p class="fw-600 mb-0">{{ faq.question }} <span v-if="!faq.isActive" class="badge status-badge status-badge--inactive ms-1">Hidden</span></p>
            <p class="small text-muted mb-0">{{ faq.answer }}</p>
          </div>
          <div class="btn-group btn-group-sm flex-shrink-0 ms-2">
            <button class="btn btn-outline-secondary" @click="edit(faq)"><i class="bi bi-pencil" /></button>
            <button class="btn btn-outline-danger" @click="remove(faq.id)"><i class="bi bi-trash" /></button>
          </div>
        </li>
      </ul>
    </div>

    <AdminModal v-model="showModal" :title="editingId ? 'Edit FAQ' : 'Add FAQ'">
      <form id="faq-form" @submit.prevent="save">
        <input v-model="form.question" required placeholder="Question *" class="form-control mb-2" />
        <textarea v-model="form.answer" required placeholder="Answer *" rows="4" class="form-control mb-2" />
        <input v-model.number="form.sortOrder" type="number" placeholder="Sort order" class="form-control mb-2" />
        <div class="form-check mb-1">
          <input id="faqActive" v-model="form.isActive" type="checkbox" class="form-check-input" />
          <label for="faqActive" class="form-check-label small">Active</label>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
        <button type="submit" form="faq-form" class="btn btn-amber">{{ editingId ? 'Update' : 'Add' }} FAQ</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'FAQ' })

interface Faq {
  id: string
  question: string
  answer: string
  sortOrder: number
  isActive: boolean
}

const toast = useToast()
const faqs = ref<Faq[]>(await useApi<Faq[]>('/api/admin/faqs'))
const editingId = ref<string | null>(null)
const showModal = ref(false)

function emptyForm() {
  return { question: '', answer: '', sortOrder: faqs.value.length, isActive: true }
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
function edit(faq: Faq) {
  editingId.value = faq.id
  showModal.value = true
  Object.assign(form, { question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, isActive: faq.isActive })
}

async function save() {
  try {
    if (editingId.value) {
      const updated = await useApi<Faq>(`/api/admin/faqs/${editingId.value}`, { method: 'PUT', body: form })
      faqs.value = faqs.value.map((f) => (f.id === updated.id ? updated : f))
      toast.success('FAQ updated')
    } else {
      const created = await useApi<Faq>('/api/admin/faqs', { method: 'POST', body: form })
      faqs.value.push(created)
      toast.success('FAQ added')
    }
    showModal.value = false
    resetForm()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not save FAQ')
  }
}
async function remove(id: string) {
  if (!confirm('Delete this FAQ?')) return
  await useApi(`/api/admin/faqs/${id}`, { method: 'DELETE' })
  faqs.value = faqs.value.filter((f) => f.id !== id)
  toast.success('FAQ deleted')
}
</script>
