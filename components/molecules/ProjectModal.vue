<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <v-card v-if="project" class="modal-card">
      <button class="modal-close" @click="$emit('update:modelValue', false)">
        <Icon name="material-symbols:close" size="20"/>
      </button>

      <!-- Slider d'images si screenshots disponibles -->
      <template v-if="project.images.length > 0">
        <div
            class="modal-slider"
            :class="project.orientation === 'portrait' ? 'slider-portrait' : 'slider-landscape'"
        >
          <img
              :src="project.images[sliderIndex]"
              :alt="t(`projects.projects.${project.key}.title`)"
              class="slider-img"
              :class="project.orientation === 'portrait' ? 'img-contain' : 'img-cover'"
          />
          <template v-if="project.images.length > 1">
            <button class="slider-btn slider-btn-prev"
                    @click="sliderIndex = (sliderIndex - 1 + project.images.length) % project.images.length">
              <Icon name="material-symbols:chevron-left" size="28"/>
            </button>
            <button class="slider-btn slider-btn-next"
                    @click="sliderIndex = (sliderIndex + 1) % project.images.length">
              <Icon name="material-symbols:chevron-right" size="28"/>
            </button>
            <div class="slider-dots">
              <span
                  v-for="(_, i) in project.images"
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
            :src="project.cover"
            :alt="t(`projects.projects.${project.key}.title`)"
            class="modal-placeholder-img"
        />
      </div>

      <div class="modal-content">
        <h3 class="modal-title">{{ t(`projects.projects.${project.key}.title`) }}</h3>
        <div class="modal-tags">
          <span v-for="tech in project.technologies" :key="tech" class="modal-tag">
            {{ tech }}
          </span>
        </div>
        <p class="modal-desc">{{ t(`projects.projects.${project.key}.description`) }}</p>
        <a
            v-if="project.link && project.link !== '#'"
            :href="project.link"
            target="_blank"
            class="modal-link"
        >
          {{ t('projects.viewProject') }}
        </a>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const {t} = useI18n()

interface Project {
  key: string
  cover: string
  images: string[]
  technologies: string[]
  link: string
  orientation: 'portrait' | 'landscape'
}

const props = defineProps<{
  modelValue: boolean
  project: Project | null
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sliderIndex = ref(0)

watch(() => props.project, () => {
  sliderIndex.value = 0
})
</script>

<style scoped>
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

/* ── Slider ── */
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

/* ── Placeholder ── */
.modal-placeholder {
  width: 100%;
  background: #0a0a0a;
}

.modal-placeholder-img {
  width: 100%;
  height: auto;
  display: block;
}

/* ── Content ── */
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
