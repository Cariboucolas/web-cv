<template>
  <div
      class="flex items-center gap-2 bg-white/5 rounded-lg p-2 w-24 h-16 flex-col justify-center hover:bg-white/10 transition-all">
    <Icon
        :name="icon"
        size="20"
        class="text-white"
    />
    <span class="text-xs text-center text-white">
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
}>()
</script>
