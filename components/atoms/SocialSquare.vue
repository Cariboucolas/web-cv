<template>
  <a
    :href="url"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :download="download ? '' : undefined"
    class="social-square"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @click="handleClick"
  >
    <Icon :name="icon" size="20" />
  </a>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  url: string
  external?: boolean
  download?: boolean
  action?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  download: false,
})

const emit = defineEmits<{
  mouseenter: []
  mouseleave: []
}>()

const handleClick = () => {
  if (props.action) {
    props.action()
  }
}
</script>

<style scoped>
.social-square {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
}

.social-square:hover {
  color: rgba(255, 255, 255, 1);
}

.social-square:hover::before {
  content: '';
  position: absolute;
  inset: -8px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: -1;
  border-radius: 0;
}
</style>

