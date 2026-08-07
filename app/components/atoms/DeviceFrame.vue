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
  /* Retour au 16:10 franc : le bandeau étant passé en surimpression, il ne
     prend plus de hauteur et l'écran occupe tout le châssis. Son ratio est
     donc celui du cadre, et c'est exactement celui des captures. */
  aspect-ratio: 16 / 10;
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
  /* Bezel uniforme sur les quatre côtés, comme sur un appareil actuel :
     l'écran va jusqu'au bord et l'encoche se pose PAR-DESSUS. Un bord
     supérieur épais pour la loger produisait une bande noire au-dessus de
     la capture. À 3,5% de la largeur, le bezel se lit encore à 156px — un
     iPhone tourne autour de 2,8%. */
  padding: 3.5cqw;
  background: #0b0b0b;
}

.device-frame--browser .device-body {
  border-radius: 3cqw;
}

/* ── Téléphone ── */
.device-notch {
  position: absolute;
  /* Posée sur l'écran, juste sous le bord — elle ne prend plus de hauteur. */
  top: 5cqw;
  left: 50%;
  transform: translateX(-50%);
  width: 28%;
  height: 1.8cqw;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
}

.device-frame--phone .device-screen {
  /* Rayon intérieur plus serré que celui du châssis, comme sur un appareil
     réel où l'écran suit le bord sans l'épouser. */
  border-radius: 6cqw;
}

/* ── Navigateur ── */
.device-chrome {
  /* En surimpression sur la capture plutôt qu'au-dessus d'elle : un bandeau
     opaque qui pousse l'écran vers le bas se lit comme une marge noire. Le
     fond translucide garde le signal « fenêtre » sans coûter de hauteur. */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.2cqw;
  padding: 0 2cqw;
  height: 4.5cqw;
  background: rgba(10, 10, 10, 0.55);
  backdrop-filter: blur(6px);
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
