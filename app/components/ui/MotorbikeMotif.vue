<template>
  <svg
    viewBox="0 0 240 130"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="motorbike-motif"
  >
    <circle cx="54" cy="96" r="26" />
    <circle cx="190" cy="96" r="26" />
    <path d="M54 96 L96 60 H140 L166 96" />
    <path d="M96 60 L110 32 H132" />
    <path d="M110 32 L90 32" />
    <path d="M140 60 L152 38 L176 38" />
    <path d="M96 60 L80 78" />
    <circle cx="176" cy="38" r="4" fill="currentColor" stroke="none" />
  </svg>
</template>

<script setup lang="ts">
// Minimalist line-art motorcycle silhouette — a decorative brand motif in
// the same restrained, abstracted spirit as TempleSilhouette/RouteMotif.
// Self-contained (stroke="currentColor" baked in, like TempleSilhouette):
// consumers only need to set `color`/`width`/`opacity` on the element via
// a wrapping class — no :deep() styling required.
</script>

<style scoped>
.motorbike-motif {
  display: block;
  width: 100%;
  height: auto;
}
</style>
