<template>
  <div class="impersonation-banner d-flex align-items-center justify-content-between gap-3 px-3 py-2">
    <span><i class="bi bi-incognito me-2" />You are accessing <strong>{{ auth.user?.shopName }}</strong> as Super Admin</span>
    <button class="btn btn-sm btn-light" :disabled="exiting" @click="exit">
      {{ exiting ? 'Exiting…' : 'Exit impersonation' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const toast = useToast()
const exiting = ref(false)

async function exit() {
  exiting.value = true
  try {
    await useApi('/api/admin/platform/exit-impersonation', { method: 'POST' })
    await auth.fetchMe()
    await navigateTo('/admin/platform/shops')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not exit impersonation')
  } finally {
    exiting.value = false
  }
}
</script>

<style scoped>
.impersonation-banner {
  background: var(--color-amber-deep);
  color: #fff;
  font-size: 0.85rem;
}
</style>
