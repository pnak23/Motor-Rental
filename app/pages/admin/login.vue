<template>
  <div class="login-screen d-flex min-vh-100">
    <!-- Brand panel -->
    <div class="login-brand d-none d-lg-flex flex-column justify-content-between position-relative overflow-hidden">
      <div class="login-brand__glow" />
      <RouteMotif class="login-brand__motif" />

      <div class="position-relative z-1 p-5">
        <div class="d-flex align-items-center gap-2 text-white login-fade-in">
          <span class="login-brand__mark d-flex align-items-center justify-content-center">
            <i class="bi bi-scooter" />
          </span>
          <span class="fs-5 fw-600 font-display">Angkor Wheels Rental</span>
        </div>
      </div>

      <div class="position-relative z-1 p-5 text-white">
        <p class="eyebrow text-gold-light mb-3 login-fade-in-1">Management Console</p>
        <h1 class="font-display login-brand__title mb-3 login-fade-in-2">
          Manage every ride,<br />booking and rider in one place.
        </h1>
        <p class="fs-6 login-brand__subtitle mb-0 login-fade-in-3">
          Sign in to track your fleet, review bookings, and keep Siem&nbsp;Reap moving.
        </p>
      </div>

      <TempleSilhouette class="login-brand__silhouette" />
    </div>

    <!-- Form panel -->
    <div class="login-form-panel flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-5 position-relative overflow-hidden">
      <div class="login-bg-grid" />
      <span class="login-bg-blob login-bg-blob--gold" />
      <span class="login-bg-blob login-bg-blob--forest" />
      <span class="login-bg-blob login-bg-blob--amber" />

      <div class="login-card p-4 p-md-5 login-fade-in">
        <div class="text-center mb-4">
          <span class="login-mark d-inline-flex align-items-center justify-content-center mb-3 d-lg-none">
            <i class="bi bi-scooter" />
          </span>
          <h1 class="h4 font-display mt-1 mb-1">Welcome back</h1>
          <p class="text-muted small mb-0">Sign in to Angkor Wheels admin</p>
        </div>

        <form @submit.prevent="submit">
          <div class="login-field mb-3" :class="{ 'is-focused': focusField === 'email', 'has-value': email }">
            <label class="login-field__label">Email</label>
            <div class="login-field__control">
              <i class="bi bi-envelope login-field__icon" />
              <input
                v-model="email"
                type="email"
                required
                class="login-field__input"
                autocomplete="username"
                @focus="focusField = 'email'"
                @blur="focusField = null"
              />
            </div>
          </div>
          <div class="login-field mb-4" :class="{ 'is-focused': focusField === 'password', 'has-value': password }">
            <label class="login-field__label">Password</label>
            <div class="login-field__control">
              <i class="bi bi-lock login-field__icon" />
              <input
                v-model="password"
                type="password"
                required
                class="login-field__input"
                autocomplete="current-password"
                @focus="focusField = 'password'"
                @blur="focusField = null"
              />
            </div>
          </div>

          <div class="d-flex align-items-center justify-content-between mb-4">
            <label class="login-remember d-flex align-items-center gap-2">
              <input v-model="remember" type="checkbox" class="form-check-input m-0" />
              <span class="small">Remember me</span>
            </label>
            <NuxtLink to="/admin/forgot-password" class="small login-link">Forgot password?</NuxtLink>
          </div>

          <button type="submit" class="btn btn-charcoal w-100 login-submit btn-shine" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" />
            <span>{{ loading ? 'Signing in…' : 'Log In' }}</span>
          </button>

          <Transition name="login-error">
            <p v-if="error" class="text-danger small mt-3 mb-0 text-center">
              <i class="bi bi-exclamation-circle me-1" />{{ error }}
            </p>
          </Transition>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')
const focusField = ref<'email' | 'password' | null>(null)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(email.value, password.value, remember.value)
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-screen {
  background: var(--color-gray-light);
}

/* ── Brand panel ── */
.login-brand {
  width: 46%;
  max-width: 560px;
  background: linear-gradient(165deg, #263a2e 0%, #1c2b21 60%, #171f19 100%);
}
.login-brand__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(55% 45% at 20% 15%, rgba(212, 175, 55, 0.22), transparent 65%);
  pointer-events: none;
}
.login-brand__motif {
  position: absolute;
  right: -30px;
  top: 40%;
  width: 300px;
  opacity: 0.5;
  color: rgba(212, 175, 55, 0.55);
  z-index: 0;
  animation: motifDrift 10s ease-in-out infinite alternate;
}
.login-brand__motif :deep(.route-line) {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-dasharray: 6 8;
  animation: dashFlow 6s linear infinite;
}
.login-brand__motif :deep(.route-dot) {
  fill: var(--color-gold, #d4af37);
}
.login-brand__motif :deep(.route-dot-hollow) {
  fill: transparent;
  stroke: var(--color-gold, #d4af37);
  stroke-width: 2;
}
@keyframes motifDrift {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-18px);
  }
}
@keyframes dashFlow {
  to {
    stroke-dashoffset: -140;
  }
}
.login-brand__mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-gold, #d4af37), var(--color-gold-deep, #ad8a26));
  color: #1c2b21;
  font-size: 1.2rem;
  flex-shrink: 0;
}
.login-brand__title {
  font-size: clamp(1.7rem, 2.6vw, 2.3rem);
  line-height: 1.2;
  max-width: 22rem;
}
.login-brand__subtitle {
  max-width: 22rem;
  opacity: 0.78;
}
.text-gold-light {
  color: var(--color-gold, #d4af37);
}
.login-brand__silhouette {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 60px;
  color: var(--color-gray-light);
  opacity: 0.05;
  z-index: 0;
}
.z-1 {
  z-index: 1;
}

/* ── Staggered entrance ── */
.login-fade-in,
.login-fade-in-1,
.login-fade-in-2,
.login-fade-in-3 {
  animation: loginFadeUp 0.7s ease both;
}
.login-fade-in-1 {
  animation-delay: 0.1s;
}
.login-fade-in-2 {
  animation-delay: 0.2s;
}
.login-fade-in-3 {
  animation-delay: 0.3s;
}
@keyframes loginFadeUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ── Form panel ── */
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

.login-remember {
  cursor: pointer;
  color: var(--color-gray-mid);
}
.login-remember .form-check-input {
  cursor: pointer;
}
.login-remember .form-check-input:checked {
  background-color: var(--color-amber-deep);
  border-color: var(--color-amber-deep);
}
.login-link {
  color: var(--color-amber-deep);
  font-weight: 600;
  text-decoration: none;
}
.login-link:hover {
  text-decoration: underline;
}

/* ── Animated input fields ── */
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

/* ── Shine sweep button ── */
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
  .login-brand__motif,
  .login-brand__motif :deep(.route-line),
  .login-bg-blob--gold,
  .login-bg-blob--forest,
  .login-bg-blob--amber,
  .login-fade-in,
  .login-fade-in-1,
  .login-fade-in-2,
  .login-fade-in-3 {
    animation: none !important;
  }
}
</style>
