<template>
  <div class="project-badge" :style="badgeStyle">
    <img v-if="logo" :src="logo" :alt="alt" class="project-badge-logo"/>
    <Icon v-else :name="icon ?? FALLBACK_ICON" :size="dims.icon"/>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const FALLBACK_ICON = 'material-symbols:folder-outline'

/** Trois tailles nommées plutôt qu'un pixel libre : les valeurs restent celles validées visuellement. */
const SIZES = {
  sm: { box: 52, radius: 12, icon: 28 },
  md: { box: 64, radius: 14, icon: 34 },
  lg: { box: 88, radius: 20, icon: 46 },
} as const

const props = withDefaults(
  defineProps<{
    /** Logo de marque, prioritaire sur `icon`. */
    logo?: string
    /** Fond du carré, quand le logo ne tient pas sur le fond sombre par défaut. */
    logoBg?: string
    /** Icône material-symbols, affichée à défaut de logo. */
    icon?: string
    alt?: string
    size?: keyof typeof SIZES
  }>(),
  { size: 'md' },
)

const dims = computed(() => SIZES[props.size])

const badgeStyle = computed(() => ({
  width: `${dims.value.box}px`,
  height: `${dims.value.box}px`,
  borderRadius: `${dims.value.radius}px`,
  ...(props.logoBg ? { background: props.logoBg } : {}),
}))
</script>

<style scoped>
/* Carré arrondi, aligné sur les icônes d'entreprise de la timeline (ExperienceCard). */
.project-badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  overflow: hidden;
}

.project-badge-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
