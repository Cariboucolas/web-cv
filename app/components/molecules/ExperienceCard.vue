<template>
  <!-- Mobile variant -->
  <div v-if="compact" class="xp-mobile-card">
    <div class="xp-mobile-header">
      <div class="xp-mobile-header-icon" :class="{ 'xp-logo--oversized': isOversized }" :style="companyBg ? { background: companyBg } : {}">
        <img v-if="companyLogo" :src="companyLogo" :alt="experience.company" class="xp-logo" />
        <Icon v-else name="material-symbols:work-outline" size="28" />
      </div>
      <div class="xp-mobile-header-text">
        <div class="xp-mobile-period">{{ period }}</div>
        <h4 class="xp-mobile-company">{{ experience.company }}</h4>
        <p class="xp-mobile-position">{{ experience.position }}</p>
      </div>
    </div>
    <div class="xp-mobile-tags">
      <span v-for="tech in experience.technologies" :key="tech" class="xp-mobile-tag">
        {{ tech }}
      </span>
    </div>
    <!-- Les highlights de l'expérience précèdent les sous-projets au lieu de
         les exclure : depuis le regroupement des périmètres sous un même
         client, c'est cette ligne qui porte ce que les sous-projets ont en
         commun. Sans elle, quatre sous-projets se relisent comme quatre
         missions distinctes, ce que le regroupement cherche justement à
         défaire. -->
    <ul v-if="experience.highlights.length" class="xp-mobile-highlights">
      <li v-for="(highlight, hi) in experience.highlights" :key="hi">{{ highlight }}</li>
    </ul>
    <!-- Sub-projects in columns -->
    <div v-if="experience.subProjects?.length" class="xp-mobile-subprojects">
      <div v-for="sub in experience.subProjects" :key="sub.name" class="xp-mobile-subproject">
        <h5 class="xp-subproject-title">{{ sub.name }}</h5>
        <ul class="xp-mobile-highlights">
          <li v-for="(highlight, hi) in sub.highlights" :key="hi">{{ highlight }}</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Desktop variant -->
  <div v-else class="xp-card">
    <div class="xp-header">
      <div class="xp-header-icon" :class="{ 'xp-logo--oversized': isOversized }" :style="companyBg ? { background: companyBg } : {}">
        <img v-if="companyLogo" :src="companyLogo" :alt="experience.company" class="xp-logo" />
        <Icon v-else name="material-symbols:work-outline" size="32" />
      </div>
      <div class="xp-header-text">
        <div class="xp-header-top">
          <h4 class="xp-company">{{ experience.company }}</h4>
          <span class="xp-period">{{ period }}</span>
        </div>
        <p class="xp-position">{{ experience.position }}</p>
      </div>
    </div>
    <div class="xp-tags">
      <span v-for="tech in experience.technologies" :key="tech" class="desktop-tag">
        {{ tech }}
      </span>
    </div>
    <!-- Voir la variante mobile : la ligne partagée précède les sous-projets
         plutôt que de leur céder la place. -->
    <ul v-if="experience.highlights.length" class="xp-highlights">
      <li v-for="(highlight, hi) in experience.highlights" :key="hi">{{ highlight }}</li>
    </ul>
    <!-- Sub-projects in 2 columns -->
    <div v-if="experience.subProjects?.length" class="xp-subprojects">
      <div v-for="sub in experience.subProjects" :key="sub.name" class="xp-subproject">
        <h5 class="xp-subproject-title">{{ sub.name }}</h5>
        <ul class="xp-highlights">
          <li v-for="(highlight, hi) in sub.highlights" :key="hi">{{ highlight }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const props = defineProps<{
  experience: Experience
  compact?: boolean
}>()

/**
 * Indexé sur le nom d'entreprise tel qu'il sort des traductions. Les noms
 * étant des noms propres, ils sont identiques en français et en anglais : une
 * seule table suffit pour les deux locales.
 *
 * Les entités MayDay, WeParis et InStore ont disparu de cette table avec le
 * regroupement sous un même client : elles vivent désormais comme titres de
 * sous-projets, où aucun logo n'est affiché. Le bloc qui condense la carrière
 * pré-développement n'y figure pas non plus, et tombe volontairement sur
 * l'icône générique — l'absence de logo signale un résumé plutôt qu'une
 * mission.
 */
const companyLogos: Record<string, string> = {
  Decathlon: '/logos/logo_decathlon.jpg',
  Brocorp: '/logos/logo_brocorp.png',
}

const companyBgColors: Record<string, string> = {
  Decathlon: '#0363d0',
  Brocorp: '#ffffff',
}

const companyLogo = computed(
  () => companyLogos[props.experience.company] ?? null,
)
const companyBg = computed(
  () => companyBgColors[props.experience.company] ?? null,
)
const isOversized = computed(() => props.experience.company === 'Decathlon')

const period = computed(() => {
  const xp = props.experience
  if (xp.periodEnd === null) {
    // Poste en cours : on affiche l'année courante plutôt qu'un « Auj. » figé.
    return `${xp.periodStart} - ${currentYear()}`
  }
  if (xp.periodStart === xp.periodEnd) {
    return xp.periodStart
  }
  return `${xp.periodStart} - ${xp.periodEnd}`
})
</script>

<style scoped>
/* ── Mobile ── */
.xp-mobile-card {
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xp-mobile-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.xp-mobile-header-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.xp-mobile-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.xp-mobile-period {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: #42b883;
  letter-spacing: 0.5px;
}

.xp-mobile-company {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.xp-mobile-position {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.xp-mobile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.xp-mobile-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}

/* ── Mobile sub-projects ── */
.xp-mobile-subprojects {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xp-mobile-subproject {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xp-mobile-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xp-mobile-highlights li {
  font-size: 13px;
  line-height: 1.6;
  color: #aaa;
  padding-left: 14px;
  position: relative;
}

.xp-mobile-highlights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #42b883;
}

/* ── Desktop ── */
.xp-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  gap: 14px;
  border-radius: 12px;
  /* Nue en desktop : la carte n'entoure qu'un contenu non cliquable, et
     l'espacement suffit à séparer les entrées. Elle ne réapparaît que là où
     le survol n'existe pas (voir plus bas). */
  background: transparent;
}

/* Aucune réaction au survol : révéler un encadrement sous le curseur promet
   une action que la carte n'offre pas — rien n'y est cliquable. Le lot 1
   l'avait introduit pour marquer l'entrée survolée ; à l'usage, il se lit
   comme une invitation au clic. */

/* Le survol n'existe pas au doigt : sur les appareils sans pointeur fin, la
   carte reste visible en permanence plutôt que de dépendre d'un geste
   impossible. La coupure à 640px ne suffisait pas — une tablette tactile
   reçoit la version desktop. */
@media (hover: none) {
  .xp-card {
    background: #111;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }
}

.xp-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
}

.xp-header-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #42b883;
  background: rgba(66, 184, 131, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.xp-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.xp-logo--oversized .xp-logo {
  width: 150%;
  height: 150%;
  object-fit: cover;
}

.xp-header-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.xp-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.xp-period {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  color: #42b883;
  white-space: nowrap;
  letter-spacing: 0;
  flex-shrink: 0;
}

.xp-company {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
  margin: 0;
}

.xp-position {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.xp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 13px;
}

.desktop-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #8a8a8a;
}

/* ── Desktop sub-projects (2 columns) ── */
.xp-subprojects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.xp-subproject {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xp-subproject-title {
  font-size: 14px;
  font-weight: 700;
  color: #42b883;
  margin: 0;
  letter-spacing: 0.5px;
}

.xp-highlights {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xp-highlights li {
  font-size: 14px;
  line-height: 1.7;
  color: #aaa;
  padding-left: 16px;
  position: relative;
}

.xp-highlights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #42b883;
}
</style>
