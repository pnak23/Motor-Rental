<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <ToastContainer />
  </ClientOnly>
</template>

<script setup lang="ts">
const localeHead = useLocaleHead()
useHead({ htmlAttrs: computed(() => localeHead.value.htmlAttrs) })
</script>
