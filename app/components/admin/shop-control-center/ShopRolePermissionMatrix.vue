<template>
  <div>
    <div class="alert alert-secondary small">
      <i class="bi bi-info-circle me-1" />
      Granular permissions beyond role are not yet supported by the backend — access is controlled by the
      2 roles a shop's own users can have (<code>ADMIN</code> / <code>STAFF</code>; <code>SUPER_ADMIN</code> is
      reserved for platform-level accounts). This matrix is illustrative of what a future permission system would cover.
    </div>

    <div class="card p-3 table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Permission</th>
            <th class="text-center">Admin</th>
            <th class="text-center">Staff</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in groups" :key="group.name">
            <tr class="table-light">
              <td colspan="3" class="fw-600 small text-uppercase">{{ group.name }}</td>
            </tr>
            <tr v-for="perm in group.permissions" :key="perm">
              <td class="small">{{ perm }}</td>
              <td class="text-center"><input type="checkbox" class="form-check-input" checked disabled /></td>
              <td class="text-center"><input type="checkbox" class="form-check-input" :checked="perm.startsWith('View')" disabled /></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const groups = [
  { name: 'Users', permissions: ['View Users', 'Create Users', 'Edit Users', 'Delete Users'] },
  { name: 'Business', permissions: ['View Records', 'Create Records', 'Edit Records', 'Delete Records'] },
  { name: 'Bookings', permissions: ['View Bookings', 'Create Bookings', 'Edit Bookings', 'Cancel Bookings'] },
  { name: 'Reports', permissions: ['View Reports', 'Export Reports'] },
  { name: 'Settings', permissions: ['Manage Shop Settings', 'Manage Branding', 'Manage Integrations'] }
]
</script>
