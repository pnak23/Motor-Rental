<template>
  <div class="card p-3 h-100">
    <div class="d-flex align-items-center gap-3">
      <div class="stat-icon d-flex align-items-center justify-content-center" :class="`stat-icon--${color}`">
        <i class="bi" :class="icon" />
      </div>
      <div>
        <p class="text-muted small mb-0">{{ label }}</p>
        <p class="fs-4 font-mono fw-600 mb-0">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  color?: 'amber' | 'charcoal' | 'success' | 'danger'
}>()
</script>

<style scoped>
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: 1.2rem;
  flex-shrink: 0;
}
.stat-icon--amber {
  background: rgba(231, 160, 60, 0.15);
  color: var(--color-amber-deep);
}
.stat-icon--charcoal {
  background: rgba(33, 38, 43, 0.08);
  color: var(--color-charcoal);
}
.stat-icon--success {
  background: rgba(63, 140, 95, 0.12);
  color: var(--color-success);
}
.stat-icon--danger {
  background: rgba(193, 70, 47, 0.12);
  color: var(--color-danger);
}
</style>
