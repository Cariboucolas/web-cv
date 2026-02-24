<template>
  <section class="w-full pt-6">

    <!-- Mobile: carousel horizontal -->
    <div class="sm:hidden">
      <div class="carousel-wrapper">
        <div class="carousel-track">
          <div
              v-for="(project, index) in projects"
              :key="index"
              class="carousel-card"
              @click="openModal(project)"
          >
            <img
                :src="project.images[0]"
                :alt="project.title"
                class="carousel-card-img"
                :class="project.orientation === 'portrait' ? 'is-portrait' : 'is-landscape'"
            />
            <div class="carousel-card-overlay">
              <span class="carousel-card-title">{{ t(`portfolio.projects.${project.key}.title`) }}</span>
              <div class="carousel-card-tags">
                <span v-for="tech in project.technologies.slice(0, 3)" :key="tech" class="carousel-tag">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <v-dialog v-model="modalOpen" max-width="480">
        <v-card v-if="selectedProject" class="modal-card">
          <button class="modal-close" @click="modalOpen = false">
            <Icon name="material-symbols:close" size="20"/>
          </button>

          <div
              class="modal-slider"
              :class="selectedProject.orientation === 'portrait' ? 'slider-portrait' : 'slider-landscape'"
          >
            <img
                :src="selectedProject.images[sliderIndex]"
                :alt="selectedProject.title"
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

          <div class="modal-content">
            <h3 class="modal-title">{{ t(`portfolio.projects.${selectedProject.key}.title`) }}</h3>
            <div class="modal-tags">
              <span v-for="tech in selectedProject.technologies" :key="tech" class="modal-tag">
                {{ tech }}
              </span>
            </div>
            <p class="modal-desc">{{ t(`portfolio.projects.${selectedProject.key}.description`) }}</p>
            <a
                v-if="selectedProject.link && selectedProject.link !== '#'"
                :href="selectedProject.link"
                target="_blank"
                class="modal-link"
            >
              {{ t('portfolio.viewProject') }}
            </a>
          </div>
        </v-card>
      </v-dialog>
    </div>

    <!-- Desktop: flip cards -->
    <div class="hidden sm:block max-w-4xl mx-auto space-y-16">
      <div class="space-y-16">
        <div v-for="(project, index) in projects" :key="index" class="portfolio-card-container">
          <div
              class="portfolio-card"
              :class="{ 'is-flipped': project.isFlipped }"
              @click="toggleFlip(project)"
          >
            <div class="portfolio-card-front">
              <img :src="project.images[0]" :alt="project.title" class="w-full h-full object-cover rounded-lg"/>
            </div>
            <div class="portfolio-card-back">
              <h4 class="text-lg font-medium mb-2">{{ t(`portfolio.projects.${project.key}.title`) }}</h4>
              <p class="text-sm text-gray-400">{{ t(`portfolio.projects.${project.key}.shortDescription`) }}</p>
            </div>
          </div>
          <div class="portfolio-description" :class="{ 'is-visible': project.isFlipped }">
            <h4 class="text-lg font-medium mb-2">{{ t(`portfolio.projects.${project.key}.title`) }}</h4>
            <p class="text-sm text-gray-300 mb-4">{{ t(`portfolio.projects.${project.key}.description`) }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="tech in project.technologies"
                  :key="tech"
                  class="px-2 py-1 bg-gray-800 rounded text-xs text-primary"
              >
                {{ tech }}
              </span>
            </div>
            <a
                v-if="project.link && project.link !== '#'"
                :href="project.link"
                target="_blank"
                class="mt-4 inline-block px-4 py-2 bg-primary bg-opacity-20 text-primary rounded-lg text-sm"
            >
              {{ t('portfolio.viewProject') }}
            </a>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import {ref} from 'vue'

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const {t} = useI18n()

interface Project {
  key: string
  images: string[]
  technologies: string[]
  link: string
  orientation: 'portrait' | 'landscape'
  isFlipped: boolean
}

const projects = ref<Project[]>([
  {
    key: 'mgm',
    images: [
      '/images/portfolio/mgm_dashboard.png',
      '/images/portfolio/mgm_debrief.png',
      '/images/portfolio/mgm_debrieflastweek.png',
      '/images/portfolio/mgm_topmodel.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'GraphQL', 'Firebase'],
    link: '#',
    orientation: 'portrait',
    isFlipped: false,
  },
  {
    key: 'fcs',
    images: ['/images/portfolio/fcs_dashboard.png'],
    technologies: ['Nuxt', 'TypeScript', 'GraphQL', 'Firebase'],
    link: '#',
    orientation: 'portrait',
    isFlipped: false,
  },
  {
    key: 'stic',
    images: [
      '/images/portfolio/stic_dashboard.png',
      '/images/portfolio/stic_immat.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'Scandit'],
    link: '#',
    orientation: 'portrait',
    isFlipped: false,
  },
  {
    key: 'winky',
    images: [
      '/images/portfolio/winky_dashboard.png',
      '/images/portfolio/winky-dashboard_2.png',
      '/images/portfolio/winky_paiment.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'Firestore'],
    link: '#',
    orientation: 'landscape',
    isFlipped: false,
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

const toggleFlip = (project: Project) => {
  project.isFlipped = !project.isFlipped
}
</script>

<style scoped>
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
  aspect-ratio: 9 / 16;
  transition: transform 0.2s ease;
}

.carousel-card:active {
  transform: scale(0.97);
}

.carousel-card-img {
  width: 100%;
  height: 100%;
}

.carousel-card-img.is-portrait {
  object-fit: cover;
}

.carousel-card-img.is-landscape {
  object-fit: contain;
  background: #111;
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
  height: 240px;
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

.modal-single-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.modal-single-img--portrait {
  height: 420px;
  object-fit: contain;
  background: #0a0a0a;
}

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

/* ── Desktop flip cards ── */
.portfolio-card-container {
  position: relative;
  height: 400px;
  perspective: 1000px;
  margin-bottom: 2rem;
}

.portfolio-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1), margin-left 0.5s ease;
  transform-style: preserve-3d;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.portfolio-card.is-flipped {
  transform: rotateY(180deg);
  margin-left: -30%;
}

.portfolio-card-front,
.portfolio-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.portfolio-card-front {
  background-color: #2a2a2a;
}

.portfolio-card-back {
  background-color: #1a1a1a;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
}

.portfolio-description {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.9);
  border-radius: 12px;
  padding: 2rem;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: none;
  z-index: -1;
}

.portfolio-description.is-visible {
  opacity: 1;
  transform: translateX(0);
  z-index: 1;
}
</style>
