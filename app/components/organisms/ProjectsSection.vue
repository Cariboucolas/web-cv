<template>
  <section class="section-full">

    <!-- Desktop: grille de cards -->
    <div class="desktop-only">
      <div class="projects-grid">
        <button
            v-for="(project, index) in projects"
            :key="project.key"
            v-reveal="index"
            type="button"
            class="project-card"
            :aria-label="t('projects.openDetail', { title: t(`projects.projects.${project.key}.title`) })"
            @click="openModal(project)"
            @mouseenter="activeKey = project.key"
            @mouseleave="activeKey = null"
            @focus="activeKey = project.key"
            @blur="activeKey = null"
        >
          <div class="project-card-stage">
            <MoleculesProjectShowcase
                :images="project.images"
                :orientation="project.orientation"
                :logo="project.logo"
                :logo-bg="project.logoBg"
                :icon="project.icon"
                alt=""
                :sizes="project.orientation === 'portrait' ? '156px' : '264px'"
                :active="activeKey === project.key"
                class="project-card-showcase"
                :class="project.orientation === 'portrait'
                  ? 'project-card-showcase--phone'
                  : 'project-card-showcase--browser'"
            />
          </div>
          <div class="project-card-body">
            <h4 class="project-card-title">{{ t(`projects.projects.${project.key}.title`) }}</h4>
            <p class="project-card-desc">{{ t(`projects.projects.${project.key}.shortDescription`) }}</p>
            <div class="project-card-tagzone">
              <!-- Liste tronquée : décorative, comme le panneau complet juste en
                   dessous. Les technologies ne sont pas portées par le texte
                   de la carte : c'est le bouton qui a son propre aria-label,
                   et la liste complète reste accessible via la modale que la
                   carte ouvre. -->
              <div class="project-card-tags" aria-hidden="true">
                <span v-for="tech in project.technologies.slice(0, 3)" :key="tech" class="project-tag">
                  {{ tech }}
                </span>
                <span v-if="project.technologies.length > 3" class="project-tag project-tag--count">
                  +{{ project.technologies.length - 3 }}
                </span>
              </div>

              <!-- Opacité nulle plutôt que display ou visibility : la révélation au
                   survol reste animable. -->
              <div class="project-card-tags-full" aria-hidden="true">
                <span v-for="tech in project.technologies" :key="tech" class="project-tag">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile: carousel horizontal -->
    <div class="mobile-only">
      <div class="carousel-wrapper">
        <div class="carousel-track">
          <div
              v-for="project in projects"
              :key="project.key"
              class="carousel-card"
              @click="openModal(project)"
          >
            <div class="carousel-card-visual">
              <AtomsProjectBadge
                  size="sm"
                  :logo="project.logo"
                  :logo-bg="project.logoBg"
                  :icon="project.icon"
                  :alt="t(`projects.projects.${project.key}.title`)"
              />
            </div>
            <div class="carousel-card-overlay">
              <span class="carousel-card-title">{{ t(`projects.projects.${project.key}.shortTitle`) }}</span>
              <div class="carousel-card-tags">
                <span v-for="tech in project.technologies.slice(0, 3)" :key="tech" class="carousel-tag">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <MoleculesProjectModal v-model="modalOpen" :project="selectedProject"/>

  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Project } from '~/types/project'

const { t } = useI18n()

const projects = ref<Project[]>([
  {
    key: 'mc',
    icon: 'material-symbols:supervisor-account',
    images: [],
    technologies: [
      'React',
      'TypeScript',
      'Python',
      'Java',
      'Vertex AI',
      'SQL',
      'Datadog',
      'SonarQube',
      'Playwright',
      'Docker',
      'Tailwind',
    ],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'mgm',
    icon: 'material-symbols:monitoring',
    images: [
      '/images/projects/mgm_dashboard',
      '/images/projects/mgm_debrief',
      '/images/projects/mgm_debrieflastweek',
      '/images/projects/mgm_topmodel',
    ],
    technologies: [
      'Nuxt',
      'TypeScript',
      'NodeJs',
      'Firebase',
      'NoSQL',
      'Datadog',
      'Sentry',
      'SonarQube',
      'GraphQL',
      'Storybook',
      'Cypress',
    ],
    link: '#',
    orientation: 'portrait',
  },
  {
    key: 'fcs',
    icon: 'material-symbols:sentiment-satisfied',
    images: ['/images/projects/fcs_dashboard'],
    technologies: [
      'Nuxt',
      'TypeScript',
      'NodeJs',
      'Firebase',
      'NoSQL',
      'Datadog',
      'Sentry',
      'SonarQube',
      'GraphQL',
      'Storybook',
      'Cypress',
    ],
    link: '#',
    orientation: 'portrait',
  },
  {
    key: 'winky',
    logo: '/logos/logo_winkyverse.png',
    logoBg: '#ffffff',
    images: [
      '/images/projects/winky_dashboard',
      '/images/projects/winky-dashboard_2',
      '/images/projects/winky_paiment',
      '/images/projects/winky_login',
    ],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'KYC'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'mechachain',
    logo: '/logos/logo_mechachain.png',
    logoBg: '#ffffff',
    images: [
      '/images/projects/mechachain_dashboard',
      '/images/projects/mechachain_login',
    ],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'KYC'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'stic',
    icon: 'material-symbols:pedal-bike',
    images: ['/images/projects/stic_dashboard', '/images/projects/stic_immat'],
    technologies: [
      'Nuxt',
      'TypeScript',
      'NodeJs',
      'Firebase',
      'NoSQL',
      'Sentry',
      'SonarQube',
      'Scandit',
      'Cypress',
    ],
    link: '#',
    orientation: 'portrait',
  },
])

const modalOpen = ref(false)
const selectedProject = ref<Project | null>(null)

/** Projet dont les captures défilent. Une seule carte à la fois. */
const activeKey = ref<string | null>(null)

const openModal = (project: Project) => {
  selectedProject.value = project
  modalOpen.value = true
  // Le survol/focus qui a déclenché le clic ne reçoit pas toujours de
  // mouseleave/blur (clic sans déplacement de souris, Safari macOS qui ne
  // focus pas les <button> au clic) : on arrête explicitement le défilement
  // pour qu'il ne continue pas derrière la modale.
  activeKey.value = null
}
</script>

<style scoped>
/* ── Desktop: grille de cards ── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-grid);
}

.project-card {
  position: relative;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 20px rgba(66, 184, 131, 0.04);
  /* Réinitialisation du bouton natif : l'apparence reste celle d'une carte. */
  appearance: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  width: 100%;
  /* Colonne flex, et non `block` : la grille étire toutes les cartes d'une
     rangée à la hauteur de la plus haute, et un <button> centre verticalement
     son contenu quand on l'étire — c'est le comportement natif du bouton, pas
     une règle d'ici, et rien dans l'inspecteur ne le désigne. La carte la plus
     courte de la rangée voyait donc son surplus se répartir en deux : une
     bande de fond au-dessus de la scène, une autre sous les tags. En colonne,
     la scène est calée en haut et le surplus part dans le corps. */
  display: flex;
  flex-direction: column;
}

.project-card:focus-visible {
  outline: 2px solid #42b883;
  outline-offset: 2px;
}

.project-card:focus-within {
  z-index: 5;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 24px rgba(66, 184, 131, 0.15);
  z-index: 5;
}

/* overflow: hidden descend de la carte vers la scène : la carte doit laisser
   sortir le panneau de tags de la tâche 6, la scène doit rogner le châssis. */
.project-card-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 3;
  overflow: hidden;
  /* Un aplat uniforme derrière un appareil incliné se lit comme une bande
     noire : le vide que laisse la rotation n'a aucune raison d'être là. Un
     dégradé qui s'éclaircit vers le haut, plus un halo à l'accent au point
     de fuite, donne au contraire une scène éclairée — le vide devient le
     fond sur lequel l'appareil est posé. */
  background:
    radial-gradient(120% 90% at 50% -15%, rgba(66, 184, 131, 0.10), transparent 62%),
    linear-gradient(180deg, #242424 0%, #171717 100%);
  border-radius: 12px 12px 0 0;
}

.project-card-showcase {
  position: absolute;
  /* L'appareil est rogné par le bas, ce qui garde dans le champ la partie
     haute de la capture. Le pivot est toujours pris dans la zone visible et
     jamais sur un bord : autour d'un coin, tout ce qui est plus bas dérive
     latéralement, et l'appareil paraît décentré alors que `left: 50%` le dit
     centré. */
  left: 50%;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
  transition: transform 0.3s ease;
}

/* Le téléphone dépasse trois fois la hauteur de la scène : son centre
   géométrique tombe hors champ, donc le pivot se cale sur le milieu de la
   bande réellement visible (~25% de sa hauteur). */
.project-card-showcase--phone {
  width: 50%;
  top: 12%;
  transform: translateX(-50%) rotate(var(--showcase-tilt));
  transform-origin: 50% 25%;
}

/* Le navigateur, lui, a la hauteur de la scène : il pivote sur son centre,
   ce qui répartit le débord également à gauche et à droite au lieu de tout
   verser d'un côté. Le `top` est calé pour que le coin le plus haut — celui
   de droite, que l'inclinaison remonte de largeur/2 × sin(5°) — retombe
   sous le bord de la carte au lieu d'en être tranché. */
.project-card-showcase--browser {
  width: 92%;
  top: 11%;
  transform: translateX(-50%) rotate(var(--showcase-tilt));
}

.project-card:hover .project-card-showcase {
  transform: translateX(-50%) rotate(var(--showcase-tilt)) translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .project-card,
  .project-card-showcase {
    transition: none;
  }

  .project-card:hover .project-card-showcase {
    transform: translateX(-50%) rotate(var(--showcase-tilt));
  }
}

.project-card-body {
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: var(--space-inner-sm);
  /* Absorbe le surplus de hauteur que la grille impose aux cartes courtes. */
  flex: 1;
}

.project-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.2px;
}

.project-card-desc {
  font-size: 13px;
  line-height: 1.5;
  color: #aaa;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Le surplus est versé au-dessus des tags, pas en dessous : le panneau
   déroulé au survol part de cette zone et doit toucher le bas de la carte
   pour paraître la prolonger. En prime, les rangées de tags s'alignent d'une
   carte à l'autre. La marge passe en padding, sinon `auto` l'écraserait
   quand il n'y a aucun surplus à absorber. */
.project-card-tagzone {
  position: relative;
  margin-top: auto;
  padding-top: var(--space-inner-md);
}

.project-card-tags,
.project-card-tags-full {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.project-card-tags-full {
  position: absolute;
  /* Déborde jusqu'au bord extérieur de la carte — 14px de padding du corps
     plus 1px de bordure — pour recouvrir son bas et paraître la prolonger. */
  top: 0;
  left: -15px;
  right: -15px;
  /* Même retrait haut que la zone qu'il recouvre : la première rangée de tags
     ne bouge pas d'un pixel entre la liste tronquée et la liste complète. */
  padding: var(--space-inner-md) 15px 14px;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
  border-radius: 0 0 12px 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.project-card:hover .project-card-tags-full,
.project-card:focus-within .project-card-tags-full {
  opacity: 1;
}

.project-tag--count {
  color: #6f6f6f;
}

@media (prefers-reduced-motion: reduce) {
  .project-card-tags-full {
    transition: none;
  }
}

.project-tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  padding: 3px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}

/* ── Mobile carousel ── */
.carousel-wrapper {
  position: relative;
  margin: 0 -16px;
}

.carousel-wrapper::before,
.carousel-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 48px;
  z-index: 2;
  pointer-events: none;
}

.carousel-wrapper::before {
  left: 0;
  background: linear-gradient(to right, #0a0a0a 0%, transparent 100%);
}

.carousel-wrapper::after {
  right: 0;
  background: linear-gradient(to left, #0a0a0a 0%, transparent 100%);
}

.carousel-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 32px 12px;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-card {
  flex: 0 0 62%;
  scroll-snap-align: center;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #1a1a1a;
  aspect-ratio: 5 / 3;
  transition: transform 0.2s ease;
}

.carousel-card:active {
  transform: scale(0.97);
}

.carousel-card-visual {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  /* L'overlay de titre occupe le bas de la carte : on remonte le badge. */
  padding-bottom: 18%;
}


.carousel-card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48px 12px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.96) 0%, rgba(0, 0, 0, 0.65) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.carousel-card-title {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
}

.carousel-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.carousel-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(66, 184, 131, 0.35);
  border: 1px solid rgba(66, 184, 131, 0.5);
  border-radius: 3px;
  color: #42b883;
}

</style>
