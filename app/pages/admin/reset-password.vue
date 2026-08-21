<template>
  <div class="login-form-panel min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-5 position-relative overflow-hidden">
    <div class="login-bg-grid" />
    <span class="login-bg-blob login-bg-blob--gold" />
    <span class="login-bg-blob login-bg-blob--forest" />
    <span class="login-bg-blob login-bg-blob--amber" />

    <div class="login-card p-4 p-md-5 login-fade-in">
      <div class="text-center mb-4">
        <span class="login-mark d-inline-flex align-items-center justify-content-center mb-3">
          <i class="bi bi-shield-lock" />
        </span>
        <h1 class="h4 font-display mt-1 mb-1">Set a new password</h1>
        <p class="text-muted small mb-0">Choose a strong password for your admin account.</p>
      </div>

      <div v-if="!token" class="text-center">
        <p class="text-danger small mb-3"><i class="bi bi-exclamation-circle me-1" />This reset link is missing or invalid.</p>
        <NuxtLink to="/admin/forgot-password" class="login-link small">Request a new link</NuxtLink>
      </div>

      <form v-else-if="!done" @submit.prevent="submit">
        <div class="login-field mb-3" :class="{ 'is-focused': focusField === 'password' }">
          <label class="login-field__label">New password</label>
          <div class="login-field__control">
            <i class="bi bi-lock login-field__icon" />
            <input
              v-model="password"
              type="password"
              required
              minlength="8"
              class="login-field__input"
              autocomplete="new-password"
              @focus="focusField = 'password'"
              @blur="focusField = null"
            />
          </div>
        </div>
        <div class="login-field mb-4" :class="{ 'is-focused': focusField === 'confirm' }">
          <label class="login-field__label">Confirm password</label>
          <div class="login-field__control">
            <i class="bi bi-lock login-field__icon" />
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              class="login-field__input"
              autocomplete="new-password"
              @focus="focusField = 'confirm'"
              @blur="focusField = null"
            />
          </div>
        </div>

        <button type="submit" class="btn btn-charcoal w-100 login-submit btn-shine" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" />
          <span>{{ loading ? 'Saving…' : 'Reset Password' }}</span>
        </button>

        <Transition name="login-error">
          <p v-if="error" class="text-danger small mt-3 mb-0 text-center">
            <i class="bi bi-exclamation-circle me-1" />{{ error }}
          </p>
        </Transition>
      </form>

      <div v-else class="text-center login-fade-in">
        <span class="login-success-icon d-inline-flex align-items-center justify-content-center mb-3">
          <i class="bi bi-check-lg" />
        </span>
        <p class="mb-3">Your password has been reset.</p>
        <NuxtLink to="/admin/login" class="btn btn-charcoal btn-shine">Go to login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const route = useRoute()
const token = computed(() => (route.query.token as string) || '')

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const done = ref(false)
const focusField = ref<'password' | 'confirm' | null>(null)

async function submit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  try {
    await useApi('/api/auth/reset-password', { method: 'POST', body: { token: token.value, password: password.value } })
    done.value = true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-form-panel {
  background: linear-gradient(155deg, #f7f4ee 0%, #efe9dc 55%, #e9e0cd 100%);
}
.login-bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(33, 38, 43, 0.06) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(65% 65% at 50% 40%, rgba(0, 0, 0, 0.6), transparent 90%);
  z-index: 0;
}
.login-bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  z-index: 0;
  pointer-events: none;
}
.login-bg-blob--gold {
  width: 420px;
  height: 420px;
  top: -120px;
  right: -80px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.55), transparent 70%);
  animation: blobDriftA 16s ease-in-out infinite alternate;
}
.login-bg-blob--forest {
  width: 380px;
  height: 380px;
  bottom: -140px;
  left: -100px;
  background: radial-gradient(circle, rgba(64, 90, 61, 0.4), transparent 70%);
  animation: blobDriftB 20s ease-in-out infinite alternate;
}
.login-bg-blob--amber {
  width: 260px;
  height: 260px;
  bottom: 15%;
  right: 12%;
  background: radial-gradient(circle, rgba(231, 160, 60, 0.35), transparent 70%);
  animation: blobDriftC 13s ease-in-out infinite alternate;
}
@keyframes blobDriftA {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(-40px, 30px) scale(1.12);
  }
}
@keyframes blobDriftB {
  from {
    transform: translate(0, 0) scale(1);
  }
  to {
    transform: translate(30px, -35px) scale(1.08);
  }
}
@keyframes blobDriftC {
  from {
    transform: translate(0, 0) scale(0.9);
  }
  to {
    transform: translate(-25px, -20px) scale(1.15);
  }
}
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-lg, 16px);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  box-shadow: 0 24px 48px rgba(33, 38, 43, 0.12);
}
.login-mark {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-amber), var(--color-amber-deep));
  color: var(--color-charcoal);
  font-size: 1.6rem;
}
.login-success-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(63, 140, 95, 0.14);
  color: var(--color-success);
  font-size: 1.6rem;
}
.login-fade-in {
  animation: loginFadeUp 0.5s ease both;
}
@keyframes loginFadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.login-field__label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-gray-mid);
  margin-bottom: 0.35rem;
  transition: color 0.2s ease;
}
.login-field.is-focused .login-field__label {
  color: var(--color-amber-deep);
}
.login-field__control {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm, 8px);
  background: var(--color-white);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.login-field.is-focused .login-field__control {
  border-color: var(--color-amber);
  box-shadow: 0 0 0 3px rgba(231, 160, 60, 0.14);
}
.login-field__icon {
  padding-left: 0.75rem;
  color: var(--color-gray-mid);
  font-size: 0.95rem;
  transition: color 0.2s ease;
}
.login-field.is-focused .login-field__icon {
  color: var(--color-amber-deep);
}
.login-field__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 0.6rem 0.75rem;
  font-size: 0.95rem;
  color: var(--color-charcoal);
}

.btn-shine {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.btn-shine::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 40%;
  background: linear-gradient(115deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
}
.btn-shine:hover:not(:disabled)::after {
  left: 120%;
}
.login-submit {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.login-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(33, 38, 43, 0.2);
}

.login-link {
  color: var(--color-amber-deep);
  font-weight: 600;
  text-decoration: none;
}
.login-link:hover {
  text-decoration: underline;
}

.login-error-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.login-error-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .login-bg-blob--gold,
  .login-bg-blob--forest,
  .login-bg-blob--amber,
  .login-fade-in {
    animation: none !important;
  }
}
</style>
