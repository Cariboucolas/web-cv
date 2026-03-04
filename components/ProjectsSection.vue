<template>
  <section class="w-full pt-6">

    <!-- Mobile: carousel horizontal -->
    <div class="sm:hidden">
      <div class="carousel-wrapper">
        <div class="carousel-track">
          <div
              v-for="(project, index) in projectsWithImages"
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
    </div>

    <!-- Desktop: timeline + cards -->
    <div class="hidden sm:block">
      <div class="desktop-timeline">
        <div v-for="project in projects" :key="project.key" class="desktop-row">
          <!-- Timeline -->
          <div class="timeline-col">
            <span class="timeline-period">{{ formatPeriod(project) }}</span>
            <span class="timeline-dot" :class="{ 'timeline-dot--active': project.periodEnd === null }"></span>
          </div>

          <!-- Card -->
          <div class="desktop-card">
            <!-- Info (left) -->
            <div class="desktop-info">
              <h4 class="desktop-title">{{ t(`projects.projects.${project.key}.title`) }}</h4>
              <p class="desktop-desc">{{ t(`projects.projects.${project.key}.description`) }}</p>
              <div class="desktop-tags">
                <span v-for="tech in project.technologies" :key="tech" class="desktop-tag">
                  {{ tech }}
                </span>
              </div>
              <a
                  v-if="project.link && project.link !== '#'"
                  :href="project.link"
                  target="_blank"
                  class="desktop-link"
              >
                {{ t('projects.viewProject') }}
              </a>
            </div>

            <!-- Slider (right) -->
            <div
                class="desktop-slider"
                :class="project.orientation === 'portrait' ? 'slider-frame-portrait' : 'slider-frame-landscape'"
            >
              <template v-if="project.images.length > 0">
                <div v-if="project.orientation === 'portrait'" class="phone-frame">
                  <img
                      :src="project.images[project.desktopSliderIndex]"
                      :alt="t(`projects.projects.${project.key}.title`)"
                      class="desktop-slider-img"
                  />
                </div>
                <img
                    v-else
                    :src="project.images[project.desktopSliderIndex]"
                    :alt="t(`projects.projects.${project.key}.title`)"
                    class="desktop-slider-img landscape-clickable"
                    @click="openZoom(project)"
                />
                <template v-if="project.images.length > 1">
                  <button class="slider-btn slider-btn-prev" @click="prevSlide(project)">
                    <Icon name="material-symbols:chevron-left" size="28"/>
                  </button>
                  <button class="slider-btn slider-btn-next" @click="nextSlide(project)">
                    <Icon name="material-symbols:chevron-right" size="28"/>
                  </button>
                  <div class="slider-dots">
                    <span
                        v-for="(_, i) in project.images"
                        :key="i"
                        class="slider-dot"
                        :class="{ active: i === project.desktopSliderIndex }"
                        @click="project.desktopSliderIndex = i"
                    />
                  </div>
                </template>
              </template>
              <div v-else class="desktop-placeholder">
                <Icon name="material-symbols:deployed-code" size="40"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal zoom landscape -->
      <div v-if="zoomProject" class="zoom-overlay" @click="zoomProject = null">
        <button class="zoom-close" @click.stop="zoomProject = null">
          <Icon name="material-symbols:close" size="22"/>
        </button>
        <img :src="zoomProject.images[zoomIndex]" alt="" class="zoom-img"/>
        <template v-if="zoomProject.images.length > 1">
          <button class="zoom-nav zoom-nav-prev" @click.stop="zoomPrev">
            <Icon name="material-symbols:chevron-left" size="32"/>
          </button>
          <button class="zoom-nav zoom-nav-next" @click.stop="zoomNext">
            <Icon name="material-symbols:chevron-right" size="32"/>
          </button>
          <div class="zoom-dots" @click.stop>
            <span
                v-for="(_, i) in zoomProject.images"
                :key="i"
                class="slider-dot"
                :class="{ active: i === zoomIndex }"
                @click="zoomIndex = i"
            />
          </div>
        </template>
      </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue'

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const {t} = useI18n()

interface Project {
  key: string
  images: string[]
  technologies: string[]
  link: string
  orientation: 'portrait' | 'landscape'
  desktopSliderIndex: number
  periodStart: number
  periodEnd: number | null
}

// Triés par date de fin décroissante (en cours en premier, puis plus récent)
const projects = ref<Project[]>([
  {
    key: 'mc',
    images: [],
    technologies: ['Python', 'Kotlin', 'React', 'Vertex AI'],
    link: '#',
    orientation: 'landscape',
    desktopSliderIndex: 0,
    periodStart: 2025,
    periodEnd: null,
  },
  {
    key: 'mgm',
    images: [
      '/images/projects/mgm_dashboard.png',
      '/images/projects/mgm_debrief.png',
      '/images/projects/mgm_debrieflastweek.png',
      '/images/projects/mgm_topmodel.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'GraphQL', 'Firebase'],
    link: '#',
    orientation: 'portrait',
    desktopSliderIndex: 0,
    periodStart: 2022,
    periodEnd: null,
  },
  {
    key: 'fcs',
    images: ['/images/projects/fcs_dashboard.png'],
    technologies: ['Nuxt', 'TypeScript', 'GraphQL', 'Firebase'],
    link: '#',
    orientation: 'portrait',
    desktopSliderIndex: 0,
    periodStart: 2024,
    periodEnd: 2024,
  },
  {
    key: 'rsb',
    images: [],
    technologies: ['Qualification de projet'],
    link: '#',
    orientation: 'landscape',
    desktopSliderIndex: 0,
    periodStart: 2023,
    periodEnd: 2023,
  },
  {
    key: 'winky',
    images: [
      '/images/projects/winky_dashboard.png',
      '/images/projects/winky-dashboard_2.png',
      '/images/projects/winky_paiment.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'Firestore'],
    link: '#',
    orientation: 'landscape',
    desktopSliderIndex: 0,
    periodStart: 2022,
    periodEnd: 2022,
  },
  {
    key: 'stic',
    images: [
      '/images/projects/stic_dashboard.png',
      '/images/projects/stic_immat.png',
    ],
    technologies: ['Nuxt', 'TypeScript', 'Firebase', 'Scandit'],
    link: '#',
    orientation: 'portrait',
    desktopSliderIndex: 0,
    periodStart: 2021,
    periodEnd: 2021,
  },
])

const projectsWithImages = computed(() =>
    projects.value.filter((p) => p.images.length > 0),
)

const modalOpen = ref(false)
const selectedProject = ref<Project | null>(null)
const sliderIndex = ref(0)

const openModal = (project: Project) => {
  selectedProject.value = project
  sliderIndex.value = 0
  modalOpen.value = true
}

const zoomProject = ref<Project | null>(null)
const zoomIndex = ref(0)

const openZoom = (project: Project) => {
  zoomProject.value = project
  zoomIndex.value = project.desktopSliderIndex
}

const zoomNext = () => {
  if (!zoomProject.value) return
  zoomIndex.value = (zoomIndex.value + 1) % zoomProject.value.images.length
}

const zoomPrev = () => {
  if (!zoomProject.value) return
  zoomIndex.value =
      (zoomIndex.value - 1 + zoomProject.value.images.length) %
      zoomProject.value.images.length
}

const nextSlide = (project: Project) => {
  project.desktopSliderIndex =
      (project.desktopSliderIndex + 1) % project.images.length
}

const prevSlide = (project: Project) => {
  project.desktopSliderIndex =
      (project.desktopSliderIndex - 1 + project.images.length) %
      project.images.length
}

const formatPeriod = (project: Project): string => {
  if (project.periodEnd === null) {
    return `${project.periodStart} - ${t('projects.today')}`
  }
  if (project.periodStart === project.periodEnd) {
    return `${project.periodStart}`
  }
  return `${project.periodStart} - ${project.periodEnd}`
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

/* ── Desktop: timeline + cards ── */
.desktop-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.desktop-row {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

/* Timeline column */
.timeline-col {
  width: 100px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

/* Ligne par segment, étendue dans le gap sauf premier/dernier */
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

.desktop-row:first-child .timeline-col::before {
  top: 50%;
}

.desktop-row:last-child .timeline-col::before {
  bottom: calc(50% - 15px);
}

.timeline-period {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  position: relative;
  z-index: 1;
  text-align: center;
  letter-spacing: 0.5px;
  background: #0f0f0f;
  padding: 2px 6px;
  border-radius: 4px;
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
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(66, 184, 131, 0);
  }
}

/* Card */
.desktop-card {
  flex: 1;
  display: flex;
  flex-direction: row;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(66, 184, 131, 0.06);
}

.desktop-info {
  width: 50%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.desktop-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.3px;
}

.desktop-desc {
  font-size: 14px;
  line-height: 1.7;
  color: #aaa;
}

.desktop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.desktop-tag {
  font-size: 11px;
  padding: 3px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
}

.desktop-link {
  font-size: 13px;
  color: #42b883;
  text-decoration: none;
  align-self: flex-start;
}

/* Slider */
.desktop-slider {
  position: relative;
  width: 50%;
  min-height: 300px;
  overflow: hidden;
  flex-shrink: 0;
}

.slider-frame-portrait {
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.slider-frame-landscape {
  background: #0a0a0a;
}

.desktop-slider-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Phone frame for portrait screenshots */
.phone-frame {
  width: 55%;
  background: #1a1a1a;
  border-radius: 28px;
  padding: 10px 6px;
  border: 3px solid #2a2a2a;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05),
  0 8px 30px rgba(0, 0, 0, 0.4);
}

.phone-frame .desktop-slider-img {
  width: 100%;
  height: auto;
  border-radius: 20px;
  object-fit: cover;
}

/* Landscape clickable */
.landscape-clickable {
  cursor: zoom-in;
}

/* Zoom modal */
.zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.zoom-close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 101;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.zoom-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.zoom-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

.zoom-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.zoom-nav:hover {
  background: rgba(0, 0, 0, 0.8);
}

.zoom-nav-prev {
  left: 24px;
}

.zoom-nav-next {
  right: 24px;
}

.zoom-dots {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* Placeholder */
.desktop-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(66, 184, 131, 0.25);
  background: #0a0a0a;
}
</style>
