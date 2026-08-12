<template>
  <div class="card p-3 mb-3">
    <h3 class="h6 font-display mb-3">Photos</h3>

    <div
      class="dropzone mb-3"
      :class="{ 'dropzone--active': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <i class="bi bi-cloud-arrow-up fs-2 text-amber" />
      <p class="mb-0 small text-muted">Drag &amp; drop photos here, or click to browse (JPG, PNG, WebP)</p>
      <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="d-none" @change="onFileInput" />
    </div>

    <p v-if="uploading" class="small text-muted"><span class="spinner-border spinner-border-sm me-2" />Uploading...</p>

    <div class="row g-2">
      <div
        v-for="(img, i) in images"
        :key="img.id"
        class="col-6 col-md-3"
        draggable="true"
        @dragstart="dragIndex = i"
        @dragover.prevent
        @drop.prevent="onReorderDrop(i)"
      >
        <div class="image-tile" :class="{ 'image-tile--primary': img.isPrimary }">
          <img :src="img.url" :alt="`Photo ${i + 1}`" />
          <div class="image-tile__actions">
            <button type="button" class="btn btn-sm btn-light" title="Set as primary" @click="setPrimary(img.id)">
              <i class="bi" :class="img.isPrimary ? 'bi-star-fill text-amber' : 'bi-star'" />
            </button>
            <button type="button" class="btn btn-sm btn-light text-danger" title="Delete" @click="deleteImage(img.id)">
              <i class="bi bi-trash" />
            </button>
          </div>
          <span v-if="img.isPrimary" class="primary-badge">Primary</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MImage {
  id: string
  url: string
  isPrimary: boolean
}

const props = defineProps<{ motorbikeId: string; modelValue: MImage[] }>()
const emit = defineEmits<{ 'update:modelValue': [MImage[]] }>()
const toast = useToast()

const images = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploading = ref(false)
const dragIndex = ref<number | null>(null)

async function uploadFiles(files: FileList | File[]) {
  const arr = Array.from(files)
  if (!arr.length) return
  uploading.value = true
  try {
    const formData = new FormData()
    for (const f of arr) formData.append('files', f)
    const uploaded = await useApi<MImage[]>(`/api/admin/motorbikes/${props.motorbikeId}/images`, {
      method: 'POST',
      body: formData
    })
    images.value = [...images.value, ...uploaded]
    toast.success(`${uploaded.length} photo(s) uploaded`)
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Upload failed')
  } finally {
    uploading.value = false
  }
}

function onFileInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) uploadFiles(files)
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  if (e.dataTransfer?.files) uploadFiles(e.dataTransfer.files)
}

async function setPrimary(imageId: string) {
  try {
    await useApi(`/api/admin/motorbikes/${props.motorbikeId}/images/${imageId}/primary`, { method: 'PUT' })
    images.value = images.value.map((img) => ({ ...img, isPrimary: img.id === imageId }))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not set primary photo')
  }
}

async function deleteImage(imageId: string) {
  try {
    await useApi(`/api/admin/motorbikes/${props.motorbikeId}/images/${imageId}`, { method: 'DELETE' })
    images.value = images.value.filter((img) => img.id !== imageId)
    toast.success('Photo deleted')
  } catch (e) {
    toast.error(e instanceof Error ? e.message : 'Could not delete photo')
  }
}

async function onReorderDrop(targetIndex: number) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return
  const arr = [...images.value]
  const [moved] = arr.splice(dragIndex.value, 1)
  arr.splice(targetIndex, 0, moved!)
  images.value = arr
  dragIndex.value = null
  try {
    await useApi(`/api/admin/motorbikes/${props.motorbikeId}/images/reorder`, {
      method: 'PUT',
      body: { imageIds: arr.map((i) => i.id) }
    })
  } catch {
    toast.error('Could not save new order')
  }
}
</script>

<style scoped>
.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.dropzone--active {
  border-color: var(--color-amber);
  background: rgba(231, 160, 60, 0.06);
}
.image-tile {
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  cursor: grab;
}
.image-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-tile--primary {
  outline: 2px solid var(--color-amber);
}
.image-tile__actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.image-tile:hover .image-tile__actions {
  opacity: 1;
}
.primary-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: var(--color-amber);
  color: var(--color-charcoal);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
</style>
