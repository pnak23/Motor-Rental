<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="true">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item shadow"
        :class="`toast-item--${toast.type}`"
        role="status"
      >
        <i
          class="bi me-2"
          :class="{
            'bi-check-circle-fill': toast.type === 'success',
            'bi-exclamation-triangle-fill': toast.type === 'error',
            'bi-info-circle-fill': toast.type === 'info'
          }"
        />
        <span>{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const toasts = useToasts()
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(90vw, 360px);
}
.toast-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-charcoal);
  color: #fff;
  font-size: 0.9rem;
}
.toast-item--success {
  background: var(--color-success);
}
.toast-item--error {
  background: var(--color-danger);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
