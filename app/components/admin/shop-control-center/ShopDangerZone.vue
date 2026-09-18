<template>
  <div>
    <div class="card border-danger p-3 p-lg-4">
      <h3 class="h6 font-display text-danger mb-3">Danger Zone</h3>

      <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
        <div>
          <p class="fw-600 mb-0">Suspend shop</p>
          <p class="small text-muted mb-0">Hides this shop from the public site until reactivated. Requires a reason.</p>
        </div>
        <button class="btn btn-outline-danger btn-sm" :disabled="shop.status === 'SUSPENDED'" @click="showSuspendModal = true">Suspend</button>
      </div>

      <div class="d-flex justify-content-between align-items-center py-3 border-bottom">
        <div>
          <p class="fw-600 mb-0">Close shop</p>
          <p class="small text-muted mb-0">Permanently hides this shop from the public site. Type the shop name to confirm.</p>
        </div>
        <button class="btn btn-outline-danger btn-sm" :disabled="shop.status === 'CLOSED'" @click="showCloseModal = true">Close Shop</button>
      </div>

      <div class="d-flex justify-content-between align-items-center py-3">
        <div>
          <p class="fw-600 mb-0">Reactivate shop</p>
          <p class="small text-muted mb-0">Restores public visibility.</p>
        </div>
        <button class="btn btn-outline-success btn-sm" :disabled="shop.status === 'ACTIVE'" @click="setStatus('ACTIVE')">Activate</button>
      </div>
    </div>

    <div class="alert alert-secondary small mt-3 mb-0">
      <i class="bi bi-info-circle me-1" />
      Archive and permanent delete are not offered here: deleting a shop would orphan its motorbikes, bookings,
      and users. Suspend or Close cover the supported ways to take a shop offline.
    </div>

    <ConfirmActionModal
      v-model="showSuspendModal"
      title="Suspend shop"
      :message="`Suspend ${shop.name}? Its motorbikes will be hidden from the public site until reactivated.`"
      confirm-text="Suspend"
      danger
      require-reason
      @confirm="(p) => setStatus('SUSPENDED', p.reason)"
    />
    <ConfirmActionModal
      v-model="showCloseModal"
      title="Close shop"
      message="This shop will be permanently hidden from the public site."
      confirm-text="Close Shop"
      danger
      :require-text="shop.name as string"
      @confirm="() => setStatus('CLOSED')"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ shop: Record<string, unknown> & { id: string; name: string; status: string } }>()
const emit = defineEmits<{ changed: [] }>()
const toast = useToast()

const showSuspendModal = ref(false)
const showCloseModal = ref(false)

async function setStatus(status: string, reason?: string) {
  try {
    await useApi(`/api/admin/platform/shops/${props.shop.id}/status`, { method: 'PUT', body: { status, reason } })
    toast.success(`Shop set to ${status.toLowerCase()}`)
    emit('changed')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update shop status')
  }
}
</script>
