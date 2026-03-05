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
              <span class="carousel-card-title">{{ t(`projects.projects.${project.key}.title`) }}</span>
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

    <!-- Modal unifiée -->
    <v-dialog v-model="modalOpen" max-width="520">
      <v-card v-if="selectedProject" class="modal-card">
        <button class="modal-close" @click="modalOpen = false">
          <Icon name="material-symbols:close" size="20"/>
        </button>

        <!-- Slider d'images si screenshots disponibles -->
        <template v-if="selectedProject.images.length > 0">
          <div
              class="modal-slider"
              :class="selectedProject.orientation === 'portrait' ? 'slider-portrait' : 'slider-landscape'"
          >
            <img
                :src="selectedProject.images[sliderIndex]"
                :alt="t(`projects.projects.${selectedProject.key}.title`)"
                class="slider-img"
                :class="selectedProject.orientation === 'portrait' ? 'img-contain' : 'img-cover'"
            />
            <template v-if="selectedProject.images.length > 1">
              <button class="slider-btn slider-btn-prev"
                      @click="sliderIndex = (sliderIndex - 1 + selectedProject.images.length) % selectedProject.images.length">
                <Icon name="material-symbols:chevron-left" size="28"/>
              </button>
              <button class="slider-btn slider-btn-next"
                      @click="sliderIndex = (sliderIndex + 1) % selectedProject.images.length">
                <Icon name="material-symbols:chevron-right" size="28"/>
              </button>
              <div class="slider-dots">
                <span
                    v-for="(_, i) in selectedProject.images"
                    :key="i"
                    class="slider-dot"
                    :class="{ active: i === sliderIndex }"
                    @click="sliderIndex = i"
                />
              </div>
            </template>
          </div>
        </template>

        <!-- Placeholder si pas de screenshots -->
        <div v-else class="modal-placeholder">
          <img
              :src="selectedProject.cover"
              :alt="t(`projects.projects.${selectedProject.key}.title`)"
              class="modal-placeholder-img"
          />
        </div>

        <div class="modal-content">
          <h3 class="modal-title">{{ t(`projects.projects.${selectedProject.key}.title`) }}</h3>
          <div class="modal-tags">
            <span v-for="tech in selectedProject.technologies" :key="tech" class="modal-tag">
              {{ tech }}
            </span>
          </div>
          <p class="modal-desc">{{ t(`projects.projects.${selectedProject.key}.description`) }}</p>
          <a
              v-if="selectedProject.link && selectedProject.link !== '#'"
              :href="selectedProject.link"
              target="_blank"
              class="modal-link"
          >
            {{ t('projects.viewProject') }}
          </a>
        </div>
      </v-card>
    </v-dialog>

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
    technologies: ['Python', 'Kotlin', 'React', 'Vertex AI'],
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
    technologies: ['Nuxt', 'TypeScript', 'GraphQL', 'Firebase'],
    link: '#',
    orientation: 'portrait',
  },
  {
    key: 'fcs',
    cover: '/images/projects/cover_fcs.svg',
    images: ['/images/projects/fcs_dashboard.png'],
    technologies: ['Nuxt', 'TypeScript', 'GraphQL', 'Firebase'],
    link: '#',
    orientation: 'portrait',
  },
  {
    key: 'rsb',
    cover: '/images/projects/cover_rsb.svg',
    images: [],
    technologies: ['Qualification de projet'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'winky',
    cover: '/images/projects/cover_winky.svg',
    images: [
      '/images/projects/winky_dashboard.png',
      '/images/projects/winky-dashboard_2.png',
      '/images/projects/winky_paiment.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'Firestore'],
    link: '#',
    orientation: 'landscape',
  },
  {
    key: 'Mechachain',
    cover: '/images/projects/cover_mechachain.svg',
    images: [],
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'KYC'],
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
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'Scandit'],
    link: '#',
    orientation: 'portrait',
  },
])

const modalOpen = ref(false)
const selectedProject = ref<Project | null>(null)
const sliderIndex = ref(0)

const openModal = (project: Project) => {
  selectedProject.value = project
  sliderIndex.value = 0
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

/* ── Modal ── */
.modal-card {
  background: #111 !important;
  border-radius: 12px !important;
  overflow: hidden;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
}

/* ── Modal slider ── */
.modal-slider {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.slider-portrait {
  height: 420px;
  background: #0a0a0a;
}

.slider-landscape {
  height: 280px;
  background: #111;
}

.slider-img {
  width: 100%;
  height: 100%;
}

.img-contain {
  object-fit: contain;
}

.img-cover {
  object-fit: cover;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.slider-btn-prev {
  left: 10px;
}

.slider-btn-next {
  right: 10px;
}

.slider-dots {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 6px;
}

.slider-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.2s ease;
}

.slider-dot.active {
  background: #42b883;
}

/* ── Modal placeholder ── */
.modal-placeholder {
  width: 100%;
  background: #0a0a0a;
}

.modal-placeholder-img {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Modal content ── */
.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modal-tag {
  font-size: 11px;
  padding: 3px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}

.modal-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #aaa;
}

.modal-link {
  font-size: 13px;
  color: #42b883;
  text-decoration: none;
  align-self: flex-start;
}
</style>
