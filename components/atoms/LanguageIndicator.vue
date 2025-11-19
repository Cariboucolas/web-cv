<template>
  <div class="icon-button" @click="$emit('click')">
    <span class="lang-indicator">{{ lang.toUpperCase() }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  lang: string
}

defineProps<Props>()

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.icon-button {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
}

.lang-indicator {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: "Orbitron", sans-serif;
}
</style>

