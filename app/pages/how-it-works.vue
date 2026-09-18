<template>
  <div>
    <PageHeader :eyebrow="t('howItWorks.eyebrow')" :title="t('howItWorks.title')" :subtitle="t('howItWorks.subtitle')" />

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div v-for="(step, i) in steps" :key="step.title" class="step-row d-flex gap-4" v-reveal>
            <div class="step-marker d-flex flex-column align-items-center">
              <span class="step-number">{{ i + 1 }}</span>
              <span v-if="i < steps.length - 1" class="step-line" />
            </div>
            <div class="pb-5">
              <h3 class="h6 font-display mb-1">{{ step.title }}</h3>
              <p class="text-muted mb-0">{{ step.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-3">
        <NuxtLink to="/motorbikes" class="btn btn-amber btn-lg">{{ t('howItWorks.startBrowsing') }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n()
useHead({ title: 'How It Works — RideNow' })

const steps = computed(() => {
  const raw = tm('howItWorks.steps') as unknown as { title: unknown; text: unknown }[]
  return raw.map((step) => ({ title: rt(step.title), text: rt(step.text) }))
})
</script>

<style scoped>
.step-marker {
  width: 40px;
}
.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-charcoal);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 600;
  flex-shrink: 0;
}
.step-line {
  flex-grow: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 0.4rem;
}
</style>
