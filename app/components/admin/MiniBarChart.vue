<template>
  <div class="mini-bar-chart d-flex align-items-end gap-2">
    <div v-for="point in points" :key="point.label" class="bar-col text-center flex-fill">
      <div class="bar-track d-flex align-items-end justify-content-center">
        <div class="bar-value small font-mono" v-if="point.value > 0">{{ formatValue(point.value) }}</div>
        <div
          class="bar"
          :class="{ 'bar--peak': point.value === max && point.value > 0 }"
          :style="{ height: mounted && max > 0 ? `${(point.value / max) * 100}%` : '0%' }"
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

const mounted = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true
  })
})

function formatValue(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
}
</script>

<style scoped>
.bar-track {
  height: 140px;
  position: relative;
}
.bar-value {
  position: absolute;
  top: -1.4rem;
  left: 0;
  right: 0;
  color: var(--color-gray-mid);
  font-size: 0.68rem;
  opacity: 0;
  transition: opacity 0.3s ease 0.4s;
}
.bar-col:hover .bar-value {
  opacity: 1;
}
.bar {
  width: 60%;
  max-width: 46px;
  background: linear-gradient(180deg, var(--color-amber) 0%, var(--color-amber-deep) 100%);
  border-radius: 5px 5px 0 0;
  min-height: 2px;
  transition:
    height 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.2s ease,
    filter 0.2s ease;
}
.bar--peak {
  box-shadow: 0 6px 14px rgba(231, 160, 60, 0.35);
}
.bar-col:hover .bar {
  filter: brightness(1.08);
}
</style>
