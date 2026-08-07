<template>
  <AtomsIconButton
    :icon="icon"
    :active="active"
    :highlighted="highlighted"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
interface Props {
  icon: string
  active?: boolean
  highlighted?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
  highlighted: false,
})

defineEmits<{
  click: []
}>()
</script>

