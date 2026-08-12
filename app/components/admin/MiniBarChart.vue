<template>
  <div class="mini-bar-chart d-flex align-items-end gap-2">
    <div v-for="point in points" :key="point.label" class="bar-col text-center flex-fill">
      <div class="bar-track d-flex align-items-end justify-content-center">
        <div
          class="bar"
          :style="{ height: `${max > 0 ? (point.value / max) * 100 : 0}%` }"
          :title="`${point.label}: ${point.value}`"
        />
      </div>
      <p class="small text-muted mt-1 mb-0">{{ point.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ points: { label: string; value: number }[] }>()
const max = computed(() => Math.max(1, ...props.points.map((p) => p.value)))
</script>

<style scoped>
.bar-track {
  height: 140px;
}
.bar {
  width: 60%;
  background: var(--color-amber);
  border-radius: 4px 4px 0 0;
  min-height: 2px;
  transition: height 0.3s ease;
}
</style>
