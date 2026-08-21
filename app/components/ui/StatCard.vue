<template>
  <div class="card stat-card p-3 h-100" :class="`stat-card--${color}`">
    <div class="d-flex align-items-center gap-3">
      <div class="stat-icon d-flex align-items-center justify-content-center" :class="`stat-icon--${color}`">
        <i class="bi" :class="icon" />
      </div>
      <div class="min-width-0">
        <p class="text-muted small mb-0 text-truncate">{{ label }}</p>
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
.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg, 14px);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(33, 38, 43, 0.1);
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.stat-card--amber::before {
  background: var(--color-amber-deep);
}
.stat-card--charcoal::before {
  background: var(--color-charcoal);
}
.stat-card--success::before {
  background: var(--color-success);
}
.stat-card--danger::before {
  background: var(--color-danger);
}
.min-width-0 {
  min-width: 0;
}
.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  font-size: 1.25rem;
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
