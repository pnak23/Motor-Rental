<template>
  <aside class="admin-sidebar d-flex flex-column" :class="{ 'admin-sidebar--collapsed': collapsed }">
    <div class="d-flex align-items-center justify-content-between px-3 py-3 sidebar-brand-row">
      <NuxtLink to="/admin" class="d-flex align-items-center gap-2 text-white text-decoration-none">
        <span class="sidebar-brand-mark d-flex align-items-center justify-content-center">
          <i class="bi bi-scooter" />
        </span>
        <span v-if="!collapsed" class="fw-600 font-display sidebar-brand-name">Admin</span>
      </NuxtLink>
      <button class="btn btn-sm btn-link text-white-50 p-0 d-none d-lg-block sidebar-collapse-btn" @click="collapsed = !collapsed">
        <i class="bi" :class="collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'" />
      </button>
    </div>

    <nav class="flex-grow-1 overflow-auto py-2 sidebar-nav">
      <NuxtLink to="/admin" class="sidebar-link" exact-active-class="active" :title="collapsed ? 'Dashboard' : undefined">
        <i class="bi bi-speedometer2" /> <span v-if="!collapsed">Dashboard</span>
      </NuxtLink>

      <template v-if="isShopUser">
        <p v-if="!collapsed" class="sidebar-heading">Rental Management</p>
        <div v-else class="sidebar-divider" />
        <NuxtLink to="/admin/motorbikes" class="sidebar-link" active-class="active" :title="collapsed ? 'Motorbikes' : undefined">
          <i class="bi bi-scooter" /> <span v-if="!collapsed">Motorbikes</span>
        </NuxtLink>
        <NuxtLink to="/admin/reservations" class="sidebar-link" active-class="active" :title="collapsed ? 'Reservations' : undefined">
          <i class="bi bi-calendar3-week" /> <span v-if="!collapsed">Reservations</span>
        </NuxtLink>
        <NuxtLink to="/admin/bookings" class="sidebar-link" active-class="active" :title="collapsed ? 'Bookings' : undefined">
          <i class="bi bi-calendar-check" /> <span v-if="!collapsed">Bookings (List)</span>
        </NuxtLink>
        <NuxtLink to="/admin/customers" class="sidebar-link" active-class="active" :title="collapsed ? 'Customers' : undefined">
          <i class="bi bi-people" /> <span v-if="!collapsed">Customers</span>
        </NuxtLink>
        <NuxtLink to="/admin/maintenance" class="sidebar-link" active-class="active" :title="collapsed ? 'Maintenance' : undefined">
          <i class="bi bi-tools" /> <span v-if="!collapsed">Maintenance</span>
        </NuxtLink>
        <NuxtLink to="/admin/reports" class="sidebar-link" active-class="active" :title="collapsed ? 'Reports' : undefined">
          <i class="bi bi-graph-up-arrow" /> <span v-if="!collapsed">Reports</span>
        </NuxtLink>

        <p v-if="!collapsed" class="sidebar-heading">My Shop</p>
        <div v-else class="sidebar-divider" />
        <NuxtLink to="/admin/shop-settings" class="sidebar-link" active-class="active" :title="collapsed ? 'Shop Settings' : undefined">
          <i class="bi bi-shop" /> <span v-if="!collapsed">Shop Settings</span>
        </NuxtLink>
        <NuxtLink to="/admin/locations" class="sidebar-link" active-class="active" :title="collapsed ? 'Locations' : undefined">
          <i class="bi bi-geo-alt" /> <span v-if="!collapsed">Locations</span>
        </NuxtLink>
        <template v-if="isShopAdmin">
          <NuxtLink to="/admin/users" class="sidebar-link" active-class="active" :title="collapsed ? 'Users' : undefined">
            <i class="bi bi-person-badge" /> <span v-if="!collapsed">Users</span>
          </NuxtLink>
          <NuxtLink to="/admin/audit-logs" class="sidebar-link" active-class="active" :title="collapsed ? 'Audit Logs' : undefined">
            <i class="bi bi-clipboard-data" /> <span v-if="!collapsed">Audit Logs</span>
          </NuxtLink>
          <NuxtLink to="/admin/access-requests" class="sidebar-link" active-class="active" :title="collapsed ? 'Access Requests' : undefined">
            <i class="bi bi-shield-check" />
            <span v-if="!collapsed" class="d-flex align-items-center gap-2">Access Requests <span v-if="pendingAccessRequests > 0" class="badge bg-amber-solid">{{ pendingAccessRequests }}</span></span>
            <span v-else-if="pendingAccessRequests > 0" class="sidebar-collapsed-dot" />
          </NuxtLink>
        </template>
      </template>

      <template v-else>
        <p v-if="!collapsed" class="sidebar-heading">Platform</p>
        <div v-else class="sidebar-divider" />
        <NuxtLink to="/admin/platform/shops" class="sidebar-link" active-class="active" :title="collapsed ? 'Shops' : undefined">
          <i class="bi bi-shop-window" /> <span v-if="!collapsed">Shops</span>
        </NuxtLink>
        <NuxtLink to="/admin/platform/users" class="sidebar-link" active-class="active" :title="collapsed ? 'Users' : undefined">
          <i class="bi bi-person-badge" /> <span v-if="!collapsed">Users</span>
        </NuxtLink>
        <NuxtLink to="/admin/platform/audit-logs" class="sidebar-link" active-class="active" :title="collapsed ? 'Audit Logs' : undefined">
          <i class="bi bi-clipboard-data" /> <span v-if="!collapsed">Audit Logs</span>
        </NuxtLink>

        <p v-if="!collapsed" class="sidebar-heading">Marketplace Website</p>
        <div v-else class="sidebar-divider" />
        <NuxtLink to="/admin/settings" class="sidebar-link" active-class="active" :title="collapsed ? 'Branding' : undefined">
          <i class="bi bi-house-gear" /> <span v-if="!collapsed">Branding &amp; Content</span>
        </NuxtLink>
        <NuxtLink to="/admin/banners" class="sidebar-link" active-class="active" :title="collapsed ? 'Banners' : undefined">
          <i class="bi bi-images" /> <span v-if="!collapsed">Banners</span>
        </NuxtLink>
        <NuxtLink to="/admin/faqs" class="sidebar-link" active-class="active" :title="collapsed ? 'FAQ' : undefined">
          <i class="bi bi-question-circle" /> <span v-if="!collapsed">FAQ</span>
        </NuxtLink>
        <NuxtLink to="/admin/contact-messages" class="sidebar-link" active-class="active" :title="collapsed ? 'Messages' : undefined">
          <i class="bi bi-envelope" /> <span v-if="!collapsed">Messages</span>
        </NuxtLink>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const collapsed = ref(false)
const auth = useAuthStore()
const isShopUser = computed(() => !!auth.user?.shopId)
const isShopAdmin = computed(() => auth.user?.role === 'ADMIN')

const pendingAccessRequests = ref(0)
function refreshPendingCount() {
  useApi<{ id: string }[]>('/api/admin/access-requests', { query: { status: 'PENDING' } })
    .then((rows) => {
      pendingAccessRequests.value = rows.length
    })
    .catch(() => {})
}
if (isShopAdmin.value) {
  refreshPendingCount()
  // Live-updates the badge as requests arrive or get resolved (including from the popup
  // on whatever page is currently open), without needing a page reload.
  const { incomingRequest } = useAccessRequestSocket()
  watch(incomingRequest, refreshPendingCount)
}
</script>

<style scoped>
.admin-sidebar {
  width: 252px;
  flex-shrink: 0;
  background: linear-gradient(190deg, #21262b 0%, #191d21 100%);
  transition: width 0.2s ease;
  position: sticky;
  top: 0;
  height: 100vh;
}
.admin-sidebar--collapsed {
  width: 72px;
}
.sidebar-brand-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 64px;
}
.sidebar-brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--color-amber), var(--color-amber-deep));
  color: var(--btn-charcoal-bg);
  font-size: 1.05rem;
  flex-shrink: 0;
}
.sidebar-brand-name {
  letter-spacing: 0.01em;
}
.sidebar-collapse-btn {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
.sidebar-collapse-btn:hover {
  opacity: 1;
}

.sidebar-nav {
  padding-left: 0.6rem;
  padding-right: 0.6rem;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  margin: 0.1rem 0;
  border-radius: var(--radius-sm, 8px);
  font-size: 0.88rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.62);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.sidebar-link i {
  font-size: 1rem;
  width: 1.1rem;
  text-align: center;
  flex-shrink: 0;
}
.sidebar-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}
.sidebar-link.active {
  color: #fff;
  background: linear-gradient(90deg, rgba(231, 160, 60, 0.22), rgba(231, 160, 60, 0.05));
  box-shadow: inset 3px 0 0 var(--color-amber);
}
.sidebar-heading {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.32);
  padding: 1rem 0.85rem 0.35rem;
  margin: 0;
}
.sidebar-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0.6rem 0.5rem;
}
.bg-amber-solid {
  background: var(--color-amber);
  color: var(--btn-charcoal-bg);
  font-size: 0.68rem;
}
.sidebar-collapsed-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-amber);
  position: absolute;
  margin-left: 0.6rem;
  margin-top: -0.6rem;
}
</style>
