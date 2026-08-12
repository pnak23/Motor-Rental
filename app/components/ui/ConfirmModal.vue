<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-backdrop" @click.self="$emit('update:modelValue', false)">
      <div class="confirm-dialog card p-4 shadow">
        <h5 class="font-display mb-2">{{ title }}</h5>
        <p class="text-muted mb-4">{{ message }}</p>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="$emit('update:modelValue', false)">Cancel</button>
          <button class="btn" :class="danger ? 'btn-danger' : 'btn-charcoal'" @click="confirm">
            {{ confirmText }}
          </button>
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
    message: string
    confirmText?: string
    danger?: boolean
  }>(),
  { confirmText: 'Confirm', danger: false }
)
const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: [] }>()

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
void props
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(33, 38, 43, 0.45);
  z-index: 1080;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.confirm-dialog {
  width: 100%;
  max-width: 420px;
}
</style>
