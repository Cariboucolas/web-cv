<template>
  <div class="stars-background">
    <div
      v-for="(star, i) in stars"
      :key="i"
      class="star"
      :style="star"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const stars = ref<Array<Record<string, string>>>([])

onMounted(() => {
  const starsArray: Array<Record<string, string>> = []
  for (let i = 0; i < 100; i++) {
    const size = Math.random() * 2 + 1
    const left = Math.random() * 100
    const top = Math.random() * 100
    const delay = Math.random() * 3
    const duration = 2 + Math.random() * 3

    starsArray.push({
      width: `${size}px`,
      height: `${size}px`,
      left: `${left}%`,
      top: `${top}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    })
  }
  stars.value = starsArray
})
</script>

<style scoped>
.stars-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 0;
  animation: twinkle infinite ease-in-out;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>

