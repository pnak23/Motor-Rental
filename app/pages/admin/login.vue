<template>
  <div class="card p-4 p-md-5" style="width: 100%; max-width: 400px">
    <div class="text-center mb-4">
      <i class="bi bi-scooter fs-1 text-amber" />
      <h1 class="h4 font-display mt-2">Admin Login</h1>
      <p class="text-muted small mb-0">Angkor Wheels Rental Management</p>
    </div>

    <form @submit.prevent="submit">
      <div class="mb-3">
        <label class="form-label small">Email</label>
        <input v-model="email" type="email" required class="form-control" autocomplete="username" />
      </div>
      <div class="mb-3">
        <label class="form-label small">Password</label>
        <input v-model="password" type="password" required class="form-control" autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-charcoal w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" />Log In
      </button>
      <p v-if="error" class="text-danger small mt-3 mb-0 text-center">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
