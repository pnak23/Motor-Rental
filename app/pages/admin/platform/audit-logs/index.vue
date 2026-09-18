<template>
  <div class="card">
    <div class="table-responsive">
      <table class="table align-middle mb-0 small">
        <thead class="table-light">
          <tr><th>When</th><th>Shop</th><th>Admin</th><th>Action</th><th>Entity</th><th>Description</th><th>IP</th></tr>
        </thead>
        <tbody>
          <tr v-if="items.length === 0"><td colspan="7" class="text-center text-muted py-4">No audit activity yet</td></tr>
          <tr v-for="log in items" :key="log.id">
            <td>{{ formatDateTime(log.createdAt) }}</td>
            <td>{{ log.shopName || 'Platform' }}</td>
            <td>{{ log.userEmail || '—' }}</td>
            <td><span class="badge bg-light text-dark border">{{ log.action }}</span></td>
            <td>{{ log.entityType }}</td>
            <td>{{ log.description }}</td>
            <td class="font-mono">{{ log.ipAddress }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="p-3 d-flex justify-content-between align-items-center">
      <span class="small text-muted">{{ total }} total</span>
      <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
    </div>
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
  title: 'Audit Logs'
})

interface AuditLog {
  id: string
  shopName: string | null
  userEmail: string | null
  action: string
  entityType: string | null
  description: string | null
  ipAddress: string | null
  createdAt: string
}

const page = ref(1)
const items = ref<AuditLog[]>([])
const total = ref(0)
const totalPages = ref(1)

async function fetchList() {
  const res = await useApi<{ items: AuditLog[]; total: number; totalPages: number }>('/api/admin/platform/audit-logs', {
    query: { page: page.value, pageSize: 50 }
  })
  items.value = res.items
  total.value = res.total
  totalPages.value = res.totalPages
}
watch(page, fetchList)
await fetchList()

function formatDateTime(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
