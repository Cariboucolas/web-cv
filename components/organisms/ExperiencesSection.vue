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
import {computed} from 'vue'

const {tm, rt} = useI18n()

/**
 * `tm` expose un type de retour récursif que TypeScript renonce à instancier
 * (TS2589). Le type s'effondre alors sur `never`, et la garde `Array.isArray`
 * juste en dessous ne narrow plus rien — `.map` disparaît. On lit donc `tm`
 * à travers une signature minimale : la forme réelle du message est de toute
 * façon vérifiée à l'exécution.
 */
const translateMessageList = tm as (key: string) => unknown

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
  return rawExperiences.map((item: any) => ({
    company: rt(item.company),
    position: rt(item.position),
    periodStart: rt(item.periodStart),
    periodEnd: item.periodEnd ? rt(item.periodEnd) : null,
    technologies: Array.isArray(item.technologies)
        ? item.technologies.map((tech: any) => rt(tech))
        : [],
    highlights: Array.isArray(item.highlights)
        ? item.highlights.map((h: any) => rt(h))
        : [],
    subProjects: Array.isArray(item.subProjects)
        ? item.subProjects.map((sub: any) => ({
          name: rt(sub.name),
          highlights: Array.isArray(sub.highlights)
              ? sub.highlights.map((h: any) => rt(h))
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
