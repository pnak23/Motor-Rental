<template>
  <div class="dropdown lang-switcher">
    <button
      class="btn btn-sm lang-switcher__toggle d-flex align-items-center gap-1"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <i class="bi bi-translate" />
      <span>{{ currentLocale?.name }}</span>
    </button>
    <ul class="dropdown-menu dropdown-menu-end">
      <li v-for="loc in availableLocales" :key="loc.code">
        <button
          class="dropdown-item"
          :class="{ active: loc.code === locale }"
          type="button"
          @click="setLocale(loc.code)"
        >
          {{ loc.name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => availableLocales.value.find((l) => l.code === locale.value))
</script>

<style scoped>
.lang-switcher__toggle {
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: inherit;
  background: transparent;
}
.site-header--transparent .lang-switcher__toggle {
  border-color: rgba(255, 255, 255, 0.6);
}
</style>
