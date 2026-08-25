<template>
  <header class="admin-topbar d-flex align-items-center justify-content-between px-3 px-lg-4 py-3">
    <div>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><NuxtLink to="/admin">Admin</NuxtLink></li>
          <li v-if="title" class="breadcrumb-item active">{{ title }}</li>
        </ol>
      </nav>
      <h1 class="h4 font-display mb-0 mt-1">{{ title }}</h1>
    </div>

    <div class="d-flex align-items-center gap-2">
      <button
        type="button"
        class="btn theme-toggle-btn d-flex align-items-center justify-content-center"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggle"
      >
        <i class="bi" :class="theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'" />
      </button>
      <div class="dropdown">
      <button
        class="btn admin-user-btn d-flex align-items-center gap-2"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span class="admin-avatar d-flex align-items-center justify-content-center">
          {{ initials }}
        </span>
        <span class="d-none d-sm-inline fw-600">{{ auth.user?.name }}</span>
        <i class="bi bi-chevron-down small admin-user-btn__chevron" />
      </button>
      <ul class="dropdown-menu dropdown-menu-end admin-user-menu">
        <li><span class="dropdown-item-text text-muted small text-uppercase">{{ auth.user?.role }}</span></li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <button class="dropdown-item text-danger" @click="handleLogout">
            <i class="bi bi-box-arrow-right me-2" />Log out
          </button>
        </li>
      </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string }>()
void props
const auth = useAuthStore()
const router = useRouter()
const { theme, toggle } = useAdminTheme()

async function handleLogout() {
  await auth.logout()
  router.push('/admin/login')
}

const initials = computed(() =>
  (auth.user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
)
</script>

<style scoped>
.admin-topbar {
  background: var(--color-white, #fff);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}
.breadcrumb-item a {
  color: var(--color-gray-mid);
  text-decoration: none;
}
.breadcrumb-item.active {
  color: var(--color-amber-deep);
}
.admin-user-btn {
  border: 1px solid var(--color-border);
  background: var(--color-white);
  border-radius: 999px;
  padding: 0.35rem 0.75rem 0.35rem 0.35rem;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-charcoal);
  font-size: 1.05rem;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    color 0.15s ease;
}
.theme-toggle-btn:hover {
  border-color: var(--color-amber);
  color: var(--color-amber-deep);
  box-shadow: 0 4px 12px rgba(231, 160, 60, 0.16);
}
.admin-user-btn:hover {
  border-color: var(--color-amber);
  box-shadow: 0 4px 12px rgba(231, 160, 60, 0.16);
}
.admin-user-btn__chevron {
  opacity: 0.5;
}
.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--btn-charcoal-bg), var(--color-charcoal-2));
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}
.admin-user-menu {
  min-width: 190px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: 0 16px 32px rgba(33, 38, 43, 0.14);
  padding: 0.4rem;
}
.admin-user-menu .dropdown-item {
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.65rem;
}
</style>
