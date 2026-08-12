<template>
  <header class="admin-topbar d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom">
    <div>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-0 small">
          <li class="breadcrumb-item"><NuxtLink to="/admin">Admin</NuxtLink></li>
          <li v-if="title" class="breadcrumb-item active">{{ title }}</li>
        </ol>
      </nav>
      <h1 class="h4 font-display mb-0 mt-1">{{ title }}</h1>
    </div>

    <div class="dropdown">
      <button
        class="btn btn-light d-flex align-items-center gap-2 border"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span
          class="rounded-circle bg-charcoal text-white d-flex align-items-center justify-content-center"
          style="width: 32px; height: 32px; font-size: 0.85rem"
        >
          {{ initials }}
        </span>
        <span class="d-none d-sm-inline">{{ auth.user?.name }}</span>
        <i class="bi bi-chevron-down small" />
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><span class="dropdown-item-text text-muted small">{{ auth.user?.role }}</span></li>
        <li><hr class="dropdown-divider" /></li>
        <li>
          <button class="dropdown-item" @click="handleLogout">
            <i class="bi bi-box-arrow-right me-2" />Log out
          </button>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{ title?: string }>()
void props
const auth = useAuthStore()
const router = useRouter()

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
