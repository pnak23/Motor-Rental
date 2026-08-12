<template>
  <aside class="admin-sidebar d-flex flex-column" :class="{ 'admin-sidebar--collapsed': collapsed }">
    <div class="d-flex align-items-center justify-content-between px-3 py-3 border-bottom border-secondary-subtle">
      <NuxtLink to="/admin" class="d-flex align-items-center gap-2 text-white text-decoration-none">
        <i class="bi bi-scooter fs-4" />
        <span v-if="!collapsed" class="fw-600 font-display">Admin</span>
      </NuxtLink>
      <button class="btn btn-sm btn-link text-white-50 p-0 d-none d-lg-block" @click="collapsed = !collapsed">
        <i class="bi" :class="collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'" />
      </button>
    </div>

    <nav class="flex-grow-1 overflow-auto py-2">
      <NuxtLink to="/admin" class="sidebar-link" exact-active-class="active">
        <i class="bi bi-speedometer2" /> <span v-if="!collapsed">Dashboard</span>
      </NuxtLink>

      <p v-if="!collapsed" class="sidebar-heading">Rental Management</p>
      <NuxtLink to="/admin/motorbikes" class="sidebar-link" active-class="active">
        <i class="bi bi-motorcycle" /> <span v-if="!collapsed">Motorbikes</span>
      </NuxtLink>
      <NuxtLink to="/admin/bookings" class="sidebar-link" active-class="active">
        <i class="bi bi-calendar-check" /> <span v-if="!collapsed">Bookings</span>
      </NuxtLink>
      <NuxtLink to="/admin/customers" class="sidebar-link" active-class="active">
        <i class="bi bi-people" /> <span v-if="!collapsed">Customers</span>
      </NuxtLink>
      <NuxtLink to="/admin/maintenance" class="sidebar-link" active-class="active">
        <i class="bi bi-tools" /> <span v-if="!collapsed">Maintenance</span>
      </NuxtLink>

      <p v-if="!collapsed" class="sidebar-heading">Website</p>
      <NuxtLink to="/admin/settings" class="sidebar-link" active-class="active">
        <i class="bi bi-house-gear" /> <span v-if="!collapsed">Content &amp; Policies</span>
      </NuxtLink>
      <NuxtLink to="/admin/banners" class="sidebar-link" active-class="active">
        <i class="bi bi-images" /> <span v-if="!collapsed">Banners</span>
      </NuxtLink>
      <NuxtLink to="/admin/faqs" class="sidebar-link" active-class="active">
        <i class="bi bi-question-circle" /> <span v-if="!collapsed">FAQ</span>
      </NuxtLink>
      <NuxtLink to="/admin/locations" class="sidebar-link" active-class="active">
        <i class="bi bi-geo-alt" /> <span v-if="!collapsed">Locations</span>
      </NuxtLink>
      <NuxtLink to="/admin/contact-messages" class="sidebar-link" active-class="active">
        <i class="bi bi-envelope" /> <span v-if="!collapsed">Messages</span>
      </NuxtLink>

      <p v-if="!collapsed" class="sidebar-heading">Settings</p>
      <NuxtLink to="/admin/users" class="sidebar-link" active-class="active">
        <i class="bi bi-person-badge" /> <span v-if="!collapsed">Users</span>
      </NuxtLink>
      <NuxtLink to="/admin/audit-logs" class="sidebar-link" active-class="active">
        <i class="bi bi-clipboard-data" /> <span v-if="!collapsed">Audit Logs</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const collapsed = ref(false)
</script>

<style scoped>
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  transition: width 0.15s ease;
}
.admin-sidebar--collapsed {
  width: 68px;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.92rem;
  text-decoration: none;
  white-space: nowrap;
}
.sidebar-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border-right: 3px solid var(--color-amber);
}
.sidebar-heading {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  padding: 0.9rem 1.1rem 0.25rem;
  margin: 0;
}
</style>
