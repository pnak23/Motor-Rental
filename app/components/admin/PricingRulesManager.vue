<template>
  <div class="card p-3 mb-3">
    <h3 class="h6 font-display mb-3">Custom Pricing Rules</h3>
    <p class="small text-muted">Override the daily/weekly/monthly price for specific day ranges (e.g. weekend or promo rates).</p>

    <table v-if="rules.length" class="table table-sm">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Days</th><th>Price/day</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="r in rules" :key="r.id">
          <td>{{ r.name }}</td>
          <td>{{ r.type }}</td>
          <td>{{ r.minDays }}–{{ r.maxDays ?? '∞' }}</td>
          <td class="price-tag">${{ Number(r.pricePerDay).toFixed(2) }}</td>
          <td><button class="btn btn-sm btn-outline-danger" @click="remove(r.id)"><i class="bi bi-trash" /></button></td>
        </tr>
      </tbody>
    </table>

    <form class="row g-2 align-items-end" @submit.prevent="add">
      <div class="col-md-3"><input v-model="form.name" required placeholder="Rule name" class="form-control form-control-sm" /></div>
      <div class="col-md-2">
        <select v-model="form.type" class="form-select form-select-sm">
          <option value="STANDARD">Standard</option>
          <option value="WEEKEND">Weekend</option>
          <option value="HOLIDAY">Holiday</option>
          <option value="PROMOTION">Promotion</option>
          <option value="LONG_TERM">Long-term</option>
        </select>
      </div>
      <div class="col-md-2"><input v-model.number="form.minDays" type="number" required placeholder="Min days" class="form-control form-control-sm" /></div>
      <div class="col-md-2"><input v-model.number="form.maxDays" type="number" placeholder="Max days" class="form-control form-control-sm" /></div>
      <div class="col-md-2"><input v-model.number="form.pricePerDay" type="number" step="0.01" required placeholder="$/day" class="form-control form-control-sm" /></div>
      <div class="col-md-1"><button type="submit" class="btn btn-sm btn-charcoal w-100"><i class="bi bi-plus" /></button></div>
    </form>
  </div>
</template>

<script setup lang="ts">
interface Rule {
  id: string
  name: string
  type: string
  minDays: number
  maxDays: number | null
  pricePerDay: string
}

const props = defineProps<{ motorbikeId: string; modelValue: Rule[] }>()
const emit = defineEmits<{ 'update:modelValue': [Rule[]] }>()
const toast = useToast()

const rules = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const form = reactive({ name: '', type: 'STANDARD', minDays: 7, maxDays: null as number | null, pricePerDay: 0 })

async function add() {
  try {
    const created = await useApi<Rule>('/api/admin/pricing', {
      method: 'POST',
      body: { ...form, motorbikeId: props.motorbikeId }
    })
    rules.value = [...rules.value, created]
    form.name = ''
    form.maxDays = null
    form.pricePerDay = 0
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not add pricing rule')
  }
}

async function remove(id: string) {
  await useApi(`/api/admin/pricing/${id}`, { method: 'DELETE' }).catch(() => {})
  rules.value = rules.value.filter((r) => r.id !== id)
}
</script>
