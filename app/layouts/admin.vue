<script setup lang="ts">
const route = useRoute()
const { theme, init } = useAdminTheme()
init()
</script>

<template>
  <div class="d-flex admin-shell" :data-theme="theme" :data-bs-theme="theme">
    <AdminSidebar />
    <div class="flex-grow-1 d-flex flex-column" style="min-height: 100vh; min-width: 0">
      <AdminTopbar :title="(route.meta.title as string) || ''" />
      <main class="flex-grow-1 admin-main p-3 p-lg-4">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-main {
  background: var(--admin-bg, #f4f3f0);
}
</style>
