<template>
  <div>
    <div class="admin-page-header">
      <div>
        <h1 class="h4 font-display mb-0">Users</h1>
        <p class="admin-page-header__subtitle">Admin and staff accounts with access to this panel.</p>
      </div>
      <div class="admin-page-header__actions">
        <button class="btn btn-amber" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add User</button>
      </div>
    </div>

    <div class="card">
      <div v-if="!users.length" class="admin-empty-state">
        <i class="bi bi-people" />
        <p>No users yet</p>
        <p class="small mb-0">Add your first admin or staff account.</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light"><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <select :value="u.role" class="form-select form-select-sm" @change="updateRole(u, ($event.target as HTMLSelectElement).value)">
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </td>
              <td>
                <span class="badge status-badge" :class="u.isActive ? 'status-badge--available' : 'status-badge--inactive'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary" @click="toggleActive(u)">
                  {{ u.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal v-model="showModal" title="Add Admin User">
      <form id="user-form" @submit.prevent="save">
        <input v-model="form.name" required placeholder="Full name *" class="form-control mb-2" />
        <input v-model="form.email" required type="email" placeholder="Email *" class="form-control mb-2" />
        <input v-model="form.password" required type="password" placeholder="Password (min 8 chars) *" class="form-control mb-2" />
        <select v-model="form.role" class="form-select mb-1">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
        <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
        <button type="submit" form="user-form" class="btn btn-amber">Create User</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', title: 'Users' })

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

const toast = useToast()
const users = ref<UserRow[]>(await useApi<UserRow[]>('/api/admin/users'))

const form = reactive({ name: '', email: '', password: '', role: 'STAFF' })
const error = ref('')
const showModal = ref(false)

function openCreate() {
  Object.assign(form, { name: '', email: '', password: '', role: 'STAFF' })
  error.value = ''
  showModal.value = true
}

async function save() {
  error.value = ''
  try {
    const created = await useApi<UserRow>('/api/admin/users', { method: 'POST', body: form })
    users.value.push(created)
    Object.assign(form, { name: '', email: '', password: '', role: 'STAFF' })
    showModal.value = false
    toast.success('User created')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create user'
  }
}

async function updateRole(u: UserRow, role: string) {
  await useApi(`/api/admin/users/${u.id}`, { method: 'PUT', body: { role } })
  u.role = role
  toast.success('Role updated')
}

async function toggleActive(u: UserRow) {
  await useApi(`/api/admin/users/${u.id}`, { method: 'PUT', body: { isActive: !u.isActive } })
  u.isActive = !u.isActive
  toast.success(u.isActive ? 'User activated' : 'User deactivated')
}
</script>
