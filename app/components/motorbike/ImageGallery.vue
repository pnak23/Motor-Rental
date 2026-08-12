<template>
  <div>
    <div class="gallery-main position-relative" @click="fullscreen = true">
      <img :src="current" :alt="alt" class="w-100 gallery-main__image" />
      <button v-if="images.length > 1" class="gallery-nav gallery-nav--prev" @click.stop="prev">
        <i class="bi bi-chevron-left" />
      </button>
      <button v-if="images.length > 1" class="gallery-nav gallery-nav--next" @click.stop="next">
        <i class="bi bi-chevron-right" />
      </button>
      <span class="gallery-zoom-hint"><i class="bi bi-arrows-fullscreen" /></span>
    </div>

    <div v-if="images.length > 1" class="d-flex gap-2 mt-2 flex-wrap">
      <button
        v-for="(img, i) in images"
        :key="img"
        class="thumb-btn"
        :class="{ 'thumb-btn--active': i === index }"
        @click="index = i"
      >
        <img :src="img" :alt="`${alt} thumbnail ${i + 1}`" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="fullscreen" class="gallery-fullscreen" @click.self="fullscreen = false">
        <button class="gallery-fullscreen__close" @click="fullscreen = false"><i class="bi bi-x-lg" /></button>
        <button v-if="images.length > 1" class="gallery-nav gallery-nav--prev gallery-nav--light" @click="prev">
          <i class="bi bi-chevron-left" />
        </button>
        <img :src="current" :alt="alt" class="gallery-fullscreen__image" />
        <button v-if="images.length > 1" class="gallery-nav gallery-nav--next gallery-nav--light" @click="next">
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

const current = computed(() => props.images[index.value] || props.images[0])

function next() {
  index.value = (index.value + 1) % props.images.length
}
function prev() {
  index.value = (index.value - 1 + props.images.length) % props.images.length
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
.gallery-main__image {
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
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
}
.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-btn--active {
  border-color: var(--color-amber);
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
