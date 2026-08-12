<template>
  <nav v-if="totalPages > 1" :aria-label="t('pagination.label')">
    <ul class="pagination mb-0">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <button class="page-link" @click="$emit('update:page', page - 1)">
          <i class="bi bi-chevron-left" />
        </button>
      </li>
      <li v-for="p in pagesToShow" :key="p" class="page-item" :class="{ active: p === page }">
        <button class="page-link" @click="$emit('update:page', p)">{{ p }}</button>
      </li>
      <li class="page-item" :class="{ disabled: page >= totalPages }">
        <button class="page-link" @click="$emit('update:page', page + 1)">
          <i class="bi bi-chevron-right" />
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{ page: number; totalPages: number }>()
defineEmits<{ 'update:page': [number] }>()

const pagesToShow = computed(() => {
  const total = props.totalPages
  const current = props.page
  const range = 1
  const pages: number[] = []
  for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
    pages.push(i)
  }
  return pages
})
</script>
