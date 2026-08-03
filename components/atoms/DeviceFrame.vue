<template>
  <div class="device-frame" :class="`device-frame--${variant}`">
    <div class="device-body">
      <!-- Encoche ou bandeau : purement décoratifs, jamais annoncés. -->
      <div v-if="variant === 'phone'" class="device-notch" aria-hidden="true"/>
      <div v-else class="device-chrome" aria-hidden="true">
        <span class="device-dot"/>
        <span class="device-dot"/>
        <span class="device-dot"/>
        <span class="device-address"/>
      </div>
      <div class="device-screen">
        <slot/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'phone' | 'browser'
}>()
</script>

<style scoped>
.device-frame {
  /* Les proportions internes sont exprimées en cqw plutôt qu'en pixels : le
     même châssis sert à 156px sur une carte et à 458px dans la modale sans
     qu'aucune taille ait à être passée en prop. */
  container-type: inline-size;
  position: relative;
}

.device-frame--phone {
  aspect-ratio: 9 / 19.5;
}

.device-frame--browser {
  /* 1.46 et non 16/10 : le bandeau supérieur occupe 6% de la largeur, donc
     c'est le châssis qui doit être plus haut pour que l'ÉCRAN, lui, retombe
     exactement en 16:10 — le ratio des captures. Sinon elles y perdent 10%
     de hauteur. */
  aspect-ratio: 1.46;
}

/* Le corps est un enfant plutôt que le conteneur lui-même : un conteneur ne
   peut pas se styler avec ses propres unités de requête. */
.device-body {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #111;
  border: 2px solid rgba(255, 255, 255, 0.12);
}

.device-frame--phone .device-body {
  border-radius: 12cqw;
  /* Le châssis est un vrai bord d'appareil, pas un filet : un padding
     proportionnel sur trois côtés, plus épais en haut pour loger l'encoche.
     À 3,5% de la largeur, il se lit encore à 156px de large — un iPhone
     tourne autour de 2,8%. */
  padding: 7cqw 3.5cqw 3.5cqw;
  background: #0b0b0b;
}

.device-frame--browser .device-body {
  border-radius: 3cqw;
}

/* ── Téléphone ── */
.device-notch {
  position: absolute;
  /* Centrée dans la bande supérieure de 7cqw. */
  top: 2.4cqw;
  left: 50%;
  transform: translateX(-50%);
  width: 28%;
  height: 1.8cqw;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
  z-index: 1;
}

.device-frame--phone .device-screen {
  /* Rayon intérieur plus serré que celui du châssis, comme sur un appareil
     réel où l'écran suit le bord sans l'épouser. */
  border-radius: 6cqw;
}

/* ── Navigateur ── */
.device-chrome {
  display: flex;
  align-items: center;
  gap: 1.2cqw;
  padding: 0 2cqw;
  height: 6cqw;
  flex-shrink: 0;
  background: #1a1a1a;
}

.device-dot {
  width: 1.6cqw;
  height: 1.6cqw;
  border-radius: 50%;
  /* Gris plutôt que rouge/jaune/vert : la charte n'a que deux couleurs. */
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.device-address {
  height: 2cqw;
  width: 40%;
  margin-left: 1.5cqw;
  border-radius: 999px;
  background: #262626;
}

.device-screen {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  /* Un écran au repos est noir : les captures dont le format ne tombe pas
     pile s'y posent sans qu'aucune bande ne se remarque. */
  background: #000;
}
</style>
