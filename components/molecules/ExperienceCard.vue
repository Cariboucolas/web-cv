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
    <!-- Sub-projects in columns -->
    <div v-if="experience.subProjects?.length" class="xp-mobile-subprojects">
      <div v-for="sub in experience.subProjects" :key="sub.name" class="xp-mobile-subproject">
        <h5 class="xp-subproject-title">{{ sub.name }}</h5>
        <ul class="xp-mobile-highlights">
          <li v-for="(highlight, hi) in sub.highlights" :key="hi">{{ highlight }}</li>
        </ul>
      </div>
    </div>
    <!-- Regular highlights -->
    <ul v-else class="xp-mobile-highlights">
      <li v-for="(highlight, hi) in experience.highlights" :key="hi">{{ highlight }}</li>
    </ul>
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
    <!-- Sub-projects in 2 columns -->
    <div v-if="experience.subProjects?.length" class="xp-subprojects">
      <div v-for="sub in experience.subProjects" :key="sub.name" class="xp-subproject">
        <h5 class="xp-subproject-title">{{ sub.name }}</h5>
        <ul class="xp-highlights">
          <li v-for="(highlight, hi) in sub.highlights" :key="hi">{{ highlight }}</li>
        </ul>
      </div>
    </div>
    <!-- Regular highlights -->
    <ul v-else class="xp-highlights">
      <li v-for="(highlight, hi) in experience.highlights" :key="hi">{{ highlight }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'

// @ts-expect-error - auto-importé par @nuxtjs/i18n
const {t} = useI18n()

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

const companyLogos: Record<string, string> = {
  'Decathlon MayDay': '/logos/logo_mayday.png',
  'Decathlon WeParis': '/logos/logo_weparis.png',
  'Decathlon InStore': '/logos/logo_decathlon.jpg',
  'Brocorp': '/logos/logo_brocorp.png',
  'Biscuiterie Poult': '/logos/logo_poult.jpg',
  'Intersport': '/logos/logo_intersport.jpg',
}

const companyBgColors: Record<string, string> = {
  'Decathlon InStore': '#0363d0',
  'Decathlon MayDay': '#ffffff',
  'Brocorp': '#ffffff',
  'Biscuiterie Poult': '#ffffff',
  'Intersport': '#ffffff',
}

const companyLogo = computed(() => companyLogos[props.experience.company] ?? null)
const companyBg = computed(() => companyBgColors[props.experience.company] ?? null)
const isOversized = computed(() => props.experience.company === 'Decathlon InStore')

const period = computed(() => {
  const xp = props.experience
  if (xp.periodEnd === null) {
    return `${xp.periodStart} - ${t('experiences.today')}`
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
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  gap: 14px;
  box-shadow: 0 0 30px rgba(66, 184, 131, 0.06);
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
  font-size: 13px;
  font-weight: 700;
  color: #42b883;
  white-space: nowrap;
  letter-spacing: 0.5px;
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
  gap: 6px;
}

.desktop-tag {
  font-size: 11px;
  padding: 3px 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #42b883;
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
