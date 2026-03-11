<template>
  <section class="w-full pt-6">

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
        <div v-for="(xp, index) in experiences" :key="index" class="xp-row">
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

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const {tm, rt} = useI18n()

interface Experience {
  company: string
  position: string
  periodStart: string
  periodEnd: string | null
  technologies: string[]
  highlights: string[]
}

const experiences = computed<Experience[]>(() => {
  const raw = tm('experiences.items')
  if (!Array.isArray(raw)) return []
  return raw.map((item: any) => ({
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
  }))
})
</script>

<style scoped>
.xp-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Desktop: timeline ── */
.xp-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  bottom: -24px;
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
