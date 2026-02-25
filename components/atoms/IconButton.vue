<template>
  <div
    :class="['icon-button', { active, highlighted }]"
    @click="$emit('click')"
  >
    <Icon :name="icon" :size="size" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  size?: number
  active?: boolean
  highlighted?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 18,
  active: false,
  highlighted: false,
})

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

.icon-button.active {
  background: rgba(66, 184, 131, 0.15);
  border-color: rgba(66, 184, 131, 0.4);
}

.icon-button.highlighted::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: rgba(255, 200, 0, 0.3);
  border: 1px solid rgba(255, 200, 0, 0.5);
  z-index: -1;
}
</style>

