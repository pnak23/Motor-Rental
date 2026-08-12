<template>
  <div class="row g-4">
    <div class="col-lg-4">
      <div class="card p-3">
        <h3 class="h6 font-display mb-3">Add Admin User</h3>
        <form @submit.prevent="save">
          <input v-model="form.name" required placeholder="Full name *" class="form-control mb-2" />
          <input v-model="form.email" required type="email" placeholder="Email *" class="form-control mb-2" />
          <input v-model="form.password" required type="password" placeholder="Password (min 8 chars) *" class="form-control mb-2" />
          <select v-model="form.role" class="form-select mb-3">
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <button type="submit" class="btn btn-amber w-100">Create User</button>
        </form>
        <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
      </div>
    </div>

    <div class="col-lg-8">
      <div class="card">
        <div class="table-responsive">
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
    </div>
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

async function save() {
  error.value = ''
  try {
    const created = await useApi<UserRow>('/api/admin/users', { method: 'POST', body: form })
    users.value.push(created)
    Object.assign(form, { name: '', email: '', password: '', role: 'STAFF' })
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
