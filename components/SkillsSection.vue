<template>
  <section class="section h-[250px] w-full flex flex-col">
    <div class="flex items-center gap-3 mb-4">
      <Icon name="material-symbols:bolt-outline" size="32" class="text-primary" />
      <h2 class="text-2xl font-semibold">Compétences</h2>
    </div>
    <div class="text-gray-300 flex flex-col flex-grow">
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-2">
          <Icon name="material-symbols:monitor-outline" size="24" class="text-primary" />
          <span class="text-lg">Front-end</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="material-symbols:dns-outline" size="24" class="text-primary" />
          <span class="text-lg">Back-end</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="material-symbols:build-circle-outline" size="24" class="text-primary" />
          <span class="text-lg">DevOps</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon name="material-symbols:architecture" size="24" class="text-primary" />
          <span class="text-lg">Architecture</span>
        </div>
      </div>

      <p class="text-sm text-primary mt-auto">Cliquez pour découvrir toutes mes compétences...</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import SkillBadge from '~/components/SkillBadge.vue'
</script> 