<template>
  <header
    class="site-header"
    :class="[isHome ? 'site-header--fixed' : 'sticky-top', isSolid ? 'site-header--solid' : 'site-header--transparent']"
  >
    <nav class="navbar navbar-expand-lg py-3">
      <div class="container">
        <NuxtLink class="navbar-brand d-flex align-items-center gap-2 font-display fw-600 min-w-0" to="/">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true" class="flex-shrink-0">
            <!-- Stylized temple-tower silhouette (Angkor prasat) -->
            <path d="M15 3 L18 9 H12 Z" :fill="markColor" />
            <path d="M10 9 H20 L18 14 H12 Z" :fill="markColor" />
            <path d="M7 14 H23 L20.5 19 H9.5 Z" :fill="markColor" />
            <rect x="9" y="19" width="12" height="7" rx="1" :fill="markColor" />
            <rect x="13.5" y="21" width="3" height="5" :fill="bgTone" />
          </svg>
          <span class="fs-5 navbar-brand__label">{{ settings?.businessName || 'Angkor Wheels Rental' }}</span>
        </NuxtLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          :aria-label="t('nav.toggleNavigation')"
          aria-expanded="false"
        >
          <span class="navbar-toggler-icon" />
        </button>

        <div id="mainNav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li class="nav-item"><NuxtLink class="nav-link" to="/">{{ t('nav.home') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/motorbikes">{{ t('nav.motorbikes') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/shops">{{ t('nav.shops') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/how-it-works">{{ t('nav.howItWorks') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/about">{{ t('nav.about') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/rental-policy">{{ t('nav.rentalPolicy') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/faq">{{ t('nav.faq') }}</NuxtLink></li>
            <li class="nav-item"><NuxtLink class="nav-link" to="/contact">{{ t('nav.contact') }}</NuxtLink></li>
            <li class="nav-item">
              <LanguageSwitcher />
            </li>
            <li class="nav-item mt-2 mt-lg-0 ms-lg-2">
              <NuxtLink class="btn btn-amber w-100" to="/shops">{{ t('nav.bookNow') }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const route = useRoute()
const scrolled = ref(false)

// Only the homepage has a hero to float over: there the header is taken
// out of flow (fixed) so the hero fills the full viewport behind it, and
// starts transparent until scrolled. Every other public page keeps the
// original in-flow, always-solid header so body text never sits underneath.
const isHome = computed(() => route.path === '/')
const isSolid = computed(() => !isHome.value || scrolled.value)
const markColor = computed(() => (isSolid.value ? 'var(--color-forest, #263A2E)' : '#ffffff'))
const bgTone = computed(() => (isSolid.value ? 'var(--color-cream, #F7F2E8)' : 'var(--color-forest, #263A2E)'))

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.site-header {
  z-index: 1030;
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}
.site-header--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
.site-header--solid {
  background-color: var(--color-cream, #f7f2e8);
  box-shadow: 0 2px 16px rgba(38, 58, 46, 0.08);
}
.site-header--transparent {
  background-color: transparent;
  box-shadow: none;
}
.site-header--transparent .nav-link,
.site-header--transparent .navbar-brand {
  color: #fff;
}
.min-w-0 {
  min-width: 0;
}
.navbar-brand__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@media (max-width: 420px) {
  .navbar-brand__label {
    max-width: 44vw;
  }
}
.site-header--transparent .navbar-toggler {
  border-color: rgba(255, 255, 255, 0.6);
}
.site-header--transparent .navbar-toggler-icon {
  filter: invert(1);
}
.nav-link {
  font-weight: 500;
  color: var(--color-forest, var(--color-charcoal));
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.nav-link.router-link-active {
  color: var(--color-gold-deep, var(--color-amber-deep));
}
.site-header--transparent .nav-link.router-link-active {
  color: var(--color-gold, #d4af37);
}

@media (max-width: 991.98px) {
  /* the mobile menu panel always gets a solid card surface once opened,
     on every page (not just the homepage's transparent header) */
  .navbar-collapse.show,
  .navbar-collapse.collapsing {
    background: var(--color-cream, #f7f2e8);
    margin: 0.75rem -0.5rem 0;
    padding: 0.75rem 0.5rem;
    border-radius: var(--radius-md, 10px);
    box-shadow: 0 8px 24px rgba(38, 58, 46, 0.18);
  }
  .site-header--transparent .navbar-collapse.show .nav-link,
  .site-header--transparent .navbar-collapse.collapsing .nav-link {
    color: var(--color-forest, var(--color-charcoal));
  }
  /* comfortable touch targets for the stacked mobile menu links */
  .navbar-collapse .nav-link {
    padding: 0.7rem 0.5rem;
  }
}
</style>
