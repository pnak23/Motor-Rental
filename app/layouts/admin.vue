<script setup lang="ts">
const route = useRoute()
const { theme, init } = useAdminTheme()
init()
const auth = useAuthStore()

const toast = useToast()
const { connect, accessEvent, clearAccessEvent } = useAccessRequestSocket()
onMounted(connect)

// Safety/accountability: notify this shop's Admin the moment a Platform Super Admin
// enters or leaves their dashboard, wherever they currently are in the admin panel.
watch(accessEvent, (evt) => {
  if (!evt) return
  const who = evt.admin ? `${evt.admin.name} (${evt.admin.email})` : 'A Platform Super Admin'
  toast.info(evt.type === 'entered' ? `${who} entered your shop dashboard` : `${who} left your shop dashboard`)
  clearAccessEvent()
})
</script>

<template>
  <div class="d-flex admin-shell" :data-theme="theme" :data-bs-theme="theme">
    <AdminSidebar />
    <div class="flex-grow-1 d-flex flex-column" style="min-height: 100vh; min-width: 0">
      <ImpersonationBanner v-if="auth.user?.impersonating" />
      <AdminTopbar :title="(route.meta.title as string) || ''" />
      <main class="flex-grow-1 admin-main p-3 p-lg-4">
        <slot />
      </main>
    </div>
    <AccessRequestPopup />
  </div>
</template>

<style scoped>
.admin-main {
  background: var(--admin-bg, #f4f3f0);
}
</style>
