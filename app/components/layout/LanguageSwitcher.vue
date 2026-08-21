<template>
  <div class="dropdown lang-switcher">
    <button
      class="lang-switcher__toggle d-flex align-items-center gap-2"
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <span class="lang-switcher__badge">{{ currentLocale?.code?.toUpperCase() }}</span>
      <span class="lang-switcher__label">{{ currentLocale?.name }}</span>
      <i class="bi bi-chevron-down lang-switcher__chevron" />
    </button>
    <ul class="dropdown-menu dropdown-menu-end lang-switcher__menu">
      <li v-for="loc in availableLocales" :key="loc.code">
        <button
          class="lang-switcher__item"
          :class="{ 'is-active': loc.code === locale }"
          type="button"
          @click="setLocale(loc.code)"
        >
          <span class="lang-switcher__item-badge">{{ loc.code.toUpperCase() }}</span>
          <span class="lang-switcher__item-name">{{ loc.name }}</span>
          <i v-if="loc.code === locale" class="bi bi-check2 lang-switcher__check" />
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
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  color: inherit;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  padding: 0.35rem 0.7rem 0.35rem 0.35rem;
  font-weight: 600;
  font-size: 0.85rem;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}
.lang-switcher__toggle:hover {
  border-color: var(--color-gold, #d4af37);
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.18);
}
.lang-switcher__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-gold, #d4af37), var(--color-gold-deep, #ad8a26));
  color: var(--color-brown, #33281f);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.lang-switcher__chevron {
  font-size: 0.65rem;
  opacity: 0.6;
  transition: transform 0.2s ease;
}
.lang-switcher__toggle[aria-expanded='true'] .lang-switcher__chevron {
  transform: rotate(180deg);
}
.site-header--transparent .lang-switcher__toggle {
  border-color: rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.site-header--transparent .lang-switcher__toggle:hover {
  border-color: var(--color-gold, #d4af37);
  background: rgba(255, 255, 255, 0.14);
}

.lang-switcher__menu {
  min-width: 190px;
  padding: 0.4rem;
  border: 1px solid var(--color-border, #e3d6b8);
  border-radius: var(--radius-md, 12px);
  box-shadow: 0 16px 36px rgba(38, 30, 20, 0.16);
  animation: langMenuIn 0.18s ease both;
}
@keyframes langMenuIn {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.lang-switcher__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: none;
  background: transparent;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-sm, 8px);
  font-weight: 500;
  color: var(--color-charcoal, #21262b);
  transition:
    background 0.15s ease,
    color 0.15s ease;
}
.lang-switcher__item:hover {
  background: rgba(212, 175, 55, 0.12);
  color: var(--color-gold-deep, #ad8a26);
}
.lang-switcher__item.is-active {
  background: rgba(212, 175, 55, 0.16);
  color: var(--color-gold-deep, #ad8a26);
  font-weight: 600;
}
.lang-switcher__item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-gray-light, #efe6d2);
  color: var(--color-forest, var(--color-charcoal));
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
}
.lang-switcher__item.is-active .lang-switcher__item-badge {
  background: linear-gradient(135deg, var(--color-gold, #d4af37), var(--color-gold-deep, #ad8a26));
  color: var(--color-brown, #33281f);
}
.lang-switcher__item-name {
  flex: 1;
  text-align: left;
}
.lang-switcher__check {
  color: var(--color-gold-deep, #ad8a26);
  font-size: 0.95rem;
}
</style>
