<template>
  <div class="card">
    <ul class="list-group list-group-flush">
      <li v-if="messages.length === 0" class="list-group-item text-center text-muted py-4">No messages yet</li>
      <li v-for="m in messages" :key="m.id" class="list-group-item" :class="{ 'bg-light': !m.isRead }">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="fw-600 mb-0">{{ m.name }} <span class="text-muted small fw-normal">&lt;{{ m.email }}&gt;</span></p>
            <p class="small text-muted mb-1">{{ m.phone }} &middot; {{ formatDateTime(m.createdAt) }}</p>
            <p class="mb-0">{{ m.message }}</p>
          </div>
          <button v-if="!m.isRead" class="btn btn-sm btn-outline-secondary flex-shrink-0" @click="markRead(m)">Mark read</button>
        </div>
      </li>
    </ul>
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
  title: 'Contact Messages'
})

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  isRead: boolean
  createdAt: string
}

const messages = ref<ContactMessage[]>(await useApi<ContactMessage[]>('/api/admin/contact-messages'))

async function markRead(m: ContactMessage) {
  await useApi(`/api/admin/contact-messages/${m.id}`, { method: 'PUT' })
  m.isRead = true
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
