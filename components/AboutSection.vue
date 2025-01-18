<template>
  <section class="section h-[250px] w-full flex flex-col">
    <div class="flex items-center gap-3 mb-4">
      <Icon name="material-symbols:account-circle" size="32" class="text-primary" />
      <h2 class="text-2xl font-semibold">À propos</h2>
    </div>
    <div class="text-gray-300 flex flex-col flex-grow justify-between">
      <p>
        Développeur passionné avec plus de 15 ans d'expérience dans l'IT, j'ai entrepris une reconversion vers le développement il y a 4 ans, 
        guidé par ma passion du digital et la découverte du code et les bonnes pratiques du Software Craftsmanship.
      </p>
      <p class="text-sm text-primary">Cliquez pour en savoir plus...</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  isModal?: boolean
}>()
</script> 