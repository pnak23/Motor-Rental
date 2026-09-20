<template>
  <div>
    <div class="gallery-main position-relative" :class="{ 'gallery-main--empty': !validImages.length }" @click="validImages.length && (fullscreen = true)">
      <img v-if="current" :src="current" :alt="alt" class="w-100 gallery-main__image" @error="markFailed(current)" />
      <div v-else class="w-100 gallery-main__image motor-placeholder motor-placeholder--lg">
        <i class="bi bi-scooter" />
      </div>
      <button v-if="validImages.length > 1" class="gallery-nav gallery-nav--prev" @click.stop="prev">
        <i class="bi bi-chevron-left" />
      </button>
      <button v-if="validImages.length > 1" class="gallery-nav gallery-nav--next" @click.stop="next">
        <i class="bi bi-chevron-right" />
      </button>
      <span v-if="current" class="gallery-zoom-hint"><i class="bi bi-arrows-fullscreen" /></span>
    </div>

    <div v-if="validImages.length > 1" class="d-flex gap-2 mt-2 flex-wrap">
      <button
        v-for="(img, i) in validImages"
        :key="img"
        class="thumb-btn"
        :class="{ 'thumb-btn--active': img === current }"
        @click="index = i"
      >
        <img :src="img" :alt="`${alt} thumbnail ${i + 1}`" @error="markFailed(img)" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="fullscreen" class="gallery-fullscreen" @click.self="fullscreen = false">
        <button class="gallery-fullscreen__close" @click="fullscreen = false"><i class="bi bi-x-lg" /></button>
        <button v-if="validImages.length > 1" class="gallery-nav gallery-nav--prev gallery-nav--light" @click="prev">
          <i class="bi bi-chevron-left" />
        </button>
        <img v-if="current" :src="current" :alt="alt" class="gallery-fullscreen__image" @error="markFailed(current)" />
        <button v-if="validImages.length > 1" class="gallery-nav gallery-nav--next gallery-nav--light" @click="next">
          <i class="bi bi-chevron-right" />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ images: string[]; alt: string }>()

const index = ref(0)
const fullscreen = ref(false)
const failedUrls = reactive(new Set<string>())

const validImages = computed(() => props.images.filter((u) => !failedUrls.has(u)))
const current = computed(() => validImages.value[index.value] || validImages.value[0])

function markFailed(url?: string) {
  if (url) failedUrls.add(url)
}

function next() {
  index.value = (index.value + 1) % validImages.value.length
}
function prev() {
  index.value = (index.value - 1 + validImages.value.length) % validImages.value.length
}

let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0]!.clientX
}
function onTouchEnd(e: TouchEvent) {
  const diff = e.changedTouches[0]!.clientX - touchStartX
  if (diff > 50) prev()
  else if (diff < -50) next()
}

onMounted(() => {
  document.addEventListener('touchstart', onTouchStart)
  document.addEventListener('touchend', onTouchEnd)
})
onBeforeUnmount(() => {
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchend', onTouchEnd)
})
</script>

<style scoped>
.gallery-main {
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: zoom-in;
  background: var(--color-gray-light);
}
.gallery-main--empty {
  cursor: default;
}
.gallery-main__image {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.gallery-main:hover .gallery-main__image {
  transform: scale(1.04);
}
.gallery-zoom-hint {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  background: rgba(33, 38, 43, 0.6);
  color: #fff;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}
.gallery-nav--prev {
  left: 0.6rem;
}
.gallery-nav--next {
  right: 0.6rem;
}
.gallery-nav--light {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.thumb-btn {
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  overflow: hidden;
  padding: 0;
  width: 70px;
  height: 56px;
  background: none;
  transition:
    border-color 0.2s ease,
    opacity 0.2s ease;
  opacity: 0.7;
}
.thumb-btn:hover {
  opacity: 1;
}
.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-btn--active {
  border-color: var(--color-amber);
  opacity: 1;
}
.gallery-fullscreen {
  position: fixed;
  inset: 0;
  background: rgba(15, 17, 19, 0.95);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gallery-fullscreen__image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
}
.gallery-fullscreen__close {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
}
</style>
