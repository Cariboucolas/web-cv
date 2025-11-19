<template>
  <div class="title-block-diagonal">
    <div class="title-left">
      <span class="title-text">{{ text }}</span>
    </div>
    <div class="title-right"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text: string
}

defineProps<Props>()
</script>

<style scoped>
.title-block-diagonal {
  display: flex;
  align-items: center;
  height: 30px;
}

.title-left {
  background: #ffffff;
  color: #1a1a1a;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 100%, 0 100%);
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  font-family: "Orbitron", sans-serif;
  min-width: 150px;
}

.title-right {
  background: rgba(20, 20, 20, 0.9);
  height: 100%;
  clip-path: polygon(15px 0, 100% 0, 100% 100%, 30px 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-left: -15px;
  width: 80px;
}

.title-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #1a1a1a;
  font-family: "Orbitron", sans-serif;
}
</style>

