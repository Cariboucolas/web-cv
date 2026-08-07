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
  /* Fond opaque, et non rgba(255, 255, 255, 0.05) : un fond translucide laissait
     voir le champ de cubes au travers du bouton, alors que le z-index de
     .page-card est censé protéger tout le contenu. Le rendu est identique —
     0.05 de blanc composé sur le fond #0a0a0a de la page donne exactement
     rgb(22, 22, 22) — et c'est déjà la valeur qu'emploie .header-social. */
  background: #161616;
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
  /* Équivalent opaque de rgba(255, 255, 255, 0.1) sur #0a0a0a. */
  background: #222222;
  border-color: rgba(255, 255, 255, 0.25);
}

.lang-indicator {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: var(--font-mono);
}
</style>

