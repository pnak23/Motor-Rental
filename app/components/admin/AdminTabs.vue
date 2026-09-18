<template>
  <ul class="nav nav-tabs admin-tabs mb-3 flex-nowrap overflow-auto">
    <li v-for="t in tabs" :key="t.key" class="nav-item">
      <button type="button" class="nav-link" :class="{ active: modelValue === t.key }" @click="$emit('update:modelValue', t.key)">
        <i v-if="t.icon" class="bi me-1" :class="t.icon" />{{ t.label }}
      </button>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{ tabs: { key: string; label: string; icon?: string }[]; modelValue: string }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>

<style scoped>
.admin-tabs .nav-link {
  white-space: nowrap;
  color: var(--color-gray-mid);
}
.admin-tabs .nav-link.active {
  color: var(--color-charcoal);
  font-weight: 600;
}
</style>
