<template>
  <Teleport to="body">
    <div v-if="modelValue" class="confirm-backdrop" @click.self="$emit('update:modelValue', false)">
      <div class="confirm-dialog card p-4 shadow">
        <h5 class="font-display mb-2">{{ title }}</h5>
        <p class="text-muted mb-3">{{ message }}</p>

        <div v-if="requireReason" class="mb-3">
          <label class="form-label small fw-600">Reason *</label>
          <textarea v-model="reason" class="form-control" rows="2" placeholder="Why is this action being taken?" />
        </div>

        <div v-if="requireText" class="mb-3">
          <label class="form-label small fw-600">Type <strong>{{ requireText }}</strong> to confirm</label>
          <input v-model="typed" class="form-control" :placeholder="requireText" />
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" @click="$emit('update:modelValue', false)">Cancel</button>
          <button class="btn" :class="danger ? 'btn-danger' : 'btn-charcoal'" :disabled="!canConfirm" @click="confirm">
            {{ confirmText || 'Confirm' }}
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
    requireReason?: boolean
    requireText?: string
  }>(),
  { confirmText: '', danger: false, requireReason: false, requireText: '' }
)
const emit = defineEmits<{ 'update:modelValue': [boolean]; confirm: [{ reason?: string }] }>()

const reason = ref('')
const typed = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reason.value = ''
      typed.value = ''
    }
  }
)

const canConfirm = computed(() => {
  if (props.requireReason && reason.value.trim().length < 3) return false
  if (props.requireText && typed.value.trim() !== props.requireText) return false
  return true
})

function confirm() {
  if (!canConfirm.value) return
  emit('confirm', props.requireReason ? { reason: reason.value.trim() } : {})
  emit('update:modelValue', false)
}
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
  max-width: 440px;
}
</style>
