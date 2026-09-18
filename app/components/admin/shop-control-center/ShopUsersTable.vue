<template>
  <div>
    <div class="d-flex justify-content-end mb-2">
      <button class="btn btn-amber btn-sm" @click="openCreate"><i class="bi bi-plus-lg me-1" />Add User</button>
    </div>

    <div class="card">
      <div v-if="pending" class="text-center py-5"><span class="spinner-border" /></div>
      <div v-else-if="!users.length" class="admin-empty-state">
        <i class="bi bi-people" />
        <p>No users yet</p>
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-light">
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th class="text-end">Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>
                <select :value="u.role" class="form-select form-select-sm" style="width: 140px" @change="updateRole(u, ($event.target as HTMLSelectElement).value)">
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td>
                <span class="badge status-badge" :class="u.isActive ? 'status-badge--available' : 'status-badge--inactive'">
                  {{ u.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="small text-muted">{{ formatDate(u.createdAt) }}</td>
              <td class="text-end">
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Actions</button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><button class="dropdown-item" @click="openResetPassword(u)"><i class="bi bi-key me-2" />Reset Password</button></li>
                    <li><button class="dropdown-item" @click="toggleActive(u)"><i class="bi me-2" :class="u.isActive ? 'bi-pause-circle' : 'bi-play-circle'" />{{ u.isActive ? 'Deactivate' : 'Activate' }}</button></li>
                    <li><button class="dropdown-item disabled" disabled title="Sessions are stateless JWTs — not tracked server-side yet"><i class="bi bi-box-arrow-right me-2" />Force Logout</button></li>
                    <li><button class="dropdown-item disabled" disabled title="Login history is not tracked yet"><i class="bi bi-clock-history me-2" />Login History</button></li>
                    <li><hr class="dropdown-divider" /></li>
                    <li><button class="dropdown-item text-danger" @click="askRemove(u)"><i class="bi bi-trash me-2" />Remove User</button></li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal v-model="showCreateModal" title="Add User">
      <form id="shop-user-form" @submit.prevent="save">
        <input v-model="form.name" required placeholder="Full name *" class="form-control mb-2" />
        <input v-model="form.email" required type="email" placeholder="Email *" class="form-control mb-2" />
        <input v-model="form.password" required type="password" placeholder="Password (min 8 chars) *" class="form-control mb-2" />
        <select v-model="form.role" class="form-select mb-1">
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
        <p v-if="error" class="text-danger small mt-2 mb-0">{{ error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showCreateModal = false">Cancel</button>
        <button type="submit" form="shop-user-form" class="btn btn-amber">Create User</button>
      </template>
    </AdminModal>

    <AdminModal v-model="showResetModal" title="Reset Password">
      <form id="reset-password-form" @submit.prevent="saveResetPassword">
        <p class="small text-muted">New password for <strong>{{ resetTarget?.email }}</strong></p>
        <input v-model="newPassword" required type="password" minlength="8" placeholder="New password (min 8 chars) *" class="form-control" />
      </form>
      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="showResetModal = false">Cancel</button>
        <button type="submit" form="reset-password-form" class="btn btn-amber">Reset Password</button>
      </template>
    </AdminModal>

    <ConfirmModal
      v-model="showRemoveModal"
      title="Remove user"
      :message="`Remove ${toRemove?.name}? They will lose access immediately.`"
      confirm-text="Remove"
      danger
      @confirm="confirmRemove"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ shopId: string }>()
const toast = useToast()

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

const users = ref<UserRow[]>([])
const pending = ref(true)

async function fetchUsers() {
  pending.value = true
  users.value = await useApi<UserRow[]>(`/api/admin/platform/shops/${props.shopId}/users`)
  pending.value = false
}
await fetchUsers()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const showCreateModal = ref(false)
const form = reactive({ name: '', email: '', password: '', role: 'STAFF' })
const error = ref('')

function openCreate() {
  Object.assign(form, { name: '', email: '', password: '', role: 'STAFF' })
  error.value = ''
  showCreateModal.value = true
}

async function save() {
  error.value = ''
  try {
    await useApi(`/api/admin/platform/shops/${props.shopId}/users`, { method: 'POST', body: form })
    showCreateModal.value = false
    toast.success('User created')
    fetchUsers()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not create user'
  }
}

async function updateRole(u: UserRow, role: string) {
  await useApi(`/api/admin/platform/shops/${props.shopId}/users/${u.id}`, { method: 'PUT', body: { role } })
  u.role = role
  toast.success('Role updated')
}

async function toggleActive(u: UserRow) {
  await useApi(`/api/admin/platform/shops/${props.shopId}/users/${u.id}`, { method: 'PUT', body: { isActive: !u.isActive } })
  u.isActive = !u.isActive
  toast.success(u.isActive ? 'User activated' : 'User deactivated')
}

const showResetModal = ref(false)
const resetTarget = ref<UserRow | null>(null)
const newPassword = ref('')
function openResetPassword(u: UserRow) {
  resetTarget.value = u
  newPassword.value = ''
  showResetModal.value = true
}
async function saveResetPassword() {
  if (!resetTarget.value) return
  try {
    await useApi(`/api/admin/platform/shops/${props.shopId}/users/${resetTarget.value.id}`, {
      method: 'PUT',
      body: { password: newPassword.value }
    })
    showResetModal.value = false
    toast.success('Password reset')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not reset password')
  }
}

const showRemoveModal = ref(false)
const toRemove = ref<UserRow | null>(null)
function askRemove(u: UserRow) {
  toRemove.value = u
  showRemoveModal.value = true
}
async function confirmRemove() {
  if (!toRemove.value) return
  try {
    await useApi(`/api/admin/platform/shops/${props.shopId}/users/${toRemove.value.id}`, { method: 'DELETE' })
    toast.success('User removed')
    fetchUsers()
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not remove user')
  }
}
</script>
