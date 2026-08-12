<template>
  <section class="page-header bg-forest text-white position-relative overflow-hidden">
    <TempleSilhouette class="page-header__silhouette" />
    <div class="container position-relative py-5 text-center">
      <p v-if="eyebrow" class="eyebrow mb-2">{{ eyebrow }}</p>
      <h1 class="font-display display-6 mb-0">{{ title }}</h1>
      <p v-if="subtitle" class="mt-3 mb-0 page-header__subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.page-header {
  padding-top: 1rem;
}
.page-header__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 40px;
  color: var(--color-cream, #f7f2e8);
  opacity: 0.07;
}
.page-header__subtitle {
  color: rgba(255, 255, 255, 0.78);
  max-width: 38rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
