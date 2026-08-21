<template>
  <span class="badge status-badge" :class="`status-badge--${status.toLowerCase()}`">{{ label }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const label = computed(() => props.status.replace(/_/g, ' '))
</script>

<style scoped>
.status-badge {
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  padding: 0.4em 0.7em;
  text-transform: capitalize;
}
.status-badge--pending {
  background: #fde8c8;
  color: #8a5a12;
}
.status-badge--confirmed {
  background: #d7ecff;
  color: #145da8;
}
.status-badge--picked_up {
  background: #dbeee0;
  color: #256b3f;
}
.status-badge--returned {
  background: #e6e6e6;
  color: #4a4a4a;
}
.status-badge--cancelled,
.status-badge--rejected {
  background: #fbdcd6;
  color: #a3341c;
}
.status-badge--available {
  background: #dbeee0;
  color: #256b3f;
}
.status-badge--rented {
  background: #d7ecff;
  color: #145da8;
}
.status-badge--maintenance {
  background: #fde8c8;
  color: #8a5a12;
}
.status-badge--inactive {
  background: #e6e6e6;
  color: #4a4a4a;
}
.status-badge--unpaid {
  background: #fbdcd6;
  color: #a3341c;
}
.status-badge--partial {
  background: #fde8c8;
  color: #8a5a12;
}
.status-badge--paid {
  background: #dbeee0;
  color: #256b3f;
}
.status-badge--refunded {
  background: #e6e6e6;
  color: #4a4a4a;
}
</style>
