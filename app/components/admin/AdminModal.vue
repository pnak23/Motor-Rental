<template>
  <Teleport to="body">
    <div v-if="modelValue" class="admin-modal-backdrop" @click.self="close">
      <div class="admin-modal card" :class="`admin-modal--${size}`" role="dialog" aria-modal="true">
        <div class="admin-modal__header d-flex align-items-start justify-content-between px-4 py-3 border-bottom">
          <div>
            <h3 class="h5 font-display mb-0">{{ title }}</h3>
            <p v-if="subtitle" class="small text-muted mb-0">{{ subtitle }}</p>
          </div>
          <div class="d-flex align-items-center gap-2">
            <slot name="header-extra" />
            <button type="button" class="btn-close-modal" aria-label="Close" @click="close"><i class="bi bi-x-lg" /></button>
          </div>
        </div>

        <div class="admin-modal__body px-4 py-3">
          <div v-if="loading" class="text-center py-5"><span class="spinner-border spinner-border-sm text-amber" /></div>
          <slot v-else />
        </div>

        <div v-if="$slots.footer" class="admin-modal__footer d-flex align-items-center justify-content-end gap-2 px-4 py-3 border-top">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    size?: 'md' | 'lg' | 'xl'
    loading?: boolean
  }>(),
  { size: 'md', loading: false, subtitle: undefined }
)
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

function close() {
  emit('update:modelValue', false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.admin-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 23, 26, 0.55);
  backdrop-filter: blur(2px);
  z-index: 1080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: adminModalFadeIn 0.15s ease;
}
.admin-modal {
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg, 14px);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(20, 23, 26, 0.28);
  animation: adminModalIn 0.2s ease;
  background: var(--color-white);
}
.admin-modal--lg {
  max-width: 760px;
}
.admin-modal--xl {
  max-width: 1040px;
}
.admin-modal__header {
  flex-shrink: 0;
}
.admin-modal__body {
  overflow-y: auto;
}
.admin-modal__footer {
  flex-shrink: 0;
  background: var(--color-gray-light);
}
.btn-close-modal {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-mid);
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease;
}
.btn-close-modal:hover {
  background: var(--color-gray-light);
  color: var(--color-charcoal);
}
@keyframes adminModalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes adminModalIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .admin-modal-backdrop,
  .admin-modal {
    animation: none;
  }
}
</style>
