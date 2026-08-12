<template>
  <div>
    <PageHeader :eyebrow="t('faq.goodToKnow')" :title="t('faq.title')" />

    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8" v-reveal>
          <div class="accordion" id="faqAccordion">
            <div v-for="(faq, i) in faqs" :key="faq.id" class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  :class="{ collapsed: i !== 0 }"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="`#faq-${i}`"
                >
                  {{ faq.question }}
                </button>
              </h2>
              <div :id="`faq-${i}`" class="accordion-collapse collapse" :class="{ show: i === 0 }" data-bs-parent="#faqAccordion">
                <div class="accordion-body text-muted">{{ faq.answer }}</div>
              </div>
            </div>
          </div>

          <div class="text-center mt-5">
            <p class="text-muted">{{ t('faq.stillHaveQuestions') }}</p>
            <NuxtLink to="/contact" class="btn btn-outline-charcoal">{{ t('faq.contactUs') }}</NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
interface Faq {
  id: string
  question: string
  answer: string
}
const faqs = await useApi<Faq[]>('/api/public/faqs')
useHead({ title: 'FAQ — Motorbike Rental Siem Reap' })
</script>
