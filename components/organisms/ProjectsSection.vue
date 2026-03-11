<template>
  <section class="w-full pt-6">

    <!-- Desktop: grille de cards -->
    <div class="hidden sm:block">
      <div class="projects-grid">
        <div
            v-for="project in projects"
            :key="project.key"
            class="project-card"
            @click="openModal(project)"
        >
          <img
              :src="project.cover"
              :alt="t(`projects.projects.${project.key}.title`)"
              class="project-card-cover"
          />
          <div class="project-card-body">
            <h4 class="project-card-title">{{ t(`projects.projects.${project.key}.title`) }}</h4>
            <p class="project-card-desc">{{ t(`projects.projects.${project.key}.shortDescription`) }}</p>
            <div class="project-card-tags">
              <span v-for="tech in project.technologies" :key="tech" class="project-tag">
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: carousel horizontal -->
    <div class="sm:hidden">
      <div class="carousel-wrapper">
        <div class="carousel-track">
          <div
              v-for="project in projects"
              :key="project.key"
              class="carousel-card"
              @click="openModal(project)"
          >
            <img
                :src="project.cover"
                :alt="t(`projects.projects.${project.key}.title`)"
                class="carousel-card-img"
            />
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

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const { t } = useI18n()

interface Project {
  key: string
  cover: string
  images: string[]
  technologies: string[]
  link: string
  orientation: 'portrait' | 'landscape'
}

const projects = ref<Project[]>([
  {
    key: 'mc',
    cover: '/images/projects/cover_mc.svg',
    images: [],
    technologies: ['React', 'TypeScript', 'Python', 'Java', 'Vertex AI', 'SQL', 'Datadog', 'SonarQube', 'Playwright', 'Docker', 'Tailwind'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'mgm',
    cover: '/images/projects/cover_mgm.svg',
    images: [
      '/images/projects/mgm_dashboard.png',
      '/images/projects/mgm_debrief.png',
      '/images/projects/mgm_debrieflastweek.png',
      '/images/projects/mgm_topmodel.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'Datadog', 'Sentry', 'SonarQube', 'GraphQL', 'Storybook', 'Cypress'],
    link: '#',
    orientation: 'portrait',
  },
  {
    key: 'fcs',
    cover: '/images/projects/cover_fcs.svg',
    images: ['/images/projects/fcs_dashboard.png'],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'Datadog', 'Sentry', 'SonarQube', 'GraphQL', 'Storybook', 'Cypress'],
    link: '#',
    orientation: 'portrait',
  },
  {
    key: 'winky',
    cover: '/images/projects/cover_winky.svg',
    images: [
      '/images/projects/winky_dashboard.png',
      '/images/projects/winky-dashboard_2.png',
      '/images/projects/winky_paiment.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'KYC'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'mechachain',
    cover: '/images/projects/cover_mechachain.svg',
    images: [],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'KYC'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'stic',
    cover: '/images/projects/cover_stic.svg',
    images: [
      '/images/projects/stic_dashboard.png',
      '/images/projects/stic_immat.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'NodeJs', 'Firebase', 'NoSQL', 'Sentry', 'SonarQube', 'Scandit', 'Cypress'],
    link: '#',
    orientation: 'portrait',
  },
])

const modalOpen = ref(false)
const selectedProject = ref<Project | null>(null)

const openModal = (project: Project) => {
  selectedProject.value = project
  modalOpen.value = true
}
</script>

<style scoped>
/* ── Desktop: grille de cards ── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 0 20px rgba(66, 184, 131, 0.04);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 24px rgba(66, 184, 131, 0.15);
}

.project-card-cover {
  width: 100%;
  aspect-ratio: 5 / 3;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  display: block;
}

.project-card-body {
  padding: 0 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.project-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.project-tag {
  font-size: 11px;
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

.carousel-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(66, 184, 131, 0.35);
  border: 1px solid rgba(66, 184, 131, 0.5);
  border-radius: 3px;
  color: #42b883;
}

</style>
