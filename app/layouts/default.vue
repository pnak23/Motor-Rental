<script setup lang="ts">
const settingsStore = useSettingsStore()
await settingsStore.load()
</script>

<template>
  <div class="d-flex flex-column min-vh-100 site-public">
    <SiteHeader />
    <main class="flex-grow-1">
      <slot />
    </main>
    <SiteFooter />
    <FloatingContact />
  </div>
</template>
