<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Access Requests</h1>
        <p class="admin-page-header__subtitle">Approve or deny a Platform Super Admin's request to access your shop's dashboard.</p>
      </div>
    </div>

    <div class="card">
      <div v-if="pending" class="text-center py-5"><span class="spinner-border" /></div>
      <div v-else-if="!requests.length" class="admin-empty-state">
        <i class="bi bi-shield-check" />
        <p>No access requests</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr><th>Requested by</th><th>Reason</th><th>Status</th><th>Requested</th><th>Responded</th><th class="text-end">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in requests" :key="r.id">
              <td>
                <p class="mb-0">{{ r.requestedByName || '—' }}</p>
                <p class="small text-muted mb-0">{{ r.requestedByEmail || '—' }}</p>
              </td>
              <td class="small">{{ r.reason }}</td>
              <td>
                <StatusBadge :status="displayStatus(r)" />
                <p v-if="r.responseNote" class="small text-muted mb-0 mt-1">{{ r.responseNote }}</p>
              </td>
              <td class="small text-muted">{{ formatDateTime(r.requestedAt) }}</td>
              <td class="small text-muted">{{ r.respondedAt ? formatDateTime(r.respondedAt) : '—' }}</td>
              <td class="text-end">
                <div v-if="displayStatus(r) === 'PENDING'" class="d-flex justify-content-end gap-1">
                  <button class="btn btn-sm btn-charcoal" @click="approve(r)"><i class="bi bi-check-lg me-1" />Approve</button>
                  <button class="btn btn-sm btn-outline-danger" @click="openDeny(r)"><i class="bi bi-x-lg me-1" />Deny</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal v-model="showDenyModal" title="Deny access request">
      <form id="deny-form" @submit.prevent="confirmDeny">
        <p class="small text-muted">Optionally tell the Super Admin why (they'll see this note).</p>
        <textarea v-model="denyNote" class="form-control" rows="2" placeholder="Reason (optional)" />
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showDenyModal = false">Cancel</button>
        <button type="submit" form="deny-form" class="btn btn-outline-danger">Deny</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth', function () {
    const auth = useAuthStore()
    if (auth.user && auth.user.role !== 'ADMIN') {
      return navigateTo('/admin')
    }
  }],
  title: 'Access Requests'
})

interface AccessRequest {
  id: string
  reason: string
  status: string
  responseNote: string | null
  requestedAt: string
  respondedAt: string | null
  expiresAt: string
  usedAt: string | null
  requestedByName: string | null
  requestedByEmail: string | null
}

const toast = useToast()
const pending = ref(true)
const requests = ref<AccessRequest[]>([])

async function fetchList() {
  pending.value = true
  requests.value = await useApi<AccessRequest[]>('/api/admin/access-requests')
  pending.value = false
}
await fetchList()

// Live refresh: a new request pushed in (or the popup on this same page resolving one)
// should update this list immediately, without needing to revisit the page.
const { incomingRequest } = useAccessRequestSocket()
watch(incomingRequest, () => fetchList())

function displayStatus(r: AccessRequest) {
  const isLive = (r.status === 'PENDING' || r.status === 'APPROVED') && !r.usedAt
  if (isLive && new Date(r.expiresAt).getTime() < Date.now()) return 'EXPIRED'
  return r.status
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function approve(r: AccessRequest) {
  try {
    await useApi(`/api/admin/access-requests/${r.id}/approve`, { method: 'POST' })
    toast.success('Access approved for 1 hour')
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not approve request')
  }
}

const showDenyModal = ref(false)
const denyTarget = ref<AccessRequest | null>(null)
const denyNote = ref('')
function openDeny(r: AccessRequest) {
  denyTarget.value = r
  denyNote.value = ''
  showDenyModal.value = true
}
async function confirmDeny() {
  if (!denyTarget.value) return
  try {
    await useApi(`/api/admin/access-requests/${denyTarget.value.id}/deny`, { method: 'POST', body: { note: denyNote.value || undefined } })
    showDenyModal.value = false
    toast.success('Access denied')
    fetchList()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not deny request')
  }
}
</script>
