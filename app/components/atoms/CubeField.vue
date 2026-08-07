<template>
  <div ref="field" class="cube-field" aria-hidden="true"/>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const field = ref<HTMLElement | null>(null)

let frame: number | null = null
let pointerX = 0
let pointerY = 0
let awake = false

/** Écrit la position dans les deux variables CSS que lit le masque. */
const apply = () => {
  frame = null
  const el = field.value
  if (!el) return
  el.style.setProperty('--cube-x', `${pointerX}px`)
  el.style.setProperty('--cube-y', `${pointerY}px`)
}

const onMove = (event: PointerEvent) => {
  // Un doigt n'a pas de position au repos : il n'y a rien à révéler avant
  // le contact, et rien à suivre après.
  if (event.pointerType !== 'mouse') return

  pointerX = event.clientX
  pointerY = event.clientY

  if (!awake) {
    awake = true
    field.value?.classList.add('cube-field--awake')
  }

  // Une seule écriture par frame, quel que soit le débit des événements :
  // une souris peut en émettre bien plus que l'écran n'affiche d'images.
  if (frame === null) frame = requestAnimationFrame(apply)
}

const onLeave = () => {
  awake = false
  field.value?.classList.remove('cube-field--awake')
}

const stop = () => {
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  if (frame !== null) {
    cancelAnimationFrame(frame)
    frame = null
  }
}

onMounted(() => {
  // matchMedia n'existe pas au rendu serveur : la décision attend le montage.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!window.matchMedia('(hover: hover)').matches) return

  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
})

onBeforeUnmount(stop)
</script>

<style scoped>
.cube-field {
  position: fixed;
  inset: 0;
  /* Derrière tout le contenu, et hors de portée du pointeur : le champ ne
     doit jamais intercepter un clic ni une sélection.

     Plan 0 : la page est enveloppée dans le <v-app> de Vuetify, qui pose son
     propre fond opaque — une couche négative disparaîtrait dessous. Le contenu
     passe donc explicitement au plan 1. */
  z-index: 0;
  pointer-events: none;

  /* Le quadrillage : ce sont ses cellules qui font les cubes. Deux dégradés
     linéaires plutôt qu'une image — aucun asset, aucune requête. */
  background-image:
    linear-gradient(to right, var(--cube-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--cube-line) 1px, transparent 1px);
  background-size: var(--cube-size) var(--cube-size);
  /* Explicite : le reset de Vuetify pose un background-repeat qui, hérité ici,
     ne laissait paraître qu'une seule maille en haut à gauche. */
  background-repeat: repeat;

  /* Tout est masqué sauf un halo autour du curseur. C'est le dégradé du
     masque qui produit la décroissance avec la distance : aucun cube n'est
     calculé individuellement, et le composite reste sur le GPU.
     Hors écran par défaut, tant qu'aucun mouvement n'a eu lieu. */
  -webkit-mask-image: radial-gradient(
    circle var(--cube-radius) at var(--cube-x, -100vw) var(--cube-y, -100vh),
    #000 0%,
    rgba(0, 0, 0, 0.55) 45%,
    transparent 72%
  );
  mask-image: radial-gradient(
    circle var(--cube-radius) at var(--cube-x, -100vw) var(--cube-y, -100vh),
    #000 0%,
    rgba(0, 0, 0, 0.55) 45%,
    transparent 72%
  );

  opacity: 0;
  transition: opacity 0.5s ease;
}

.cube-field--awake {
  opacity: 1;
}

/* Pas de curseur à suivre, et rien à animer pour qui n'en veut pas. */
@media (hover: none) {
  .cube-field {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cube-field {
    display: none;
  }
}
</style>
