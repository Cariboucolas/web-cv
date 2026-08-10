<template>
  <section class="w-full">

    <!-- Mobile: cards empilées -->
    <div class="sm:hidden">
      <div class="xp-mobile-list">
        <MoleculesExperienceCard
            v-for="(xp, index) in experiences"
            :key="index"
            :experience="xp"
            compact
        />
      </div>
    </div>

    <!-- Desktop: timeline + cards -->
    <div class="hidden sm:block">
      <div class="xp-timeline">
        <div v-for="(xp, index) in experiences" :key="index" v-reveal="index" class="xp-row">
          <!-- Timeline -->
          <div class="timeline-col">
            <span class="timeline-dot" :class="{ 'timeline-dot--active': xp.periodEnd === null }"></span>
          </div>

          <!-- Card -->
          <MoleculesExperienceCard :experience="xp"/>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { tm, rt } = useI18n()

/**
 * `tm` expose un type de retour récursif que TypeScript renonce à instancier
 * (TS2589). Le type s'effondre alors sur `never`, et la garde `Array.isArray`
 * juste en dessous ne narrow plus rien — `.map` disparaît. On lit donc `tm`
 * à travers une signature minimale : la forme réelle du message est de toute
 * façon vérifiée à l'exécution.
 */
const translateMessageList = tm as (key: string) => unknown

/**
 * Message de traduction non résolu, tel qu'il sort de `tm`. Sa forme interne
 * appartient à vue-i18n et c'est précisément celle qui fait capituler
 * l'inférence : on l'emprunte donc à la signature de `rt`, seule fonction
 * capable de la réduire en chaîne, plutôt que de la redéclarer.
 */
type RawMessage = Parameters<typeof rt>[0]

/**
 * Forme des entrées telles que les portent `locales/fr.json` et `en.json`.
 * Tout y est optionnel sauf l'identité de l'expérience : un fichier de
 * traduction peut mentir, chaque champ de liste reste donc gardé à l'exécution.
 */
interface RawSubProject {
  name: RawMessage
  highlights?: RawMessage[]
}

interface RawExperience {
  company: RawMessage
  position: RawMessage
  periodStart: RawMessage
  periodEnd?: RawMessage
  technologies?: RawMessage[]
  highlights?: RawMessage[]
  subProjects?: RawSubProject[]
}

interface SubProject {
  name: string
  highlights: string[]
}

interface Experience {
  company: string
  position: string
  periodStart: string
  periodEnd: string | null
  technologies: string[]
  highlights: string[]
  subProjects?: SubProject[]
}

const experiences = computed<Experience[]>(() => {
  const rawExperiences = translateMessageList('experiences.items')
  if (!Array.isArray(rawExperiences)) return []
  return rawExperiences.map((rawExperience: RawExperience) => ({
    company: rt(rawExperience.company),
    position: rt(rawExperience.position),
    periodStart: rt(rawExperience.periodStart),
    periodEnd: rawExperience.periodEnd ? rt(rawExperience.periodEnd) : null,
    technologies: Array.isArray(rawExperience.technologies)
      ? rawExperience.technologies.map((technology) => rt(technology))
      : [],
    highlights: Array.isArray(rawExperience.highlights)
      ? rawExperience.highlights.map((highlight) => rt(highlight))
      : [],
    subProjects: Array.isArray(rawExperience.subProjects)
      ? rawExperience.subProjects.map((rawSubProject) => ({
          name: rt(rawSubProject.name),
          highlights: Array.isArray(rawSubProject.highlights)
            ? rawSubProject.highlights.map((highlight) => rt(highlight))
            : [],
        }))
      : undefined,
  }))
})
</script>

<style scoped>
.xp-mobile-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-entry);
}

/* ── Desktop: timeline ── */
.xp-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-entry);
}

.xp-row {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.timeline-col {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 40px;
  position: relative;
}

.timeline-col::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: calc(var(--space-entry) * -1);
  width: 2px;
  background: rgba(66, 184, 131, 0.35);
  transform: translateX(-50%);
}

.xp-row:first-child .timeline-col::before {
  top: 40px;
}

.xp-row:last-child .timeline-col::before {
  bottom: auto;
  height: 46px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #42b883;
  position: relative;
  z-index: 1;
  border: 2px solid #0a0a0a;
}

.timeline-dot--active {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.5); }
  50% { box-shadow: 0 0 0 6px rgba(66, 184, 131, 0); }
}
</style>
