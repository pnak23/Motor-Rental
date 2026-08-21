<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="d-flex">
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
  background: #f4f3f0;
}
</style>
