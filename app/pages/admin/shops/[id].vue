<template>
  <div>
    <NuxtLink to="/admin/platform/shops" class="small text-muted d-inline-flex align-items-center mb-2 text-decoration-none">
      <i class="bi bi-arrow-left me-1" />Back to Shops
    </NuxtLink>

    <div class="admin-page-header flex-wrap">
      <div>
        <h1 class="h4 font-display mb-1 d-flex align-items-center gap-2">
          {{ shop.name }}
          <StatusBadge :status="shop.status" />
        </h1>
        <p class="admin-page-header__subtitle mb-0">
          {{ shop.slug }} &middot; Created {{ formatDate(shop.createdAt) }} &middot;
          Last activity {{ shop.lastActivity ? formatDate(shop.lastActivity) : 'never' }}
        </p>
      </div>
      <div class="admin-page-header__actions d-flex gap-2">
        <a :href="`/motorbikes?shop=${shop.slug}`" target="_blank" rel="noopener" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-box-arrow-up-right me-1" />View Public Website
        </a>
        <template v-if="!accessRequest || ['DENIED', 'EXPIRED', 'USED'].includes(accessRequest.status)">
          <button class="btn btn-charcoal btn-sm" @click="showRequestModal = true">
            <i class="bi bi-incognito me-1" />Request Access
          </button>
        </template>
        <template v-else-if="accessRequest.status === 'PENDING'">
          <button class="btn btn-outline-secondary btn-sm" disabled>
            <i class="bi bi-hourglass-split me-1" />Pending Approval…
          </button>
          <button class="btn btn-outline-secondary btn-sm" title="Refresh status" @click="fetchAccessRequest">
            <i class="bi bi-arrow-clockwise" />
          </button>
        </template>
        <template v-else-if="accessRequest.status === 'APPROVED'">
          <button class="btn btn-charcoal btn-sm" :disabled="impersonating" @click="accessShop">
            <i class="bi bi-incognito me-1" />{{ impersonating ? 'Opening…' : 'Enter Shop Dashboard' }}
          </button>
        </template>
        <div class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">More</button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li v-if="shop.status !== 'ACTIVE'"><button class="dropdown-item" @click="setStatus('ACTIVE')"><i class="bi bi-play-circle me-2" />Activate</button></li>
            <li v-if="shop.status !== 'SUSPENDED'"><button class="dropdown-item" @click="tab = 'danger'"><i class="bi bi-pause-circle me-2" />Suspend…</button></li>
            <li v-if="shop.status !== 'CLOSED'"><button class="dropdown-item text-danger" @click="tab = 'danger'"><i class="bi bi-x-circle me-2" />Close…</button></li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="shop.status !== 'ACTIVE'" class="alert alert-warning d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-exclamation-triangle" />
      <span>
        This shop is <strong>{{ shop.status.toLowerCase() }}</strong> and hidden from the public marketplace.
        <template v-if="shop.suspendedReason">Reason: {{ shop.suspendedReason }}</template>
      </span>
    </div>

    <div v-if="accessRequest?.status === 'DENIED'" class="alert alert-secondary d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-shield-x" />
      <span>
        This shop's Admin denied your last access request.
        <template v-if="accessRequest.responseNote">Note: {{ accessRequest.responseNote }}</template>
        You can submit a new request above.
      </span>
    </div>

    <ConfirmActionModal
      v-model="showRequestModal"
      title="Request shop access"
      :message="`Request access to ${shop.name}'s dashboard. Its Admin must approve before you can enter.`"
      confirm-text="Send Request"
      require-reason
      @confirm="(p) => requestAccess(p.reason)"
    />
    <AdminTabs v-model="tab" :tabs="tabs" />

    <ShopUsersTable v-if="tab === 'users'" :shop-id="id" />
    <ShopRolePermissionMatrix v-else-if="tab === 'permissions'" />
    <ShopAuditLogs v-else-if="tab === 'audit'" :shop-id="id" />
    <ShopDangerZone v-else-if="tab === 'danger'" :shop="shop" @changed="fetchShop" />
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
  title: 'Shop Control Center'
})

export interface ShopDetail {
  id: string
  slug: string
  name: string
  status: string
  suspendedReason: string | null
  isActive: boolean
  createdAt: string
  lastActivity: string | null
  ownerName: string | null
  ownerEmail: string | null
  userCount: number
  bookingCount: number
  [key: string]: unknown
}

const route = useRoute()
const id = route.params.id as string
const toast = useToast()

const shop = ref<ShopDetail>(await useApi<ShopDetail>(`/api/admin/platform/shops/${id}`))

async function fetchShop() {
  shop.value = await useApi<ShopDetail>(`/api/admin/platform/shops/${id}`)
}

const tabs = [
  { key: 'users', label: 'Users', icon: 'bi-people' },
  { key: 'permissions', label: 'Roles & Permissions', icon: 'bi-shield-lock' },
  { key: 'audit', label: 'Audit Logs', icon: 'bi-clipboard-data' },
  { key: 'danger', label: 'Danger Zone', icon: 'bi-exclamation-octagon' }
]
const tab = ref('users')

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function setStatus(newStatus: string) {
  try {
    await useApi(`/api/admin/platform/shops/${id}/status`, { method: 'PUT', body: { status: newStatus } })
    toast.success(`Shop set to ${newStatus.toLowerCase()}`)
    fetchShop()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not update shop status')
  }
}

interface AccessRequest {
  id: string
  status: string
  reason: string
  responseNote: string | null
}

const accessRequest = ref<AccessRequest | null>(null)
async function fetchAccessRequest() {
  accessRequest.value = await useApi<AccessRequest | null>(`/api/admin/platform/shops/${id}/access-requests/latest`)
}
await fetchAccessRequest()

// Live update: the moment this shop's Admin approves/denies, reflect it here immediately —
// no more manual "Refresh" needed.
const { resolvedRequest, clearResolved } = useAccessRequestSocket()
watch(resolvedRequest, (resolved) => {
  if (!resolved || resolved.request.shopId !== id) return
  accessRequest.value = { ...resolved.request, status: resolved.type === 'approved' ? 'APPROVED' : 'DENIED' }
  toast[resolved.type === 'approved' ? 'success' : 'info'](
    resolved.type === 'approved' ? 'Approved — you can enter now' : "This shop's Admin denied the request"
  )
  clearResolved()
})

const showRequestModal = ref(false)
async function requestAccess(reason?: string) {
  try {
    await useApi(`/api/admin/platform/shops/${id}/access-requests`, { method: 'POST', body: { reason } })
    toast.success('Access request sent — waiting for this shop\'s Admin to approve')
    fetchAccessRequest()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not send access request')
  }
}

const impersonating = ref(false)
async function accessShop() {
  impersonating.value = true
  try {
    await useApi(`/api/admin/platform/shops/${id}/impersonate`, { method: 'POST' })
    const auth = useAuthStore()
    await auth.fetchMe()
    await navigateTo('/admin')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not access this shop')
    impersonating.value = false
    fetchAccessRequest()
  }
}
</script>
