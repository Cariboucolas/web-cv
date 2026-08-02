<template>
  <AtomsDeviceFrame :variant="variant">
    <!-- Projet sans capture : le logo tient lieu d'écran de démarrage, ce qui
         garde la grille homogène plutôt que d'y laisser un trou. -->
    <div v-if="images.length === 0" class="showcase-fallback">
      <img
          v-if="logo"
          :src="logo"
          :alt="alt"
          class="showcase-logo"
          :style="logoBg ? { background: logoBg } : undefined"
      />
      <Icon v-else-if="icon" :name="icon" class="showcase-icon"/>
    </div>

    <!-- Les captures sont montées au fur et à mesure du défilement : au repos,
         seule la première est dans le DOM, donc seule elle est téléchargée.
         Le filtrage passe par visibleImages plutôt que par un v-if posé sur le
         v-for : sur un même élément, Vue 3 évalue v-if avant v-for, donc la
         condition n'aurait pas accès à l'index. -->
    <template v-else>
      <img
          v-for="(image, i) in visibleImages"
          :key="image"
          :src="`${image}-${widths[0]}.webp`"
          :srcset="`${image}-${widths[0]}.webp ${widths[0]}w, ${image}-${widths[1]}.webp ${widths[1]}w`"
          :sizes="sizes"
          :alt="i === 0 ? alt : ''"
          class="showcase-img"
          :class="{ 'showcase-img--active': i === index }"
          decoding="async"
      />
    </template>
  </AtomsDeviceFrame>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Chemins sans suffixe ni extension : `/images/projects/mgm_dashboard`. */
    images: string[]
    orientation: 'portrait' | 'landscape'
    alt: string
    sizes: string
    logo?: string
    logoBg?: string
    icon?: string
    active?: boolean
    interval?: number
  }>(),
  {
    active: false,
    interval: 1500,
  },
)

const variant = computed(() =>
  props.orientation === 'portrait' ? 'phone' : 'browser',
)

/** Largeurs des variantes générées en tâche 1, par orientation. */
const widths = computed<[number, number]>(() =>
  props.orientation === 'portrait' ? [380, 570] : [560, 940],
)

const index = ref(0)

/** Nombre de captures montées. Le défilement avance d'un cran à la fois, donc
 *  un compteur suffit : les suivantes ne sont jamais téléchargées tant que le
 *  survol n'a pas atteint leur rang. */
const mountedCount = ref(1)

const visibleImages = computed(() => props.images.slice(0, mountedCount.value))

const reduceMotion = ref(false)

onMounted(() => {
  // matchMedia n'existe pas au rendu serveur : la détection attend le montage.
  reduceMotion.value = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
})

let timer: ReturnType<typeof setInterval> | null = null

const stop = () => {
  if (timer !== null) {
    clearInterval(timer)
    timer = null
  }
}

watch(
  () => props.active,
  (active) => {
    stop()
    if (!active || reduceMotion.value || props.images.length < 2) {
      // L'état de repos est déterministe : on revient toujours à la première.
      index.value = 0
      return
    }
    timer = setInterval(() => {
      index.value = (index.value + 1) % props.images.length
      mountedCount.value = Math.max(mountedCount.value, index.value + 1)
    }, props.interval)
  },
)

onBeforeUnmount(stop)
</script>

<style scoped>
.showcase-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Cadrage par le haut : c'est la partie de la capture qui porte l'identité
     de l'écran, et la seule visible une fois le châssis rogné par la carte. */
  object-position: top center;
  opacity: 0;
  /* Fondu resserré avec la cadence : à 400ms pour 1,5s de cycle, l'image
     passait un quart du temps en transition et paraissait molle. */
  transition: opacity 0.25s ease;
}

.showcase-img--active {
  opacity: 1;
}

.showcase-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #141414;
}

.showcase-logo {
  width: 44%;
  max-height: 44%;
  object-fit: contain;
  border-radius: 6px;
  padding: 4px;
}

.showcase-icon {
  /* Le composant Icon de @nuxt/icon dimensionne via `font-size` (em) : la
     prop `size` pose un style inline qui l'emporterait sur toute règle CSS
     de même spécificité, donc elle n'est pas utilisée ici. cqw plutôt que px
     pour suivre le châssis, comme .showcase-logo et DeviceFrame.vue. */
  font-size: 22cqw;
  color: #42b883;
  opacity: 0.6;
}

@media (prefers-reduced-motion: reduce) {
  .showcase-img {
    transition: none;
  }
}
</style>
