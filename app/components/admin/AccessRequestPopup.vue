<template>
  <AdminModal v-if="isShopAdmin" v-model="show" title="Shop access request" :loading="submitting">
    <template v-if="incomingRequest">
      <p class="mb-2">
        <strong>{{ incomingRequest.requestedByName || 'A Platform Super Admin' }}</strong>
        <span v-if="incomingRequest.requestedByEmail" class="text-muted"> ({{ incomingRequest.requestedByEmail }})</span>
        is requesting access to your shop's dashboard.
      </p>
      <p class="small text-muted mb-3">Reason: {{ incomingRequest.reason }}</p>

      <div v-if="showDenyForm" class="mb-2">
        <label class="form-label small fw-600">Note (optional)</label>
        <textarea v-model="denyNote" class="form-control" rows="2" placeholder="Let them know why, if you'd like" />
      </div>
    </template>
    <template #footer>
      <template v-if="!showDenyForm">
        <button class="btn btn-outline-danger" @click="showDenyForm = true">Deny</button>
        <button class="btn btn-charcoal" @click="approve">Approve</button>
      </template>
      <template v-else>
        <button class="btn btn-outline-secondary" @click="showDenyForm = false">Back</button>
        <button class="btn btn-outline-danger" @click="deny">Confirm Deny</button>
      </template>
    </template>
  </AdminModal>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()
const isShopAdmin = computed(() => auth.user?.role === 'ADMIN' && !!auth.user?.shopId)

const { incomingRequest, clearIncoming } = useAccessRequestSocket()
const show = computed({
  get: () => !!incomingRequest.value,
  set: (v) => {
    if (!v) clearIncoming()
  }
})

const showDenyForm = ref(false)
const denyNote = ref('')
watch(incomingRequest, () => {
  showDenyForm.value = false
  denyNote.value = ''
})

const submitting = ref(false)

async function approve() {
  if (!incomingRequest.value) return
  submitting.value = true
  try {
    await useApi(`/api/admin/access-requests/${incomingRequest.value.id}/approve`, { method: 'POST' })
    toast.success('Access approved for 1 hour')
    clearIncoming()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not approve request')
  } finally {
    submitting.value = false
  }
}

async function deny() {
  if (!incomingRequest.value) return
  submitting.value = true
  try {
    await useApi(`/api/admin/access-requests/${incomingRequest.value.id}/deny`, {
      method: 'POST',
      body: { note: denyNote.value || undefined }
    })
    toast.success('Access denied')
    clearIncoming()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not deny request')
  } finally {
    submitting.value = false
  }
}

// Catch-up: pick up a request that arrived while the socket was reconnecting (or before
// this tab connected at all) — only if nothing has already arrived live via the socket.
onMounted(async () => {
  if (!isShopAdmin.value || incomingRequest.value) return
  try {
    const pending = await useApi<SocketAccessRequest[]>('/api/admin/access-requests', { query: { status: 'PENDING' } })
    if (pending.length && !incomingRequest.value) {
      incomingRequest.value = pending[pending.length - 1] ?? null
    }
  } catch {
    // non-critical — the Access Requests page and sidebar badge still surface it
  }
})
</script>
